import {
  PanelBottomIcon,
  PanelRightIcon,
  SearchIcon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { navigationItems } from "@/data/mock-workspace"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/store/workspace-store"

export function AppTitlebar() {
  const { state: sidebarState } = useSidebar()
  const activePage = useWorkspaceStore((state) => state.activePage)
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const toggleRightPanel = useWorkspaceStore((state) => state.toggleRightPanel)
  const toggleBottomPanel = useWorkspaceStore(
    (state) => state.toggleBottomPanel
  )
  const rightPanelOpen = useWorkspaceStore((state) => state.rightPanelOpen)
  const bottomPanelOpen = useWorkspaceStore((state) => state.bottomPanelOpen)
  const title =
    navigationItems.find((item) => item.id === activePage)?.label ?? "Aestival"

  return (
    <header className="app-no-drag relative z-20 flex h-[53px] shrink-0">
      <div
        aria-hidden="true"
        className="app-drag-region absolute inset-x-2 top-2 bottom-0 z-0"
      />
      <div
        className={cn(
          "pointer-events-none relative z-10 flex min-w-0 items-center px-2 transition-[width,background-color,border-color]",
          sidebarState === "expanded"
            ? "w-[var(--sidebar-width)] shrink-0 bg-transparent"
            : "flex-1 border-b bg-background"
        )}
      >
        <div className="h-full w-[72px] shrink-0" aria-hidden="true" />
        <div className="app-no-drag pointer-events-auto flex min-w-0 flex-1 items-center gap-1">
          <SidebarTrigger aria-label="显示或隐藏左侧栏" />
          <p className="ml-1 min-w-0 truncate text-sm font-medium">{title}</p>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none relative z-10 flex items-center justify-end gap-1 border-b bg-background px-2",
          sidebarState === "expanded" ? "min-w-0 flex-1" : "shrink-0"
        )}
      >
        <div className="app-no-drag pointer-events-auto flex shrink-0 items-center gap-1">
          <IconButton
            label="全局搜索"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            label={rightPanelOpen ? "关闭右侧栏" : "打开右侧栏"}
            aria-pressed={rightPanelOpen}
            onClick={toggleRightPanel}
          >
            <PanelRightIcon />
          </IconButton>
          <IconButton
            label={bottomPanelOpen ? "关闭底部面板" : "打开底部面板"}
            aria-pressed={bottomPanelOpen}
            onClick={toggleBottomPanel}
          >
            <PanelBottomIcon />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
