import { create } from "zustand"

import {
  initialMockTaskRuns,
  initialMockTasks,
  taskFromSessionSchedule,
  type MockTask,
  type MockTaskRun,
  type TaskCenterTab,
  type TaskResult,
  type TaskTrigger,
} from "@/data/mock-task-center"
import type { MockScheduledTaskRecord } from "@/data/mock-session-management"

export type TaskDialog = "create" | "delete" | "bypass" | null

type TaskStore = {
  tasks: MockTask[]
  runs: MockTaskRun[]
  activeTab: TaskCenterTab
  search: string
  statusFilter: "all" | "enabled" | "paused"
  triggerFilter: "all" | TaskTrigger
  resultFilter: "all" | TaskResult
  calendarView: "month" | "week" | "day"
  selectedTaskId: string | null
  selectedRunId: string | null
  detailsOpen: boolean
  runDetailsOpen: boolean
  dialog: TaskDialog
  dialogId: string | null
  wizardStep: number
  executionType: TaskTrigger
  scheduleMode: "simple" | "cron"
  approval: "request" | "automatic" | "bypass"
  hydrateSessionTasks: (records: MockScheduledTaskRecord[]) => void
  setActiveTab: (tab: TaskCenterTab) => void
  setSearch: (search: string) => void
  setStatusFilter: (value: "all" | "enabled" | "paused") => void
  setTriggerFilter: (value: "all" | TaskTrigger) => void
  setResultFilter: (value: "all" | TaskResult) => void
  setCalendarView: (value: "month" | "week" | "day") => void
  openTaskDetails: (id: string) => void
  openRunDetails: (id: string) => void
  setDetailsOpen: (open: boolean) => void
  setRunDetailsOpen: (open: boolean) => void
  setDialog: (dialog: TaskDialog, id?: string | null) => void
  setWizardStep: (step: number) => void
  setExecutionType: (type: TaskTrigger) => void
  setScheduleMode: (mode: "simple" | "cron") => void
  setApproval: (approval: "request" | "automatic" | "bypass") => void
  addMockTask: (task: MockTask) => void
  toggleTask: (id: string) => void
  duplicateTask: (id: string) => void
  deleteTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: initialMockTasks.map((task) => ({ ...task, notifications: [...task.notifications], nextRuns: [...task.nextRuns] })),
  runs: initialMockTaskRuns.map((run) => ({ ...run })),
  activeTab: "tasks",
  search: "",
  statusFilter: "all",
  triggerFilter: "all",
  resultFilter: "all",
  calendarView: "month",
  selectedTaskId: null,
  selectedRunId: null,
  detailsOpen: false,
  runDetailsOpen: false,
  dialog: null,
  dialogId: null,
  wizardStep: 1,
  executionType: "prompt",
  scheduleMode: "simple",
  approval: "request",
  hydrateSessionTasks: (records) => set((state) => {
    const known = new Set(state.tasks.map((task) => task.id))
    const incoming = records.filter((record) => !known.has(record.id)).map(taskFromSessionSchedule)
    return incoming.length ? { tasks: [...incoming, ...state.tasks] } : state
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTriggerFilter: (triggerFilter) => set({ triggerFilter }),
  setResultFilter: (resultFilter) => set({ resultFilter }),
  setCalendarView: (calendarView) => set({ calendarView }),
  openTaskDetails: (selectedTaskId) => set({ selectedTaskId, detailsOpen: true }),
  openRunDetails: (selectedRunId) => set({ selectedRunId, runDetailsOpen: true }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setRunDetailsOpen: (runDetailsOpen) => set({ runDetailsOpen }),
  setDialog: (dialog, dialogId = null) => set({ dialog, dialogId, wizardStep: 1 }),
  setWizardStep: (wizardStep) => set({ wizardStep }),
  setExecutionType: (executionType) => set({ executionType }),
  setScheduleMode: (scheduleMode) => set({ scheduleMode }),
  setApproval: (approval) => set({ approval }),
  addMockTask: (task) => set((state) => ({ tasks: [task, ...state.tasks], dialog: null, dialogId: null })),
  toggleTask: (id) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, enabled: !task.enabled, nextRun: task.enabled ? null : task.nextRuns[0] ?? null, nextRunRelative: task.enabled ? null : "即将运行" } : task) })),
  duplicateTask: (id) => set((state) => { const source = state.tasks.find((task) => task.id === id); return source ? { tasks: [{ ...source, id: `${source.id}-copy-${Date.now()}`, name: `${source.name}（副本）`, enabled: false, nextRun: null, nextRunRelative: null }, ...state.tasks] } : state }),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id), dialog: null, dialogId: null, detailsOpen: state.selectedTaskId === id ? false : state.detailsOpen })),
}))
