import { create } from "zustand"

import {
  initialBottomPanels,
  initialRightPanels,
  mockDebugEvents,
  type WorkspacePanelInstance,
  type WorkspacePanelPlacement,
  type WorkspacePanelType,
} from "@/data/mock-workspace-panels"
import { useEditorWorkbenchStore } from "@/store/editor-workbench-store"

type WorkspacePanelStore = {
  rightPanels: WorkspacePanelInstance[]
  bottomPanels: WorkspacePanelInstance[]
  activeRightId: string | null
  activeBottomId: string | null
  mockWorkspaceOpen: boolean
  expandedFolders: string[]
  searchQuery: string
  replaceQuery: string
  replaceOpen: boolean
  searchOptions: string[]
  logSource: string
  logLevel: string
  logQuery: string
  autoScrollLogs: boolean
  logsCleared: boolean
  selectedDebugEventId: string
  debugTab: "overview" | "request" | "response" | "tools" | "tokens" | "raw"
  sensitiveDialogOpen: boolean
  renamePanelId: string | null
  replaceDialogOpen: boolean
  openPanel: (type: WorkspacePanelType, placement: WorkspacePanelPlacement) => string
  setActivePanel: (placement: WorkspacePanelPlacement, id: string) => void
  closePanel: (placement: WorkspacePanelPlacement, id: string) => void
  movePanel: (id: string, to: WorkspacePanelPlacement) => void
  reorderPanel: (placement: WorkspacePanelPlacement, fromId: string, toId: string) => void
  togglePinnedPanel: (id: string) => void
  renamePanel: (id: string, title: string) => void
  setRenamePanelId: (id: string | null) => void
  openMockWorkspace: () => void
  closeMockWorkspace: () => void
  toggleFolder: (id: string) => void
  setSearchQuery: (value: string) => void
  setReplaceQuery: (value: string) => void
  setReplaceOpen: (value: boolean) => void
  setSearchOptions: (values: string[]) => void
  setReplaceDialogOpen: (value: boolean) => void
  setLogSource: (value: string) => void
  setLogLevel: (value: string) => void
  setLogQuery: (value: string) => void
  setAutoScrollLogs: (value: boolean) => void
  clearLogsView: () => void
  restoreLogsView: () => void
  setSelectedDebugEventId: (id: string) => void
  setDebugTab: (tab: WorkspacePanelStore["debugTab"]) => void
  setSensitiveDialogOpen: (value: boolean) => void
}

function newPanel(type: WorkspacePanelType, sequence: number): WorkspacePanelInstance {
  const titles: Record<WorkspacePanelType, string> = {
    files: "文件",
    terminal: `终端 ${sequence}`,
    search: "内容搜索",
    logs: "日志",
    debug: "会话调试",
    board: "项目看板",
  }
  return {
    id: `panel-${type}-${Date.now()}-${sequence}`,
    type,
    title: titles[type],
    pinned: false,
  }
}

