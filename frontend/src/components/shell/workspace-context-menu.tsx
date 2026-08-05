import type { ReactNode } from "react"
import { ContextMenuHost } from "@/components/shell/context-menu-host"

type WorkspaceContextMenuProps = {
  children: ReactNode
}

export function WorkspaceContextMenu({
  children,
}: WorkspaceContextMenuProps) {
  return (
    <>
      {children}
      <ContextMenuHost />
    </>
  )
}
