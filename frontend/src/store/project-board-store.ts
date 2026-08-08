import { format } from "date-fns"
import { create } from "zustand"

import { initialProjectWorkItems } from "@/data/mock-project-board"
import type { MockSessionProjectId } from "@/data/mock-session-management"
import { getProjectBoardDateRange } from "@/lib/project-board-filter"
import { applyProjectBoardCommand } from "@/services/project-board-service"
import type {
  ProjectBoardCommand,
  ProjectBoardCommandResult,
  ProjectBoardDatePreset,
  ProjectBoardSurface,
  ProjectBoardSurfaceState,
  ProjectBoardViewMode,
  ProjectWorkItemEvent,
  ProjectWorkItemStatus,
} from "@/types/project-board"
import { mockAiActor } from "@/types/project-board"

const month = getProjectBoardDateRange("month")

function createSurfaceState(): ProjectBoardSurfaceState {
  return {
    view: "board",
    preset: "month",
    from: month.from,
    to: month.to,
    includeUnscheduled: true,
    showVoided: false,
    compactStatus: "pending",
    selectedWorkItemId: null,
  }
}

type ProjectBoardStore = {
  items: typeof initialProjectWorkItems
  events: ProjectWorkItemEvent[]
  surfaces: Record<ProjectBoardSurface, ProjectBoardSurfaceState>
  execute: (command: ProjectBoardCommand) => ProjectBoardCommandResult
  setSurfaceView: (surface: ProjectBoardSurface, view: ProjectBoardViewMode) => void
  setSurfacePreset: (surface: ProjectBoardSurface, preset: ProjectBoardDatePreset) => void
  setSurfaceRange: (surface: ProjectBoardSurface, from: string, to: string) => void
  setIncludeUnscheduled: (surface: ProjectBoardSurface, value: boolean) => void
  setShowVoided: (surface: ProjectBoardSurface, value: boolean) => void
  setCompactStatus: (surface: ProjectBoardSurface, status: ProjectWorkItemStatus) => void
  setSelectedWorkItem: (surface: ProjectBoardSurface, id: string | null) => void
  runMockAiPlanning: (projectId: MockSessionProjectId) => ProjectBoardCommandResult
}

export const useProjectBoardStore = create<ProjectBoardStore>((set, get) => ({
  items: initialProjectWorkItems.map((item) => ({ ...item, tags: [...item.tags], acceptanceCriteria: [...item.acceptanceCriteria] })),
  events: [],
  surfaces: { main: createSurfaceState(), right: createSurfaceState() },
  execute: (command) => {
    const state = get()
    const next = applyProjectBoardCommand({ items: state.items, events: state.events }, command)
    set({ items: next.snapshot.items, events: next.snapshot.events })
    return next.result
  },
  setSurfaceView: (surface, view) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], view } } })),
  setSurfacePreset: (surface, preset) => set((state) => {
    const range = preset === "custom" ? state.surfaces[surface] : getProjectBoardDateRange(preset)
    return { surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], preset, from: range.from, to: range.to } } }
  }),
  setSurfaceRange: (surface, from, to) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], preset: "custom", from, to } } })),
  setIncludeUnscheduled: (surface, includeUnscheduled) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], includeUnscheduled } } })),
  setShowVoided: (surface, showVoided) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], showVoided } } })),
  setCompactStatus: (surface, compactStatus) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], compactStatus } } })),
  setSelectedWorkItem: (surface, selectedWorkItemId) => set((state) => ({ surfaces: { ...state.surfaces, [surface]: { ...state.surfaces[surface], selectedWorkItemId } } })),
  runMockAiPlanning: (projectId) => {
    const state = get()
    const candidate = state.items.find((item) => item.projectId === projectId && item.lifecycle === "active" && item.status === "pending")
    const today = format(new Date(), "yyyy-MM-dd")
    const created = get().execute({
      type: "create",
      projectId,
      actor: mockAiActor,
      draft: {
        title: "AI 规划：补齐下一步验收路径",
        description: "由前端 Mock 规划器生成，不会调用模型、工具或写入本地文件。",
        status: "pending",
        priority: "medium",
        tags: ["AI 规划", "Mock"],
        plannedStart: today,
        plannedEnd: today,
        acceptanceCriteria: ["由人类检查计划内容", "进入待验收后由人类确认完成"],
      },
    })
    if (candidate) {
      get().execute({ type: "move", workItemId: candidate.id, toStatus: "in-progress", toIndex: 0, actor: mockAiActor })
    }
    const latest = get()
    const workItemId = created.workItemId
    if (workItemId) {
      const item = latest.items.find((candidateItem) => candidateItem.id === workItemId)
      if (item) {
        const audit: ProjectWorkItemEvent = {
          id: `board-event-ai-${Date.now()}`,
          workItemId,
          projectId,
          type: "ai-planned",
          actor: mockAiActor,
          createdAt: new Date().toISOString(),
          summary: "AI Mock 规划器生成并调整了工作项",
        }
        set((current) => ({ events: [audit, ...current.events] }))
      }
    }
    return { ok: true, message: "AI Mock 计划已生成，未调用真实模型", workItemId }
  },
}))
