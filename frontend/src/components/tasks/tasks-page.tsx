import { useEffect, useMemo, useState } from "react"
import {
  BotIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  Clock3Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  GaugeIcon,
  ListRestartIcon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ShieldQuestionIcon,
  SkipForwardIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react"
import { toast } from "sonner"

import { TaskOverlays } from "@/components/tasks/task-overlays"
import {
  ManagementEmpty,
  ManagementListFrame,
  ManagementMetricBand,
  ManagementPageHeader,
  ManagementToolbar,
} from "@/components/shared/management-page"
import { ManagementSearch } from "@/components/shared/management-search"
import { DropdownMenuIconTrigger } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  taskResultLabels,
  taskTriggerLabels,
  type MockTask,
  type MockTaskRun,
  type TaskCenterTab,
  type TaskResult,
} from "@/data/mock-task-center"
import { useTaskStore } from "@/store/task-store"
import { useWorkspaceStore } from "@/store/workspace-store"

const triggerIcons = { prompt: FileTextIcon, conversation: ListRestartIcon, agent: BotIcon, workflow: WorkflowIcon }
const resultIcons: Record<TaskResult, typeof CheckCircle2Icon> = { success: CheckCircle2Icon, failed: CircleAlertIcon, skipped: SkipForwardIcon, approval: ShieldQuestionIcon, limited: GaugeIcon, running: PlayIcon, queued: Clock3Icon }
const taskTabDescriptions: Record<TaskCenterTab, string> = {
  tasks: "安排本地任务并处理审批、失败与受限状态。当前调度与立即运行均为前端 Mock。",
  calendar: "以系统时区 Asia/Shanghai（UTC+08:00）预览计划运行点。",
  runs: "查看计划时间、实际开始、资源消耗与脱敏运行结果。",
}

function resultVariant(result: TaskResult): "default" | "secondary" | "destructive" | "outline" {
  if (result === "failed") return "destructive"
  if (result === "success" || result === "running") return "default"
  return result === "approval" || result === "limited" ? "secondary" : "outline"
}

export function TasksPage() {
  const scheduledTasks = useWorkspaceStore((state) => state.scheduledTasks)
  const hydrateSessionTasks = useTaskStore((state) => state.hydrateSessionTasks)
  const tasks = useTaskStore((state) => state.tasks)
  const runs = useTaskStore((state) => state.runs)
  const activeTab = useTaskStore((state) => state.activeTab)
  const setActiveTab = useTaskStore((state) => state.setActiveTab)
  useEffect(() => hydrateSessionTasks(scheduledTasks), [hydrateSessionTasks, scheduledTasks])

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ManagementPageHeader
        tabs={
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TaskCenterTab)}>
            <TabsList className="max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="tasks"><Clock3Icon />任务</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDaysIcon />日历</TabsTrigger>
            <TabsTrigger value="runs"><ListRestartIcon />运行记录</TabsTrigger>
            </TabsList>
          </Tabs>
        }
        description={taskTabDescriptions[activeTab]}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex w-full flex-col gap-4">
          {activeTab === "tasks" ? <TaskList tasks={tasks} /> : activeTab === "calendar" ? <TaskCalendar tasks={tasks} /> : <RunList runs={runs} />}
        </div>
      </div>
      <TaskOverlays />
    </section>
  )
}

