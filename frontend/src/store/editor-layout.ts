export type EditorSplitOrientation = "horizontal" | "vertical"
export type EditorSplitDirection = "left" | "right" | "up" | "down"
export type EditorDropEdge = "left" | "right" | "top" | "bottom"
export type EditorContentView = "source" | "preview" | "split"
export type EditorDiffKind = "saved-working" | "working-external" | "revision"
export type EditorDiffMode = "side-by-side" | "inline"

export type ChatEditorInput = {
  id: string
  kind: "chat"
  pinned: true
  closable: false
}

export type FileEditorInput = {
  id: string
  kind: "file"
  resourceId: string
  pinned: boolean
  preview: boolean
  contentView: EditorContentView
}

export type DiffEditorInput = {
  id: string
  kind: "diff"
  resourceId: string
  comparisonId: string
  diffKind: EditorDiffKind
  mode: EditorDiffMode
  pinned: true
  preview: false
}

export type EditorInput = ChatEditorInput | FileEditorInput | DiffEditorInput

export type EditorGroupState = {
  id: string
  editorIds: string[]
  activeEditorId: string
  previewEditorId: string | null
  mruEditorIds: string[]
}

export type EditorLayoutNode =
  | { type: "group"; groupId: string }
  | {
      type: "split"
      id: string
      orientation: EditorSplitOrientation
      children: EditorLayoutNode[]
      sizes: number[]
    }

export type EditorWorkbenchState = {
  layout: EditorLayoutNode
  groups: Record<string, EditorGroupState>
  editors: Record<string, EditorInput>
  primaryGroupId: string
  activeGroupId: string
  nextGroupSequence: number
  nextEditorSequence: number
  nextSplitSequence: number
  nextComparisonSequence: number
}

export type EditorLayoutAction =
  | {
      type: "open-file"
      resourceId: string
      pinned: boolean
      dirty: boolean
      contentView?: EditorContentView
      targetGroupId?: string
    }
  | {
      type: "open-diff"
      resourceId: string
      kind: EditorDiffKind
      targetGroupId?: string
    }
  | {
      type: "open-file-beside"
      resourceId: string
      dirty: boolean
      contentView?: EditorContentView
      anchorGroupId: string
      direction: EditorSplitDirection
    }
  | { type: "activate-editor"; groupId: string; editorId: string }
  | { type: "focus-group"; groupId: string }
  | { type: "pin-editor"; groupId: string; editorId: string }
  | {
      type: "set-content-view"
      groupId: string
      editorId: string
      contentView: EditorContentView
    }
  | {
      type: "set-diff-mode"
      groupId: string
      editorId: string
      mode: EditorDiffMode
    }
  | {
      type: "split-editor"
      groupId: string
      editorId: string
      direction: EditorSplitDirection
    }
  | {
      type: "move-editor"
      sourceGroupId: string
      editorId: string
      targetGroupId: string
      targetIndex: number
      copy: boolean
    }
  | {
      type: "split-with-editor"
      sourceGroupId: string
      editorId: string
      targetGroupId: string
      edge: EditorDropEdge
      copy: boolean
    }
  | {
      type: "reorder-editor"
      groupId: string
      editorId: string
      targetIndex: number
    }
  | { type: "close-editor"; groupId: string; editorId: string }
  | { type: "close-group"; groupId: string }
  | { type: "set-layout-sizes"; splitId: string; sizes: number[] }

const CHAT_EDITOR_ID = "editor-chat"
const PRIMARY_GROUP_ID = "editor-group-1"

export function createInitialEditorWorkbenchState(): EditorWorkbenchState {
  const chat: ChatEditorInput = {
    id: CHAT_EDITOR_ID,
    kind: "chat",
    pinned: true,
    closable: false,
  }
  const primary: EditorGroupState = {
    id: PRIMARY_GROUP_ID,
    editorIds: [chat.id],
    activeEditorId: chat.id,
    previewEditorId: null,
    mruEditorIds: [chat.id],
  }
  return {
    layout: { type: "group", groupId: primary.id },
    groups: { [primary.id]: primary },
    editors: { [chat.id]: chat },
    primaryGroupId: primary.id,
    activeGroupId: primary.id,
    nextGroupSequence: 2,
    nextEditorSequence: 1,
    nextSplitSequence: 1,
    nextComparisonSequence: 1,
  }
}