export const useWorkspacePanelStore = create<WorkspacePanelStore>((set) => ({
  rightPanels: initialRightPanels.map((panel) => ({ ...panel })),
  bottomPanels: initialBottomPanels.map((panel) => ({ ...panel })),
  activeRightId: initialRightPanels[0]?.id ?? null,
  activeBottomId: initialBottomPanels[0]?.id ?? null,
  mockWorkspaceOpen: false,
  expandedFolders: ["folder-root", "folder-src", "folder-docs", "folder-documents"],
  searchQuery: "Workspace",
  replaceQuery: "Workbench",
  replaceOpen: false,
  searchOptions: [],
  logSource: "all",
  logLevel: "all",
  logQuery: "",
  autoScrollLogs: true,
  logsCleared: false,
  selectedDebugEventId: mockDebugEvents[0]?.id ?? "",
  debugTab: "overview",
  sensitiveDialogOpen: false,
  renamePanelId: null,
  replaceDialogOpen: false,
  openPanel: (type, placement) => {
    if (type === "board") placement = "right"
    const state = useWorkspacePanelStore.getState()
    const all = [...state.rightPanels, ...state.bottomPanels]
    if (type !== "terminal") {
      const existing = all.find((panel) => panel.type === type)
      if (existing) {
        const currentPlacement = state.rightPanels.some((panel) => panel.id === existing.id)
          ? "right"
          : "bottom"
        if (currentPlacement !== placement) state.movePanel(existing.id, placement)
        else state.setActivePanel(placement, existing.id)
        return existing.id
      }
    }
    const terminalCount = all.filter((panel) => panel.type === "terminal").length + 1
    const panel = newPanel(type, terminalCount)
    set((current) => placement === "right"
      ? { rightPanels: [...current.rightPanels, panel], activeRightId: panel.id }
      : { bottomPanels: [...current.bottomPanels, panel], activeBottomId: panel.id })
    return panel.id
  },
  setActivePanel: (placement, id) => set(
    placement === "right" ? { activeRightId: id } : { activeBottomId: id },
  ),
  closePanel: (placement, id) => set((state) => {
    const panels = placement === "right" ? state.rightPanels : state.bottomPanels
    const next = panels.filter((panel) => panel.id !== id)
    const active = next[0]?.id ?? null
    return placement === "right"
      ? { rightPanels: next, activeRightId: active }
      : { bottomPanels: next, activeBottomId: active }
  }),
  movePanel: (id, to) => set((state) => {
    const panel = [...state.rightPanels, ...state.bottomPanels].find((item) => item.id === id)
    if (!panel) return state
    if (panel.type === "board" && to === "bottom") return state
    const rightPanels = state.rightPanels.filter((item) => item.id !== id)
    const bottomPanels = state.bottomPanels.filter((item) => item.id !== id)
    if (to === "right") rightPanels.push(panel)
    else bottomPanels.push(panel)
    return {
      rightPanels,
      bottomPanels,
      activeRightId: to === "right" ? id : rightPanels[0]?.id ?? null,
      activeBottomId: to === "bottom" ? id : bottomPanels[0]?.id ?? null,
    }
  }),
  reorderPanel: (placement, fromId, toId) => set((state) => {
    const panels = placement === "right" ? state.rightPanels : state.bottomPanels
    const fromIndex = panels.findIndex((panel) => panel.id === fromId)
    const toIndex = panels.findIndex((panel) => panel.id === toId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return state
    const next = [...panels]
    const moved = next.splice(fromIndex, 1)[0]
    if (!moved) return state
    next.splice(toIndex, 0, moved)
    return placement === "right" ? { rightPanels: next } : { bottomPanels: next }
  }),
  togglePinnedPanel: (id) => set((state) => ({
    rightPanels: state.rightPanels.map((panel) =>
      panel.id === id ? { ...panel, pinned: !panel.pinned } : panel),
    bottomPanels: state.bottomPanels.map((panel) =>
      panel.id === id ? { ...panel, pinned: !panel.pinned } : panel),
  })),
  renamePanel: (id, title) => set((state) => ({
    rightPanels: state.rightPanels.map((panel) =>
      panel.id === id ? { ...panel, title } : panel),
    bottomPanels: state.bottomPanels.map((panel) =>
      panel.id === id ? { ...panel, title } : panel),
    renamePanelId: null,
  })),
  setRenamePanelId: (renamePanelId) => set({ renamePanelId }),
  openMockWorkspace: () => set({ mockWorkspaceOpen: true }),
  closeMockWorkspace: () => {
    useEditorWorkbenchStore.getState().reset()
    set({ mockWorkspaceOpen: false })
  },
  toggleFolder: (id) => set((state) => ({
    expandedFolders: state.expandedFolders.includes(id)
      ? state.expandedFolders.filter((item) => item !== id)
      : [...state.expandedFolders, id],
  })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setReplaceQuery: (replaceQuery) => set({ replaceQuery }),
  setReplaceOpen: (replaceOpen) => set({ replaceOpen }),
  setSearchOptions: (searchOptions) => set({ searchOptions }),
  setReplaceDialogOpen: (replaceDialogOpen) => set({ replaceDialogOpen }),
  setLogSource: (logSource) => set({ logSource }),
  setLogLevel: (logLevel) => set({ logLevel }),
  setLogQuery: (logQuery) => set({ logQuery }),
  setAutoScrollLogs: (autoScrollLogs) => set({ autoScrollLogs }),
  clearLogsView: () => set({ logsCleared: true }),
  restoreLogsView: () => set({ logsCleared: false }),
  setSelectedDebugEventId: (selectedDebugEventId) => set({ selectedDebugEventId }),
  setDebugTab: (debugTab) => set({ debugTab }),
  setSensitiveDialogOpen: (sensitiveDialogOpen) => set({ sensitiveDialogOpen }),
}))