function TaskList({ tasks }: { tasks: MockTask[] }) {
  const search = useTaskStore((state) => state.search)
  const setSearch = useTaskStore((state) => state.setSearch)
  const status = useTaskStore((state) => state.statusFilter)
  const setStatus = useTaskStore((state) => state.setStatusFilter)
  const trigger = useTaskStore((state) => state.triggerFilter)
  const setTrigger = useTaskStore((state) => state.setTriggerFilter)
  const result = useTaskStore((state) => state.resultFilter)
  const setResult = useTaskStore((state) => state.setResultFilter)
  const filtered = useMemo(() => tasks.filter((task) => {
    const query = search.trim().toLowerCase()
    return (!query || [task.name, task.description, task.project, task.target, task.schedule].join(" ").toLowerCase().includes(query))
      && (status === "all" || (status === "enabled" ? task.enabled : !task.enabled))
      && (trigger === "all" || task.trigger === trigger)
      && (result === "all" || task.lastResult === result)
  }), [result, search, status, tasks, trigger])
  const enabled = tasks.filter((task) => task.enabled).length
  const approvals = tasks.filter((task) => task.lastResult === "approval").length
  const failures = tasks.filter((task) => task.lastResult === "failed").length
  return <>
    <ManagementMetricBand items={[{ label: "已启用", value: enabled }, { label: "今日将运行", value: 2 }, { label: "等待审批", value: approvals }, { label: "最近失败", value: failures }]} />
    <ManagementToolbar><ManagementSearch value={search} onValueChange={setSearch} placeholder="搜索任务…" label="搜索任务" /><FilterSelect label="任务状态" value={status} onChange={(value) => setStatus(value as typeof status)} items={[["all","全部状态"],["enabled","已启用"],["paused","已暂停"]]} /><FilterSelect label="执行内容" value={trigger} onChange={(value) => setTrigger(value as typeof trigger)} items={[["all","全部类型"],...Object.entries(taskTriggerLabels)]} /><FilterSelect label="最近结果" value={result} onChange={(value) => setResult(value as typeof result)} items={[["all","全部结果"],...Object.entries(taskResultLabels)]} /><Button onClick={() => useTaskStore.getState().setDialog("create")}><PlusIcon data-icon="inline-start" />创建任务</Button></ManagementToolbar>
    {filtered.length ? <><ManagementListFrame className="hidden lg:block"><TaskTable tasks={filtered} /></ManagementListFrame><div className="lg:hidden"><TaskItems tasks={filtered} /></div></> : <ManagementEmpty><EmptyHeader><EmptyMedia variant="icon"><Clock3Icon /></EmptyMedia><EmptyTitle>没有匹配任务</EmptyTitle><EmptyDescription>调整搜索词或筛选条件后重试。</EmptyDescription></EmptyHeader></ManagementEmpty>}
  </>
}

function FilterSelect({ label, value, onChange, items }: { label: string; value: string; onChange: (value: string) => void; items: Array<[string,string]> }) {
  const current = items.find(([id]) => id === value)?.[1] ?? label
  return <Select value={value} onValueChange={(next) => onChange(next as string)}><SelectTrigger aria-label={label}><SelectValue>{current}</SelectValue></SelectTrigger><SelectContent><SelectGroup>{items.map(([id,text]) => <SelectItem key={id} value={id}>{text}</SelectItem>)}</SelectGroup></SelectContent></Select>
}

function TaskTable({ tasks }: { tasks: MockTask[] }) {
  return <Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>执行内容</TableHead><TableHead>计划</TableHead><TableHead>下次运行</TableHead><TableHead>最近结果</TableHead><TableHead>状态</TableHead><TableHead className="w-24 text-right">动作</TableHead></TableRow></TableHeader><TableBody>{tasks.map((task) => <TaskTableRow key={task.id} task={task} />)}</TableBody></Table>
}

function TaskTableRow({ task }: { task: MockTask }) {
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const Icon = triggerIcons[task.trigger]
  const ResultIcon = resultIcons[task.lastResult]
  return <ContextMenu><ContextMenuTrigger render={<TableRow tabIndex={0} onDoubleClick={() => useTaskStore.getState().openTaskDetails(task.id)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); useTaskStore.getState().openTaskDetails(task.id) } }} />}><TableCell><div className="flex items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></span><div className="min-w-36"><div className="flex items-center gap-1.5 font-medium">{task.name}{task.risk ? <Badge variant="destructive">高风险</Badge> : null}</div><div className="max-w-56 truncate text-xs text-muted-foreground">{task.description}</div></div></div></TableCell><TableCell><div>{taskTriggerLabels[task.trigger]}</div><div className="text-xs text-muted-foreground">{task.target}</div></TableCell><TableCell><div>{task.schedule}</div><div className="font-mono text-xs text-muted-foreground">{task.cron}</div></TableCell><TableCell>{task.nextRun ? <><div>{task.nextRun}</div><div className="text-xs text-muted-foreground">{task.nextRunRelative}</div></> : <span className="text-muted-foreground">已暂停</span>}</TableCell><TableCell><Badge variant={resultVariant(task.lastResult)}><ResultIcon />{taskResultLabels[task.lastResult]}</Badge></TableCell><TableCell><Switch checked={task.enabled} onCheckedChange={() => toggleTask(task.id)} aria-label={`${task.enabled ? "暂停" : "启用"}${task.name}`} /></TableCell><TableCell><div className="flex justify-end gap-1"><Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`立即运行${task.name}`} onClick={() => toast.info("已加入前端 Mock 队列，未调用调度器")} />}><PlayIcon /></TooltipTrigger><TooltipContent>立即运行</TooltipContent></Tooltip><TaskMenu task={task} /></div></TableCell></ContextMenuTrigger><TaskContextMenu task={task} /></ContextMenu>
}

