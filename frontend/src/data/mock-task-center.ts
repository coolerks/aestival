import type { MockScheduledTaskRecord } from "@/data/mock-session-management"

export type TaskCenterTab = "tasks" | "calendar" | "runs"
export type TaskTrigger = "prompt" | "conversation" | "agent" | "workflow"
export type TaskResult = "success" | "failed" | "skipped" | "approval" | "limited" | "running" | "queued"

export type MockTask = {
  id: string
  name: string
  description: string
  project: string
  trigger: TaskTrigger
  target: string
  schedule: string
  cron: string
  timezone: string
  nextRun: string | null
  nextRunRelative: string | null
  lastResult: TaskResult
  enabled: boolean
  approval: "request" | "automatic" | "bypass"
  risk: boolean
  notifications: string[]
  nextRuns: string[]
}

export type MockTaskRun = {
  id: string
  taskId: string
  taskName: string
  scheduledAt: string
  startedAt: string
  duration: string
  model: string
  tokens: string
  cost: string
  toolCalls: number
  result: TaskResult
  summary: string
}

export const initialMockTasks: MockTask[] = [
  {
    id: "task-daily-review",
    name: "每日项目审查",
    description: "汇总变更并生成只读审查建议。",
    project: "Aestival",
    trigger: "agent",
    target: "审查智能体",
    schedule: "工作日 09:00",
    cron: "0 9 * * 1-5",
    timezone: "Asia/Shanghai（UTC+08:00）",
    nextRun: "2026-08-03 09:00",
    nextRunRelative: "3 天后",
    lastResult: "success",
    enabled: true,
    approval: "request",
    risk: false,
    notifications: ["失败", "等待审批"],
    nextRuns: ["8 月 3 日 09:00", "8 月 4 日 09:00", "8 月 5 日 09:00", "8 月 6 日 09:00", "8 月 7 日 09:00"],
  },
  {
    id: "task-weekly-summary",
    name: "每周会话摘要",
    description: "整理任务项目中本周完成的会话。",
    project: "任务",
    trigger: "prompt",
    target: "会话摘要",
    schedule: "每周五 18:00",
    cron: "0 18 * * 5",
    timezone: "Asia/Shanghai（UTC+08:00）",
    nextRun: "2026-07-31 18:00",
    nextRunRelative: "已错过 3 小时",
    lastResult: "skipped",
    enabled: true,
    approval: "automatic",
    risk: false,
    notifications: ["成功", "失败"],
    nextRuns: ["8 月 7 日 18:00", "8 月 14 日 18:00", "8 月 21 日 18:00", "8 月 28 日 18:00", "9 月 4 日 18:00"],
  },
  {
    id: "task-continue-channel",
    name: "继续连接渠道方案",
    description: "继续指定会话并在需要工具时等待桌面审批。",
    project: "任务",
    trigger: "conversation",
    target: "补充设置连接渠道方案",
    schedule: "每天 20:30",
    cron: "30 20 * * *",
    timezone: "Asia/Shanghai（UTC+08:00）",
    nextRun: "2026-08-01 20:30",
    nextRunRelative: "明天",
    lastResult: "approval",
    enabled: true,
    approval: "request",
    risk: false,
    notifications: ["等待审批", "超过阈值"],
    nextRuns: ["8 月 1 日 20:30", "8 月 2 日 20:30", "8 月 3 日 20:30", "8 月 4 日 20:30", "8 月 5 日 20:30"],
  },
  {
    id: "task-release-draft",
    name: "生成发布草稿",
    description: "触发本地工作流生成发布说明草稿。",
    project: "Aestival",
    trigger: "workflow",
    target: "发布准备工作流",
    schedule: "每月 1 日 10:00",
    cron: "0 10 1 * *",
    timezone: "Asia/Shanghai（UTC+08:00）",
    nextRun: null,
    nextRunRelative: null,
    lastResult: "failed",
    enabled: false,
    approval: "bypass",
    risk: true,
    notifications: ["失败", "超过阈值"],
    nextRuns: ["8 月 1 日 10:00", "9 月 1 日 10:00", "10 月 1 日 10:00", "11 月 1 日 10:00", "12 月 1 日 10:00"],
  },
]

export const initialMockTaskRuns: MockTaskRun[] = [
  { id: "run-001", taskId: "task-daily-review", taskName: "每日项目审查", scheduledAt: "今天 09:00", startedAt: "09:00:02", duration: "1 分 28 秒", model: "Mock Balanced", tokens: "8.4k", cost: "¥0.18（估算）", toolCalls: 3, result: "success", summary: "生成 4 条审查建议，未修改文件。" },
  { id: "run-002", taskId: "task-continue-channel", taskName: "继续连接渠道方案", scheduledAt: "昨天 20:30", startedAt: "20:30:01", duration: "等待 12 分钟", model: "Mock Balanced", tokens: "3.1k", cost: "¥0.06（估算）", toolCalls: 1, result: "approval", summary: "等待读取外部渠道文档的桌面审批。" },
  { id: "run-003", taskId: "task-release-draft", taskName: "生成发布草稿", scheduledAt: "7 月 1 日 10:00", startedAt: "10:00:03", duration: "18 秒", model: "Mock Fast", tokens: "1.2k", cost: "¥0.02（估算）", toolCalls: 2, result: "failed", summary: "工作流适配器尚未接入。" },
  { id: "run-004", taskId: "task-weekly-summary", taskName: "每周会话摘要", scheduledAt: "7 月 25 日 18:00", startedAt: "—", duration: "—", model: "Mock Balanced", tokens: "0", cost: "¥0", toolCalls: 0, result: "skipped", summary: "应用未运行，错过策略为跳过。" },
]

export const taskResultLabels: Record<TaskResult, string> = {
  success: "成功",
  failed: "失败",
  skipped: "已跳过",
  approval: "等待审批",
  limited: "受限",
  running: "运行中",
  queued: "排队中",
}

export const taskTriggerLabels: Record<TaskTrigger, string> = {
  prompt: "Prompt",
  conversation: "继续会话",
  agent: "智能体",
  workflow: "工作流",
}

export function taskFromSessionSchedule(record: MockScheduledTaskRecord): MockTask {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    project: record.projectId === "ai-ui" ? "AI UI" : record.projectId === "aestival" ? "Aestival" : "任务",
    trigger: "conversation",
    target: "指定会话",
    schedule: record.scheduleMode === "cron" ? `Cron：${record.cron}` : record.simpleSchedule,
    cron: record.cron,
    timezone: record.timezone,
    nextRun: record.enabled ? record.nextRuns[0] ?? null : null,
    nextRunRelative: record.enabled ? "即将运行" : null,
    lastResult: "queued",
    enabled: record.enabled,
    approval: record.approvalMode,
    risk: false,
    notifications: [...record.notifications],
    nextRuns: [...record.nextRuns],
  }
}
