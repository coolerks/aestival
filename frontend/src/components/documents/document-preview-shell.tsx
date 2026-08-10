import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import type { DocumentPreviewKind } from "@/types/document-preview"

type DocumentPreviewShellProps = ComponentPropsWithoutRef<"div"> & {
  kind: DocumentPreviewKind
  toolbar?: ReactNode
  statusBar?: ReactNode
  contentClassName?: string
}

/**
 * Shared document surface: one toolbar, one bounded content viewport, and one
 * status bar. Format-specific viewers provide only their navigation/content.
 */
export const DocumentPreviewShell = forwardRef<HTMLDivElement, DocumentPreviewShellProps>(
  function DocumentPreviewShell({
    kind,
    toolbar,
    statusBar,
    contentClassName,
    className,
    children,
    ...props
  }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex size-full min-h-0 flex-col bg-background", className)}
        data-document-kind={kind}
        {...props}
      >
        {toolbar}
        <div className={cn("min-h-0 flex-1", contentClassName)}>{children}</div>
        {statusBar}
      </div>
    )
  },
)
