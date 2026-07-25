import { create } from "zustand"

export type AgentMode = "agent" | "chat"
export type AppPage = "new-task" | "knowledge" | "apps" | "capabilities" | "tasks"

type WorkspaceState = {
  mode: AgentMode
  activePage: AppPage
  commandOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  draft: string
  setMode: (mode: AgentMode) => void
  setActivePage: (page: AppPage) => void
  setCommandOpen: (open: boolean) => void
  toggleRightPanel: () => void
  toggleBottomPanel: () => void
  setDraft: (draft: string) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: "agent",
  activePage: "new-task",
  commandOpen: false,
  rightPanelOpen: false,
  bottomPanelOpen: false,
  draft: "",
  setMode: (mode) => set({ mode }),
  setActivePage: (activePage) => set({ activePage }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  toggleBottomPanel: () =>
    set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  setDraft: (draft) => set({ draft }),
}))
