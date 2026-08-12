import {
  PanelBottomIcon,
  PanelRightIcon,
  SearchIcon,
  ShieldQuestionIcon,
  ListTodoIcon,
  TimerIcon,
  NetworkIcon,
} from "lucide-react"
import type { MouseEvent } from "react"
import { toast } from "sonner"

import { ConversationTitleMenu } from "@/components/chat/conversation-title-menu"
import { IconButton } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { navigationItems } from "@/data/mock-workspace"
import { mockFiles } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import { toggleWindowMaximise } from "@/services/window-service"
import { openWorkspaceNoteGraph } from "@/services/project-workspace-navigation"
import { useAppStore } from "@/store/app-store"
import { selectActiveEditor } from "@/store/editor-layout"
import { useEditorWorkbenchStore } from "@/store/editor-workbench-store"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useWorkspaceStore } from "@/store/workspace-store"

export function AppTitlebar() {
  const { state: sidebarState } = useSidebar()
  const activePage = useWorkspaceStore((state) => state.activePage)
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const conversationTitle = useWorkspaceStore(
    (state) => state.conversationTitle
  )
  const runState = useWorkspaceStore((state) => state.runState)
  const isTemporaryConversation = useWorkspaceStore(
    (state) => state.isTemporaryConversation
  )
  const mockAppDraft = useWorkspaceStore((state) => state.mockAppDraft)
  const appCenterView = useAppStore((state) => state.view)
  const selectedAppName = useAppStore(
    (state) =>
      state.apps.find((app) => app.id === state.selectedAppId)?.name
  )
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const activeProject = useProjectWorkspaceStore((state) =>
    state.projects.find((project) => project.id === state.activeProjectId),
  )
  const noteWorkspace = useProjectWorkspaceStore((state) =>
    state.noteWorkspaces[state.activeProjectId],
  )
  const activeNoteTab = noteWorkspace
    ? noteWorkspace.groups
        .find((group) => group.id === noteWorkspace.focusedGroupId)
        ?.tabs.find(
          (tab) =>
            tab.id ===
            noteWorkspace.groups.find(
              (group) => group.id === noteWorkspace.focusedGroupId,
            )?.activeTabId,
        )
    : null
  const openProjectBoard = useWorkspaceStore((state) => state.openProjectBoard)
  const returnFromProjectBoard = useWorkspaceStore((state) => state.returnFromProjectBoard)
  const toggleRightPanel = useWorkspaceStore((state) => state.toggleRightPanel)
  const toggleBottomPanel = useWorkspaceStore(
    (state) => state.toggleBottomPanel
  )
  const rightPanelOpen = useWorkspaceStore((state) => state.rightPanelOpen)
  const bottomPanelOpen = useWorkspaceStore((state) => state.bottomPanelOpen)
  const activeFileId = useEditorWorkbenchStore((state) => {
    const editor = selectActiveEditor(state.workbench)
    return editor && editor.kind !== "chat" ? editor.resourceId : null
  })
  const activeFileName = mockFiles.find((file) => file.id === activeFileId)?.name
  const activeProjectLabel = activeProject?.name ?? "任务"
  const title =
    activePage === "project-board"
      ? `${activeProjectLabel} · 看板`
      : activePage === "new-task" && activeProject?.kind === "note" && activeNoteTab?.kind !== "chat"
        ? activeNoteTab?.title ?? activeProjectLabel
      : activeFileName ?? (activePage === "new-task" && conversationId
      ? conversationTitle
      : activePage === "apps" && appCenterView === "editor"
        ? selectedAppName ?? mockAppDraft?.name ?? "应用"
      : activePage === "settings"
        ? "设置"
      : navigationItems.find((item) => item.id === activePage)?.label ??
        "Aestival")
  const running =
    runState === "waiting" ||
    runState === "thinking" ||
    runState === "streaming"

  const handleTitlebarDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return
    }

    const target = event.target
    if (target instanceof Element && target.closest(".app-no-drag")) {
      return
    }

    event.preventDefault()
    void toggleWindowMaximise().catch(() => {
      toast.error("无法切换窗口大小")
    })
  }

  return (
    <header
      className={cn(
        "app-drag-region relative z-20 grid h-[53px] shrink-0 transition-[grid-template-columns] duration-200 ease-linear",
        sidebarState === "expanded"
          ? "grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
          : "grid-cols-[124px_minmax(0,1fr)]"
      )}
      onDoubleClick={handleTitlebarDoubleClick}
    >
      {/* 主标题栏背景边界与侧栏材质层使用同一条 256px ↔ 0px 轨迹，避免收起/展开时分离。 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-0 border-b bg-background transition-[left] duration-200 ease-linear",
          sidebarState === "expanded"
            ? "left-[var(--sidebar-width)]"
            : "left-0"
        )}
      />
      {/* 左段属于侧栏：只承载窗口控件安全区和侧栏开关，不显示页面名称。 */}
      <div
        className="pointer-events-none relative z-10 flex h-full min-w-0 items-center px-4"
      >
        <div className="h-full w-[72px] shrink-0" aria-hidden="true" />
        <SidebarTrigger
          className="app-no-drag pointer-events-auto"
          aria-label="显示或隐藏左侧栏"
        />
      </div>
      {/* 右段属于主内容：页面、会话或文件名称统一从主内容左缘开始。 */}
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-2 border-b bg-background px-4">
        <p className="min-w-0 max-w-[min(36rem,50vw)] truncate text-sm font-medium">
          {title}
        </p>
        {activePage === "new-task" && conversationId ? (
          <ConversationTitleMenu />
        ) : null}
        <span className="min-w-0 flex-1" aria-hidden="true" />
        {activePage === "new-task" && conversationId ? (
          <span className="flex shrink-0 items-center gap-2">
            {isTemporaryConversation ? (
              <Badge variant="secondary">
                <TimerIcon data-icon="inline-start" />
                临时
              </Badge>
            ) : null}
            {runState === "awaiting-approval" ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldQuestionIcon className="size-3.5" aria-hidden="true" />
                等待审批
              </span>
            ) : running ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Spinner aria-label="Mock 会话运行中" className="size-3.5" />
                运行中
              </span>
            ) : null}
          </span>
        ) : null}
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            className="app-no-drag pointer-events-auto"
            label="全局搜索"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon />
          </IconButton>
          {activeProject?.kind === "note" ? (
            <IconButton
              className="app-no-drag pointer-events-auto"
              label={`打开${activeProjectLabel}全局图谱`}
              onClick={() => openWorkspaceNoteGraph(activeProject.id)}
            >
              <NetworkIcon />
            </IconButton>
          ) : (
            <IconButton
              className={cn(
                "app-no-drag pointer-events-auto",
                activePage === "project-board" && "bg-muted text-foreground"
              )}
              label={activePage === "project-board" ? "返回先前页面" : `打开${activeProjectLabel}项目看板`}
              aria-pressed={activePage === "project-board"}
              onClick={activePage === "project-board" ? returnFromProjectBoard : openProjectBoard}
            >
              <ListTodoIcon />
            </IconButton>
          )}
          <IconButton
            className={cn(
              "app-no-drag pointer-events-auto",
              bottomPanelOpen && "bg-muted text-foreground"
            )}
            label={bottomPanelOpen ? "关闭底部面板" : "打开底部面板"}
            aria-pressed={bottomPanelOpen}
            onClick={toggleBottomPanel}
          >
            <PanelBottomIcon />
          </IconButton>
          <IconButton
            className={cn(
              "app-no-drag pointer-events-auto",
              rightPanelOpen && "bg-muted text-foreground"
            )}
            label={rightPanelOpen ? "关闭右侧栏" : "打开右侧栏"}
            aria-pressed={rightPanelOpen}
            onClick={toggleRightPanel}
          >
            <PanelRightIcon />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
