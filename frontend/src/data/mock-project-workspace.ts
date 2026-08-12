import type {
  NoteBacklink,
  NoteBuffer,
  NoteEntry,
  NoteGraphEdge,
  NoteGraphNode,
  NoteMetadata,
  NoteOutlineItem,
  NoteWorkspaceSnapshot,
  WorkspaceProject,
} from "@/types/project-workspace"

const instantMode = {
  "group-main:note-aestival": "instant",
} as const

export const initialWorkspaceProjects: WorkspaceProject[] = [
  {
    id: "task",
    name: "任务",
    kind: "project",
    roots: [],
    defaultRootId: null,
    createdAt: "2026-08-01T08:00:00.000Z",
    fixed: true,
  },
  {
    id: "aestival",
    name: "Aestival",
    kind: "project",
    roots: [],
    defaultRootId: null,
    createdAt: "2026-08-02T08:00:00.000Z",
  },
  {
    id: "ai-ui",
    name: "AI UI",
    kind: "project",
    roots: [],
    defaultRootId: null,
    createdAt: "2026-08-03T08:00:00.000Z",
  },
  {
    id: "research-notes",
    name: "研究笔记 · 示例",
    kind: "note",
    roots: [
      {
        id: "root-notes",
        displayName: "Notes",
        path: "/示例/Notes",
        canonicalIdentity: "/示例/Notes",
        availability: "ready",
      },
      {
        id: "root-library",
        displayName: "Library",
        path: "/示例/Library",
        canonicalIdentity: "/示例/Library",
        availability: "ready",
      },
    ],
    defaultRootId: "root-notes",
    createdAt: "2026-08-11T12:00:00.000Z",
    sample: true,
  },
]

export const sampleNoteEntries: NoteEntry[] = [
  { id: "folder-notes-root", rootId: "root-notes", parentId: null, name: "Notes", relativePath: "", kind: "folder", children: ["folder-projects", "folder-research", "folder-inbox"] },
  { id: "folder-projects", rootId: "root-notes", parentId: "folder-notes-root", name: "Projects", relativePath: "Projects", kind: "folder", children: ["note-aestival"] },
  { id: "folder-research", rootId: "root-notes", parentId: "folder-notes-root", name: "Research", relativePath: "Research", kind: "folder", children: ["note-graph", "note-agents"] },
  { id: "folder-inbox", rootId: "root-notes", parentId: "folder-notes-root", name: "Inbox", relativePath: "Inbox", kind: "folder", children: ["note-reading"] },
  { id: "note-aestival", rootId: "root-notes", parentId: "folder-projects", name: "Aestival 笔记工作区.md", relativePath: "Projects/Aestival 笔记工作区.md", kind: "markdown" },
  { id: "note-graph", rootId: "root-notes", parentId: "folder-research", name: "知识图谱设计.md", relativePath: "Research/知识图谱设计.md", kind: "markdown" },
  { id: "note-agents", rootId: "root-notes", parentId: "folder-research", name: "笔记代理边界.md", relativePath: "Research/笔记代理边界.md", kind: "markdown" },
  { id: "note-reading", rootId: "root-notes", parentId: "folder-inbox", name: "阅读摘记.md", relativePath: "Inbox/阅读摘记.md", kind: "markdown" },
  { id: "folder-library-root", rootId: "root-library", parentId: null, name: "Library", relativePath: "", kind: "folder", children: ["folder-sources", "folder-assets"] },
  { id: "folder-sources", rootId: "root-library", parentId: "folder-library-root", name: "Sources", relativePath: "Sources", kind: "folder", children: ["note-vditor"] },
  { id: "folder-assets", rootId: "root-library", parentId: "folder-library-root", name: "Assets", relativePath: "Assets", kind: "folder", children: ["asset-flow"] },
  { id: "note-vditor", rootId: "root-library", parentId: "folder-sources", name: "Vditor 调研.md", relativePath: "Sources/Vditor 调研.md", kind: "markdown" },
  { id: "asset-flow", rootId: "root-library", parentId: "folder-assets", name: "workspace-flow.png", relativePath: "Assets/workspace-flow.png", kind: "image", readonly: true },
]

