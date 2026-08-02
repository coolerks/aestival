import { mockAiCodeBundle, type MockAppDraft, type MockCodeFile } from "@/data/mock-ai-app"

export type AppSource = "manual" | "ai" | "imported"
export type AppStatus = "runnable" | "draft" | "error" | "disabled"
export type AppViewMode = "grid" | "list"
export type AppSort = "updated" | "name" | "recent"

export type AppPermissions = {
  network: boolean
  files: boolean
  clipboard: boolean
  externalLinks: boolean
  notifications: boolean
}

export type MockLocalApp = {
  id: string
  name: string
  description: string
  source: AppSource
  status: AppStatus
  updatedAt: string
  lastRunAt: string | null
  runCount: number
  entryFile: string
  files: MockCodeFile[]
  permissions: AppPermissions
  sourceConversation?: string
  sourceModel?: string
  errorMessage?: string
}

const defaultPermissions: AppPermissions = {
  network: false,
  files: false,
  clipboard: false,
  externalLinks: false,
  notifications: false,
}

function cloneFiles(files: MockCodeFile[]) {
  return files.map((file) => ({ ...file }))
}

export const initialMockApps: MockLocalApp[] = [
  {
    id: "app-focus-board",
    name: "冲刺专注板",
    description: "本地专注计数与今日目标小工具。",
    source: "ai",
    status: "runnable",
    updatedAt: "今天 19:28",
    lastRunAt: "今天 20:06",
    runCount: 8,
    entryFile: mockAiCodeBundle.entryFile,
    files: cloneFiles(mockAiCodeBundle.files),
    permissions: { ...defaultPermissions },
    sourceConversation: "完善 Aestival 导航层级",
    sourceModel: "Mock Balanced",
  },
  {
    id: "app-reading-list",
    name: "本地阅读清单",
    description: "整理临时链接与阅读进度，不访问云端账户。",
    source: "manual",
    status: "draft",
    updatedAt: "昨天 16:42",
    lastRunAt: null,
    runCount: 0,
    entryFile: "index.html",
    files: cloneFiles(mockAiCodeBundle.files),
    permissions: { ...defaultPermissions, clipboard: true },
  },
  {
    id: "app-api-inspector",
    name: "响应结构检查器",
    description: "粘贴 JSON 并检查字段结构的离线页面。",
    source: "imported",
    status: "error",
    updatedAt: "3 天前",
    lastRunAt: "3 天前",
    runCount: 3,
    entryFile: "index.html",
    files: cloneFiles(mockAiCodeBundle.files),
    permissions: { ...defaultPermissions },
    errorMessage: "script.js 第 18 行存在语法错误，预览保留上次成功版本。",
  },
  {
    id: "app-release-notes",
    name: "版本说明生成器",
    description: "将本地变更摘要整理为发布说明。",
    source: "ai",
    status: "disabled",
    updatedAt: "7 天前",
    lastRunAt: "8 天前",
    runCount: 5,
    entryFile: "index.html",
    files: cloneFiles(mockAiCodeBundle.files),
    permissions: { ...defaultPermissions, files: true },
    sourceConversation: "整理版本发布流程",
    sourceModel: "Mock Balanced",
  },
]

export function appFromConversationDraft(draft: MockAppDraft): MockLocalApp {
  return {
    id: draft.id,
    name: draft.name,
    description: draft.description,
    source: "ai",
    status: "draft",
    updatedAt: `今天 ${draft.createdAt}`,
    lastRunAt: null,
    runCount: 0,
    entryFile: draft.entryFile,
    files: cloneFiles(draft.files),
    permissions: {
      network: draft.networkPolicy !== "off",
      files: draft.fileAccess,
      clipboard: draft.clipboardRead || draft.clipboardWrite,
      externalLinks: false,
      notifications: false,
    },
    sourceConversation: draft.sourceConversation,
    sourceModel: draft.sourceModel,
  }
}

export const appSourceLabels: Record<AppSource, string> = {
  manual: "手动创建",
  ai: "AI 会话",
  imported: "本地导入",
}

export const appStatusLabels: Record<AppStatus, string> = {
  runnable: "可运行",
  draft: "草稿",
  error: "需要修复",
  disabled: "已停用",
}

export const appPermissionLabels: Record<keyof AppPermissions, string> = {
  network: "网络",
  files: "文件",
  clipboard: "剪贴板",
  externalLinks: "外部链接",
  notifications: "通知",
}
