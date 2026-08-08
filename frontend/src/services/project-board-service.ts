import type { MockSessionProjectId } from "@/data/mock-session-management"
import { actorLabel, canMoveProjectWorkItem, canVoidProjectWorkItem } from "@/lib/project-board-policy"
import type {
  BoardActor,
  ProjectBoardCommand,
  ProjectBoardCommandResult,
  ProjectBoardService,
  ProjectBoardSnapshot,
  ProjectWorkItem,
  ProjectWorkItemEvent,
  ProjectWorkItemEventType,
  ProjectWorkItemStatus,
} from "@/types/project-board"

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nextNumber(items: ProjectWorkItem[], projectId: MockSessionProjectId) {
  const prefix = projectId === "task" ? "TASK" : projectId === "aestival" ? "AES" : "AIUI"
  const max = items
    .filter((item) => item.projectId === projectId)
    .map((item) => Number(item.number.split("-")[1] ?? 0))
    .reduce((current, value) => Math.max(current, value), 0)
  return `${prefix}-${max + 1}`
}

function event(
  item: ProjectWorkItem,
  type: ProjectWorkItemEventType,
  actor: BoardActor,
  summary: string,
  now: string,
  fromStatus?: ProjectWorkItemStatus,
  toStatus?: ProjectWorkItemStatus,
): ProjectWorkItemEvent {
  return {
    id: createId("board-event"),
    workItemId: item.id,
    projectId: item.projectId,
    type,
    actor,
    createdAt: now,
    summary,
    fromStatus,
    toStatus,
  }
}

function normalizeOrders(items: ProjectWorkItem[], projectId: MockSessionProjectId, status: ProjectWorkItemStatus) {
  const ordered = items
    .filter((item) => item.projectId === projectId && item.status === status && item.lifecycle === "active")
    .sort((a, b) => a.order - b.order)
  const orderById = new Map(ordered.map((item, index) => [item.id, index]))
  return items.map((item) => orderById.has(item.id) ? { ...item, order: orderById.get(item.id) ?? item.order } : item)
}

function placeItem(
  items: ProjectWorkItem[],
  itemId: string,
  toStatus: ProjectWorkItemStatus,
  toIndex: number,
  actor: BoardActor,
  now: string,
) {
  const moving = items.find((item) => item.id === itemId)
  if (!moving) return items
  const target = items
    .filter((item) => item.projectId === moving.projectId && item.id !== itemId && item.status === toStatus && item.lifecycle === "active")
    .sort((a, b) => a.order - b.order)
  target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, {
    ...moving,
    status: toStatus,
    updatedBy: actor,
    updatedAt: now,
  })
  const orderById = new Map(target.map((item, index) => [item.id, index]))
  return items.map((item) => {
    if (item.id === itemId) {
      return { ...item, status: toStatus, order: orderById.get(item.id) ?? 0, updatedBy: actor, updatedAt: now }
    }
    return orderById.has(item.id) ? { ...item, order: orderById.get(item.id) ?? item.order } : item
  })
}

