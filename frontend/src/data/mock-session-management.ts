export type MockSessionProjectId = "task" | "aestival" | "ai-ui"

export type MockSessionStatus =
  | "completed"
  | "running"
  | "awaiting-approval"
  | "failed"

export type MockSessionRecord = {
  id: string
  title: string
  projectId: MockSessionProjectId
  relativeTime: string
  activityRank: number
  starred: boolean
  archived: boolean
  status: MockSessionStatus
}

export type SessionDialogKind =
  | "rename"
  | "move"
  | "delete"
  | "schedule"

export type SessionDialogState = {
  kind: SessionDialogKind
  sessionId: string
}

export type MockScheduleMode = "simple" | "cron"
export type MockApprovalMode = "request" | "automatic"

export type MockScheduledTaskInput = {
  sessionId: string
  name: string
  description: string
  projectId: MockSessionProjectId
  enabled: boolean
  scheduleMode: MockScheduleMode
  simpleSchedule: string
  cron: string
  timezone: string
  maxDuration: string
  retries: string
  overlapPolicy: string
  missedRunPolicy: string
  autoCompact: boolean
  tokenGuardrail: string
  approvalMode: MockApprovalMode
  notifications: string[]
}

export type MockScheduledTaskRecord = MockScheduledTaskInput & {
  id: string
  createdAt: string
  nextRuns: string[]
}

export const mockSessionProjects: Array<{
  id: MockSessionProjectId
  label: string
  fixed?: boolean
}> = [
  { id: "task", label: "任务", fixed: true },
  { id: "aestival", label: "Aestival" },
  { id: "ai-ui", label: "AI UI" },
]

export const initialMockSessions: MockSessionRecord[] = [
  {
    id: "session-frontend-shell",
    title: "完善前端基础与窗口外壳",
    projectId: "task",
    relativeTime: "刚刚",
    activityRank: 130,
    starred: true,
    archived: false,
    status: "completed",
  },
  {
    id: "session-channel-plan",
    title: "补充设置连接渠道方案",
    projectId: "task",
    relativeTime: "4 小时前",
    activityRank: 120,
    starred: false,
    archived: false,
    status: "awaiting-approval",
  },
  {
    id: "session-file-preview",
    title: "梳理文件预览与面板交互",
    projectId: "task",
    relativeTime: "昨天",
    activityRank: 110,
    starred: false,
    archived: false,
    status: "completed",
  },
  {
    id: "session-shadcn-matrix",
    title: "检查 shadcn 组件覆盖矩阵",
    projectId: "task",
    relativeTime: "昨天",
    activityRank: 100,
    starred: false,
    archived: false,
    status: "failed",
  },
  {
    id: "session-collaboration",
    title: "建立跨会话协作约束",
    projectId: "task",
    relativeTime: "2 天前",
    activityRank: 90,
    starred: false,
    archived: false,
    status: "completed",
  },
  {
    id: "session-window-state",
    title: "复核窗口尺寸与状态恢复",
    projectId: "task",
    relativeTime: "3 天前",
    activityRank: 80,
    starred: false,
    archived: false,
    status: "running",
  },
  {
    id: "session-command-plan",
    title: "整理全局 Command 动作目录",
    projectId: "task",
    relativeTime: "4 天前",
    activityRank: 70,
    starred: false,
    archived: false,
    status: "completed",
  },
  {
    id: "session-archived-theme",
    title: "归档的主题实验",
    projectId: "task",
    relativeTime: "上周",
    activityRank: 40,
    starred: false,
    archived: true,
    status: "completed",
  },
  {
    id: "session-aestival-navigation",
    title: "完善 Aestival 导航层级",
    projectId: "aestival",
    relativeTime: "昨天",
    activityRank: 105,
    starred: true,
    archived: false,
    status: "completed",
  },
  {
    id: "session-aestival-window",
    title: "验证桌面窗口交互",
    projectId: "aestival",
    relativeTime: "2 天前",
    activityRank: 75,
    starred: false,
    archived: false,
    status: "completed",
  },
  {
    id: "session-aestival-errors",
    title: "整理错误与空状态文案",
    projectId: "aestival",
    relativeTime: "上周",
    activityRank: 55,
    starred: false,
    archived: false,
    status: "failed",
  },
  {
    id: "session-ai-ui-density",
    title: "评估聊天消息密度",
    projectId: "ai-ui",
    relativeTime: "3 小时前",
    activityRank: 115,
    starred: false,
    archived: false,
    status: "completed",
  },
  {
    id: "session-ai-ui-code",
    title: "预览 AI 生成代码应用",
    projectId: "ai-ui",
    relativeTime: "昨天",
    activityRank: 85,
    starred: false,
    archived: false,
    status: "completed",
  },
]

export const sessionActionLabels = {
  open: "打开会话",
  star: "Star",
  unstar: "取消 Star",
  rename: "重命名",
  fork: "从最后一条消息分叉",
  move: "移动到项目",
  schedule: "创建定时任务",
  export: "导出会话",
  stats: "会话统计",
  archive: "归档",
  unarchive: "取消归档",
  delete: "删除会话",
} as const

export function sortMockSessions(
  sessions: MockSessionRecord[]
): MockSessionRecord[] {
  return [...sessions].sort(
    (left, right) =>
      Number(right.starred) - Number(left.starred) ||
      right.activityRank - left.activityRank
  )
}

export function createMockScheduledTask(
  input: MockScheduledTaskInput
): MockScheduledTaskRecord {
  const now = new Date()
  const runLabels =
    input.scheduleMode === "cron"
      ? ["明天 09:00", "后天 09:00", "周三 09:00", "周四 09:00", "周五 09:00"]
      : ["明天 09:00", "后天 09:00", "3 天后 09:00", "4 天后 09:00", "5 天后 09:00"]

  return {
    ...input,
    id: `scheduled-task-${now.getTime()}`,
    createdAt: new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(now),
    nextRuns: runLabels,
  }
}
