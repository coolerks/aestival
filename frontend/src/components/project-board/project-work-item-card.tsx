import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import {
  ArchiveRestoreIcon,
  BanIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleArrowRightIcon,
  ExternalLinkIcon,
  GripVerticalIcon,
  UserRoundIcon,
} from "lucide-react"
import type { KeyboardEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { actorLabel } from "@/lib/project-board-policy"
import { cn } from "@/lib/utils"
import type { ProjectWorkItem, ProjectWorkItemStatus } from "@/types/project-board"

import {
  projectWorkItemPriorityLabels,
  projectWorkItemStatuses,
  projectWorkItemStatusLabels,
} from "./project-board-constants"

type ProjectWorkItemCardProps = {
  item: ProjectWorkItem
  overlay?: boolean
  onOpen: (itemId: string) => void
  onMove: (itemId: string, status: Exclude<ProjectWorkItemStatus, "completed">) => void
  onRequestComplete: (itemId: string) => void
  onReopen: (itemId: string) => void
  onVoid: (itemId: string) => void
  onRestore: (itemId: string) => void
}

function ItemCardContent({
  item,
  overlay,
  onOpen,
  listeners,
  attributes,
}: Pick<ProjectWorkItemCardProps, "item" | "overlay" | "onOpen"> & {
  listeners?: ReturnType<typeof useSortable>["listeners"]
  attributes?: ReturnType<typeof useSortable>["attributes"]
}) {
  const dateLabel = item.plannedStart || item.plannedEnd
    ? `${item.plannedStart ?? item.plannedEnd}${item.plannedEnd && item.plannedEnd !== item.plannedStart ? ` → ${item.plannedEnd}` : ""}`
    : "未排期"
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onOpen(item.id)
    }
  }

  return (
    <Card
      size="sm"
      className={cn(
        "group/work-item cursor-default gap-2 rounded-lg shadow-none transition-colors hover:bg-muted/25",
        overlay && "rotate-1 shadow-lg",
        item.lifecycle === "voided" && "border-dashed opacity-70",
      )}
      tabIndex={0}
      role="button"
      aria-label={`打开任务 ${item.title}`}
      onClick={() => onOpen(item.id)}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="gap-1.5">
        <CardDescription className="text-xs">{item.number}</CardDescription>
        <CardTitle className="line-clamp-2 text-sm">{item.title}</CardTitle>
        <CardAction>
          {listeners ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`拖动任务 ${item.title}`}
                    onClick={(event) => event.stopPropagation()}
                    {...attributes}
                    {...listeners}
                  />
                }
              >
                <GripVerticalIcon />
              </TooltipTrigger>
              <TooltipContent>拖动任务，键盘使用空格拾取</TooltipContent>
            </Tooltip>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {item.status === "blocked" && item.blockedReason ? (
          <p className="line-clamp-2 text-xs text-destructive">{item.blockedReason}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={item.priority === "urgent" ? "destructive" : "outline"}>
            {projectWorkItemPriorityLabels[item.priority]}
          </Badge>
          {item.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1 truncate">
            <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {dateLabel}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <UserRoundIcon className="size-3.5" aria-hidden="true" />
            {actorLabel(item.updatedBy)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectWorkItemCard(props: ProjectWorkItemCardProps) {
  const { item } = props
  const sortable = useSortable({ id: item.id, data: { type: "work-item", itemId: item.id, status: item.status }, disabled: item.lifecycle === "voided" })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  return (
    <div ref={sortable.setNodeRef} style={style} className={cn(sortable.isDragging && "opacity-30")}>
      <ContextMenu>
        <ContextMenuTrigger className="block rounded-lg">
          <ItemCardContent item={item} onOpen={props.onOpen} listeners={sortable.listeners} attributes={sortable.attributes} />
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuGroup>
            <ContextMenuLabel>{item.number}</ContextMenuLabel>
            <ContextMenuItem onClick={() => props.onOpen(item.id)}>
              <ExternalLinkIcon />打开详情
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          {item.lifecycle === "voided" ? (
            <ContextMenuGroup>
              <ContextMenuItem onClick={() => props.onRestore(item.id)}>
                <ArchiveRestoreIcon />恢复任务
              </ContextMenuItem>
            </ContextMenuGroup>
          ) : (
            <>
              <ContextMenuGroup>
                {item.status === "completed" ? (
                  <ContextMenuItem onClick={() => props.onReopen(item.id)}>
                    <CircleArrowRightIcon />重新打开到待验收
                  </ContextMenuItem>
                ) : (
                  <ContextMenuSub>
                    <ContextMenuSubTrigger><CircleArrowRightIcon />移动到</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">
                      <ContextMenuGroup>
                        {projectWorkItemStatuses.map(({ id, label, Icon }) => (
                          <ContextMenuItem
                            key={id}
                            disabled={id === item.status || (id === "completed" && item.status !== "review")}
                            onClick={() => id === "completed" ? props.onRequestComplete(item.id) : props.onMove(item.id, id)}
                          >
                            <Icon />{label}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuGroup>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                )}
                {item.status === "review" ? (
                  <ContextMenuItem onClick={() => props.onRequestComplete(item.id)}>
                    <CheckCircle2Icon />验收并完成
                  </ContextMenuItem>
                ) : null}
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem variant="destructive" onClick={() => props.onVoid(item.id)}>
                  <BanIcon />作废任务
                </ContextMenuItem>
              </ContextMenuGroup>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export function ProjectWorkItemOverlay({ item }: { item: ProjectWorkItem }) {
  return <ItemCardContent item={item} overlay onOpen={() => undefined} />
}

export function WorkItemStatusLabel({ status }: { status: ProjectWorkItemStatus }) {
  return <span>{projectWorkItemStatusLabels[status]}</span>
}