export function applyProjectBoardCommand(
  snapshot: ProjectBoardSnapshot,
  command: ProjectBoardCommand,
  now = new Date().toISOString(),
): { snapshot: ProjectBoardSnapshot; result: ProjectBoardCommandResult } {
  if (command.type === "create") {
    const id = createId("work-item")
    const order = snapshot.items.filter((item) => item.projectId === command.projectId && item.status === command.draft.status).length
    const item: ProjectWorkItem = {
      id,
      projectId: command.projectId,
      number: nextNumber(snapshot.items, command.projectId),
      ...command.draft,
      lifecycle: "active",
      order,
      createdBy: command.actor,
      updatedBy: command.actor,
      createdAt: now,
      updatedAt: now,
    }
    const createdEvent = event(item, "created", command.actor, `${actorLabel(command.actor)}创建了任务`, now)
    return {
      snapshot: { items: [...snapshot.items, item], events: [createdEvent, ...snapshot.events] },
      result: { ok: true, message: "任务已创建（Mock）", workItemId: id },
    }
  }

  const item = snapshot.items.find((candidate) => candidate.id === command.workItemId)
  if (!item) return { snapshot, result: { ok: false, message: "未找到项目任务" } }

  if (command.type === "update") {
    if (item.lifecycle === "voided") return { snapshot, result: { ok: false, message: "请先恢复已作废任务" } }
    if (item.status === "completed" && command.patch.status) {
      return { snapshot, result: { ok: false, message: "请使用“重新打开”变更已完成任务" } }
    }
    if (command.patch.status && command.patch.status !== item.status) {
      const permission = canMoveProjectWorkItem(item, command.patch.status, command.actor)
      if (!permission.allowed) return { snapshot, result: { ok: false, message: permission.reason ?? "状态变更被拒绝" } }
    }
    const updated: ProjectWorkItem = { ...item, ...command.patch, updatedBy: command.actor, updatedAt: now }
    const updatedEvent = event(updated, "updated", command.actor, `${actorLabel(command.actor)}更新了任务`, now, item.status, updated.status)
    return {
      snapshot: { items: snapshot.items.map((candidate) => candidate.id === item.id ? updated : candidate), events: [updatedEvent, ...snapshot.events] },
      result: { ok: true, message: "任务已更新（Mock）", workItemId: item.id },
    }
  }

  if (command.type === "move") {
    if (command.toStatus === "completed") {
      const denied = event(item, "transition-denied", command.actor, "完成任务需要单独执行人工验收", now, item.status, command.toStatus)
      return {
        snapshot: { ...snapshot, events: [denied, ...snapshot.events] },
        result: { ok: false, message: "请先人工确认验收，再完成任务", workItemId: item.id },
      }
    }
    const permission = canMoveProjectWorkItem(item, command.toStatus, command.actor)
    if (!permission.allowed) {
      const denied = event(item, "transition-denied", command.actor, permission.reason ?? "状态变更被拒绝", now, item.status, command.toStatus)
      return {
        snapshot: { ...snapshot, events: [denied, ...snapshot.events] },
        result: { ok: false, message: permission.reason ?? "状态变更被拒绝", workItemId: item.id },
      }
    }
    const sameStatus = item.status === command.toStatus
    let items = placeItem(snapshot.items, item.id, command.toStatus, command.toIndex, command.actor, now)
    items = normalizeOrders(items, item.projectId, item.status)
    if (item.status !== command.toStatus) items = normalizeOrders(items, item.projectId, command.toStatus)
    const movedItem = items.find((candidate) => candidate.id === item.id) ?? item
    const eventType: ProjectWorkItemEventType = sameStatus
      ? "reordered"
      : item.status === "completed"
        ? "reopened"
        : "moved"
    const movedEvent = event(
      movedItem,
      eventType,
      command.actor,
      sameStatus
        ? `${actorLabel(command.actor)}调整了任务顺序`
        : item.status === "completed"
          ? "本地用户重新打开了任务"
          : `${actorLabel(command.actor)}变更了任务状态`,
      now,
      item.status,
      command.toStatus,
    )
    return {
      snapshot: { items, events: [movedEvent, ...snapshot.events] },
      result: { ok: true, message: sameStatus ? "排序已更新（Mock）" : "状态已更新（Mock）", workItemId: item.id },
    }
  }

  if (command.type === "complete") {
    const permission = canMoveProjectWorkItem(item, "completed", command.actor)
    if (!permission.allowed) return { snapshot, result: { ok: false, message: permission.reason ?? "无法完成任务" } }
    const completed = { ...item, previousStatus: item.status, status: "completed" as const, order: 0, updatedBy: command.actor, updatedAt: now }
    const items = normalizeOrders(snapshot.items.map((candidate) => candidate.id === item.id ? completed : candidate), item.projectId, item.status)
    const completedEvent = event(completed, "completed", command.actor, "本地用户已验收并完成任务", now, item.status, "completed")
    return { snapshot: { items, events: [completedEvent, ...snapshot.events] }, result: { ok: true, message: "已验收并完成", workItemId: item.id } }
  }

  if (command.type === "reopen") {
    if (item.status !== "completed") return { snapshot, result: { ok: false, message: "只有已完成任务可以重新打开" } }
    if (command.actor.kind !== "human") return { snapshot, result: { ok: false, message: "只有人类可以重新打开已完成任务" } }
    const toStatus = command.toStatus ?? "review"
    const reopened = { ...item, status: toStatus, order: snapshot.items.filter((candidate) => candidate.projectId === item.projectId && candidate.status === toStatus).length, updatedBy: command.actor, updatedAt: now }
    const reopenedEvent = event(reopened, "reopened", command.actor, "本地用户重新打开了任务", now, "completed", toStatus)
    return { snapshot: { items: snapshot.items.map((candidate) => candidate.id === item.id ? reopened : candidate), events: [reopenedEvent, ...snapshot.events] }, result: { ok: true, message: "任务已重新打开", workItemId: item.id } }
  }

  const lifecyclePermission = canVoidProjectWorkItem(command.actor)
  if (!lifecyclePermission.allowed) return { snapshot, result: { ok: false, message: lifecyclePermission.reason ?? "操作被拒绝" } }
  if (command.type === "void") {
    if (!command.reason.trim()) return { snapshot, result: { ok: false, message: "请填写作废原因" } }
    const voided = { ...item, lifecycle: "voided" as const, previousStatus: item.status, voidReason: command.reason.trim(), updatedBy: command.actor, updatedAt: now }
    const voidedEvent = event(voided, "voided", command.actor, `本地用户作废任务：${command.reason.trim()}`, now)
    return { snapshot: { items: snapshot.items.map((candidate) => candidate.id === item.id ? voided : candidate), events: [voidedEvent, ...snapshot.events] }, result: { ok: true, message: "任务已作废", workItemId: item.id } }
  }

  const status = item.previousStatus ?? "pending"
  const restored = { ...item, lifecycle: "active" as const, status, voidReason: undefined, order: snapshot.items.filter((candidate) => candidate.projectId === item.projectId && candidate.status === status && candidate.lifecycle === "active").length, updatedBy: command.actor, updatedAt: now }
  const restoredEvent = event(restored, "restored", command.actor, "本地用户恢复了任务", now)
  return { snapshot: { items: snapshot.items.map((candidate) => candidate.id === item.id ? restored : candidate), events: [restoredEvent, ...snapshot.events] }, result: { ok: true, message: "任务已恢复", workItemId: item.id } }
}

export function createInMemoryProjectBoardService(initial: ProjectBoardSnapshot): ProjectBoardService {
  let snapshot: ProjectBoardSnapshot = {
    items: initial.items.map((item) => ({ ...item, tags: [...item.tags], acceptanceCriteria: [...item.acceptanceCriteria] })),
    events: [...initial.events],
  }
  const listeners = new Set<(next: ProjectBoardSnapshot) => void>()
  return {
    getSnapshot: () => snapshot,
    submit: (command) => {
      const next = applyProjectBoardCommand(snapshot, command)
      snapshot = next.snapshot
      listeners.forEach((listener) => listener(snapshot))
      return next.result
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
