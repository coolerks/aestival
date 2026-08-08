import { formatDistanceToNow, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { BanIcon, CheckCircle2Icon, RotateCcwIcon, SaveIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { actorLabel } from "@/lib/project-board-policy"
import type { MockSessionProjectId } from "@/data/mock-session-management"
import type {
  ProjectWorkItem,
  ProjectWorkItemDraft,
  ProjectWorkItemEvent,
  ProjectWorkItemPriority,
  ProjectWorkItemStatus,
} from "@/types/project-board"

import {
  projectWorkItemPriorityLabels,
  projectWorkItemStatuses,
  projectWorkItemStatusLabels,
} from "./project-board-constants"

type WorkItemFormValue = {
  title: string
  description: string
  status: Exclude<ProjectWorkItemStatus, "completed">
  priority: ProjectWorkItemPriority
  tags: string
  plannedStart: string
  plannedEnd: string
  acceptanceCriteria: string
  blockedReason: string
}

function initialValue(item?: ProjectWorkItem): WorkItemFormValue {
  return {
    title: item?.title ?? "",
    description: item?.description ?? "",
    status: item?.status === "completed" ? "review" : item?.status ?? "pending",
    priority: item?.priority ?? "medium",
    tags: item?.tags.join("，") ?? "",
    plannedStart: item?.plannedStart ?? "",
    plannedEnd: item?.plannedEnd ?? "",
    acceptanceCriteria: item?.acceptanceCriteria.join("\n") ?? "",
    blockedReason: item?.blockedReason ?? "",
  }
}

function toDraft(value: WorkItemFormValue): ProjectWorkItemDraft {
  return {
    title: value.title.trim(),
    description: value.description.trim(),
    status: value.status,
    priority: value.priority,
    tags: value.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
    plannedStart: value.plannedStart || undefined,
    plannedEnd: value.plannedEnd || undefined,
    acceptanceCriteria: value.acceptanceCriteria.split("\n").map((line) => line.trim()).filter(Boolean),
    blockedReason: value.status === "blocked" ? value.blockedReason.trim() || undefined : undefined,
  }
}

function WorkItemForm({ item, onChangeValidity, onDraftChange }: {
  item?: ProjectWorkItem
  onChangeValidity: (valid: boolean) => void
  onDraftChange: (draft: ProjectWorkItemDraft) => void
}) {
  const [value, setValue] = useState(() => initialValue(item))
  useEffect(() => setValue(initialValue(item)), [item])
  const invalidDates = Boolean(value.plannedStart && value.plannedEnd && value.plannedStart > value.plannedEnd)
  const valid = Boolean(value.title.trim()) && !invalidDates
  useEffect(() => {
    onChangeValidity(valid)
    onDraftChange(toDraft(value))
  }, [valid, value, onChangeValidity, onDraftChange])
  const update = <K extends keyof WorkItemFormValue>(key: K, next: WorkItemFormValue[K]) => setValue((current) => ({ ...current, [key]: next }))

  return (
    <FieldGroup>
      <Field data-invalid={!value.title.trim()}>
        <FieldLabel htmlFor="board-item-title">标题</FieldLabel>
        <Input id="board-item-title" value={value.title} onChange={(event) => update("title", event.target.value)} aria-invalid={!value.title.trim()} autoFocus />
      </Field>
      <Field>
        <FieldLabel htmlFor="board-item-description">说明</FieldLabel>
        <Textarea id="board-item-description" value={value.description} onChange={(event) => update("description", event.target.value)} rows={3} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>状态</FieldLabel>
          <Select value={value.status} onValueChange={(next) => update("status", next as WorkItemFormValue["status"])}>
            <SelectTrigger className="w-full"><SelectValue>{projectWorkItemStatusLabels[value.status]}</SelectValue></SelectTrigger>
            <SelectContent><SelectGroup>{projectWorkItemStatuses.filter((status) => status.id !== "completed").map((status) => <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>优先级</FieldLabel>
          <Select value={value.priority} onValueChange={(next) => update("priority", next as ProjectWorkItemPriority)}>
            <SelectTrigger className="w-full"><SelectValue>{projectWorkItemPriorityLabels[value.priority]}</SelectValue></SelectTrigger>
            <SelectContent><SelectGroup>{Object.entries(projectWorkItemPriorityLabels).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>
      </div>
      {value.status === "blocked" ? (
        <Field>
          <FieldLabel htmlFor="board-item-blocked">受阻原因</FieldLabel>
          <Input id="board-item-blocked" value={value.blockedReason} onChange={(event) => update("blockedReason", event.target.value)} />
        </Field>
      ) : null}
      <Field>
        <FieldLabel htmlFor="board-item-tags">标签</FieldLabel>
        <Input id="board-item-tags" value={value.tags} onChange={(event) => update("tags", event.target.value)} placeholder="设计，QA，前端" />
        <FieldDescription>使用逗号分隔。</FieldDescription>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={invalidDates}>
          <FieldLabel htmlFor="board-item-start">计划开始</FieldLabel>
          <Input id="board-item-start" type="date" value={value.plannedStart} onChange={(event) => update("plannedStart", event.target.value)} aria-invalid={invalidDates} />
        </Field>
        <Field data-invalid={invalidDates}>
          <FieldLabel htmlFor="board-item-end">计划结束</FieldLabel>
          <Input id="board-item-end" type="date" value={value.plannedEnd} onChange={(event) => update("plannedEnd", event.target.value)} aria-invalid={invalidDates} />
          {invalidDates ? <FieldDescription>结束日期不能早于开始日期。</FieldDescription> : null}
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="board-item-criteria">验收标准</FieldLabel>
        <Textarea id="board-item-criteria" value={value.acceptanceCriteria} onChange={(event) => update("acceptanceCriteria", event.target.value)} rows={3} placeholder="每行一项" />
      </Field>
    </FieldGroup>
  )
}

export function CreateWorkItemDialog({ open, projectId, onOpenChange, onCreate }: {
  open: boolean
  projectId: MockSessionProjectId
  onOpenChange: (open: boolean) => void
  onCreate: (draft: ProjectWorkItemDraft) => void
}) {
  const [valid, setValid] = useState(false)
  const [draft, setDraft] = useState<ProjectWorkItemDraft>(() => toDraft(initialValue()))
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>创建项目任务</DialogTitle><DialogDescription>保存到 {projectId} 的前端 Mock 看板，不会写入本地文件。</DialogDescription></DialogHeader>
        <WorkItemForm key={`${projectId}-${open}`} onChangeValidity={setValid} onDraftChange={setDraft} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!valid} onClick={() => onCreate(draft)}><SaveIcon data-icon="inline-start" />创建任务</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WorkItemDetailContent({ item, events, onSave, onComplete, onReopen, onVoid, onRestore }: {
  item: ProjectWorkItem
  events: ProjectWorkItemEvent[]
  onSave: (draft: ProjectWorkItemDraft) => void
  onComplete: () => void
  onReopen: () => void
  onVoid: () => void
  onRestore: () => void
}) {
  const [valid, setValid] = useState(true)
  const [draft, setDraft] = useState<ProjectWorkItemDraft>(() => toDraft(initialValue(item)))
  const itemEvents = useMemo(() => events.filter((event) => event.workItemId === item.id).slice(0, 6), [events, item.id])
  const isReadOnly = item.lifecycle === "voided" || item.status === "completed"
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-4 flex flex-wrap items-center gap-2"><Badge variant="outline">{item.number}</Badge><Badge variant={item.lifecycle === "voided" ? "destructive" : "secondary"}>{item.lifecycle === "voided" ? "已作废" : projectWorkItemStatusLabels[item.status]}</Badge></div>
        {!isReadOnly ? <WorkItemForm item={item} onChangeValidity={setValid} onDraftChange={setDraft} /> : (
          <div className="divide-y rounded-lg border text-sm">
            <div className="px-3 py-3">
              <p className="font-medium">{item.lifecycle === "voided" ? "该任务已作废" : "该任务已由人类验收完成"}</p>
              <p className="mt-1 text-muted-foreground">{item.lifecycle === "voided" ? `原因：${item.voidReason ?? "未记录"}` : item.description || "暂无说明"}</p>
            </div>
            <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 px-3 py-3">
              <dt className="text-muted-foreground">优先级</dt><dd>{projectWorkItemPriorityLabels[item.priority]}</dd>
              <dt className="text-muted-foreground">计划日期</dt><dd>{item.plannedStart || item.plannedEnd ? `${item.plannedStart ?? "未定"} — ${item.plannedEnd ?? "未定"}` : "未排期"}</dd>
              <dt className="text-muted-foreground">标签</dt><dd>{item.tags.join("、") || "无"}</dd>
              <dt className="text-muted-foreground">验收标准</dt><dd>{item.acceptanceCriteria.join("；") || "未填写"}</dd>
            </dl>
          </div>
        )}
        <Separator className="my-5" />
        <section aria-labelledby="board-audit-title">
          <h3 id="board-audit-title" className="text-sm font-medium">变更记录</h3>
          <div className="mt-2 divide-y rounded-lg border">
            {itemEvents.length ? itemEvents.map((audit) => (
              <div key={audit.id} className="flex items-start justify-between gap-3 px-3 py-2 text-xs">
                <div><p>{audit.summary}</p><p className="text-muted-foreground">{actorLabel(audit.actor)}</p></div>
                <time className="shrink-0 text-muted-foreground">{formatDistanceToNow(parseISO(audit.createdAt), { locale: zhCN, addSuffix: true })}</time>
              </div>
            )) : <p className="px-3 py-4 text-xs text-muted-foreground">暂无变更记录。</p>}
          </div>
        </section>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t p-4">
        {item.lifecycle === "voided" ? <Button variant="outline" onClick={onRestore}><RotateCcwIcon data-icon="inline-start" />恢复任务</Button> : <>
          <Button variant="outline" onClick={onVoid}><BanIcon data-icon="inline-start" />作废</Button>
          {item.status === "review" ? <Button variant="outline" onClick={onComplete}><CheckCircle2Icon data-icon="inline-start" />验收并完成</Button> : null}
          {item.status === "completed" ? <Button variant="outline" onClick={onReopen}><RotateCcwIcon data-icon="inline-start" />重新打开</Button> : null}
          {item.status !== "completed" ? <Button disabled={!valid} onClick={() => onSave(draft)}><SaveIcon data-icon="inline-start" />保存 Mock</Button> : null}
        </>}
      </div>
    </>
  )
}

export function WorkItemDetailOverlay({ surface, item, events, onClose, onSave, onComplete, onReopen, onVoid, onRestore }: {
  surface: "main" | "right"
  item: ProjectWorkItem | null
  events: ProjectWorkItemEvent[]
  onClose: () => void
  onSave: (draft: ProjectWorkItemDraft) => void
  onComplete: () => void
  onReopen: () => void
  onVoid: () => void
  onRestore: () => void
}) {
  if (surface === "main") {
    return <Sheet open={Boolean(item)} onOpenChange={(open) => { if (!open) onClose() }}><SheetContent side="right" className="w-[520px] max-w-[92vw] sm:max-w-[520px]">{item ? <><SheetHeader><SheetTitle>{item.title}</SheetTitle><SheetDescription>项目任务详情与前端 Mock 审计记录。</SheetDescription></SheetHeader><WorkItemDetailContent item={item} events={events} onSave={onSave} onComplete={onComplete} onReopen={onReopen} onVoid={onVoid} onRestore={onRestore} /><SheetFooter className="sr-only" /></> : null}</SheetContent></Sheet>
  }
  return <Dialog open={Boolean(item)} onOpenChange={(open) => { if (!open) onClose() }}><DialogContent className="flex max-h-[min(760px,calc(100vh-2rem))] flex-col p-0 sm:max-w-xl">{item ? <><DialogHeader className="p-4 pb-0"><DialogTitle>{item.title}</DialogTitle><DialogDescription>右侧看板任务详情。</DialogDescription></DialogHeader><WorkItemDetailContent item={item} events={events} onSave={onSave} onComplete={onComplete} onReopen={onReopen} onVoid={onVoid} onRestore={onRestore} /></> : null}</DialogContent></Dialog>
}

export function CompleteWorkItemDialog({ item, onOpenChange, onConfirm }: { item: ProjectWorkItem | null; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return <AlertDialog open={Boolean(item)} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><CheckCircle2Icon /></AlertDialogMedia><AlertDialogTitle>验收并完成任务？</AlertDialogTitle><AlertDialogDescription>“{item?.title}”完成后，只有人类可以重新打开。该操作仅更新前端 Mock。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>继续验收</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>确认完成</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}

export function VoidWorkItemDialog({ item, onOpenChange, onConfirm }: { item: ProjectWorkItem | null; onOpenChange: (open: boolean) => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("")
  useEffect(() => { if (item) setReason("") }, [item])
  return <AlertDialog open={Boolean(item)} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><BanIcon /></AlertDialogMedia><AlertDialogTitle>作废任务？</AlertDialogTitle><AlertDialogDescription>作废后默认从看板和甘特图隐藏，可以由人类恢复。</AlertDialogDescription></AlertDialogHeader><Field data-invalid={!reason.trim()}><FieldLabel htmlFor="void-work-item-reason">作废原因</FieldLabel><Textarea id="void-work-item-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={!reason.trim()} /></Field><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={!reason.trim()} onClick={() => onConfirm(reason)}>确认作废</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}
