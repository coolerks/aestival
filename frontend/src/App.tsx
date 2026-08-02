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
      const modifier = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (modifier && key === "k") {
        event.preventDefault()
        setCommandOpen(true)
        return
      }
      if (modifier && key === ",") {
        event.preventDefault()
        useWorkspaceStore.getState().setActivePage("settings")
        return
      }

      const target = event.target
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (editing) {
        return
      }

      const state = useWorkspaceStore.getState()
      const session = state.sessions.find(
        (item) => item.id === state.conversationId
      )
      if (!session) {
        return
      }

      if (event.key === "F2") {
        event.preventDefault()
        state.openSessionDialog("rename", session.id)
      } else if (modifier && event.shiftKey && key === "s") {
        event.preventDefault()
        state.toggleSessionStar(session.id)
      } else if (modifier && event.shiftKey && key === "a") {
        event.preventDefault()
        state.setSessionArchived(session.id, !session.archived)
      } else if (modifier && event.key === "Backspace") {
        event.preventDefault()
        state.openSessionDialog("delete", session.id)
      } else if (modifier && event.altKey && key === "n") {
        event.preventDefault()
        state.openSessionDialog("schedule", session.id)
      } else if (modifier && event.altKey && key === "i") {
        event.preventDefault()
        state.setStatsOpen(true)
      } else if (modifier && event.altKey && key === "f") {
        event.preventDefault()
        state.setForkDialogOpen(
          true,
          state.messages[state.messages.length - 1]?.id
        )
      } else if (modifier && event.shiftKey && key === "e") {
        event.preventDefault()
        state.setExportDialogOpen(true, "conversation")
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
