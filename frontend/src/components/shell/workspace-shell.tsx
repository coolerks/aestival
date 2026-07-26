import { NewTaskView } from "@/components/chat/new-task-view"
import { WorkspacePanel } from "@/components/panels/workspace-panel"
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
import { useNarrowWorkspace } from "@/hooks/use-narrow-workspace"
import { useWorkspaceStore } from "@/store/workspace-store"

function CurrentPage() {
  const activePage = useWorkspaceStore((state) => state.activePage)

  return (
    <div className="app-selectable-content flex size-full min-h-0">
      {activePage === "new-task" ? (
        <NewTaskView />
      ) : (
        <PlaceholderPage page={activePage} />
      )}
    </div>
  )
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
                文件、终端、搜索、日志与会话调试面板。
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

  return (
    <WorkspaceContextMenu>
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
    </WorkspaceContextMenu>
  )
}
