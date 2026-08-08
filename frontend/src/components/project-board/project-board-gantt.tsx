import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isWeekend,
  parseISO,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarX2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import type { ProjectWorkItem, ProjectWorkItemStatus } from "@/types/project-board"

import { projectWorkItemStatusLabels } from "./project-board-constants"

const statusBarClasses: Record<ProjectWorkItemStatus, string> = {
  pending: "bg-muted-foreground/55",
  "in-progress": "bg-primary",
  blocked: "bg-destructive",
  review: "bg-secondary-foreground/65",
  completed: "bg-primary/55",
}

type ProjectBoardGanttProps = {
  items: ProjectWorkItem[]
  from: string
  to: string
  compact?: boolean
  onOpen: (id: string) => void
}

export function ProjectBoardGantt({ items, from, to, compact, onOpen }: ProjectBoardGanttProps) {
  const start = parseISO(from)
  const end = parseISO(to)
  const days = eachDayOfInterval({ start, end })
  const scheduled = items.filter((item) => item.plannedStart || item.plannedEnd)
  const unscheduled = items.filter((item) => !item.plannedStart && !item.plannedEnd)
  const labelWidth = compact ? 150 : 220
  const dayWidth = compact ? 30 : 36
  const gridStyle = { gridTemplateColumns: `${labelWidth}px repeat(${days.length}, ${dayWidth}px)` }
  const today = new Date()

  if (items.length === 0) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon"><CalendarX2Icon /></EmptyMedia>
          <EmptyTitle>当前范围没有任务</EmptyTitle>
          <EmptyDescription>调整日期范围，或开启“包含未排期”。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="min-h-0 w-max min-w-full rounded-lg border" aria-label="项目甘特图">
      <div className="min-w-max">
        <div className="sticky top-0 z-20 grid h-12 border-b bg-background" style={gridStyle}>
          <div className="sticky left-0 z-30 flex items-center border-r bg-background px-3 text-xs font-medium">任务</div>
          {days.map((day) => (
            <div key={day.toISOString()} className={cn("flex flex-col items-center justify-center border-r text-[11px] text-muted-foreground", isWeekend(day) && "bg-muted/45", isSameDay(day, today) && "text-foreground")}>
              <span>{format(day, "EEE", { locale: zhCN })}</span>
              <span className={cn(isSameDay(day, today) && "font-semibold")}>{format(day, "M/d")}</span>
            </div>
          ))}
        </div>
        {scheduled.map((item) => {
          const itemStart = parseISO(item.plannedStart ?? item.plannedEnd ?? from)
          const itemEnd = parseISO(item.plannedEnd ?? item.plannedStart ?? to)
          const clippedStart = itemStart < start ? start : itemStart
          const clippedEnd = itemEnd > end ? end : itemEnd
          const startIndex = differenceInCalendarDays(clippedStart, start)
          const span = Math.max(1, differenceInCalendarDays(clippedEnd, clippedStart) + 1)
          return (
            <div key={item.id} className="relative grid min-h-14 border-b last:border-b-0" style={gridStyle}>
              <button type="button" onClick={() => onOpen(item.id)} className="sticky left-0 z-10 flex min-w-0 flex-col justify-center border-r bg-background px-3 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <span className="truncate text-xs font-medium">{item.title}</span>
                <span className="truncate text-[11px] text-muted-foreground">{item.number} · {projectWorkItemStatusLabels[item.status]}</span>
              </button>
              {days.map((day) => <div key={day.toISOString()} className={cn("border-r", isWeekend(day) && "bg-muted/35", isSameDay(day, today) && "border-l border-l-foreground/40")} />)}
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className={cn("z-10 my-4 h-6 min-w-0 truncate rounded-md px-2 text-left text-[11px] font-medium text-primary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", statusBarClasses[item.status])}
                style={{ gridColumn: `${startIndex + 2} / span ${span}` }}
                title={`${item.title} · ${item.plannedStart ?? ""}–${item.plannedEnd ?? ""}`}
              >
                {compact ? item.number : item.title}
              </button>
            </div>
          )
        })}
        {unscheduled.length > 0 ? (
          <div className="border-t bg-muted/15">
            <div className="sticky left-0 flex h-9 items-center px-3 text-xs font-medium">未排期 · {unscheduled.length}</div>
            {unscheduled.map((item) => (
              <button key={item.id} type="button" onClick={() => onOpen(item.id)} className="sticky left-0 flex w-full max-w-[min(32rem,90vw)] items-center justify-between gap-3 border-t bg-background px-3 py-2 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <span className="min-w-0 truncate text-xs font-medium">{item.title}</span>
                <Badge variant="outline">{projectWorkItemStatusLabels[item.status]}</Badge>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