const markdownById: Record<string, string> = {
  "note-aestival": `---
title: Aestival 笔记工作区
tags: [product, notes, ui]
status: active
updated: 2026-08-11
---

# Aestival 笔记工作区

笔记项目把 Markdown 编辑、知识面板与固定聊天页签放进同一个克制的桌面工作区。

## 设计目标

- 使用 Vditor 提供源码、并排、即时与预览四种模式。
- 只把显式 Markdown 链接与 [[知识图谱设计]] 视为图谱边。
- 让 [[笔记代理边界]] 限制 Shell、构建与调试动作。

## 编辑体验

同一笔记可以在多个编辑组打开；Markdown Buffer 共享，而模式与滚动位置彼此独立。

> 当前内容与保存提示均为前端示例，不会写入磁盘。

## 下一步

结合 [Vditor 调研](../../Library/Sources/Vditor%20调研.md) 完成本地资源加载，并从 [[阅读摘记]] 汇总后续观察。
`,
  "note-graph": `---
title: 知识图谱设计
tags: [graph, knowledge]
---

# 知识图谱设计

图谱只展示明确链接，不根据相似文本或共同标签猜测关系。

## 节点

每个 Markdown 文件是一个节点，身份由根目录与相对路径组成。

## 边

标准 Markdown 链接与 WikiLink 形成有向边。相关入口见 [[Aestival 笔记工作区]]。
`,
  "note-agents": `# 笔记代理边界

笔记代理可以在已授权根目录内搜索和处理文件，但不能使用终端、构建、调试或项目看板。

## 明确拒绝

- Shell 与脚本执行
- 根目录外路径
- 未经审批的写入

返回 [[Aestival 笔记工作区]]。
`,
  "note-reading": `# 阅读摘记

把高质量文章的观点整理为长期笔记，再链接到 [[Aestival 笔记工作区]]。

## 待整理

- 编辑器模式切换是否保留选区
- 图谱列表的键盘操作
`,
  "note-vditor": `---
title: Vditor 调研
tags: [editor, markdown]
license: MIT
---

# Vditor 调研

Vditor 的 sv 与 ir 模式覆盖本项目需要的源码、并排和即时渲染，静态 preview API 用于只读预览。

关联：[[Aestival 笔记工作区]]。
`,
}

export const initialNoteBuffers = Object.entries(markdownById).reduce<
  Record<string, NoteBuffer>
>((buffers, [noteId, markdown]) => {
  buffers[noteId] = {
    noteId,
    markdown,
    savedMarkdown: markdown,
    version: 1,
    status: "ready",
  }
  return buffers
}, {})

export const sampleOutlines: NoteOutlineItem[] = [
  { id: "outline-aestival-1", noteId: "note-aestival", depth: 1, title: "Aestival 笔记工作区", line: 8 },
  { id: "outline-aestival-2", noteId: "note-aestival", depth: 2, title: "设计目标", line: 12 },
  { id: "outline-aestival-3", noteId: "note-aestival", depth: 2, title: "编辑体验", line: 20 },
  { id: "outline-aestival-4", noteId: "note-aestival", depth: 2, title: "下一步", line: 26 },
  { id: "outline-graph-1", noteId: "note-graph", depth: 1, title: "知识图谱设计", line: 6 },
  { id: "outline-graph-2", noteId: "note-graph", depth: 2, title: "节点", line: 10 },
  { id: "outline-graph-3", noteId: "note-graph", depth: 2, title: "边", line: 14 },
]

export const sampleBacklinks: NoteBacklink[] = [
  { id: "backlink-graph", sourceNoteId: "note-graph", sourceTitle: "知识图谱设计", rootLabel: "Notes", line: 16, context: "相关入口见 [[Aestival 笔记工作区]]。", linked: true },
  { id: "backlink-agents", sourceNoteId: "note-agents", sourceTitle: "笔记代理边界", rootLabel: "Notes", line: 12, context: "返回 [[Aestival 笔记工作区]]。", linked: true },
  { id: "backlink-vditor", sourceNoteId: "note-vditor", sourceTitle: "Vditor 调研", rootLabel: "Library", line: 11, context: "关联：[[Aestival 笔记工作区]]。", linked: true },
  { id: "mention-reading", sourceNoteId: "note-reading", sourceTitle: "阅读摘记", rootLabel: "Notes", line: 7, context: "继续观察 Aestival 笔记工作区的使用密度。", linked: false },
]

