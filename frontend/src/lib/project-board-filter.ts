import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns"

import type {
  ProjectBoardDatePreset,
  ProjectBoardFilter,
  ProjectWorkItem,
} from "@/types/project-board"

const dateFormat = "yyyy-MM-dd"

export function getProjectBoardDateRange(
  preset: ProjectBoardDatePreset,
  today = new Date(),
) {
  const atMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (preset === "week") {
    return {
      from: format(startOfWeek(atMidnight, { weekStartsOn: 1 }), dateFormat),
      to: format(endOfWeek(atMidnight, { weekStartsOn: 1 }), dateFormat),
    }
  }
  if (preset === "next-7" || preset === "next-14") {
    const days = preset === "next-7" ? 6 : 13
    const end = new Date(atMidnight)
    end.setDate(end.getDate() + days)
    return { from: format(atMidnight, dateFormat), to: format(end, dateFormat) }
  }
  return {
    from: format(startOfMonth(atMidnight), dateFormat),
    to: format(endOfMonth(atMidnight), dateFormat),
  }
}

export function projectWorkItemMatchesFilter(
  item: ProjectWorkItem,
  filter: ProjectBoardFilter,
) {
  if (item.projectId !== filter.projectId) return false
  if (item.lifecycle === "voided" && !filter.showVoided) return false
  if (!item.plannedStart && !item.plannedEnd) return filter.includeUnscheduled
  const itemStart = item.plannedStart ?? item.plannedEnd
  const itemEnd = item.plannedEnd ?? item.plannedStart
  if (!itemStart || !itemEnd) return filter.includeUnscheduled
  return itemStart <= filter.to && itemEnd >= filter.from
}
