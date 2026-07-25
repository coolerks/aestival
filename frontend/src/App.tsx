import { useEffect, type CSSProperties } from "react"
import { ThemeProvider } from "next-themes"

import { AppSidebar } from "@/components/shell/app-sidebar"
import { AppTitlebar } from "@/components/shell/app-titlebar"
import { GlobalCommand } from "@/components/shell/global-command"
import { SidebarGlassBackdrop } from "@/components/shell/sidebar-glass-backdrop"
import { WorkspaceShell } from "@/components/shell/workspace-shell"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useWorkspaceStore } from "@/store/workspace-store"

function AestivalWorkspace() {
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)

  useEffect(() => {
    const preventNativeContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandOpen(true)
      }
    }

    document.addEventListener("contextmenu", preventNativeContextMenu)
    window.addEventListener("keydown", handleKeyboardShortcuts)
    return () => {
      document.removeEventListener("contextmenu", preventNativeContextMenu)
      window.removeEventListener("keydown", handleKeyboardShortcuts)
    }
  }, [setCommandOpen])

  return (
    <TooltipProvider>
      <SidebarProvider
        className="relative isolate h-full min-h-0 flex-col overflow-hidden"
        style={
          {
            "--sidebar-width": "16rem",
          } as CSSProperties
        }
      >
        <SidebarGlassBackdrop />
        <AppTitlebar />
        {/* z-30 使 SidebarRail 上延部分在标题栏区域同样可 hover 并显示高亮线；行内容与标题栏垂直方向不重叠，不影响其他层级 */}
        <div className="relative z-30 flex min-h-0 flex-1">
          <AppSidebar />
          <SidebarInset className="min-h-0 overflow-hidden">
            <WorkspaceShell />
          </SidebarInset>
        </div>
        <GlobalCommand />
        <Toaster position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AestivalWorkspace />
    </ThemeProvider>
  )
}
