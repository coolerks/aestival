import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarGlassBackdrop() {
  const { state: sidebarState } = useSidebar()

  return (
    <div
      aria-hidden="true"
      data-slot="sidebar-glass-backdrop"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[var(--sidebar-width)] border-r border-sidebar-border bg-sidebar/10 transition-transform duration-200 ease-linear md:block",
        sidebarState === "collapsed" && "-translate-x-full"
      )}
    />
  )
}