export const sampleMetadata: NoteMetadata[] = [
  {
    noteId: "note-aestival",
    tags: ["product", "notes", "ui"],
    properties: [
      { key: "title", value: "Aestival 笔记工作区", type: "string" },
      { key: "status", value: "active", type: "string" },
      { key: "updated", value: "2026-08-11", type: "date" },
      { key: "custom_view", value: "compact", type: "unknown", readonly: true },
    ],
  },
]

export const sampleGraphNodes: NoteGraphNode[] = [
  { id: "note-aestival", rootId: "root-notes", relativePath: "Projects/Aestival 笔记工作区.md", title: "Aestival 笔记工作区", tags: ["product", "notes", "ui"], hasAttachments: true, orphan: false },
  { id: "note-graph", rootId: "root-notes", relativePath: "Research/知识图谱设计.md", title: "知识图谱设计", tags: ["graph", "knowledge"], hasAttachments: false, orphan: false },
  { id: "note-agents", rootId: "root-notes", relativePath: "Research/笔记代理边界.md", title: "笔记代理边界", tags: ["agents"], hasAttachments: false, orphan: false },
  { id: "note-reading", rootId: "root-notes", relativePath: "Inbox/阅读摘记.md", title: "阅读摘记", tags: ["reading"], hasAttachments: false, orphan: false },
  { id: "note-vditor", rootId: "root-library", relativePath: "Sources/Vditor 调研.md", title: "Vditor 调研", tags: ["editor", "markdown"], hasAttachments: false, orphan: false },
]

export const sampleGraphEdges: NoteGraphEdge[] = [
  { id: "edge-aestival-graph", sourceId: "note-aestival", targetId: "note-graph", kind: "wiki-link" },
  { id: "edge-aestival-agents", sourceId: "note-aestival", targetId: "note-agents", kind: "wiki-link" },
  { id: "edge-aestival-reading", sourceId: "note-aestival", targetId: "note-reading", kind: "wiki-link" },
  { id: "edge-aestival-vditor", sourceId: "note-aestival", targetId: "note-vditor", kind: "markdown-link" },
  { id: "edge-graph-aestival", sourceId: "note-graph", targetId: "note-aestival", kind: "wiki-link" },
]

export function createNoteWorkspaceSnapshot(
  projectId: string,
  sample = false,
): NoteWorkspaceSnapshot {
  const noteTab = sample
    ? [{ id: "tab-note-aestival", kind: "note" as const, title: "Aestival 笔记工作区.md", resourceId: "note-aestival", preview: false }]
    : []
  return {
    projectId,
    groups: [
      {
        id: "group-main",
        tabs: [
          { id: "tab-chat", kind: "chat", title: "聊天", resourceId: null, preview: false },
          ...noteTab,
        ],
        activeTabId: sample ? "tab-note-aestival" : "tab-chat",
      },
    ],
    focusedGroupId: "group-main",
    editorModes: sample ? { ...instantMode } : {},
    expandedEntryIds: sample
      ? ["folder-notes-root", "folder-projects", "folder-research", "folder-library-root", "folder-sources"]
      : [],
    rightPanelTypes: ["files", "search", "outline", "backlinks", "metadata", "local-graph"],
    activeRightPanel: "files",
    bottomPanelTypes: ["search", "backlinks"],
    activeBottomPanel: "search",
    rightPanelOpen: true,
    bottomPanelOpen: false,
    searchQuery: "",
    outlineQuery: "",
    graphQuery: "",
    graphRootFilter: "all",
    graphShowOrphans: true,
    selectedGraphNodeId: sample ? "note-aestival" : null,
    localGraphDepth: 1,
    localGraphDirection: "both",
  }
}
