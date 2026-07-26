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
    <header className="app-drag-region relative z-20 flex h-[53px] shrink-0">
      {/* 实体背景层：左缘与侧栏/材质层同步滑动，保证整列回缩统一 */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 right-0 border-b bg-background transition-[left] duration-200 ease-linear",
          sidebarState === "expanded"
            ? "left-[var(--sidebar-width)]"
            : "left-0"
        )}
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center px-2">
        <div className="h-full w-[72px] shrink-0" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <SidebarTrigger
            className="app-no-drag pointer-events-auto"
            aria-label="显示或隐藏左侧栏"
          />
          <p className="ml-1 min-w-0 truncate text-sm font-medium">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            className="app-no-drag pointer-events-auto"
            label="全局搜索"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            className="app-no-drag pointer-events-auto"
            label={rightPanelOpen ? "关闭右侧栏" : "打开右侧栏"}
            aria-pressed={rightPanelOpen}
            onClick={toggleRightPanel}
          >
            <PanelRightIcon />
          </IconButton>
          <IconButton
            className="app-no-drag pointer-events-auto"
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