function cloneState(state: EditorWorkbenchState): EditorWorkbenchState {
  return {
    ...state,
    layout: cloneLayout(state.layout),
    groups: Object.fromEntries(
      Object.entries(state.groups).map(([id, group]) => [
        id,
        {
          ...group,
          editorIds: [...group.editorIds],
          mruEditorIds: [...group.mruEditorIds],
        },
      ]),
    ),
    editors: Object.fromEntries(
      Object.entries(state.editors).map(([id, editor]) => [id, { ...editor }]),
    ),
  }
}

function cloneLayout(node: EditorLayoutNode): EditorLayoutNode {
  if (node.type === "group") return { ...node }
  return {
    ...node,
    children: node.children.map(cloneLayout),
    sizes: [...node.sizes],
  }
}

function touch<T>(items: T[], item: T): T[] {
  return [item, ...items.filter((candidate) => candidate !== item)]
}

function normalizeSizes(sizes: number[], length: number): number[] {
  if (length <= 0) return []
  const valid = sizes.length === length && sizes.every((size) => Number.isFinite(size) && size > 0)
  if (!valid) return Array.from({ length }, () => 100 / length)
  const total = sizes.reduce((sum, size) => sum + size, 0)
  return sizes.map((size) => (size / total) * 100)
}

function minInsertIndex(state: EditorWorkbenchState, groupId: string): number {
  return groupId === state.primaryGroupId ? 1 : 0
}

function clampInsertIndex(
  state: EditorWorkbenchState,
  group: EditorGroupState,
  index: number,
): number {
  return Math.min(
    Math.max(index, minInsertIndex(state, group.id)),
    group.editorIds.length,
  )
}

function inputIdentity(input: EditorInput): string {
  if (input.kind === "chat") return "chat"
  if (input.kind === "file") return `file:${input.resourceId}`
  return `diff:${input.comparisonId}`
}

function findEquivalentEditorId(
  state: EditorWorkbenchState,
  group: EditorGroupState,
  input: EditorInput,
): string | null {
  const identity = inputIdentity(input)
  return group.editorIds.find((id) => {
    const candidate = state.editors[id]
    return candidate ? inputIdentity(candidate) === identity : false
  }) ?? null
}

function activateEditor(
  state: EditorWorkbenchState,
  groupId: string,
  editorId: string,
): void {
  const group = state.groups[groupId]
  if (!group || !group.editorIds.includes(editorId)) return
  group.activeEditorId = editorId
  group.mruEditorIds = touch(group.mruEditorIds, editorId)
  state.activeGroupId = groupId
}

function pinEditor(state: EditorWorkbenchState, groupId: string, editorId: string): void {
  const group = state.groups[groupId]
  const input = state.editors[editorId]
  if (!group || !input || input.kind !== "file") return
  input.pinned = true
  input.preview = false
  if (group.previewEditorId === editorId) group.previewEditorId = null
}

function removeEditorReference(
  state: EditorWorkbenchState,
  groupId: string,
  editorId: string,
): void {
  const group = state.groups[groupId]
  if (!group || !group.editorIds.includes(editorId)) return
  const removedIndex = group.editorIds.indexOf(editorId)
  group.editorIds = group.editorIds.filter((id) => id !== editorId)
  group.mruEditorIds = group.mruEditorIds.filter((id) => id !== editorId)
  if (group.previewEditorId === editorId) group.previewEditorId = null

  if (group.activeEditorId === editorId) {
    const adjacent = group.editorIds[removedIndex]
      ?? group.editorIds[removedIndex - 1]
      ?? group.mruEditorIds[0]
    group.activeEditorId = adjacent ?? ""
    if (adjacent) group.mruEditorIds = touch(group.mruEditorIds, adjacent)
  }

  const referenced = Object.values(state.groups).some((candidate) =>
    candidate.editorIds.includes(editorId),
  )
  if (!referenced) delete state.editors[editorId]
}

