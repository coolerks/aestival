export type ProjectKind = "project" | "note"

export type WorkspaceStatus =
  | "idle"
  | "dirty"
  | "loading"
  | "ready"
  | "partial"
  | "error"

export type ProjectRootAvailability = "unknown" | "ready" | "unavailable"

export type ProjectRoot = {
  id: string
  displayName: string
  path: string
  canonicalIdentity: string
  availability: ProjectRootAvailability
}

export type WorkspaceProject = {
  id: string
  name: string
  kind: ProjectKind
  roots: ProjectRoot[]
  defaultRootId: string | null
  createdAt: string
  fixed?: boolean
  sample?: boolean
  createdInCurrentRun?: boolean
}

export type ProjectDraft = {
  name: string
  kind: ProjectKind | null
  roots: ProjectRoot[]
  defaultRootId: string | null
}

export type ProjectDraftErrors = Partial<
  Record<"name" | "kind" | "roots" | "defaultRootId" | "summary", string>
>

export type NoteEditorMode = "source" | "split" | "instant" | "preview"

export type NotePanelType =
  | "files"
  | "search"
  | "outline"
  | "backlinks"
  | "metadata"
  | "local-graph"

export type NoteEntryKind =
  | "folder"
  | "markdown"
  | "image"
  | "pdf"
  | "text"
  | "binary"

export type NoteEntry = {
  id: string
  rootId: string
  parentId: string | null
  name: string
  relativePath: string
  kind: NoteEntryKind
  readonly?: boolean
  children?: string[]
}

export type NoteBuffer = {
  noteId: string
  markdown: string
  savedMarkdown: string
  version: number
  status: WorkspaceStatus
}

export type NoteTab = {
  id: string
  kind: "chat" | "note" | "graph"
  title: string
  resourceId: string | null
  preview: boolean
}

export type NoteEditorGroup = {
  id: string
  tabs: NoteTab[]
  activeTabId: string
}

export type NoteWorkspaceSnapshot = {
  projectId: string
  groups: NoteEditorGroup[]
  focusedGroupId: string
  editorModes: Record<string, NoteEditorMode>
  expandedEntryIds: string[]
  rightPanelTypes: NotePanelType[]
  activeRightPanel: NotePanelType
  bottomPanelTypes: Array<Extract<NotePanelType, "search" | "backlinks">>
  activeBottomPanel: Extract<NotePanelType, "search" | "backlinks">
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  searchQuery: string
  outlineQuery: string
  graphQuery: string
  graphRootFilter: string
  graphShowOrphans: boolean
  selectedGraphNodeId: string | null
  localGraphDepth: 1 | 2 | 3
  localGraphDirection: "both" | "incoming" | "outgoing"
}

export type NoteOutlineItem = {
  id: string
  noteId: string
  depth: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  line: number
}

export type NoteBacklink = {
  id: string
  sourceNoteId: string
  sourceTitle: string
  rootLabel: string
  line: number
  context: string
  linked: boolean
}

export type NoteMetadata = {
  noteId: string
  tags: string[]
  properties: Array<{
    key: string
    value: string
    type: "string" | "number" | "boolean" | "date" | "list" | "unknown"
    readonly?: boolean
  }>
}

export type NoteGraphNode = {
  id: string
  rootId: string
  relativePath: string
  title: string
  tags: string[]
  hasAttachments: boolean
  orphan: boolean
}

export type NoteGraphEdge = {
  id: string
  sourceId: string
  targetId: string
  kind: "markdown-link" | "wiki-link"
}
