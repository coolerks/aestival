import {
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CirclePauseIcon,
  CirclePlayIcon,
} from "lucide-react"

import type {
  ProjectWorkItemPriority,
  ProjectWorkItemStatus,
} from "@/types/project-board"

export const projectWorkItemStatuses: Array<{
  id: ProjectWorkItemStatus
  label: string
  Icon: typeof CircleDashedIcon
  description: string
}> = [
  { id: "pending", label: "待处理", Icon: CircleDashedIcon, description: "尚未开始的工作项" },
  { id: "in-progress", label: "处理中", Icon: CirclePlayIcon, description: "正在推进的工作项" },
  { id: "blocked", label: "受阻", Icon: CirclePauseIcon, description: "存在明确阻塞的工作项" },
  { id: "review", label: "待验收", Icon: CircleDotDashedIcon, description: "等待人工确认结果" },
  { id: "completed", label: "已完成", Icon: CheckCircle2Icon, description: "已经由人类验收" },
]

export const projectWorkItemStatusLabels = Object.fromEntries(
  projectWorkItemStatuses.map((status) => [status.id, status.label]),
) as Record<ProjectWorkItemStatus, string>

export const projectWorkItemPriorityLabels: Record<ProjectWorkItemPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
}

export const voidedStatus = {
  label: "已作废",
  Icon: BanIcon,
}
