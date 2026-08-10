import pdfSampleUrl from "@/assets/document/pdf测试.pdf?url"
import wordSampleUrl from "@/assets/document/word测试.docx?url"
import wordPreviewUrl from "@/assets/document/previews/word测试.preview.pdf?url"
import spreadsheetPrintUrl from "@/assets/document/previews/测试excel.print.pdf?url"
import spreadsheetManifestUrl from "@/assets/document/previews/测试excel.workbook.json?url"
import presentationPreviewUrl from "@/assets/document/previews/测试ppt.preview.pdf?url"
import presentationSlides from "@/assets/document/previews/测试ppt.slides.json"
import spreadsheetSampleUrl from "@/assets/document/测试excel.xlsx?url"
import presentationSampleUrl from "@/assets/document/测试ppt.pptx?url"
import type { DocumentPreviewDescriptor } from "@/types/document-preview"

export type WorkspacePanelType = "files" | "terminal" | "search" | "logs" | "debug" | "board"
export type WorkspacePanelPlacement = "right" | "bottom"

export type WorkspacePanelInstance = {
  id: string
  type: WorkspacePanelType
  title: string
  pinned: boolean
}

export type MockFileKind =
  | "code"
  | "markdown"
  | "json"
  | "csv"
  | "image"
  | "pdf"
  | "word"
  | "presentation"
  | "spreadsheet"
  | "binary"

export type MockFile = {
  id: string
  name: string
  path: string
  parent: string
  language: string
  encoding: string
  lineEnding: string
  size: string
  modifiedAt: string
  kind: MockFileKind
  icon: "react_ts" | "markdown" | "json" | "document" | "image" | "pdf" | "word" | "powerpoint" | "table"
  content: string
  preview?: DocumentPreviewDescriptor
  dirty?: boolean
  readonly?: boolean
  externalChange?: boolean
  deleted?: boolean
}

export type MockFileTreeNode = {
  id: string
  name: string
  kind: "folder" | "file"
  icon?: "folder-project" | "folder-src" | "folder-docs"
  fileId?: string
  status?: string
  children?: MockFileTreeNode[]
}

export type MockSearchMatch = {
  id: string
  fileId: string
  path: string
  line: number
  before: string
  match: string
  after: string
}

export type MockLogEntry = {
  id: string
  time: string
  level: "Trace" | "Debug" | "Info" | "Warn" | "Error"
  source: "应用" | "代理" | "MCP" | "任务" | "应用运行"
  message: string
  details: Record<string, string>
}

export type MockDebugEvent = {
  id: string
  time: string
  type: "用户提交" | "上下文组装" | "模型请求" | "流式事件" | "工具审批" | "工具结果" | "上下文压缩" | "模型结束"
  status: "完成" | "等待" | "受限"
  duration: string
  model: string
  message: string
  request: string
  response: string
  tool: string
  tokens: string
  raw: string
}

export const panelTypeLabels: Record<WorkspacePanelType, string> = {
  files: "文件",
  terminal: "终端",
  search: "内容搜索",
  logs: "日志",
  debug: "会话调试",
  board: "项目看板",
}

export const initialRightPanels: WorkspacePanelInstance[] = [
  { id: "panel-files", type: "files", title: "文件", pinned: true },
]

export const initialBottomPanels: WorkspacePanelInstance[] = [
  { id: "panel-terminal-1", type: "terminal", title: "终端 1", pinned: false },
]

