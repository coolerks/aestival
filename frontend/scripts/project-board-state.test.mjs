import assert from "node:assert/strict"
import test from "node:test"

import { projectWorkItemMatchesFilter } from "../src/lib/project-board-filter.ts"
import { applyProjectBoardCommand } from "../src/services/project-board-service.ts"

const human = { kind: "human", id: "local-user" }
const ai = { kind: "ai", agentId: "planner", runId: "run-1" }

function item(overrides = {}) {
  return {
    id: "item-1",
    projectId: "aestival",
    number: "AES-1",
    title: "验证看板权限",
    description: "",
    status: "pending",
    lifecycle: "active",
    priority: "medium",
    tags: [],
    plannedStart: "2026-08-05",
    plannedEnd: "2026-08-10",
    acceptanceCriteria: [],
    order: 0,
    createdBy: human,
    updatedBy: human,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  }
}

function apply(items, command) {
  return applyProjectBoardCommand({ items, events: [] }, command, "2026-08-08T03:30:00.000Z")
}

test("AI 无法把待验收任务直接完成，并记录拒绝事件", () => {
  const current = item({ status: "review" })
  const next = apply([current], {
    type: "move",
    workItemId: current.id,
    toStatus: "completed",
    toIndex: 0,
    actor: ai,
  })
  assert.equal(next.result.ok, false)
  assert.equal(next.snapshot.items[0].status, "review")
  assert.equal(next.snapshot.events[0].type, "transition-denied")
})

test("只有待验收任务可以由人类验收完成", () => {
  const pending = item({ status: "pending" })
  const rejected = apply([pending], { type: "complete", workItemId: pending.id, actor: human })
  assert.equal(rejected.result.ok, false)

  const review = item({ status: "review" })
  const completed = apply([review], { type: "complete", workItemId: review.id, actor: human })
  assert.equal(completed.result.ok, true)
  assert.equal(completed.snapshot.items[0].status, "completed")
  assert.equal(completed.snapshot.events[0].type, "completed")
})

test("AI 无法重新打开、作废或恢复任务", () => {
  const completed = item({ status: "completed" })
  const reopened = apply([completed], { type: "reopen", workItemId: completed.id, actor: ai })
  assert.equal(reopened.result.ok, false)

  const active = item()
  const voided = apply([active], { type: "void", workItemId: active.id, reason: "Mock", actor: ai })
  assert.equal(voided.result.ok, false)

  const archived = item({ lifecycle: "voided", previousStatus: "pending" })
  const restored = apply([archived], { type: "restore", workItemId: archived.id, actor: ai })
  assert.equal(restored.result.ok, false)
})

test("跨状态移动保持目标列顺序并隔离其他项目", () => {
  const moving = item({ id: "moving", status: "pending", order: 0 })
  const first = item({ id: "first", status: "in-progress", order: 0 })
  const second = item({ id: "second", status: "in-progress", order: 1 })
  const otherProject = item({ id: "other", projectId: "task", status: "in-progress", order: 0 })
  const next = apply([moving, first, second, otherProject], {
    type: "move",
    workItemId: moving.id,
    toStatus: "in-progress",
    toIndex: 1,
    actor: human,
  })
  const aestival = next.snapshot.items
    .filter((entry) => entry.projectId === "aestival" && entry.status === "in-progress")
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.id)
  assert.deepEqual(aestival, ["first", "moving", "second"])
  assert.equal(next.snapshot.items.find((entry) => entry.id === "other").order, 0)
})

test("日期筛选按交集判断，并正确处理未排期和作废", () => {
  const filter = {
    projectId: "aestival",
    preset: "custom",
    from: "2026-08-08",
    to: "2026-08-14",
    includeUnscheduled: false,
    showVoided: false,
  }
  assert.equal(projectWorkItemMatchesFilter(item(), filter), true)
  assert.equal(projectWorkItemMatchesFilter(item({ plannedStart: "2026-08-01", plannedEnd: "2026-08-07" }), filter), false)
  assert.equal(projectWorkItemMatchesFilter(item({ plannedStart: undefined, plannedEnd: undefined }), filter), false)
  assert.equal(projectWorkItemMatchesFilter(item({ lifecycle: "voided" }), filter), false)
  assert.equal(projectWorkItemMatchesFilter(item({ plannedStart: undefined, plannedEnd: undefined }), { ...filter, includeUnscheduled: true }), true)
  assert.equal(projectWorkItemMatchesFilter(item({ lifecycle: "voided" }), { ...filter, showVoided: true }), true)
})

test("作废与恢复保留原状态并写入审计", () => {
  const blocked = item({ status: "blocked" })
  const voided = apply([blocked], { type: "void", workItemId: blocked.id, reason: "方案取消", actor: human })
  assert.equal(voided.snapshot.items[0].lifecycle, "voided")
  assert.equal(voided.snapshot.items[0].previousStatus, "blocked")
  assert.equal(voided.snapshot.events[0].type, "voided")

  const restored = applyProjectBoardCommand(voided.snapshot, { type: "restore", workItemId: blocked.id, actor: human }, "2026-08-08T03:31:00.000Z")
  assert.equal(restored.snapshot.items[0].lifecycle, "active")
  assert.equal(restored.snapshot.items[0].status, "blocked")
  assert.equal(restored.snapshot.events[0].type, "restored")
})
