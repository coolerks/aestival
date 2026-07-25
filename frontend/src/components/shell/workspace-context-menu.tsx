import type { ReactNode } from "react"
import {
  CommandIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelsTopLeftIcon,
  RotateCcwIcon,
  SearchIcon,
  SquarePenIcon,
  TimerIcon,
} from "lucide-react"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useWorkspaceStore } from "@/store/workspace-store"

type WorkspaceContextMenuProps = {
  children: ReactNode
}

export function WorkspaceContextMenu({
  children,
}: WorkspaceContextMenuProps) {
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const rightPanelOpen = useWorkspaceStore((state) => state.rightPanelOpen)
  const bottomPanelOpen = useWorkspaceStore((state) => state.bottomPanelOpen)
  const toggleRightPanel = useWorkspaceStore((state) => state.toggleRightPanel)
  const toggleBottomPanel = useWorkspaceStore((state) => state.toggleBottomPanel)

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex min-h-0 flex-1 flex-col">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => setActivePage("new-task")}>
            <SquarePenIcon />
            新建任务
            <ContextMenuShortcut>⌘N</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <TimerIcon />
            新建临时会话
            <ContextMenuShortcut>⌘⇧N</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => setCommandOpen(true)}>
            <SearchIcon />
            全局搜索
            <ContextMenuShortcut>⌘K</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setCommandOpen(true)}>
            <CommandIcon />
            打开命令
            <ContextMenuShortcut>⌘⇧P</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuCheckboxItem
            checked={sidebarOpen}
            onCheckedChange={setSidebarOpen}
          >
            <PanelLeftIcon />
            左侧栏
            <ContextMenuShortcut>⌘B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={rightPanelOpen}
            onCheckedChange={toggleRightPanel}
          >
            <PanelRightIcon />
            右侧栏
            <ContextMenuShortcut>⌘⌥B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={bottomPanelOpen}
            onCheckedChange={toggleBottomPanel}
          >
            <PanelBottomIcon />
            底部面板
            <ContextMenuShortcut>⌘J</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <PanelsTopLeftIcon />
              布局方式
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuGroup>
                <ContextMenuItem>默认布局</ContextMenuItem>
                <ContextMenuItem>专注模式</ContextMenuItem>
                <ContextMenuItem>
                  <RotateCcwIcon />
                  重置布局
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