export const mockFiles: MockFile[] = [
  {
    id: "file-app-tsx",
    name: "App.tsx",
    path: "Aestival/src/App.tsx",
    parent: "src",
    language: "TypeScript React",
    encoding: "UTF-8",
    lineEnding: "LF",
    size: "3.2 KB",
    modifiedAt: "今天 21:42",
    kind: "code",
    icon: "react_ts",
    dirty: true,
    content: `import { WorkspaceShell } from "@/components/shell/workspace-shell"

export default function App() {
  return <WorkspaceShell />
}
`,
  },
  {
    id: "file-readme",
    name: "README.md",
    path: "Aestival/docs/README.md",
    parent: "docs",
    language: "Markdown",
    encoding: "UTF-8",
    lineEnding: "LF",
    size: "6.8 KB",
    modifiedAt: "昨天 18:20",
    kind: "markdown",
    icon: "markdown",
    content: "# Aestival\n\n本地优先、无登录的桌面 AI Agent 工作区。\n\n## 当前阶段\n\n正在实现工作区面板与安全文件预览。",
  },
  {
    id: "file-package",
    name: "package.json",
    path: "Aestival/frontend/package.json",
    parent: "frontend",
    language: "JSON",
    encoding: "UTF-8",
    lineEnding: "LF",
    size: "1.4 KB",
    modifiedAt: "今天 21:58",
    kind: "json",
    icon: "json",
    externalChange: true,
    content: `{
  "name": "aestival-frontend",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build --mode production"
  }
}`,
  },
  {
    id: "file-usage-csv",
    name: "usage.csv",
    path: "Aestival/mock/usage.csv",
    parent: "mock",
    language: "CSV",
    encoding: "UTF-8",
    lineEnding: "LF",
    size: "912 B",
    modifiedAt: "今天 20:16",
    kind: "csv",
    icon: "document",
    readonly: true,
    content: "date,messages,tokens,cost\n2026-07-29,42,18000,6.20\n2026-07-30,58,24000,8.10\n2026-07-31,64,27000,9.40",
  },
  {
    id: "file-logo-svg",
    name: "logo.svg",
    path: "Aestival/assets/logo.svg",
    parent: "assets",
    language: "SVG",
    encoding: "UTF-8",
    lineEnding: "LF",
    size: "4.6 KB",
    modifiedAt: "7 月 25 日",
    kind: "image",
    icon: "image",
    readonly: true,
    content: "安全图像预览",
  },
  {
    id: "file-design-pdf",
    name: "design-notes.pdf",
    path: "Aestival/docs/design-notes.pdf",
    parent: "docs",
    language: "PDF",
    encoding: "Binary",
    lineEnding: "—",
    size: "1.8 MB",
    modifiedAt: "7 月 28 日",
    kind: "pdf",
    icon: "pdf",
    readonly: true,
    content: "3 页 · 脚本与外部资源已禁用",
  },
  {
    id: "file-cache-bin",
    name: "workspace-cache.bin",
    path: "Aestival/.cache/workspace-cache.bin",
    parent: ".cache",
    language: "Binary",
    encoding: "Binary",
    lineEnding: "—",
    size: "18.4 MB",
    modifiedAt: "今天 21:11",
    kind: "binary",
    icon: "document",
    readonly: true,
    content: "41 45 53 54 49 56 41 4c 00 00 00 02 7b 6d 6f 63 6b 7d",
  },
  {
    id: "file-document-pdf-sample",
    name: "pdf测试.pdf",
    path: "Aestival/documents/pdf测试.pdf",
    parent: "documents",
    language: "PDF",
    encoding: "Binary",
    lineEnding: "—",
    size: "428 KB",
    modifiedAt: "今天 14:42",
    kind: "pdf",
    icon: "pdf",
    readonly: true,
    content: "17 页 · 包含嵌套目录",
    preview: { kind: "pdf", sourceUrl: pdfSampleUrl },
  },
  {
    id: "file-document-word-sample",
    name: "word测试.docx",
    path: "Aestival/documents/word测试.docx",
    parent: "documents",
    language: "Word",
    encoding: "Binary",
    lineEnding: "—",
    size: "2.6 MB",
    modifiedAt: "今天 14:42",
    kind: "word",
    icon: "word",
    readonly: true,
    content: "19 页 · 本地保真预览",
    preview: {
      kind: "word",
      sourceUrl: wordSampleUrl,
      previewPdfUrl: wordPreviewUrl,
    },
  },
  {
    id: "file-document-presentation-sample",
    name: "测试ppt.pptx",
    path: "Aestival/documents/测试ppt.pptx",
    parent: "documents",
    language: "PowerPoint",
    encoding: "Binary",
    lineEnding: "—",
    size: "55 KB",
    modifiedAt: "今天 14:42",
    kind: "presentation",
    icon: "powerpoint",
    readonly: true,
    content: "8 张幻灯片 · 本地保真预览",
    preview: {
      kind: "presentation",
      sourceUrl: presentationSampleUrl,
      previewPdfUrl: presentationPreviewUrl,
      slides: presentationSlides.slides,
    },
  },
  {
    id: "file-document-spreadsheet-sample",
    name: "测试excel.xlsx",
    path: "Aestival/documents/测试excel.xlsx",
    parent: "documents",
    language: "Excel",
    encoding: "Binary",
    lineEnding: "—",
    size: "16 KB",
    modifiedAt: "今天 14:42",
    kind: "spreadsheet",
    icon: "table",
    readonly: true,
    content: "2 个工作表 · 包含图表打印预览",
    preview: {
      kind: "spreadsheet",
      sourceUrl: spreadsheetSampleUrl,
      workbookManifestUrl: spreadsheetManifestUrl,
      printPdfUrl: spreadsheetPrintUrl,
    },
  },
]

