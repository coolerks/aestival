import { create } from "zustand"

import {
  createNoteWorkspaceSnapshot,
  initialNoteBuffers,
  initialWorkspaceProjects,
  sampleNoteEntries,
} from "@/data/mock-project-workspace"
import { noteEditorKey } from "@/lib/project-workspace"
import type {
  NoteEditorMode,
  NoteBuffer,
  NoteEntry,
  NotePanelType,
  NoteWorkspaceSnapshot,
  ProjectDraft,
  WorkspaceProject,
} from "@/types/project-workspace"

type ProjectWorkspaceStore = {
  projects: WorkspaceProject[]
  activeProjectId: string
  projectDialogOpen: boolean
  projectDialogRequestId: number
  noteWorkspaces: Record<string, NoteWorkspaceSnapshot>
  noteBuffers: Record<string, NoteBuffer>
  noteEntries: NoteEntry[]
  setProjectDialogOpen: (open: boolean) => void
  requestProjectDialog: () => void
  setActiveProject: (projectId: string) => void
  createProject: (draft: ProjectDraft) => WorkspaceProject
  renameProject: (projectId: string, name: string) => void
  removeProject: (projectId: string) => void
  setNotePanelOpen: (
    projectId: string,
    placement: "right" | "bottom",
    open: boolean,
  ) => void
  setActiveNotePanel: (
    projectId: string,
    placement: "right" | "bottom",
    panel: NotePanelType,
  ) => void
  setNoteSearchQuery: (projectId: string, query: string) => void
  setOutlineQuery: (projectId: string, query: string) => void
  toggleNoteEntry: (projectId: string, entryId: string) => void
  createNoteEntry: (projectId: string, parentId: string | null, name: string, kind: "markdown" | "folder") => string | null
  renameNoteEntry: (entryId: string, name: string) => boolean
  moveNoteEntry: (entryId: string, targetFolderId: string) => boolean
  trashNoteEntry: (entryId: string) => void
  openNote: (projectId: string, noteId: string, persistent?: boolean, groupId?: string) => void
  openGlobalGraph: (projectId: string, groupId?: string) => void
  setActiveNoteTab: (projectId: string, groupId: string, tabId: string) => void
  closeNoteTab: (projectId: string, groupId: string, tabId: string) => void
  focusNoteGroup: (projectId: string, groupId: string) => void
  splitActiveNote: (projectId: string) => void
  closeNoteGroup: (projectId: string, groupId: string) => void
  setNoteEditorMode: (
    projectId: string,
    groupId: string,
    noteId: string,
    mode: NoteEditorMode,
  ) => void
  updateNoteBuffer: (noteId: string, markdown: string) => void
  markNoteSaved: (noteId: string) => void
  discardNoteChanges: (noteId: string) => void
  setGraphQuery: (projectId: string, query: string) => void
  setGraphRootFilter: (projectId: string, rootId: string) => void
  setGraphShowOrphans: (projectId: string, show: boolean) => void
  selectGraphNode: (projectId: string, noteId: string | null) => void
  setLocalGraphDepth: (projectId: string, depth: 1 | 2 | 3) => void
  setLocalGraphDirection: (
    projectId: string,
    direction: "both" | "incoming" | "outgoing",
  ) => void
}

function updateSnapshot(
  snapshots: Record<string, NoteWorkspaceSnapshot>,
  projectId: string,
  update: (snapshot: NoteWorkspaceSnapshot) => NoteWorkspaceSnapshot,
) {
  const snapshot = snapshots[projectId]
  if (!snapshot) return snapshots
  return { ...snapshots, [projectId]: update(snapshot) }
}

function replaceEntryPathPrefix(
  entry: NoteEntry,
  previousPath: string,
  nextPath: string,
) {
  if (entry.relativePath === previousPath) {
    return { ...entry, relativePath: nextPath }
  }
  if (entry.relativePath.startsWith(`${previousPath}/`)) {
    return {
      ...entry,
      relativePath: `${nextPath}${entry.relativePath.slice(previousPath.length)}`,
    }
  }
  return entry
}

const sampleWorkspace = createNoteWorkspaceSnapshot("research-notes", true)
let runtimeIdSequence = 0