function replaceGroupLeaf(
  node: EditorLayoutNode,
  groupId: string,
  replacement: EditorLayoutNode,
): EditorLayoutNode {
  if (node.type === "group") return node.groupId === groupId ? replacement : node
  return {
    ...node,
    children: node.children.map((child) => replaceGroupLeaf(child, groupId, replacement)),
  }
}

function removeGroupLeaf(node: EditorLayoutNode, groupId: string): EditorLayoutNode | null {
  if (node.type === "group") return node.groupId === groupId ? null : node
  const kept: Array<{ child: EditorLayoutNode; size: number }> = []
  node.children.forEach((child, index) => {
    const nextChild = removeGroupLeaf(child, groupId)
    if (nextChild) kept.push({ child: nextChild, size: node.sizes[index] ?? 1 })
  })
  if (kept.length === 0) return null
  if (kept.length === 1) return kept[0]!.child
  return {
    ...node,
    children: kept.map((item) => item.child),
    sizes: normalizeSizes(kept.map((item) => item.size), kept.length),
  }
}

function updateSplitSizes(
  node: EditorLayoutNode,
  splitId: string,
  sizes: number[],
): EditorLayoutNode {
  if (node.type === "group") return node
  if (node.id === splitId) {
    return { ...node, sizes: normalizeSizes(sizes, node.children.length) }
  }
  return {
    ...node,
    children: node.children.map((child) => updateSplitSizes(child, splitId, sizes)),
  }
}

function directionOrientation(direction: EditorSplitDirection): EditorSplitOrientation {
  return direction === "left" || direction === "right" ? "horizontal" : "vertical"
}

function edgeDirection(edge: EditorDropEdge): EditorSplitDirection {
  if (edge === "top") return "up"
  if (edge === "bottom") return "down"
  return edge
}

function insertGroupBeside(
  state: EditorWorkbenchState,
  anchorGroupId: string,
  newGroupId: string,
  direction: EditorSplitDirection,
): void {
  const orientation = directionOrientation(direction)
  const before = direction === "left" || direction === "up"
  const first: EditorLayoutNode = {
    type: "group",
    groupId: before ? newGroupId : anchorGroupId,
  }
  const second: EditorLayoutNode = {
    type: "group",
    groupId: before ? anchorGroupId : newGroupId,
  }
  state.layout = replaceGroupLeaf(state.layout, anchorGroupId, {
    type: "split",
    id: `editor-split-${state.nextSplitSequence}`,
    orientation,
    children: [first, second],
    sizes: [50, 50],
  })
  state.nextSplitSequence += 1
}

function nextGroupIdAfterRemoval(state: EditorWorkbenchState, removedGroupId: string): string {
  const ordered = collectLayoutGroupIds(state.layout)
  const index = ordered.indexOf(removedGroupId)
  return ordered[index + 1]
    ?? ordered[index - 1]
    ?? state.primaryGroupId
}

function removeGroup(state: EditorWorkbenchState, groupId: string): void {
  if (groupId === state.primaryGroupId) return
  const group = state.groups[groupId]
  if (!group) return
  const fallbackGroupId = nextGroupIdAfterRemoval(state, groupId)
  const editorIds = [...group.editorIds]
  delete state.groups[groupId]
  state.layout = removeGroupLeaf(state.layout, groupId) ?? {
    type: "group",
    groupId: state.primaryGroupId,
  }
  for (const editorId of editorIds) {
    const referenced = Object.values(state.groups).some((candidate) =>
      candidate.editorIds.includes(editorId),
    )
    if (!referenced) delete state.editors[editorId]
  }
  if (state.activeGroupId === groupId) {
    state.activeGroupId = state.groups[fallbackGroupId]
      ? fallbackGroupId
      : state.primaryGroupId
  }
}

