import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type CompactDefinitionRow = {
  label: string
  value: ReactNode
  action?: ReactNode
}

export function CompactDefinitionList({
  rows,
  className,
}: {
  rows: CompactDefinitionRow[]
  className?: string
}) {
  return (
    <dl className={cn("divide-y overflow-hidden rounded-lg border", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            "grid items-center gap-3 px-3 py-2.5",
            row.action
              ? "grid-cols-[minmax(7rem,auto)_minmax(0,1fr)_auto]"
              : "grid-cols-[7rem_minmax(0,1fr)]"
          )}
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 break-words text-foreground">{row.value}</dd>
          {row.action ? <div className="shrink-0">{row.action}</div> : null}
        </div>
      ))}
    </dl>
  )
}
