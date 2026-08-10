import { create } from "zustand"

import { mockFiles, type MockFile } from "@/data/mock-workspace-panels"
import { resolveFileLanguage } from "@/lib/monaco-language-registry"
import {
  countResourceReferences,
  countResourceReferencesInGroup,
  createInitialEditorWorkbenchState,
  reduceEditorWorkbenchState,
  selectActiveEditor,
  selectActiveResourceId,
  selectOpenResourceIds,
  type DiffEditorInput,
  type EditorContentView,
  type EditorDiffKind,
  type EditorDiffMode,
  type EditorDropEdge,
  type EditorInput,
  type EditorSplitDirection,
  type EditorWorkbenchState,
} from "@/store/editor-layout"
import { useDocumentPreviewStore } from "@/store/document-preview-store"

export type EditorBuffer = {
  fileId: string
  languageId: string
  tabSize: number
  encoding: string
  lineEnding: string
  savedSource: string
  workingSource: string
  externalSource?: string
  version: number
  dirty: boolean
  readonly: boolean
  externalChange: boolean
}

export type EditorDiffSession = {
  resourceId: string
  left: { label: string; source: string }
  right: { label: string; source: string }
  mode: EditorDiffMode
  kind: EditorDiffKind
}

export type PendingEditorClose =
  | { type: "editor"; groupId: string; editorId: string; resourceId: string }
  | { type: "group"; groupId: string; resourceIds: string[] }

type EditorWorkbenchStore = {
  workbench: EditorWorkbenchState
  editorBuffers: Record<string, EditorBuffer>
  pendingClose: PendingEditorClose | null
  reset: () => void
  openFile: (fileId: string, pinned?: boolean, targetGroupId?: string) => void
  openFileToSide: (
    fileId: string,
    direction?: EditorSplitDirection,
    anchorGroupId?: string,
  ) => void
  activateEditor: (groupId: string, editorId: string) => void
  focusGroup: (groupId: string) => void
  pinEditor: (groupId: string, editorId: string) => void
  requestCloseEditor: (groupId: string, editorId: string) => void
  requestCloseGroup: (groupId: string) => void
  cancelPendingClose: () => void
  confirmPendingClose: (save: boolean) => void
  comparePendingClose: () => void
  splitEditor: (
    groupId: string,
    editorId: string,
    direction: EditorSplitDirection,
  ) => void
  moveEditor: (
    sourceGroupId: string,
    editorId: string,
    targetGroupId: string,
    targetIndex: number,
    copy?: boolean,
  ) => void
  splitWithEditor: (
    sourceGroupId: string,
    editorId: string,
    targetGroupId: string,
    edge: EditorDropEdge,
    copy?: boolean,
  ) => void
  reorderEditor: (groupId: string, editorId: string, targetIndex: number) => void
  setEditorContentView: (
    groupId: string,
    editorId: string,
    contentView: EditorContentView,
  ) => void
  setLayoutSizes: (splitId: string, sizes: number[]) => void
  setEditorSource: (
    groupId: string,
    editorId: string,
    fileId: string,
    source: string,
  ) => void
  saveEditorBuffer: (fileId: string) => void
  setEditorLanguage: (fileId: string, languageId: string) => void
  setEditorTabSize: (fileId: string, tabSize: number) => void
  setEditorEncoding: (fileId: string, encoding: string) => void
  setEditorLineEnding: (fileId: string, lineEnding: string) => void
  openDiff: (resourceId: string, kind: EditorDiffKind, targetGroupId?: string) => void
  setDiffMode: (groupId: string, editorId: string, mode: EditorDiffMode) => void
  closeDiff: (groupId: string, editorId: string) => void
  acceptDiffSide: (groupId: string, editorId: string, side: "left" | "right") => void
}

function findFile(fileId: string): MockFile | undefined {
  return mockFiles.find((file) => file.id === fileId)
}

export function defaultEditorContentView(file: MockFile): EditorContentView {
  if (file.kind === "markdown") return "preview"
  if (file.kind === "code" || file.kind === "json") return "source"
  return "preview"
}