export const mockFileTree: MockFileTreeNode = {
  id: "folder-root",
  name: "Aestival",
  kind: "folder",
  icon: "folder-project",
  children: [
    {
      id: "folder-src",
      name: "src",
      kind: "folder",
      icon: "folder-src",
      children: [{ id: "node-app-tsx", name: "App.tsx", kind: "file", fileId: "file-app-tsx", status: "M" }],
    },
    {
      id: "folder-docs",
      name: "docs",
      kind: "folder",
      icon: "folder-docs",
      children: [
        { id: "node-readme", name: "README.md", kind: "file", fileId: "file-readme" },
        { id: "node-design-pdf", name: "design-notes.pdf", kind: "file", fileId: "file-design-pdf" },
      ],
    },
    {
      id: "folder-frontend",
      name: "frontend",
      kind: "folder",
      icon: "folder-project",
      children: [{ id: "node-package", name: "package.json", kind: "file", fileId: "file-package", status: "M" }],
    },
    {
      id: "folder-mock",
      name: "mock",
      kind: "folder",
      icon: "folder-project",
      children: [{ id: "node-usage", name: "usage.csv", kind: "file", fileId: "file-usage-csv" }],
    },
    {
      id: "folder-assets",
      name: "assets",
      kind: "folder",
      icon: "folder-project",
      children: [{ id: "node-logo", name: "logo.svg", kind: "file", fileId: "file-logo-svg" }],
    },
    {
      id: "folder-cache",
      name: ".cache",
      kind: "folder",
      icon: "folder-project",
      children: [{ id: "node-cache", name: "workspace-cache.bin", kind: "file", fileId: "file-cache-bin" }],
    },
    {
      id: "folder-documents",
      name: "documents",
      kind: "folder",
      icon: "folder-docs",
      children: [
        { id: "node-pdf-sample", name: "pdf测试.pdf", kind: "file", fileId: "file-document-pdf-sample" },
        { id: "node-word-sample", name: "word测试.docx", kind: "file", fileId: "file-document-word-sample" },
        { id: "node-presentation-sample", name: "测试ppt.pptx", kind: "file", fileId: "file-document-presentation-sample" },
        { id: "node-spreadsheet-sample", name: "测试excel.xlsx", kind: "file", fileId: "file-document-spreadsheet-sample" },
      ],
    },
  ],
}

export const mockSearchMatches: MockSearchMatch[] = [
  { id: "match-1", fileId: "file-app-tsx", path: "src/App.tsx", line: 1, before: "import { ", match: "Workspace", after: "Shell } from …" },
  { id: "match-2", fileId: "file-app-tsx", path: "src/App.tsx", line: 4, before: "return <", match: "Workspace", after: "Shell />" },
  { id: "match-3", fileId: "file-readme", path: "docs/README.md", line: 7, before: "正在实现", match: "工作区", after: "面板与安全文件预览。" },
]

export const mockLogs: MockLogEntry[] = [
  { id: "log-1", time: "22:01:18.402", level: "Info", source: "应用", message: "工作区面板状态已恢复", details: { placement: "right,bottom", sensitive: "[REDACTED]" } },
  { id: "log-2", time: "22:01:20.114", level: "Debug", source: "代理", message: "加载脱敏会话调试事件", details: { events: "8", path: "…/Aestival" } },
  { id: "log-3", time: "22:01:22.701", level: "Warn", source: "任务", message: "调度服务尚未接入，跳过真实执行", details: { task: "每日项目审查" } },
  { id: "log-4", time: "22:01:25.016", level: "Error", source: "MCP", message: "Mock 连接测试未发送网络请求", details: { endpoint: "[REDACTED]", code: "MOCK_ONLY" } },
]

export const mockDebugEvents: MockDebugEvent[] = [
  { id: "debug-submit", time: "21:58:01.003", type: "用户提交", status: "完成", duration: "2 ms", model: "—", message: "关联消息 msg-184", request: "已接收脱敏任务说明。", response: "—", tool: "—", tokens: "输入 28（估算）", raw: '{"type":"user.submit","content":"[REDACTED]"}' },
  { id: "debug-context", time: "21:58:01.018", type: "上下文组装", status: "完成", duration: "42 ms", model: "Mock Balanced", message: "系统、会话与项目上下文", request: "3 个消息段；文件路径已缩短。", response: "—", tool: "—", tokens: "系统 1.2k · 会话 3.4k", raw: '{"type":"context.build","authorization":"[REDACTED]"}' },
  { id: "debug-model", time: "21:58:01.061", type: "模型请求", status: "完成", duration: "1.8 s", model: "Mock Balanced", message: "结束原因：tool_calls", request: "temperature: 0.2 · tools: 4", response: "请求读取工作区结构。", tool: "read_tree", tokens: "输入 4.8k · 输出 312", raw: '{"type":"model.request","api_key":"[REDACTED]"}' },
  { id: "debug-approval", time: "21:58:02.904", type: "工具审批", status: "等待", duration: "12 s", model: "Mock Balanced", message: "等待桌面审批", request: "读取 Aestival 项目树", response: "用户允许一次", tool: "read_tree", tokens: "—", raw: '{"type":"tool.approval","decision":"once"}' },
  { id: "debug-end", time: "21:58:15.227", type: "模型结束", status: "完成", duration: "3.2 s", model: "Mock Balanced", message: "结束原因：stop", request: "—", response: "已生成前端 Mock 建议。", tool: "—", tokens: "总计 6.1k（估算）", raw: '{"type":"model.end","reason":"stop"}' },
]