function collapseEmptySecondaryGroup(state: EditorWorkbenchState, groupId: string): void {
  const group = state.groups[groupId]
  if (!group || groupId === state.primaryGroupId || group.editorIds.length > 0) return
  removeGroup(state, groupId)
}

function createClonedInput(state: EditorWorkbenchState, source: EditorInput): EditorInput | null {
  if (source.kind === "chat") return null
  const id = `editor-${state.nextEditorSequence}`
  state.nextEditorSequence += 1
  if (source.kind === "file") {
    return {
      ...source,
      id,
      pinned: true,
      preview: false,
    }
  }
  return { ...source, id }
}

function createGroupWithInput(
  state: EditorWorkbenchState,
  input: EditorInput,
): EditorGroupState {
  const id = `editor-group-${state.nextGroupSequence}`
  state.nextGroupSequence += 1
  const group: EditorGroupState = {
    id,
    editorIds: [input.id],
    activeEditorId: input.id,
    previewEditorId: null,
    mruEditorIds: [input.id],
  }
  state.groups[id] = group
  state.editors[input.id] = input
  return group
}

function removePreviewInput(state: EditorWorkbenchState, group: EditorGroupState): void {
  const previewId = group.previewEditorId
  if (!previewId) return
  removeEditorReference(state, group.id, previewId)
  group.previewEditorId = null
}

function openFile(state: EditorWorkbenchState, action: Extract<EditorLayoutAction, { type: "open-file" }>): void {
  const group = state.groups[action.targetGroupId ?? state.activeGroupId]
  if (!group) return
  const existingId = group.editorIds.find((id) => {
    const input = state.editors[id]
    return input?.kind === "file" && input.resourceId === action.resourceId
  })
  if (existingId) {
    const input = state.editors[existingId]
    if (input?.kind === "file") {
      if (action.pinned || action.dirty) pinEditor(state, group.id, input.id)
      if (action.contentView) input.contentView = action.contentView
      activateEditor(state, group.id, input.id)
    }
    return
  }

  const shouldPin = action.pinned || action.dirty
  if (!shouldPin) removePreviewInput(state, group)
  const input: FileEditorInput = {
    id: `editor-${state.nextEditorSequence}`,
    kind: "file",
    resourceId: action.resourceId,
    pinned: shouldPin,
    preview: !shouldPin,
    contentView: action.contentView ?? "source",
  }
  state.nextEditorSequence += 1
  state.editors[input.id] = input
  group.editorIds.push(input.id)
  group.previewEditorId = input.preview ? input.id : null
  activateEditor(state, group.id, input.id)
}

function openDiff(state: EditorWorkbenchState, action: Extract<EditorLayoutAction, { type: "open-diff" }>): void {
  const group = state.groups[action.targetGroupId ?? state.activeGroupId]
  if (!group) return
  const input: DiffEditorInput = {
    id: `editor-${state.nextEditorSequence}`,
    kind: "diff",
    resourceId: action.resourceId,
    comparisonId: `comparison-${state.nextComparisonSequence}`,
    diffKind: action.kind,
    mode: "side-by-side",
    pinned: true,
    preview: false,
  }
  state.nextEditorSequence += 1
  state.nextComparisonSequence += 1
  state.editors[input.id] = input
  group.editorIds.push(input.id)
  activateEditor(state, group.id, input.id)
}

function openFileBeside(
  state: EditorWorkbenchState,
  action: Extract<EditorLayoutAction, { type: "open-file-beside" }>,
): void {
  if (!state.groups[action.anchorGroupId]) return
  const input: FileEditorInput = {
    id: `editor-${state.nextEditorSequence}`,
    kind: "file",
    resourceId: action.resourceId,
    pinned: true,
    preview: false,
    contentView: action.contentView ?? "source",
  }
  state.nextEditorSequence += 1
  const group = createGroupWithInput(state, input)
  insertGroupBeside(state, action.anchorGroupId, group.id, action.direction)
  activateEditor(state, group.id, input.id)
}

