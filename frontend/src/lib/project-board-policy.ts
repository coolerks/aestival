import type {
  BoardActor,
  ProjectWorkItem,
  ProjectWorkItemStatus,
} from "@/types/project-board"

export type ProjectBoardPolicyResult = {
  allowed: boolean
  reason?: string
}

export function canMoveProjectWorkItem(
  item: ProjectWorkItem,
  toStatus: ProjectWorkItemStatus,
  actor: BoardActor,
): ProjectBoardPolicyResult {
  if (item.lifecycle === "voided") {
    return { allowed: false, reason: "已作废任务需要先由人类恢复" }
  }
  if (item.status === toStatus) return { allowed: true }
  if (toStatus === "completed") {
    if (actor.kind !== "human") {
      return { allowed: false, reason: "AI 不能代替人类完成验收" }
    }
    if (item.status !== "review") {
      return { allowed: false, reason: "任务必须先进入待验收" }
    }
  }
  if (item.status === "completed" && actor.kind !== "human") {
    return { allowed: false, reason: "只有人类可以重新打开已完成任务" }
  }
  return { allowed: true }
}

export function canVoidProjectWorkItem(actor: BoardActor): ProjectBoardPolicyResult {
  return actor.kind === "human"
    ? { allowed: true }
    : { allowed: false, reason: "只有人类可以作废或恢复任务" }
}

export function actorLabel(actor: BoardActor) {
  return actor.kind === "human" ? "本地用户" : "AI 规划"
}
