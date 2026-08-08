import { addDays, format, startOfToday } from "date-fns"

import type { MockSessionProjectId } from "@/data/mock-session-management"
import type {
  BoardActor,
  ProjectWorkItem,
  ProjectWorkItemPriority,
  ProjectWorkItemStatus,
} from "@/types/project-board"

const human: BoardActor = { kind: "human", id: "local-user" }
const ai: BoardActor = {
  kind: "ai",
  agentId: "aestival-planner",
  runId: "initial-mock-plan",
}
const today = startOfToday()
const isoDay = (offset: number) => format(addDays(today, offset), "yyyy-MM-dd")
const isoTime = (offset = 0) => addDays(today, offset).toISOString()

type MockItemInput = {
  id: string
  projectId: MockSessionProjectId
  number: string
  title: string
  status: ProjectWorkItemStatus
  priority: ProjectWorkItemPriority
  tags: string[]
  order: number
  start?: number
  end?: number
  description?: string
  criteria?: string[]
  actor?: BoardActor
  blockedReason?: string
}

function workItem(input: MockItemInput): ProjectWorkItem {
  const actor = input.actor ?? human
  return {
    id: input.id,
    projectId: input.projectId,
    number: input.number,
    title: input.title,
    description: input.description ?? "该条目仅存在于前端 Mock 工作区，用于验证项目看板交互。",
    status: input.status,
    lifecycle: "active",
    priority: input.priority,
    tags: input.tags,
    plannedStart: input.start === undefined ? undefined : isoDay(input.start),
    plannedEnd: input.end === undefined ? undefined : isoDay(input.end),
    acceptanceCriteria: input.criteria ?? ["完成实现并通过本地检查", "由项目负责人确认结果"],
    order: input.order,
    createdBy: actor,
    updatedBy: actor,
    createdAt: isoTime(-8),
    updatedAt: isoTime(-1),
    blockedReason: input.blockedReason,
  }
}

export const initialProjectWorkItems: ProjectWorkItem[] = [
  workItem({ id: "work-task-1", projectId: "task", number: "TASK-101", title: "梳理消息输入的键盘路径", status: "pending", priority: "high", tags: ["交互", "聊天"], order: 0, start: -1, end: 2, actor: ai }),
  workItem({ id: "work-task-2", projectId: "task", number: "TASK-102", title: "补齐窄窗口布局验收", status: "pending", priority: "medium", tags: ["QA"], order: 1, start: 3, end: 5 }),
  workItem({ id: "work-task-3", projectId: "task", number: "TASK-103", title: "统一工作区面板恢复逻辑", status: "in-progress", priority: "urgent", tags: ["工作区", "状态"], order: 0, start: -3, end: 1, actor: ai }),
  workItem({ id: "work-task-4", projectId: "task", number: "TASK-104", title: "检查全局右键菜单边界", status: "blocked", priority: "high", tags: ["右键", "QA"], order: 0, start: -2, end: 3, blockedReason: "等待 Monaco 编辑区的交互回归结果" }),
  workItem({ id: "work-task-5", projectId: "task", number: "TASK-105", title: "验收编辑组拖放语义", status: "review", priority: "high", tags: ["Monaco"], order: 0, start: -5, end: 0 }),
  workItem({ id: "work-task-6", projectId: "task", number: "TASK-106", title: "完成管理页工具栏对齐", status: "completed", priority: "medium", tags: ["管理页"], order: 0, start: -10, end: -4 }),
  workItem({ id: "work-task-7", projectId: "task", number: "TASK-107", title: "记录下一轮无障碍检查", status: "pending", priority: "low", tags: ["无障碍"], order: 2 }),

  workItem({ id: "work-aestival-1", projectId: "aestival", number: "AES-201", title: "实现项目看板状态内核", status: "in-progress", priority: "urgent", tags: ["看板", "状态模型"], order: 0, start: -1, end: 3, actor: ai }),
  workItem({ id: "work-aestival-2", projectId: "aestival", number: "AES-202", title: "完善五状态权限矩阵", status: "review", priority: "high", tags: ["权限", "验收"], order: 0, start: -2, end: 1 }),
  workItem({ id: "work-aestival-3", projectId: "aestival", number: "AES-203", title: "接入标题栏与右侧面板入口", status: "pending", priority: "high", tags: ["外壳"], order: 0, start: 2, end: 4 }),
  workItem({ id: "work-aestival-4", projectId: "aestival", number: "AES-204", title: "核对 Wails 适配接口边界", status: "blocked", priority: "medium", tags: ["Wails"], order: 0, blockedReason: "后端持久化协议尚未评审" }),
  workItem({ id: "work-aestival-5", projectId: "aestival", number: "AES-205", title: "建立看板视觉回归清单", status: "completed", priority: "low", tags: ["QA"], order: 0, start: -7, end: -3 }),

  workItem({ id: "work-aiui-1", projectId: "ai-ui", number: "AIUI-301", title: "评估看板卡片信息密度", status: "pending", priority: "medium", tags: ["设计"], order: 0, start: 0, end: 2 }),
  workItem({ id: "work-aiui-2", projectId: "ai-ui", number: "AIUI-302", title: "制作甘特图紧凑模式", status: "in-progress", priority: "high", tags: ["甘特图"], order: 0, start: -1, end: 5, actor: ai }),
  workItem({ id: "work-aiui-3", projectId: "ai-ui", number: "AIUI-303", title: "补齐任务详情键盘顺序", status: "review", priority: "high", tags: ["无障碍"], order: 0, start: -3, end: 0 }),
  workItem({ id: "work-aiui-4", projectId: "ai-ui", number: "AIUI-304", title: "确认拖放覆盖空列", status: "blocked", priority: "urgent", tags: ["拖放"], order: 0, start: 1, end: 4, blockedReason: "等待窄面板容器宽度策略确认" }),
  workItem({ id: "work-aiui-5", projectId: "ai-ui", number: "AIUI-305", title: "归档旧版卡片草案", status: "completed", priority: "low", tags: ["清理"], order: 0, start: -12, end: -8 }),
]