function splitEditor(
  state: EditorWorkbenchState,
  action: Extract<EditorLayoutAction, { type: "split-editor" }>,
): void {
  const sourceGroup = state.groups[action.groupId]
  const sourceInput = state.editors[action.editorId]
  if (!sourceGroup || !sourceGroup.editorIds.includes(action.editorId) || !sourceInput) return
  const copy = createClonedInput(state, sourceInput)
  if (!copy) return
  pinEditor(state, sourceGroup.id, sourceInput.id)
  const newGroup = createGroupWithInput(state, copy)
  insertGroupBeside(state, sourceGroup.id, newGroup.id, action.direction)
  activateEditor(state, newGroup.id, copy.id)
}

function moveEditor(
  state: EditorWorkbenchState,
  action: Extract<EditorLayoutAction, { type: "move-editor" }>,
): void {
  const source = state.groups[action.sourceGroupId]
  const target = state.groups[action.targetGroupId]
  const input = state.editors[action.editorId]
  if (!source || !target || !input || input.kind === "chat") return
  if (!source.editorIds.includes(input.id)) return

  pinEditor(state, source.id, input.id)
  if (source.id === target.id) {
    const fromIndex = source.editorIds.indexOf(input.id)
    if (fromIndex < 0) return
    const nextIds = [...source.editorIds]
    nextIds.splice(fromIndex, 1)
    const index = clampInsertIndex(state, { ...source, editorIds: nextIds }, action.targetIndex)
    nextIds.splice(index, 0, input.id)
    source.editorIds = nextIds
    activateEditor(state, source.id, input.id)
    return
  }

  const existingId = findEquivalentEditorId(state, target, input)
  if (existingId) {
    if (!action.copy) {
      removeEditorReference(state, source.id, input.id)
      collapseEmptySecondaryGroup(state, source.id)
    }
    activateEditor(state, target.id, existingId)
    return
  }

  const movedInput = action.copy ? createClonedInput(state, input) : input
  if (!movedInput) return
  if (!action.copy) removeEditorReference(state, source.id, input.id)
  state.editors[movedInput.id] = movedInput
  const index = clampInsertIndex(state, target, action.targetIndex)
  target.editorIds.splice(index, 0, movedInput.id)
  target.mruEditorIds = touch(target.mruEditorIds, movedInput.id)
  collapseEmptySecondaryGroup(state, source.id)
  activateEditor(state, target.id, movedInput.id)
}

function splitWithEditor(
  state: EditorWorkbenchState,
  action: Extract<EditorLayoutAction, { type: "split-with-editor" }>,
): void {
  const source = state.groups[action.sourceGroupId]
  const target = state.groups[action.targetGroupId]
  const input = state.editors[action.editorId]
  if (!source || !target || !input || input.kind === "chat") return
  if (!source.editorIds.includes(input.id)) return

  pinEditor(state, source.id, input.id)
  const nextInput = action.copy ? createClonedInput(state, input) : input
  if (!nextInput) return
  if (!action.copy) removeEditorReference(state, source.id, input.id)
  const group = createGroupWithInput(state, nextInput)
  insertGroupBeside(state, target.id, group.id, edgeDirection(action.edge))
  collapseEmptySecondaryGroup(state, source.id)
  activateEditor(state, group.id, nextInput.id)
}

function closeEditor(state: EditorWorkbenchState, groupId: string, editorId: string): void {
  const group = state.groups[groupId]
  const input = state.editors[editorId]
  if (!group || !input || input.kind === "chat") return
  removeEditorReference(state, groupId, editorId)
  collapseEmptySecondaryGroup(state, groupId)
  if (state.groups[groupId] && !state.groups[groupId]!.activeEditorId) {
    const fallback = state.groups[groupId]!.editorIds[0]
    if (fallback) activateEditor(state, groupId, fallback)
  }
}