function initialEditorBuffers(): Record<string, EditorBuffer> {
  return Object.fromEntries(
    mockFiles.map((file) => [
      file.id,
      {
        fileId: file.id,
        languageId: resolveFileLanguage(file),
        tabSize: 2,
        encoding: file.encoding,
        lineEnding: file.lineEnding,
        savedSource: file.content,
        workingSource: file.content,
        externalSource: file.externalChange
          ? `${file.content}\n\n// 外部变更（Mock）`
          : undefined,
        version: 1,
        dirty: Boolean(file.dirty),
        readonly: Boolean(file.readonly),
        externalChange: Boolean(file.externalChange),
      } satisfies EditorBuffer,
    ]),
  )
}

function editorResourceId(workbench: EditorWorkbenchState, editorId: string): string | null {
  const input = workbench.editors[editorId]
  return input && input.kind !== "chat" ? input.resourceId : null
}

function dirtyFinalResourcesForGroup(
  workbench: EditorWorkbenchState,
  buffers: Record<string, EditorBuffer>,
  groupId: string,
): string[] {
  const group = workbench.groups[groupId]
  if (!group) return []
  const resourceIds = group.editorIds.flatMap((editorId) => {
    const resourceId = editorResourceId(workbench, editorId)
    return resourceId ? [resourceId] : []
  })
  return resourceIds.filter((resourceId, index) => {
    if (resourceIds.indexOf(resourceId) !== index) return false
    const finalReference = countResourceReferences(workbench, resourceId)
      === countResourceReferencesInGroup(workbench, groupId, resourceId)
    const buffer = buffers[resourceId]
    return finalReference && Boolean(buffer?.dirty || buffer?.externalChange)
  })
}

function closePending(
  workbench: EditorWorkbenchState,
  pending: PendingEditorClose,
): EditorWorkbenchState {
  return reduceEditorWorkbenchState(workbench, pending.type === "editor"
    ? {
        type: "close-editor",
        groupId: pending.groupId,
        editorId: pending.editorId,
      }
    : { type: "close-group", groupId: pending.groupId })
}

export function createEditorDiffSession(
  editor: EditorInput | null,
  buffer: EditorBuffer | undefined,
): EditorDiffSession | null {
  if (!editor || editor.kind !== "diff" || !buffer) return null
  const external = buffer.externalSource ?? buffer.savedSource
  const sources = editor.diffKind === "working-external"
    ? {
        left: { label: "本地工作副本", source: buffer.workingSource },
        right: { label: "外部变更", source: external },
      }
    : editor.diffKind === "revision"
      ? {
          left: { label: "基线版本", source: buffer.savedSource },
          right: { label: "当前版本", source: buffer.workingSource },
        }
      : {
          left: { label: "已保存", source: buffer.savedSource },
          right: { label: "工作副本", source: buffer.workingSource },
        }
  return {
    resourceId: editor.resourceId,
    ...sources,
    mode: editor.mode,
    kind: editor.diffKind,
  }
}

function saveBuffers(
  buffers: Record<string, EditorBuffer>,
  resourceIds: string[],
): Record<string, EditorBuffer> {
  const next = { ...buffers }
  for (const resourceId of resourceIds) {
    const buffer = next[resourceId]
    if (!buffer || buffer.readonly) continue
    next[resourceId] = {
      ...buffer,
      savedSource: buffer.workingSource,
      dirty: false,
      externalChange: false,
      externalSource: undefined,
    }
  }
  return next
}

