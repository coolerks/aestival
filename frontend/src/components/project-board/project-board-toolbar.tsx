import { format, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  CalendarRangeIcon,
  ChartNoAxesGanttIcon,
  Columns3Icon,
  PanelRightOpenIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useProjectBoardStore } from "@/store/project-board-store"
import type { ProjectBoardDatePreset, ProjectBoardSurface } from "@/types/project-board"

const presets: Array<{ id: ProjectBoardDatePreset; label: string }> = [
  { id: "week", label: "本周" },
  { id: "next-7", label: "未来 7 天" },
  { id: "next-14", label: "未来 14 天" },
  { id: "month", label: "本月" },
]

type ProjectBoardToolbarProps = {
  surface: ProjectBoardSurface
  compact?: boolean
  onCreate: () => void
  onOpenRight?: () => void
  onAiPlan: () => void
  planning?: boolean
}

function DateFilter({ surface, compact }: { surface: ProjectBoardSurface; compact?: boolean }) {
  const state = useProjectBoardStore((store) => store.surfaces[surface])
  const setPreset = useProjectBoardStore((store) => store.setSurfacePreset)
  const setRange = useProjectBoardStore((store) => store.setSurfaceRange)
  const setIncludeUnscheduled = useProjectBoardStore((store) => store.setIncludeUnscheduled)
  const setShowVoided = useProjectBoardStore((store) => store.setShowVoided)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>({ from: parseISO(state.from), to: parseISO(state.to) })
  const label = state.preset === "custom"
    ? `${format(parseISO(state.from), "M/d")}–${format(parseISO(state.to), "M/d")}`
    : presets.find((preset) => preset.id === state.preset)?.label ?? "日期"

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button variant="outline" size={compact ? "icon-sm" : "sm"} aria-label={`日期范围：${label}`} />
              }
            />
          }
        >
          <CalendarRangeIcon data-icon={compact ? undefined : "inline-start"} />
          {compact ? null : label}
        </TooltipTrigger>
        <TooltipContent>筛选计划日期</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-3">
        <PopoverHeader>
          <PopoverTitle>计划日期</PopoverTitle>
          <PopoverDescription>起止日期与范围有交集的任务会显示。</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              size="xs"
              variant={state.preset === preset.id ? "secondary" : "ghost"}
              onClick={() => {
                setPreset(surface, preset.id)
                const next = useProjectBoardStore.getState().surfaces[surface]
                setDraftRange({ from: parseISO(next.from), to: parseISO(next.to) })
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          numberOfMonths={1}
          locale={zhCN}
          selected={draftRange}
          onSelect={(range) => {
            setDraftRange(range)
            if (range?.from && range.to) setRange(surface, format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"))
          }}
        />
        <Separator />
        <div className="grid gap-2">
          <Label className="flex items-center justify-between gap-4">
            <span>包含未排期</span>
            <Switch checked={state.includeUnscheduled} onCheckedChange={(value) => setIncludeUnscheduled(surface, value)} aria-label="包含未排期任务" />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>显示已作废</span>
            <Switch checked={state.showVoided} onCheckedChange={(value) => setShowVoided(surface, value)} aria-label="显示已作废任务" />
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ProjectBoardToolbar({ surface, compact, onCreate, onOpenRight, onAiPlan, planning }: ProjectBoardToolbarProps) {
  const state = useProjectBoardStore((store) => store.surfaces[surface])
  const setView = useProjectBoardStore((store) => store.setSurfaceView)
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", compact && "gap-1.5")}>
      <ToggleGroup
        value={[state.view]}
        onValueChange={(values) => {
          const next = values[values.length - 1]
          if (next === "board" || next === "gantt") setView(surface, next)
        }}
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="看板显示模式"
      >
        <ToggleGroupItem value="board" aria-label="看板视图"><Columns3Icon />{compact ? null : "看板"}</ToggleGroupItem>
        <ToggleGroupItem value="gantt" aria-label="甘特图视图"><ChartNoAxesGanttIcon />{compact ? null : "甘特"}</ToggleGroupItem>
      </ToggleGroup>
      <DateFilter surface={surface} compact={compact} />
      <span className="min-w-0 flex-1" aria-hidden="true" />
      {onOpenRight ? (
        <Tooltip>
          <TooltipTrigger render={<Button size="icon-sm" variant="outline" aria-label="在右侧打开项目看板" onClick={onOpenRight} />}>
            <PanelRightOpenIcon />
          </TooltipTrigger>
          <TooltipContent>在右侧打开</TooltipContent>
        </Tooltip>
      ) : null}
      <Button size={compact ? "icon-sm" : "sm"} variant="outline" onClick={onAiPlan} disabled={planning} aria-label="AI 规划（Mock）">
        <SparklesIcon data-icon={compact ? undefined : "inline-start"} />{compact ? null : planning ? "规划中" : "AI 规划"}
      </Button>
      <Button size={compact ? "icon-sm" : "sm"} onClick={onCreate} aria-label="创建项目任务">
        <PlusIcon data-icon={compact ? undefined : "inline-start"} />{compact ? null : "创建任务"}
      </Button>
    </div>
  )
}