function TaskItems({ tasks }: { tasks: MockTask[] }) {
  return <ManagementListFrame><ItemGroup className="gap-0">{tasks.map((task,index) => <TaskItem key={task.id} task={task} separated={index>0} />)}</ItemGroup></ManagementListFrame>
}

function TaskItem({ task, separated }: { task: MockTask; separated: boolean }) {
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const Icon = triggerIcons[task.trigger]
  const ResultIcon = resultIcons[task.lastResult]
  return <ContextMenu><ContextMenuTrigger className="block">{separated ? <Separator /> : null}<Item className="rounded-none"><ItemMedia variant="icon" className="size-9 rounded-lg bg-muted"><Icon /></ItemMedia><ItemContent><ItemTitle>{task.name}{task.risk ? <Badge variant="destructive">高风险</Badge> : null}</ItemTitle><ItemDescription>{task.schedule} · {task.target}</ItemDescription><div className="flex flex-wrap gap-1"><Badge variant={resultVariant(task.lastResult)}><ResultIcon />{taskResultLabels[task.lastResult]}</Badge>{task.nextRunRelative ? <Badge variant="outline">{task.nextRunRelative}</Badge> : null}</div></ItemContent><ItemActions><Switch checked={task.enabled} onCheckedChange={() => toggleTask(task.id)} aria-label={`${task.enabled ? "暂停" : "启用"}${task.name}`} /><TaskMenu task={task} /></ItemActions></Item></ContextMenuTrigger><TaskContextMenu task={task} /></ContextMenu>
}

function TaskMenu({ task }: { task: MockTask }) {
  const openDetails = useTaskStore((state) => state.openTaskDetails)
  const duplicate = useTaskStore((state) => state.duplicateTask)
  const toggle = useTaskStore((state) => state.toggleTask)
  const setDialog = useTaskStore((state) => state.setDialog)
  return <DropdownMenu><DropdownMenuIconTrigger label={`${task.name}更多操作`}><MoreHorizontalIcon /></DropdownMenuIconTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => openDetails(task.id)}><EyeIcon />查看详情</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("已加入前端 Mock 队列，未调用调度器")}><PlayIcon />立即运行</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("编辑沿用创建向导，当前未写入持久化") }><PencilIcon />编辑</DropdownMenuItem><DropdownMenuItem onClick={() => duplicate(task.id)}><CopyIcon />复制一份</DropdownMenuItem><DropdownMenuItem onClick={() => toggle(task.id)}>{task.enabled ? <PauseCircleIcon /> : <PlayIcon />}{task.enabled ? "暂停" : "启用"}</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem onClick={() => toast.info("已生成脱敏 Mock 预览") }><DownloadIcon />导出</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDialog("delete",task.id)}><Trash2Icon />删除</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
}

function TaskContextMenu({ task }: { task: MockTask }) {
  const openDetails = useTaskStore((state) => state.openTaskDetails)
  const duplicate = useTaskStore((state) => state.duplicateTask)
  const toggle = useTaskStore((state) => state.toggleTask)
  const setDialog = useTaskStore((state) => state.setDialog)
  return <ContextMenuContent><ContextMenuGroup><ContextMenuItem onClick={() => toast.info("已加入前端 Mock 队列，未调用调度器")}><PlayIcon />立即运行</ContextMenuItem><ContextMenuItem onClick={() => openDetails(task.id)}><EyeIcon />查看详情</ContextMenuItem><ContextMenuItem onClick={() => toast.info("编辑草稿未持久化") }><PencilIcon />编辑</ContextMenuItem><ContextMenuItem onClick={() => duplicate(task.id)}><CopyIcon />复制一份</ContextMenuItem><ContextMenuItem onClick={() => toggle(task.id)}>{task.enabled ? <PauseCircleIcon /> : <PlayIcon />}{task.enabled ? "暂停" : "启用"}</ContextMenuItem></ContextMenuGroup><ContextMenuSeparator /><ContextMenuGroup><ContextMenuItem onClick={() => toast.info("运行记录已切换到任务筛选") }><ListRestartIcon />查看运行记录</ContextMenuItem><ContextMenuItem onClick={() => toast.info("已生成脱敏 Mock 预览") }><DownloadIcon />导出</ContextMenuItem><ContextMenuItem variant="destructive" onClick={() => setDialog("delete",task.id)}><Trash2Icon />删除</ContextMenuItem></ContextMenuGroup></ContextMenuContent>
}