export const useEditorWorkbenchStore = create<EditorWorkbenchStore>((set, get) => ({
  workbench: createInitialEditorWorkbenchState(),
  editorBuffers: initialEditorBuffers(),
  pendingClose: null,
  reset: () => {
    useDocumentPreviewStore.getState().reset()
    set({
      workbench: createInitialEditorWorkbenchState(),
      editorBuffers: initialEditorBuffers(),
      pendingClose: null,
    })
  },
  openFile: (fileId, pinned = false, targetGroupId) => set((state) => {
    const file = findFile(fileId)
    const buffer = state.editorBuffers[fileId]
    if (!file || !buffer) return state
    return {
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "open-file",
        resourceId: fileId,
        pinned,
        dirty: buffer.dirty,
        contentView: defaultEditorContentView(file),
        targetGroupId,
      }),
    }
  }),
  openFileToSide: (fileId, direction = "right", anchorGroupId) => set((state) => {
    const file = findFile(fileId)
    const buffer = state.editorBuffers[fileId]
    const anchor = anchorGroupId ?? state.workbench.activeGroupId
    if (!file || !buffer || !state.workbench.groups[anchor]) return state
    return {
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "open-file-beside",
        resourceId: fileId,
        dirty: buffer.dirty,
        contentView: defaultEditorContentView(file),
        anchorGroupId: anchor,
        direction,
      }),
    }
  }),
  activateEditor: (groupId, editorId) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "activate-editor",
      groupId,
      editorId,
    }),
  })),
  focusGroup: (groupId) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "focus-group",
      groupId,
    }),
  })),
  pinEditor: (groupId, editorId) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "pin-editor",
      groupId,
      editorId,
    }),
  })),
  requestCloseEditor: (groupId, editorId) => {
    const state = get()
    const resourceId = editorResourceId(state.workbench, editorId)
    if (!resourceId) return
    const buffer = state.editorBuffers[resourceId]
    const finalReference = countResourceReferences(state.workbench, resourceId) === 1
    if (finalReference && (buffer?.dirty || buffer?.externalChange)) {
      set({ pendingClose: { type: "editor", groupId, editorId, resourceId } })
      return
    }
    set({
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "close-editor",
        groupId,
        editorId,
      }),
    })
  },
  requestCloseGroup: (groupId) => {
    const state = get()
    const resourceIds = dirtyFinalResourcesForGroup(
      state.workbench,
      state.editorBuffers,
      groupId,
    )
    if (resourceIds.length > 0) {
      set({ pendingClose: { type: "group", groupId, resourceIds } })
      return
    }
    set({
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "close-group",
        groupId,
      }),
    })
  },
  cancelPendingClose: () => set({ pendingClose: null }),
  confirmPendingClose: (save) => set((state) => {
    const pending = state.pendingClose
    if (!pending) return state
    const resourceIds = pending.type === "group"
      ? pending.resourceIds
      : [pending.resourceId]
    return {
      editorBuffers: save ? saveBuffers(state.editorBuffers, resourceIds) : state.editorBuffers,
      workbench: closePending(state.workbench, pending),
      pendingClose: null,
    }
  }),
  comparePendingClose: () => set((state) => {
    const pending = state.pendingClose
    if (!pending || pending.type !== "editor") return state
    return {
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "open-diff",
        resourceId: pending.resourceId,
        kind: "working-external",
        targetGroupId: pending.groupId,
      }),
      pendingClose: null,
    }
  }),
  splitEditor: (groupId, editorId, direction) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "split-editor",
      groupId,
      editorId,
      direction,
    }),
  })),
  moveEditor: (sourceGroupId, editorId, targetGroupId, targetIndex, copy = false) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "move-editor",
      sourceGroupId,
      editorId,
      targetGroupId,
      targetIndex,
      copy,
    }),
  })),
  splitWithEditor: (
    sourceGroupId,
    editorId,
    targetGroupId,
    edge,
    copy = false,
  ) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "split-with-editor",
      sourceGroupId,
      editorId,
      targetGroupId,
      edge,
      copy,
    }),
  })),
  reorderEditor: (groupId, editorId, targetIndex) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "reorder-editor",
      groupId,
      editorId,
      targetIndex,
    }),
  })),
  setEditorContentView: (groupId, editorId, contentView) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "set-content-view",
      groupId,
      editorId,
      contentView,
    }),
  })),
  setLayoutSizes: (splitId, sizes) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "set-layout-sizes",
      splitId,
      sizes,
    }),
  })),
  setEditorSource: (groupId, editorId, fileId, source) => set((state) => {
    const buffer = state.editorBuffers[fileId]
    if (!buffer || buffer.readonly) return state
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [fileId]: {
          ...buffer,
          workingSource: source,
          version: buffer.version + 1,
          dirty: source !== buffer.savedSource,
        },
      },
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "pin-editor",
        groupId,
        editorId,
      }),
    }
  }),
  saveEditorBuffer: (fileId) => set((state) => ({
    editorBuffers: saveBuffers(state.editorBuffers, [fileId]),
  })),
  setEditorLanguage: (fileId, languageId) => set((state) => {
    const buffer = state.editorBuffers[fileId]
    if (!buffer) return state
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [fileId]: { ...buffer, languageId },
      },
    }
  }),
  setEditorTabSize: (fileId, tabSize) => set((state) => {
    const buffer = state.editorBuffers[fileId]
    if (!buffer || ![2, 4].includes(tabSize)) return state
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [fileId]: { ...buffer, tabSize },
      },
    }
  }),
  setEditorEncoding: (fileId, encoding) => set((state) => {
    const buffer = state.editorBuffers[fileId]
    if (!buffer || !["UTF-8", "UTF-16 LE", "UTF-16 BE"].includes(encoding)) return state
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [fileId]: { ...buffer, encoding },
      },
    }
  }),
  setEditorLineEnding: (fileId, lineEnding) => set((state) => {
    const buffer = state.editorBuffers[fileId]
    if (!buffer || !["LF", "CRLF"].includes(lineEnding)) return state
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [fileId]: { ...buffer, lineEnding },
      },
    }
  }),
  openDiff: (resourceId, kind, targetGroupId) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "open-diff",
      resourceId,
      kind,
      targetGroupId,
    }),
  })),
  setDiffMode: (groupId, editorId, mode) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "set-diff-mode",
      groupId,
      editorId,
      mode,
    }),
  })),
  closeDiff: (groupId, editorId) => set((state) => ({
    workbench: reduceEditorWorkbenchState(state.workbench, {
      type: "close-editor",
      groupId,
      editorId,
    }),
  })),
  acceptDiffSide: (groupId, editorId, side) => set((state) => {
    const editor = state.workbench.editors[editorId] as DiffEditorInput | undefined
    if (!editor || editor.kind !== "diff") return state
    const buffer = state.editorBuffers[editor.resourceId]
    const session = createEditorDiffSession(editor, buffer)
    if (!buffer || !session) return state
    const source = side === "left" ? session.left.source : session.right.source
    const nextBuffer = side === "left"
      ? {
          ...buffer,
          workingSource: source,
          dirty: source !== buffer.savedSource,
          externalChange: false,
        }
      : session.kind === "working-external"
        ? {
            ...buffer,
            workingSource: source,
            dirty: source !== buffer.savedSource,
            externalChange: false,
            externalSource: undefined,
          }
        : {
            ...buffer,
            savedSource: source,
            workingSource: source,
            dirty: false,
            externalChange: false,
          }
    return {
      editorBuffers: {
        ...state.editorBuffers,
        [editor.resourceId]: nextBuffer,
      },
      workbench: reduceEditorWorkbenchState(state.workbench, {
        type: "close-editor",
        groupId,
        editorId,
      }),
    }
  }),
}))

useEditorWorkbenchStore.subscribe((state, previous) => {
  if (state.workbench.editors === previous.workbench.editors) return
  const validEditorIds = new Set(Object.keys(state.workbench.editors))
  const previewStore = useDocumentPreviewStore.getState()
  for (const editorId of Object.keys(previewStore.states)) {
    if (!validEditorIds.has(editorId)) previewStore.removeState(editorId)
  }
})

export function selectActiveEditorResource(state: EditorWorkbenchStore): string | null {
  return selectActiveResourceId(state.workbench)
}

export function selectOpenEditorResources(state: EditorWorkbenchStore): string[] {
  return selectOpenResourceIds(state.workbench)
}

export function isResourcePinned(workbench: EditorWorkbenchState, resourceId: string): boolean {
  return Object.values(workbench.editors).some((editor) =>
    editor.kind === "file" && editor.resourceId === resourceId && editor.pinned,
  )
}

export function selectCurrentDiffSession(state: EditorWorkbenchStore): EditorDiffSession | null {
  const editor = selectActiveEditor(state.workbench)
  if (!editor || editor.kind !== "diff") return null
  return createEditorDiffSession(editor, state.editorBuffers[editor.resourceId])
}
