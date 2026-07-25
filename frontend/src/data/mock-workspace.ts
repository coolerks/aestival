import {
  AppWindowIcon,
  BlocksIcon,
  BookOpenIcon,
  CalendarClockIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderKanbanIcon,
  MessageSquareTextIcon,
  SearchIcon,
  SettingsIcon,
  SquarePenIcon,
  type LucideIcon,
} from "lucide-react"

import type { AppPage } from "@/store/workspace-store"

export type NavigationItem = {
  id: AppPage
  label: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { id: "new-task", label: "新建任务", icon: SquarePenIcon },
  { id: "knowledge", label: "知识库", icon: DatabaseIcon },
  { id: "apps", label: "应用", icon: AppWindowIcon },
  { id: "capabilities", label: "能力", icon: BlocksIcon },
  { id: "tasks", label: "任务", icon: CalendarClockIcon },
]

export const mockSessions = [
  { id: "session-1", title: "完善前端基础与窗口外壳", time: "刚刚" },
  { id: "session-2", title: "补充设置连接渠道方案", time: "4 小时前" },
  { id: "session-3", title: "梳理文件预览与面板交互", time: "昨天" },
  { id: "session-4", title: "检查 shadcn 组件覆盖矩阵", time: "昨天" },
  { id: "session-5", title: "建立跨会话协作约束", time: "2 天前" },
] as const

export const commandItems = [
  { id: "new-task", label: "新建任务", group: "功能", icon: SquarePenIcon, shortcut: "⌘N" },
  { id: "knowledge", label: "打开知识库", group: "功能", icon: DatabaseIcon, shortcut: "⌘1" },
  { id: "apps", label: "打开应用", group: "功能", icon: AppWindowIcon, shortcut: "⌘2" },
  { id: "capabilities", label: "打开能力", group: "功能", icon: BlocksIcon, shortcut: "⌘3" },
  { id: "tasks", label: "打开任务", group: "功能", icon: CalendarClockIcon, shortcut: "⌘4" },
  { id: "search", label: "搜索会话与聊天记录", group: "搜索", icon: SearchIcon, shortcut: "⌘K" },
  { id: "docs", label: "查看设计方案", group: "最近", icon: BookOpenIcon },
  { id: "workspace", label: "Aestival 前端实现", group: "最近", icon: FolderKanbanIcon },
  { id: "conversation", label: "完善前端基础与窗口外壳", group: "会话", icon: MessageSquareTextIcon },
  { id: "settings", label: "打开设置", group: "功能", icon: SettingsIcon, shortcut: "⌘," },
  { id: "readme", label: "README.md", group: "文件", icon: FileTextIcon },
] as const

export const pageCopy: Record<Exclude<AppPage, "new-task">, { title: string; description: string }> = {
  knowledge: {
    title: "知识库",
    description: "管理本地文件、数据库与向量检索来源。",
  },
  apps: {
    title: "应用",
    description: "创建、预览和运行本地 HTML、CSS 与 JavaScript 应用。",
  },
  capabilities: {
    title: "能力",
    description: "管理 MCP、Skill、智能体、指令与 Hooks。",
  },
  tasks: {
    title: "任务",
    description: "安排定时运行并查看执行记录与待审批事项。",
  },
}