function TaskCalendar({ tasks }: { tasks: MockTask[] }) {
  const view = useTaskStore((state) => state.calendarView)
  const setView = useTaskStore((state) => state.setCalendarView)
  const [date,setDate] = useState<Date | undefined>(new Date(2026,6,31))
  const active = tasks.filter((task) => task.enabled)
  return <><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">拖拽改期尚未接入；编辑前会要求确认并同步计划表达式。</p><ToggleGroup value={[view]} onValueChange={(values) => values[0] && setView(values[0] as typeof view)} variant="outline" size="default" spacing={0}><ToggleGroupItem value="month">月</ToggleGroupItem><ToggleGroupItem value="week">周</ToggleGroupItem><ToggleGroupItem value="day">日</ToggleGroupItem></ToggleGroup></div><div className="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)]"><Calendar mode="single" selected={date} onSelect={setDate} timeZone="Asia/Shanghai" captionLayout="dropdown" className="w-full rounded-lg border [--cell-size:--spacing(10)] sm:w-fit" /><div className="min-w-0 rounded-lg border"><div className="border-b px-3 py-2 text-sm font-medium">{date ? new Intl.DateTimeFormat("zh-CN",{dateStyle:"long"}).format(date) : "选择日期"}的计划</div><ItemGroup className="gap-0">{active.map((task,index) => <HoverCard key={task.id}><HoverCardTrigger render={<button type="button" className="w-full text-left" onDoubleClick={() => toast.info("已打开编辑 Mock") } />}>{index ? <Separator /> : null}<Item className="rounded-none"><ItemMedia variant="icon"><Clock3Icon /></ItemMedia><ItemContent><ItemTitle>{task.name}</ItemTitle><ItemDescription>{task.schedule} · {task.target}</ItemDescription></ItemContent><Badge variant="outline">{task.nextRunRelative}</Badge></Item></HoverCardTrigger><HoverCardContent><div className="flex flex-col gap-2"><div className="font-medium">{task.name}</div><p className="text-sm text-muted-foreground">{task.description}</p><div className="text-xs">{task.timezone}</div><Button size="xs" variant="outline" onClick={() => toast.info("已打开编辑 Mock")}>编辑任务</Button></div></HoverCardContent></HoverCard>)}</ItemGroup></div></div></>
}

function RunList({ runs }: { runs: MockTaskRun[] }) {
  const openRunDetails = useTaskStore((state) => state.openRunDetails)
  return <><div className="flex flex-wrap items-end justify-between gap-3"><p className="text-xs text-muted-foreground">Token 与费用为 Mock 估算，不代表真实计费。</p><div className="flex gap-2"><FilterSelect label="运行结果" value="all" onChange={() => undefined} items={[["all","全部结果"],...Object.entries(taskResultLabels)]} /><Button variant="outline" onClick={() => toast.info("已生成脱敏 Mock 预览") }><DownloadIcon data-icon="inline-start" />导出</Button></div></div><ManagementListFrame><Table><TableHeader><TableRow><TableHead>任务</TableHead><TableHead>计划 / 开始</TableHead><TableHead>持续时间</TableHead><TableHead>模型</TableHead><TableHead>Token / 费用</TableHead><TableHead>工具</TableHead><TableHead>结果</TableHead><TableHead className="text-right">详情</TableHead></TableRow></TableHeader><TableBody>{runs.map((run) => { const Icon=resultIcons[run.result]; return <TableRow key={run.id}><TableCell><div className="font-medium">{run.taskName}</div><div className="max-w-56 truncate text-xs text-muted-foreground">{run.summary}</div></TableCell><TableCell><div>{run.scheduledAt}</div><div className="text-xs text-muted-foreground">{run.startedAt}</div></TableCell><TableCell>{run.duration}</TableCell><TableCell>{run.model}</TableCell><TableCell><div>{run.tokens}</div><div className="text-xs text-muted-foreground">{run.cost}</div></TableCell><TableCell>{run.toolCalls}</TableCell><TableCell><Badge variant={resultVariant(run.result)}>{run.result === "running" ? <Spinner /> : <Icon />}{taskResultLabels[run.result]}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon-sm" aria-label={`查看${run.taskName}运行详情`} onClick={() => openRunDetails(run.id)}><EyeIcon /></Button></TableCell></TableRow>})}</TableBody></Table></ManagementListFrame></>
}
