import {
  AppWindowIcon,
  BlocksIcon,
  BookOpenIcon,
  CalendarClockIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderKanbanIcon,
  SearchIcon,
  RssIcon,
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
  { id: "tasks", label: "定时任务", icon: CalendarClockIcon },
  { id: "knowledge", label: "知识库", icon: DatabaseIcon },
  { id: "capabilities", label: "能力", icon: BlocksIcon },
  { id: "apps", label: "应用", icon: AppWindowIcon },
  { id: "reading", label: "阅读", icon: RssIcon },
]

export const commandItems = [
  { id: "new-task", label: "新建任务", group: "功能", icon: SquarePenIcon, shortcut: "⌘N" },
  { id: "knowledge", label: "打开知识库", group: "功能", icon: DatabaseIcon, shortcut: "⌘1" },
  { id: "apps", label: "打开应用", group: "功能", icon: AppWindowIcon, shortcut: "⌘2" },
  { id: "capabilities", label: "打开能力", group: "功能", icon: BlocksIcon, shortcut: "⌘3" },
  { id: "tasks", label: "打开定时任务", group: "功能", icon: CalendarClockIcon, shortcut: "⌘4" },
  { id: "reading", label: "打开阅读", group: "功能", icon: RssIcon, shortcut: "⌘5" },
  { id: "search", label: "搜索会话与聊天记录", group: "搜索", icon: SearchIcon, shortcut: "⌘K" },
  { id: "docs", label: "查看设计方案", group: "最近", icon: BookOpenIcon },
  { id: "workspace", label: "Aestival 前端实现", group: "最近", icon: FolderKanbanIcon },
  { id: "settings", label: "打开设置", group: "功能", icon: SettingsIcon, shortcut: "⌘," },
  { id: "readme", label: "README.md", group: "文件", icon: FileTextIcon },
] as const

export const pageCopy: Record<Exclude<AppPage, "new-task">, { title: string; description: string }> = {
  "project-board": {
    title: "项目看板",
    description: "规划项目工作项并查看甘特图。",
  },
  knowledge: {
    title: "知识库",
    description: "管理本地文件、数据库与向量检索来源。",
  },
  apps: {
    title: "应用",
    description: "创建、预览和运行本地 HTML、CSS 与 JavaScript 应用。",
  },
  reading: {
    title: "阅读",
    description: "阅读订阅文章，并通过显式要求管理智能合集。",
  },
  capabilities: {
    title: "能力",
    description: "管理 MCP、Skill、智能体、指令与 Hooks。",
  },
  tasks: {
    title: "任务",
    description: "安排定时运行并查看执行记录与待审批事项。",
  },
  settings: {
    title: "设置",
    description: "管理模型、统计、外部连接、通知、外观与快捷键。",
  },
}
