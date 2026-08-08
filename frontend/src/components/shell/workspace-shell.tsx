import { lazy, Suspense } from "react"

import { NewTaskView } from "@/components/chat/new-task-view"
import { WorkspacePanel } from "@/components/panels/workspace-panel"
import { WorkspaceMainTabs } from "@/components/panels/workspace-main-tabs"
import { PlaceholderPage } from "@/components/pages/placeholder-page"
import { WorkspaceContextMenu } from "@/components/shell/workspace-context-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useNarrowWorkspace } from "@/hooks/use-narrow-workspace"
import { selectOpenResourceIds } from "@/store/editor-layout"
import { useEditorWorkbenchStore } from "@/store/editor-workbench-store"
import { useWorkspaceStore } from "@/store/workspace-store"

const ConversationView = lazy(() =>
  import("@/components/chat/conversation-view").then((module) => ({
    default: module.ConversationView,
  }))
)

const SpeechMiniPlayer = lazy(() =>
  import("@/components/shell/speech-mini-player").then((module) => ({
    default: module.SpeechMiniPlayer,
  }))
)

const SessionManagementDialogs = lazy(() =>
  import("@/components/session/session-management-dialogs").then((module) => ({
    default: module.SessionManagementDialogs,
  }))
)

const ProjectBoardPage = lazy(() =>
  import("@/components/project-board/project-board-page").then((module) => ({
    default: module.ProjectBoardPage,
  }))
)

function CurrentAppPage() {
  const activePage = useWorkspaceStore((state) => state.activePage)
  const conversationId = useWorkspaceStore((state) => state.conversationId)

  return (
    <div className="app-selectable-content flex size-full min-h-0">
      {activePage === "project-board" ? (
        <Suspense fallback={<div className="flex size-full flex-col gap-3 p-4"><Skeleton className="h-8 w-64" /><Skeleton className="min-h-0 flex-1" /></div>}>
          <ProjectBoardPage />
        </Suspense>
      ) : activePage === "new-task" ? (
        conversationId ? (
          <Suspense
            fallback={
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-8 py-10">
                <Skeleton className="ml-auto h-16 w-2/3 rounded-2xl" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            }
          >
            <ConversationView />
          </Suspense>
        ) : (
          <NewTaskView />
        )
      ) : (
        <PlaceholderPage page={activePage} />
      )}
    </div>
  )
}

function CurrentPage() {
  const activePage = useWorkspaceStore((state) => state.activePage)
  const openFileCount = useEditorWorkbenchStore((state) =>
    selectOpenResourceIds(state.workbench).length,
  )
  const content = <CurrentAppPage />
  return openFileCount > 0 && activePage !== "project-board" ? <WorkspaceMainTabs chat={content} /> : content
}

function HorizontalWorkspace() {
  const rightPanelOpen = useWorkspaceStore((state) => state.rightPanelOpen)
  const toggleRightPanel = useWorkspaceStore((state) => state.toggleRightPanel)
  const isNarrow = useNarrowWorkspace()

  if (!rightPanelOpen) {
    return <CurrentPage />
  }

  if (isNarrow) {
    return (
      <>
        <CurrentPage />
        <Sheet
          open={rightPanelOpen}
          onOpenChange={(open) => {
            if (!open) {
              toggleRightPanel()
            }
          }}
        >
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-[340px] max-w-[88vw] p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>右侧工作区</SheetTitle>
              <SheetDescription>
                文件、终端、搜索、日志、项目看板与会话调试面板。
              </SheetDescription>
            </SheetHeader>
            <WorkspacePanel placement="right" />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel id="main" minSize="480px">
        <CurrentPage />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        id="right"
        defaultSize="28%"
        minSize="280px"
        maxSize="45%"
        collapsible
      >
        <WorkspacePanel placement="right" />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function WorkspaceShell() {
  const bottomPanelOpen = useWorkspaceStore((state) => state.bottomPanelOpen)
  const speechPlayback = useWorkspaceStore((state) => state.speechPlayback)

  return (
    <WorkspaceContextMenu>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          {bottomPanelOpen ? (
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel id="workspace" minSize="45%">
                <HorizontalWorkspace />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                id="bottom"
                defaultSize="30%"
                minSize="160px"
                maxSize="55%"
                collapsible
              >
                <WorkspacePanel placement="bottom" />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <HorizontalWorkspace />
          )}
        </div>
        {speechPlayback ? (
          <Suspense fallback={null}>
            <SpeechMiniPlayer />
          </Suspense>
        ) : null}
        <Suspense fallback={null}>
          <SessionManagementDialogs />
        </Suspense>
      </div>
    </WorkspaceContextMenu>
  )
}