export function reduceEditorWorkbenchState(
  state: EditorWorkbenchState,
  action: EditorLayoutAction,
): EditorWorkbenchState {
  if (action.type === "set-layout-sizes") {
    return {
      ...state,
      layout: updateSplitSizes(state.layout, action.splitId, action.sizes),
    }
  }

  const next = cloneState(state)
  switch (action.type) {
    case "open-file":
      openFile(next, action)
      break
    case "open-diff":
      openDiff(next, action)
      break
    case "open-file-beside":
      openFileBeside(next, action)
      break
    case "activate-editor":
      activateEditor(next, action.groupId, action.editorId)
      break
    case "focus-group":
      if (next.groups[action.groupId]) next.activeGroupId = action.groupId
      break
    case "pin-editor":
      pinEditor(next, action.groupId, action.editorId)
      break
    case "set-content-view": {
      const input = next.editors[action.editorId]
      if (next.groups[action.groupId]?.editorIds.includes(action.editorId) && input?.kind === "file") {
        input.contentView = action.contentView
        activateEditor(next, action.groupId, input.id)
      }
      break
    }
    case "set-diff-mode": {
      const input = next.editors[action.editorId]
      if (next.groups[action.groupId]?.editorIds.includes(action.editorId) && input?.kind === "diff") {
        input.mode = action.mode
        activateEditor(next, action.groupId, input.id)
      }
      break
    }
    case "split-editor":
      splitEditor(next, action)
      break
    case "move-editor":
      moveEditor(next, action)
      break
    case "split-with-editor":
      splitWithEditor(next, action)
      break
    case "reorder-editor":
      moveEditor(next, {
        type: "move-editor",
        sourceGroupId: action.groupId,
        editorId: action.editorId,
        targetGroupId: action.groupId,
        targetIndex: action.targetIndex,
        copy: false,
      })
      break
    case "close-editor":
      closeEditor(next, action.groupId, action.editorId)
      break
    case "close-group": {
      const group = next.groups[action.groupId]
      if (!group) break
      if (action.groupId === next.primaryGroupId) {
        for (const editorId of [...group.editorIds]) closeEditor(next, group.id, editorId)
        activateEditor(next, group.id, CHAT_EDITOR_ID)
      } else {
        removeGroup(next, group.id)
      }
      break
    }
  }
  return next
}

export function collectLayoutGroupIds(node: EditorLayoutNode): string[] {
  if (node.type === "group") return [node.groupId]
  return node.children.flatMap(collectLayoutGroupIds)
}

export function selectActiveEditor(state: EditorWorkbenchState): EditorInput | null {
  const group = state.groups[state.activeGroupId]
  return group ? state.editors[group.activeEditorId] ?? null : null
}

export function selectGroupActiveEditor(
  state: EditorWorkbenchState,
  groupId: string,
): EditorInput | null {
  const group = state.groups[groupId]
  return group ? state.editors[group.activeEditorId] ?? null : null
}

export function selectActiveResourceId(state: EditorWorkbenchState): string | null {
  const active = selectActiveEditor(state)
  return active && active.kind !== "chat" ? active.resourceId : null
}

export function selectOpenResourceIds(state: EditorWorkbenchState): string[] {
  const seen = new Set<string>()
  const resources: string[] = []
  for (const groupId of collectLayoutGroupIds(state.layout)) {
    for (const editorId of state.groups[groupId]?.editorIds ?? []) {
      const editor = state.editors[editorId]
      if (!editor || editor.kind === "chat" || seen.has(editor.resourceId)) continue
      seen.add(editor.resourceId)
      resources.push(editor.resourceId)
    }
  }
  return resources
}

export function countResourceReferences(state: EditorWorkbenchState, resourceId: string): number {
  return Object.values(state.groups).reduce((count, group) =>
    count + group.editorIds.filter((editorId) => {
      const editor = state.editors[editorId]
      return editor?.kind !== "chat" && editor?.resourceId === resourceId
    }).length,
  0)
}