function createRuntimeId(prefix: string) {
  runtimeIdSequence += 1
  return `${prefix}-${Date.now()}-${runtimeIdSequence}`
}

export const useProjectWorkspaceStore = create<ProjectWorkspaceStore>(
  (set, get) => ({
    projects: initialWorkspaceProjects.map((project) => ({
      ...project,
      roots: project.roots.map((root) => ({ ...root })),
    })),
    activeProjectId: "task",
    projectDialogOpen: false,
    projectDialogRequestId: 0,
    noteWorkspaces: { "research-notes": sampleWorkspace },
    noteBuffers: Object.fromEntries(
      Object.entries(initialNoteBuffers).map(([id, buffer]) => [
        id,
        { ...buffer },
      ]),
    ),
    noteEntries: sampleNoteEntries.map((entry) => ({
      ...entry,
      children: entry.children ? [...entry.children] : undefined,
    })),
    setProjectDialogOpen: (projectDialogOpen) => set({ projectDialogOpen }),
    requestProjectDialog: () =>
      set((state) => ({
        projectDialogOpen: true,
        projectDialogRequestId: state.projectDialogRequestId + 1,
      })),
    setActiveProject: (activeProjectId) => set({ activeProjectId }),
    createProject: (draft) => {
      const now = new Date()
      const id = createRuntimeId("project")
      const project: WorkspaceProject = {
        id,
        name: draft.name.trim(),
        kind: draft.kind ?? "project",
        roots: draft.roots.map((root) => ({ ...root })),
        defaultRootId: draft.defaultRootId,
        createdAt: now.toISOString(),
        createdInCurrentRun: true,
      }
      set((state) => ({
        projects: [...state.projects, project],
        activeProjectId: id,
        projectDialogOpen: false,
        noteWorkspaces:
          project.kind === "note"
            ? {
                ...state.noteWorkspaces,
                [id]: createNoteWorkspaceSnapshot(id),
              }
            : state.noteWorkspaces,
      }))
      return project
    },
    renameProject: (projectId, name) =>
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId && !project.fixed
            ? { ...project, name: name.trim() || project.name }
            : project,
        ),
      })),
    removeProject: (projectId) =>
      set((state) => {
        const project = state.projects.find((item) => item.id === projectId)
        if (!project || project.fixed) return state
        const noteWorkspaces = { ...state.noteWorkspaces }
        delete noteWorkspaces[projectId]
        return {
          projects: state.projects.filter((item) => item.id !== projectId),
          activeProjectId:
            state.activeProjectId === projectId ? "task" : state.activeProjectId,
          noteWorkspaces,
        }
      }),
    setNotePanelOpen: (projectId, placement, open) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(
          state.noteWorkspaces,
          projectId,
          (snapshot) =>
            placement === "right"
              ? { ...snapshot, rightPanelOpen: open }
              : { ...snapshot, bottomPanelOpen: open },
        ),
      })),
    setActiveNotePanel: (projectId, placement, panel) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(
          state.noteWorkspaces,
          projectId,
          (snapshot) =>
            placement === "right"
              ? { ...snapshot, activeRightPanel: panel }
              : panel === "search" || panel === "backlinks"
                ? { ...snapshot, activeBottomPanel: panel }
                : snapshot,
        ),
      })),
    setNoteSearchQuery: (projectId, searchQuery) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, searchQuery })),
      })),
    setOutlineQuery: (projectId, outlineQuery) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, outlineQuery })),
      })),
    toggleNoteEntry: (projectId, entryId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({
          ...snapshot,
          expandedEntryIds: snapshot.expandedEntryIds.includes(entryId)
            ? snapshot.expandedEntryIds.filter((id) => id !== entryId)
            : [...snapshot.expandedEntryIds, entryId],
        })),
      })),
    createNoteEntry: (projectId, requestedParentId, rawName, kind) => {
      const state = get()
      const project = state.projects.find((item) => item.id === projectId)
      if (!project?.sample) return null
      const rootEntry = state.noteEntries.find(
        (entry) => entry.rootId === project.defaultRootId && entry.parentId === null,
      )
      const parent = state.noteEntries.find(
        (entry) => entry.id === requestedParentId && entry.kind === "folder",
      ) ?? rootEntry
      if (!parent) return null
      const baseName = rawName.trim()
      const name = kind === "markdown" && !/\.md$/i.test(baseName) ? `${baseName}.md` : baseName
      if (!name) return null
      const duplicate = state.noteEntries.some(
        (entry) => entry.parentId === parent.id && entry.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
      if (duplicate) return null
      const id = createRuntimeId(kind === "markdown" ? "note" : "folder")
      const relativePath = [parent.relativePath, name].filter(Boolean).join("/")
      const entry: NoteEntry = {
        id,
        rootId: parent.rootId,
        parentId: parent.id,
        name,
        relativePath,
        kind,
        children: kind === "folder" ? [] : undefined,
      }
      const buffer: NoteBuffer | null = kind === "markdown"
        ? {
            noteId: id,
            markdown: `# ${name.replace(/\.md$/i, "")}\n\n`,
            savedMarkdown: "",
            version: 1,
            status: "dirty",
          }
        : null
      set((current) => ({
        noteEntries: [
          ...current.noteEntries.map((candidate) =>
            candidate.id === parent.id
              ? { ...candidate, children: [...(candidate.children ?? []), id] }
              : candidate,
          ),
          entry,
        ],
        noteBuffers: buffer ? { ...current.noteBuffers, [id]: buffer } : current.noteBuffers,
        noteWorkspaces: updateSnapshot(current.noteWorkspaces, projectId, (snapshot) => ({
          ...snapshot,
          expandedEntryIds: snapshot.expandedEntryIds.includes(parent.id)
            ? snapshot.expandedEntryIds
            : [...snapshot.expandedEntryIds, parent.id],
        })),
      }))
      if (kind === "markdown") get().openNote(projectId, id, true)
      return id
    },
    renameNoteEntry: (entryId, rawName) => {
      const state = get()
      const entry = state.noteEntries.find((item) => item.id === entryId)
      if (!entry || entry.parentId === null) return false
      const baseName = rawName.trim()
      const name = entry.kind === "markdown" && !/\.md$/i.test(baseName) ? `${baseName}.md` : baseName
      if (!name) return false
      const duplicate = state.noteEntries.some(
        (item) =>
          item.id !== entryId &&
          item.parentId === entry.parentId &&
          item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
      if (duplicate) return false
      const parent = state.noteEntries.find((item) => item.id === entry.parentId)
      const relativePath = [parent?.relativePath, name].filter(Boolean).join("/")
      set((current) => ({
        noteEntries: current.noteEntries.map((item) => {
          const updated = replaceEntryPathPrefix(
            item,
            entry.relativePath,
            relativePath,
          )
          return item.id === entryId ? { ...updated, name } : updated
        }),
        noteWorkspaces: Object.fromEntries(
          Object.entries(current.noteWorkspaces).map(([projectId, snapshot]) => [
            projectId,
            {
              ...snapshot,
              groups: snapshot.groups.map((group) => ({
                ...group,
                tabs: group.tabs.map((tab) =>
                  tab.resourceId === entryId ? { ...tab, title: name } : tab,
                ),
              })),
            },
          ]),
        ),
      }))
      return true
    },
    moveNoteEntry: (entryId, targetFolderId) => {
      const state = get()
      const entry = state.noteEntries.find((item) => item.id === entryId)
      const target = state.noteEntries.find(
        (item) => item.id === targetFolderId && item.kind === "folder",
      )
      if (
        !entry ||
        entry.parentId === null ||
        !target ||
        entry.id === target.id ||
        entry.rootId !== target.rootId ||
        entry.parentId === target.id
      ) {
        return false
      }
      let ancestor: NoteEntry | undefined = target
      while (ancestor) {
        if (ancestor.id === entry.id) return false
        ancestor = ancestor.parentId
          ? state.noteEntries.find((item) => item.id === ancestor?.parentId)
          : undefined
      }
      if (
        target.children?.some(
          (id) =>
            state.noteEntries
              .find((item) => item.id === id)
              ?.name.toLocaleLowerCase() === entry.name.toLocaleLowerCase(),
        )
      ) {
        return false
      }
      const relativePath = [target.relativePath, entry.name]
        .filter(Boolean)
        .join("/")
      set((current) => ({
        noteEntries: current.noteEntries.map((item) => {
          if (item.id === entry.parentId) {
            return {
              ...item,
              children: item.children?.filter((id) => id !== entryId),
            }
          }
          if (item.id === target.id) {
            return { ...item, children: [...(item.children ?? []), entryId] }
          }
          const updated = replaceEntryPathPrefix(
            item,
            entry.relativePath,
            relativePath,
          )
          return item.id === entryId
            ? { ...updated, parentId: target.id }
            : updated
        }),
      }))
      return true
    },
    trashNoteEntry: (entryId) =>
      set((state) => {
        const target = state.noteEntries.find((entry) => entry.id === entryId)
        if (!target || target.parentId === null) return state
        const collect = (id: string, ids: Set<string>) => {
          ids.add(id)
          state.noteEntries.find((entry) => entry.id === id)?.children?.forEach((child) => collect(child, ids))
        }
        const removed = new Set<string>()
        collect(entryId, removed)
        const noteBuffers = { ...state.noteBuffers }
        removed.forEach((id) => delete noteBuffers[id])
        const noteWorkspaces = Object.fromEntries(
          Object.entries(state.noteWorkspaces).map(([projectId, snapshot]) => [
            projectId,
            {
              ...snapshot,
              groups: snapshot.groups.map((group) => {
                const tabs = group.tabs.filter((tab) => !tab.resourceId || !removed.has(tab.resourceId))
                const active = tabs.find((tab) => tab.id === group.activeTabId) ?? tabs[0]
                return { ...group, tabs, activeTabId: active?.id ?? "tab-chat" }
              }),
              selectedGraphNodeId: snapshot.selectedGraphNodeId && removed.has(snapshot.selectedGraphNodeId) ? null : snapshot.selectedGraphNodeId,
            },
          ]),
        )
        return {
          noteEntries: state.noteEntries
            .filter((entry) => !removed.has(entry.id))
            .map((entry) => ({ ...entry, children: entry.children?.filter((id) => !removed.has(id)) })),
          noteBuffers,
          noteWorkspaces,
        }
      }),
    openNote: (projectId, noteId, persistent = false, requestedGroupId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => {
          const groupId = requestedGroupId ?? snapshot.focusedGroupId
          return {
            ...snapshot,
            focusedGroupId: groupId,
            selectedGraphNodeId: noteId,
            groups: snapshot.groups.map((group) => {
              if (group.id !== groupId) return group
              const entry = state.noteEntries.find((item) => item.id === noteId)
              const title = entry?.name ?? "未命名笔记.md"
              const existing = group.tabs.find(
                (tab) => tab.kind === "note" && tab.resourceId === noteId,
              )
              if (existing) {
                return {
                  ...group,
                  activeTabId: existing.id,
                  tabs: group.tabs.map((tab) =>
                    tab.id === existing.id && persistent
                      ? { ...tab, preview: false }
                      : tab,
                  ),
                }
              }
              const previewIndex = group.tabs.findIndex((tab) => tab.preview)
              const nextTab = {
                id: `tab-${noteId}-${group.id}`,
                kind: "note" as const,
                title,
                resourceId: noteId,
                preview: !persistent,
              }
              const tabs = [...group.tabs]
              if (previewIndex >= 0 && !persistent) tabs.splice(previewIndex, 1, nextTab)
              else tabs.push(nextTab)
              return { ...group, tabs, activeTabId: nextTab.id }
            }),
          }
        }),
      })),
    openGlobalGraph: (projectId, requestedGroupId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => {
          const groupId = requestedGroupId ?? snapshot.focusedGroupId
          return {
            ...snapshot,
            focusedGroupId: groupId,
            groups: snapshot.groups.map((group) => {
              if (group.id !== groupId) return group
              const existing = group.tabs.find((tab) => tab.kind === "graph")
              if (existing) return { ...group, activeTabId: existing.id }
              const graph = { id: `tab-graph-${group.id}`, kind: "graph" as const, title: "全局图谱", resourceId: null, preview: false }
              return { ...group, tabs: [...group.tabs, graph], activeTabId: graph.id }
            }),
          }
        }),
      })),
    setActiveNoteTab: (projectId, groupId, tabId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({
          ...snapshot,
          focusedGroupId: groupId,
          groups: snapshot.groups.map((group) =>
            group.id === groupId ? { ...group, activeTabId: tabId } : group,
          ),
        })),
      })),
    closeNoteTab: (projectId, groupId, tabId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({
          ...snapshot,
          groups: snapshot.groups.map((group) => {
            if (group.id !== groupId) return group
            const tab = group.tabs.find((item) => item.id === tabId)
            if (!tab || tab.kind === "chat") return group
            const index = group.tabs.findIndex((item) => item.id === tabId)
            const tabs = group.tabs.filter((item) => item.id !== tabId)
            const fallback = tabs[Math.min(index, tabs.length - 1)] ?? tabs[0]
            return { ...group, tabs, activeTabId: group.activeTabId === tabId ? fallback?.id ?? "tab-chat" : group.activeTabId }
          }),
        })),
      })),
    focusNoteGroup: (projectId, focusedGroupId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, focusedGroupId })),
      })),
    splitActiveNote: (projectId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => {
          if (snapshot.groups.length >= 2) return snapshot
          const current = snapshot.groups.find((group) => group.id === snapshot.focusedGroupId)
          const tab = current?.tabs.find((item) => item.id === current.activeTabId)
          if (!tab || tab.kind !== "note" || !tab.resourceId) return snapshot
          const groupId = "group-side"
          const sideTab = { ...tab, id: `${tab.id}-side`, preview: false }
          return {
            ...snapshot,
            focusedGroupId: groupId,
            groups: [...snapshot.groups, { id: groupId, tabs: [sideTab], activeTabId: sideTab.id }],
            editorModes: { ...snapshot.editorModes, [noteEditorKey(groupId, tab.resourceId)]: "preview" },
          }
        }),
      })),
    closeNoteGroup: (projectId, groupId) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => {
          if (groupId === "group-main") return snapshot
          return { ...snapshot, groups: snapshot.groups.filter((group) => group.id !== groupId), focusedGroupId: "group-main" }
        }),
      })),
    setNoteEditorMode: (projectId, groupId, noteId, mode) =>
      set((state) => ({
        noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({
          ...snapshot,
          editorModes: { ...snapshot.editorModes, [noteEditorKey(groupId, noteId)]: mode },
        })),
      })),
    updateNoteBuffer: (noteId, markdown) =>
      set((state) => {
        const buffer = state.noteBuffers[noteId]
        if (!buffer || buffer.markdown === markdown) return state
        return {
          noteBuffers: {
            ...state.noteBuffers,
            [noteId]: { ...buffer, markdown, version: buffer.version + 1, status: "dirty" },
          },
        }
      }),
    markNoteSaved: (noteId) =>
      set((state) => {
        const buffer = state.noteBuffers[noteId]
        if (!buffer) return state
        return { noteBuffers: { ...state.noteBuffers, [noteId]: { ...buffer, savedMarkdown: buffer.markdown, status: "ready" } } }
      }),
    discardNoteChanges: (noteId) =>
      set((state) => {
        const buffer = state.noteBuffers[noteId]
        if (!buffer || buffer.status !== "dirty") return state
        return {
          noteBuffers: {
            ...state.noteBuffers,
            [noteId]: {
              ...buffer,
              markdown: buffer.savedMarkdown,
              version: buffer.version + 1,
              status: "ready",
            },
          },
        }
      }),
    setGraphQuery: (projectId, graphQuery) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, graphQuery })) })),
    setGraphRootFilter: (projectId, graphRootFilter) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, graphRootFilter })) })),
    setGraphShowOrphans: (projectId, graphShowOrphans) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, graphShowOrphans })) })),
    selectGraphNode: (projectId, selectedGraphNodeId) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, selectedGraphNodeId })) })),
    setLocalGraphDepth: (projectId, localGraphDepth) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, localGraphDepth })) })),
    setLocalGraphDirection: (projectId, localGraphDirection) =>
      set((state) => ({ noteWorkspaces: updateSnapshot(state.noteWorkspaces, projectId, (snapshot) => ({ ...snapshot, localGraphDirection })) })),
  }),
)
