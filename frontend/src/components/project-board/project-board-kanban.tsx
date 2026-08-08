import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProjectWorkItem, ProjectWorkItemStatus } from "@/types/project-board"

import { projectWorkItemStatuses } from "./project-board-constants"
import {
  ProjectWorkItemCard,
  ProjectWorkItemOverlay,
} from "./project-work-item-card"

type ProjectBoardKanbanProps = {
  items: ProjectWorkItem[]
  visibleStatuses?: ProjectWorkItemStatus[]
  compact?: boolean
  onOpen: (id: string) => void
  onMove: (id: string, status: Exclude<ProjectWorkItemStatus, "completed">, index: number) => void
  onRequestComplete: (id: string) => void
  onReopen: (id: string) => void
  onVoid: (id: string) => void
  onRestore: (id: string) => void
  onCreateInStatus: (status: Exclude<ProjectWorkItemStatus, "completed">) => void
}

function BoardColumn({ status, items, compact, children, onCreate }: {
  status: ProjectWorkItemStatus
  items: ProjectWorkItem[]
  compact?: boolean
  children: React.ReactNode
  onCreate?: () => void
}) {
  const definition = projectWorkItemStatuses.find((candidate) => candidate.id === status)
  const droppable = useDroppable({ id: `column:${status}`, data: { type: "column", status } })
  if (!definition) return null
  const Icon = definition.Icon
  return (
    <section className={cn("min-w-0 border-r last:border-r-0", compact && "border-r-0")} aria-labelledby={`board-column-${status}`}>
      <header className="sticky top-0 z-10 flex h-11 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur-sm">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id={`board-column-${status}`} className="text-xs font-medium">{definition.label}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
        <span className="flex-1" aria-hidden="true" />
        {onCreate ? <Button size="icon-xs" variant="ghost" aria-label={`在${definition.label}创建任务`} onClick={onCreate}><PlusIcon /></Button> : null}
      </header>
      <div ref={droppable.setNodeRef} className={cn("flex min-h-28 flex-col gap-2 p-2", droppable.isOver && "bg-muted/35") }>
        {children}
        {items.length === 0 ? <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">拖放到这里</div> : null}
      </div>
    </section>
  )
}

export function ProjectBoardKanban(props: ProjectBoardKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const statuses = props.visibleStatuses ?? projectWorkItemStatuses.map((status) => status.id)
  const activeItem = props.items.find((item) => item.id === activeId) ?? null
  const activeItems = props.items.filter((item) => item.lifecycle === "active")

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    if (!event.over) return
    const moving = activeItems.find((item) => item.id === String(event.active.id))
    if (!moving) return
    const overId = String(event.over.id)
    const targetItem = activeItems.find((item) => item.id === overId)
    const status = targetItem?.status ?? (overId.startsWith("column:") ? overId.slice(7) as ProjectWorkItemStatus : moving.status)
    const statusItems = activeItems.filter((item) => item.status === status).sort((a, b) => a.order - b.order)
    const index = targetItem ? Math.max(0, statusItems.findIndex((item) => item.id === targetItem.id)) : statusItems.length
    if (status === "completed") {
      props.onRequestComplete(moving.id)
      return
    }
    props.onMove(moving.id, status, index)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd}>
      <div className={cn("grid items-start", props.compact ? "grid-cols-1" : "min-w-[1380px] grid-cols-5")}>
        {statuses.map((status) => {
          const statusItems = props.items.filter((item) => item.status === status).sort((a, b) => a.order - b.order)
          return (
            <BoardColumn
              key={status}
              status={status}
              items={statusItems}
              compact={props.compact}
              onCreate={status === "completed" ? undefined : () => props.onCreateInStatus(status)}
            >
              <SortableContext items={statusItems.filter((item) => item.lifecycle === "active").map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {statusItems.map((item) => (
                  <ProjectWorkItemCard
                    key={item.id}
                    item={item}
                    onOpen={props.onOpen}
                    onMove={(id, next) => props.onMove(id, next, activeItems.filter((candidate) => candidate.status === next).length)}
                    onRequestComplete={props.onRequestComplete}
                    onReopen={props.onReopen}
                    onVoid={props.onVoid}
                    onRestore={props.onRestore}
                  />
                ))}
              </SortableContext>
            </BoardColumn>
          )
        })}
      </div>
      <DragOverlay>{activeItem ? <div className="w-64"><ProjectWorkItemOverlay item={activeItem} /></div> : null}</DragOverlay>
    </DndContext>
  )
}