export function countResourceReferencesInGroup(
  state: EditorWorkbenchState,
  groupId: string,
  resourceId: string,
): number {
  const group = state.groups[groupId]
  if (!group) return 0
  return group.editorIds.filter((editorId) => {
    const editor = state.editors[editorId]
    return editor?.kind !== "chat" && editor?.resourceId === resourceId
  }).length
}

export function minimumEditorLayoutSize(node: EditorLayoutNode): { width: number; height: number } {
  if (node.type === "group") return { width: 320, height: 240 }
  const children = node.children.map(minimumEditorLayoutSize)
  if (node.orientation === "horizontal") {
    return {
      width: children.reduce((sum, child) => sum + child.width, 0),
      height: Math.max(...children.map((child) => child.height)),
    }
  }
  return {
    width: Math.max(...children.map((child) => child.width)),
    height: children.reduce((sum, child) => sum + child.height, 0),
  }
}

export function validateEditorWorkbenchState(state: EditorWorkbenchState): string[] {
  const errors: string[] = []
  const layoutGroupIds = collectLayoutGroupIds(state.layout)
  const stateGroupIds = Object.keys(state.groups)
  if (new Set(layoutGroupIds).size !== layoutGroupIds.length) errors.push("布局树包含重复编辑组")
  if (layoutGroupIds.length !== stateGroupIds.length) errors.push("布局树与编辑组表不一致")
  if (!state.groups[state.primaryGroupId]) errors.push("主编辑组不存在")
  if (!state.groups[state.activeGroupId]) errors.push("活动编辑组不存在")

  const referencedEditorIds = new Set<string>()
  for (const groupId of stateGroupIds) {
    const group = state.groups[groupId]!
    if (!layoutGroupIds.includes(groupId)) errors.push(`编辑组 ${groupId} 不在布局树中`)
    if (new Set(group.editorIds).size !== group.editorIds.length) errors.push(`编辑组 ${groupId} 包含重复编辑器 ID`)
    if (!group.editorIds.includes(group.activeEditorId)) errors.push(`编辑组 ${groupId} 的活动编辑器不存在`)
    const identities = new Set<string>()
    for (const editorId of group.editorIds) {
      const editor = state.editors[editorId]
      if (!editor) {
        errors.push(`编辑组 ${groupId} 引用了不存在的编辑器 ${editorId}`)
        continue
      }
      if (referencedEditorIds.has(editorId)) errors.push(`编辑器 ${editorId} 同时属于多个编辑组`)
      referencedEditorIds.add(editorId)
      const identity = inputIdentity(editor)
      if (identities.has(identity)) errors.push(`编辑组 ${groupId} 包含重复输入 ${identity}`)
      identities.add(identity)
      if (editor.kind === "chat" && groupId !== state.primaryGroupId) errors.push("聊天页签只能位于主编辑组")
    }
    if (group.previewEditorId) {
      const preview = state.editors[group.previewEditorId]
      if (!group.editorIds.includes(group.previewEditorId)) errors.push(`编辑组 ${groupId} 的预览编辑器不存在`)
      else if (preview?.kind !== "file" || preview.pinned || !preview.preview) errors.push(`编辑组 ${groupId} 的预览编辑器状态无效`)
    }
    if (group.mruEditorIds.some((id) => !group.editorIds.includes(id))) errors.push(`编辑组 ${groupId} 的 MRU 包含无效编辑器`)
  }

  const primary = state.groups[state.primaryGroupId]
  if (primary?.editorIds[0] !== CHAT_EDITOR_ID) errors.push("聊天页签不是主编辑组第一项")
  if (state.editors[CHAT_EDITOR_ID]?.kind !== "chat") errors.push("聊天编辑器不存在")
  for (const editorId of Object.keys(state.editors)) {
    if (!referencedEditorIds.has(editorId)) errors.push(`编辑器 ${editorId} 没有所属编辑组`)
  }
  return errors
}
