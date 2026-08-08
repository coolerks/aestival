import type { MockSessionProjectId } from "@/data/mock-session-management"

export type ProjectWorkItemStatus =
  | "pending"
  | "in-progress"
  | "blocked"
  | "review"
  | "completed"

export type ProjectWorkItemLifecycle = "active" | "voided"
export type ProjectWorkItemPriority = "low" | "medium" | "high" | "urgent"

export type BoardActor =
  | { kind: "human"; id: "local-user" }
  | { kind: "ai"; agentId: string; runId: string }

export type ProjectWorkItem = {
  id: string
  projectId: MockSessionProjectId
  number: string
  title: string
  description?: string
  status: ProjectWorkItemStatus
  previousStatus?: ProjectWorkItemStatus
  lifecycle: ProjectWorkItemLifecycle
  priority: ProjectWorkItemPriority
  tags: string[]
  plannedStart?: string
  plannedEnd?: string
  acceptanceCriteria: string[]
  conversationId?: string
  order: number
  createdBy: BoardActor
  updatedBy: BoardActor
  createdAt: string
  updatedAt: string
  blockedReason?: string
  voidReason?: string
}

export type ProjectWorkItemEventType =
  | "created"
  | "updated"
  | "moved"
  | "completed"
  | "reopened"
  | "voided"
  | "restored"
  | "reordered"
  | "transition-denied"
  | "ai-planned"

export type ProjectWorkItemEvent = {
  id: string
  workItemId: string
  projectId: MockSessionProjectId
  type: ProjectWorkItemEventType
  actor: BoardActor
  createdAt: string
  summary: string
  fromStatus?: ProjectWorkItemStatus
  toStatus?: ProjectWorkItemStatus
}

export type ProjectWorkItemDraft = {
  title: string
  description: string
  status: Exclude<ProjectWorkItemStatus, "completed">
  priority: ProjectWorkItemPriority
  tags: string[]
  plannedStart?: string
  plannedEnd?: string
  acceptanceCriteria: string[]
  conversationId?: string
  blockedReason?: string
}

export type ProjectBoardCommand =
  | {
      type: "create"
      projectId: MockSessionProjectId
      draft: ProjectWorkItemDraft
      actor: BoardActor
    }
  | {
      type: "update"
      workItemId: string
      patch: Partial<ProjectWorkItemDraft>
      actor: BoardActor
    }
  | {
      type: "move"
      workItemId: string
      toStatus: ProjectWorkItemStatus
      toIndex: number
      actor: BoardActor
    }
  | {
      type: "complete"
      workItemId: string
      actor: Extract<BoardActor, { kind: "human" }>
    }
  | {
      type: "reopen"
      workItemId: string
      toStatus?: Exclude<ProjectWorkItemStatus, "completed">
      actor: Extract<BoardActor, { kind: "human" }>
    }
  | {
      type: "void"
      workItemId: string
      reason: string
      actor: Extract<BoardActor, { kind: "human" }>
    }
  | {
      type: "restore"
      workItemId: string
      actor: Extract<BoardActor, { kind: "human" }>
    }

export type ProjectBoardCommandResult = {
  ok: boolean
  message: string
  workItemId?: string
}

export type ProjectBoardDatePreset =
  | "week"
  | "next-7"
  | "next-14"
  | "month"
  | "custom"

export type ProjectBoardFilter = {
  projectId: MockSessionProjectId
  preset: ProjectBoardDatePreset
  from: string
  to: string
  includeUnscheduled: boolean
  showVoided: boolean
}

export type ProjectBoardViewMode = "board" | "gantt"
export type ProjectBoardSurface = "main" | "right"

export type ProjectBoardSurfaceState = {
  view: ProjectBoardViewMode
  preset: ProjectBoardDatePreset
  from: string
  to: string
  includeUnscheduled: boolean
  showVoided: boolean
  compactStatus: ProjectWorkItemStatus
  selectedWorkItemId: string | null
}

export type ProjectBoardSnapshot = {
  items: ProjectWorkItem[]
  events: ProjectWorkItemEvent[]
}

export interface ProjectBoardService {
  getSnapshot(): ProjectBoardSnapshot
  submit(command: ProjectBoardCommand): ProjectBoardCommandResult
  subscribe(listener: (snapshot: ProjectBoardSnapshot) => void): () => void
}

export interface ProjectBoardPlanningAdapter {
  createMockPlan(projectId: MockSessionProjectId): ProjectBoardCommandResult
}

export const humanActor: Extract<BoardActor, { kind: "human" }> = {
  kind: "human",
  id: "local-user",
}

export const mockAiActor: Extract<BoardActor, { kind: "ai" }> = {
  kind: "ai",
  agentId: "aestival-planner",
  runId: "mock-plan",
}
