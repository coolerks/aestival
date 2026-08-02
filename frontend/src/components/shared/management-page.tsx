import { Fragment, type ReactNode } from "react"

import { Empty } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type ManagementMetric = {
  label: string
  value: ReactNode
  onClick?: () => void
}

export function ManagementPageHeader({
  tabs,
  description,
  status = "前端 Mock",
  className,
}: {
  tabs?: ReactNode
  description?: ReactNode
  status?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-end justify-between gap-3 px-4 pt-4",
        className
      )}
    >
      <div className="min-w-0">
        {tabs}
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {status ? (
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {status}
        </span>
      ) : null}
    </div>
  )
}

export function ManagementMetricBand({
  items,
  className,
}: {
  items: ManagementMetric[]
  className?: string
}) {
  return (
    <div className={cn("flex items-stretch rounded-lg border", className)}>
      {items.map((item, index) => {
        const content = (
          <>
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-base font-semibold tabular-nums">
              {item.value}
            </span>
          </>
        )

        return (
          <Fragment key={item.label}>
            {index > 0 ? <Separator orientation="vertical" className="h-auto" /> : null}
            {item.onClick ? (
              <button
                type="button"
                className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={item.onClick}
              >
                {content}
              </button>
            ) : (
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-3 py-2">
                {content}
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export function ManagementToolbar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  )
}

export function ManagementListFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      {children}
    </div>
  )
}

export function ManagementEmpty({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Empty className={cn("min-h-64 rounded-lg border", className)}>
      {children}
    </Empty>
  )
}
