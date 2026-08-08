import { useEffect, useMemo, useRef, useState } from "react"
import { CircleDashedIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockSessionProjects } from "@/data/mock-session-management"
import { projectWorkItemMatchesFilter } from "@/lib/project-board-filter"
import { useProjectBoardStore } from "@/store/project-board-store"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type {
  ProjectBoardSurface as ProjectBoardSurfaceId,
  ProjectWorkItemDraft,
  ProjectWorkItemStatus,
} from "@/types/project-board"
import { humanActor } from "@/types/project-board"

import { projectWorkItemStatuses, projectWorkItemStatusLabels } from "./project-board-constants"
import { ProjectBoardGantt } from "./project-board-gantt"
import { ProjectBoardKanban } from "./project-board-kanban"
import { ProjectBoardToolbar } from "./project-board-toolbar"
import {
  CompleteWorkItemDialog,
  CreateWorkItemDialog,
  VoidWorkItemDialog,
  WorkItemDetailOverlay,
} from "./project-work-item-overlays"

function useSurfaceWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}

export function ProjectBoardSurface({ surface }: { surface: ProjectBoardSurfaceId }) {
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const project = mockSessionProjects.find((candidate) => candidate.id === activeProjectId)
  const surfaceState = useProjectBoardStore((state) => state.surfaces[surface])
  const items = useProjectBoardStore((state) => state.items)
  const events = useProjectBoardStore((state) => state.events)
  const execute = useProjectBoardStore((state) => state.execute)
  const setSelected = useProjectBoardStore((state) => state.setSelectedWorkItem)
  const setCompactStatus = useProjectBoardStore((state) => state.setCompactStatus)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<Exclude<ProjectWorkItemStatus, "completed">>("pending")
  const [completeId, setCompleteId] = useState<string | null>(null)
  const [voidId, setVoidId] = useState<string | null>(null)
  const [planning, setPlanning] = useState(false)
  const { ref, width } = useSurfaceWidth()
  const compact = surface === "right" && width > 0 && width < 640
  const filteredItems = useMemo(() => items.filter((item) => projectWorkItemMatchesFilter(item, {
    projectId: activeProjectId,
    preset: surfaceState.preset,
    from: surfaceState.from,
    to: surfaceState.to,
    includeUnscheduled: surfaceState.includeUnscheduled,
    showVoided: surfaceState.showVoided,
  })), [activeProjectId, items, surfaceState.from, surfaceState.includeUnscheduled, surfaceState.preset, surfaceState.showVoided, surfaceState.to])
  const selectedItem = items.find((item) => item.id === surfaceState.selectedWorkItemId) ?? null
  const completeItem = items.find((item) => item.id === completeId) ?? null
  const voidItem = items.find((item) => item.id === voidId) ?? null

  const openRight = () => {
    useWorkspacePanelStore.getState().openPanel("board", "right")
    const workspace = useWorkspaceStore.getState()
    if (!workspace.rightPanelOpen) workspace.toggleRightPanel()
  }

  const moveItem = (id: string, status: Exclude<ProjectWorkItemStatus, "completed">, index: number) => {
    const before = useProjectBoardStore.getState().items.find((item) => item.id === id)
    if (!before) return
    const result = execute({ type: "move", workItemId: id, toStatus: status, toIndex: index, actor: humanActor })
    if (!result.ok) return void toast.error(result.message)
    if (before.status === "completed") {
      toast.success(result.message)
      return
    }
    toast.success(result.message, {
      action: {
        label: "撤销",
        onClick: () => execute({ type: "move", workItemId: id, toStatus: before.status, toIndex: before.order, actor: humanActor }),
      },
    })
  }

  const createTask = (draft: ProjectWorkItemDraft) => {
    const result = execute({ type: "create", projectId: activeProjectId, actor: humanActor, draft: { ...draft, status: createStatus } })
    if (result.ok) {
      setCreateOpen(false)
      toast.success(result.message)
      if (result.workItemId) setSelected(surface, result.workItemId)
    } else toast.error(result.message)
  }

  const saveSelected = (draft: ProjectWorkItemDraft) => {
    if (!selectedItem) return
    const result = execute({ type: "update", workItemId: selectedItem.id, patch: draft, actor: humanActor })
    result.ok ? toast.success(result.message) : toast.error(result.message)
  }

  const reopen = (id: string) => {
    const result = execute({ type: "reopen", workItemId: id, actor: humanActor })
    result.ok ? toast.success(result.message) : toast.error(result.message)
  }

  const restore = (id: string) => {
    const result = execute({ type: "restore", workItemId: id, actor: humanActor })
    result.ok ? toast.success(result.message) : toast.error(result.message)
  }

  const openCreate = (status: Exclude<ProjectWorkItemStatus, "completed"> = "pending") => {
    setCreateStatus(status)
    setCreateOpen(true)
  }

  const runAiPlan = () => {
    setPlanning(true)
    window.setTimeout(() => {
      const result = useProjectBoardStore.getState().runMockAiPlanning(activeProjectId)
      setPlanning(false)
      toast.success(result.message)
    }, 450)
  }

  return (
    <div ref={ref} className="flex size-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 flex-col gap-2 border-b p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{project?.label ?? "任务"}项目</span>
          <span aria-hidden="true">·</span>
          <span>{filteredItems.length} 个工作项</span>
          <Badge variant="outline" className="ml-auto">前端 Mock</Badge>
        </div>
        <ProjectBoardToolbar surface={surface} compact={compact} onCreate={() => openCreate()} onOpenRight={surface === "main" ? openRight : undefined} onAiPlan={runAiPlan} planning={planning} />
        {compact && surfaceState.view === "board" ? (
          <Select value={surfaceState.compactStatus} onValueChange={(value) => setCompactStatus(surface, value as ProjectWorkItemStatus)}>
            <SelectTrigger className="w-full"><SelectValue>{projectWorkItemStatusLabels[surfaceState.compactStatus]}</SelectValue></SelectTrigger>
            <SelectContent><SelectGroup>{projectWorkItemStatuses.map((status) => <SelectItem key={status.id} value={status.id}>{status.label} · {filteredItems.filter((item) => item.status === status.id).length}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader><EmptyMedia variant="icon"><CircleDashedIcon /></EmptyMedia><EmptyTitle>当前范围没有工作项</EmptyTitle><EmptyDescription>调整日期筛选，或创建一个新的项目任务。</EmptyDescription></EmptyHeader>
          </Empty>
        ) : surfaceState.view === "board" ? (
          <ProjectBoardKanban
            items={filteredItems}
            compact={compact}
            visibleStatuses={compact ? [surfaceState.compactStatus] : undefined}
            onOpen={(id) => setSelected(surface, id)}
            onMove={moveItem}
            onRequestComplete={(id) => {
              const item = items.find((candidate) => candidate.id === id)
              if (item?.status !== "review") toast.error("任务必须先进入待验收")
              else setCompleteId(id)
            }}
            onReopen={reopen}
            onVoid={setVoidId}
            onRestore={restore}
            onCreateInStatus={openCreate}
          />
        ) : (
          <div className="p-3"><ProjectBoardGantt items={filteredItems} from={surfaceState.from} to={surfaceState.to} compact={compact} onOpen={(id) => setSelected(surface, id)} /></div>
        )}
      </div>
      <CreateWorkItemDialog open={createOpen} projectId={activeProjectId} onOpenChange={setCreateOpen} onCreate={createTask} />
      <WorkItemDetailOverlay
        surface={surface}
        item={selectedItem}
        events={events}
        onClose={() => setSelected(surface, null)}
        onSave={saveSelected}
        onComplete={() => selectedItem && setCompleteId(selectedItem.id)}
        onReopen={() => selectedItem && reopen(selectedItem.id)}
        onVoid={() => selectedItem && setVoidId(selectedItem.id)}
        onRestore={() => selectedItem && restore(selectedItem.id)}
      />
      <CompleteWorkItemDialog item={completeItem} onOpenChange={(open) => { if (!open) setCompleteId(null) }} onConfirm={() => {
        if (!completeId) return
        const result = execute({ type: "complete", workItemId: completeId, actor: humanActor })
        setCompleteId(null)
        result.ok ? toast.success(result.message) : toast.error(result.message)
      }} />
      <VoidWorkItemDialog item={voidItem} onOpenChange={(open) => { if (!open) setVoidId(null) }} onConfirm={(reason) => {
        if (!voidId) return
        const result = execute({ type: "void", workItemId: voidId, reason, actor: humanActor })
        setVoidId(null)
        result.ok ? toast.success(result.message) : toast.error(result.message)
      }} />
    </div>
  )
}
