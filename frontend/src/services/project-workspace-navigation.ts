import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useWorkspaceStore } from "@/store/workspace-store"

export function activateWorkspaceProject(
  projectId: string,
  options: { openFiles?: boolean } = {},
) {
  const projects = useProjectWorkspaceStore.getState()
  const project = projects.projects.find((item) => item.id === projectId)
  if (!project) return

  const workspace = useWorkspaceStore.getState()
  if (projects.activeProjectId !== projectId) workspace.resetConversation()
  projects.setActiveProject(projectId)
  workspace.setActiveProjectId(projectId)
  workspace.setActivePage("new-task")

  if (project.kind === "note") {
    const snapshot = projects.noteWorkspaces[projectId]
    workspace.setRightPanelOpen(options.openFiles ? true : (snapshot?.rightPanelOpen ?? true))
    workspace.setBottomPanelOpen(options.openFiles ? false : (snapshot?.bottomPanelOpen ?? false))
    if (options.openFiles) projects.setActiveNotePanel(projectId, "right", "files")
  } else if (options.openFiles) {
    workspace.setRightPanelOpen(true)
    workspace.setBottomPanelOpen(false)
  }
}

export function openWorkspaceNoteGraph(projectId: string) {
  activateWorkspaceProject(projectId)
  const projects = useProjectWorkspaceStore.getState()
  projects.openGlobalGraph(projectId)
}
