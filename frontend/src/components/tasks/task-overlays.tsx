import { useState } from "react"
import {
  BellIcon,
  BotIcon,
  CheckIcon,
  CircleAlertIcon,
  FileTextIcon,
  HistoryIcon,
  ShieldAlertIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { taskResultLabels, taskTriggerLabels, type MockTask, type TaskTrigger } from "@/data/mock-task-center"
import { useTaskStore } from "@/store/task-store"

const executionChoices: Array<[TaskTrigger, typeof FileTextIcon, string, string]> = [
  ["prompt", FileTextIcon, "Prompt", "按计划发送固定任务说明。"],
  ["conversation", HistoryIcon, "继续会话", "从指定会话的已有上下文继续。"],
  ["agent", BotIcon, "智能体", "调用已经配置的本地智能体。"],
  ["workflow", WorkflowIcon, "工作流", "触发已安装的工作流入口。"],
]

export function TaskOverlays() {
  const dialog = useTaskStore((state) => state.dialog)
  const dialogId = useTaskStore((state) => state.dialogId)
  const setDialog = useTaskStore((state) => state.setDialog)
  const tasks = useTaskStore((state) => state.tasks)
  const runs = useTaskStore((state) => state.runs)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const selectedRunId = useTaskStore((state) => state.selectedRunId)
  const detailsOpen = useTaskStore((state) => state.detailsOpen)
  const runDetailsOpen = useTaskStore((state) => state.runDetailsOpen)
  const setDetailsOpen = useTaskStore((state) => state.setDetailsOpen)
  const setRunDetailsOpen = useTaskStore((state) => state.setRunDetailsOpen)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const selectedTask = tasks.find((task) => task.id === selectedTaskId)
  const deleteTarget = tasks.find((task) => task.id === dialogId)
  const selectedRun = runs.find((run) => run.id === selectedRunId)

  return <>
    <CreateTaskDialog open={dialog === "create"} onOpenChange={(open) => !open && setDialog(null)} />
    <AlertDialog open={dialog === "delete"} onOpenChange={(open) => !open && setDialog(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Trash2Icon /></AlertDialogMedia>
          <AlertDialogTitle>删除“{deleteTarget?.name ?? "该任务"}”？</AlertDialogTitle>
          <AlertDialogDescription>任务与本地 Mock 计划会从当前列表移除；历史运行记录仍保留。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => dialogId && deleteTask(dialogId)}>删除任务</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <TaskDetails task={selectedTask} open={detailsOpen} onOpenChange={setDetailsOpen} />
    <RunDetails run={selectedRun} open={runDetailsOpen} onOpenChange={setRunDetailsOpen} />
  </>
}

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const step = useTaskStore((state) => state.wizardStep)
  const setStep = useTaskStore((state) => state.setWizardStep)
  const executionType = useTaskStore((state) => state.executionType)
  const setExecutionType = useTaskStore((state) => state.setExecutionType)
  const scheduleMode = useTaskStore((state) => state.scheduleMode)
  const setScheduleMode = useTaskStore((state) => state.setScheduleMode)
  const approval = useTaskStore((state) => state.approval)
  const setApproval = useTaskStore((state) => state.setApproval)
  const addTask = useTaskStore((state) => state.addMockTask)
  const [name, setName] = useState("每日上午整理")
  const [description, setDescription] = useState("整理当前项目的待处理事项并生成只读摘要。")
  const [bypassOpen, setBypassOpen] = useState(false)
  const [notifyFailure, setNotifyFailure] = useState(true)
  const [notifyApproval, setNotifyApproval] = useState(true)
  const steps = ["基本信息", "执行内容", "运行计划", "运行策略", "通知确认"]

  function createTask() {
    const task: MockTask = {
      id: `task-mock-${Date.now()}`,
      name: name.trim() || "未命名任务",
      description: description.trim() || "暂无说明",
      project: "任务",
      trigger: executionType,
      target: taskTriggerLabels[executionType],
      schedule: scheduleMode === "cron" ? "Cron：0 9 * * 1-5" : "工作日 09:00",
      cron: "0 9 * * 1-5",
      timezone: "Asia/Shanghai（UTC+08:00）",
      nextRun: "2026-08-03 09:00",
      nextRunRelative: "3 天后",
      lastResult: "queued",
      enabled: true,
      approval,
      risk: approval === "bypass",
      notifications: [notifyFailure ? "失败" : "", notifyApproval ? "等待审批" : ""].filter(Boolean),
      nextRuns: ["8 月 3 日 09:00", "8 月 4 日 09:00", "8 月 5 日 09:00", "8 月 6 日 09:00", "8 月 7 日 09:00"],
    }
    addTask(task)
    toast.success("Mock 任务已添加到任务中心")
  }

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建计划任务</DialogTitle>
          <DialogDescription>第 {step} 步，共 5 步 · 当前仅保存到前端 Mock 状态。</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-1" aria-label="创建任务进度">
          {steps.map((label, index) => <button key={label} type="button" className="flex min-w-0 flex-col gap-1 text-left" onClick={() => setStep(index + 1)}><span className={`h-1 rounded-full ${index + 1 <= step ? "bg-primary" : "bg-muted"}`} /><span className="truncate text-xs text-muted-foreground">{label}</span></button>)}
        </div>
        {step === 1 ? <FieldGroup><Field><FieldLabel htmlFor="task-name">名称</FieldLabel><Input id="task-name" value={name} onChange={(event) => setName(event.target.value)} /></Field><Field><FieldLabel htmlFor="task-description">说明</FieldLabel><Textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} /></Field><Field><FieldLabel htmlFor="task-project">项目</FieldLabel><Select defaultValue="tasks"><SelectTrigger id="task-project"><SelectValue>任务</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="tasks">任务</SelectItem><SelectItem value="aestival">Aestival</SelectItem></SelectGroup></SelectContent></Select><FieldDescription>项目仅用于组织任务，不改变运行权限。</FieldDescription></Field></FieldGroup> : null}
        {step === 2 ? <FieldSet><FieldLegend>执行内容</FieldLegend><RadioGroup value={executionType} onValueChange={(value) => setExecutionType(value as TaskTrigger)}>{executionChoices.map(([value, Icon, title, description]) => <FieldLabel key={value}><Field orientation="horizontal"><RadioGroupItem value={value} /><Icon className="size-4" /><FieldGroup className="gap-0"><span className="font-medium">{title}</span><FieldDescription>{description}</FieldDescription></FieldGroup></Field></FieldLabel>)}</RadioGroup></FieldSet> : null}
        {step === 3 ? <FieldGroup><Field><FieldLabel>计划模式</FieldLabel><RadioGroup className="grid-cols-2" value={scheduleMode} onValueChange={(value) => setScheduleMode(value as "simple" | "cron")}><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="simple" /><span>简单计划</span></Field></FieldLabel><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="cron" /><span>Cron</span></Field></FieldLabel></RadioGroup></Field>{scheduleMode === "simple" ? <div className="grid gap-3 sm:grid-cols-2"><Field><FieldLabel>频率</FieldLabel><Select defaultValue="workdays"><SelectTrigger><SelectValue>每个工作日</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="daily">每天</SelectItem><SelectItem value="workdays">每个工作日</SelectItem><SelectItem value="weekly">每周</SelectItem></SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="task-time">时间</FieldLabel><Input id="task-time" type="time" defaultValue="09:00" /></Field></div> : <Field><FieldLabel htmlFor="task-cron">Cron 表达式</FieldLabel><Input id="task-cron" className="font-mono" defaultValue="0 9 * * 1-5" /><FieldDescription>分钟 小时 日 月 星期</FieldDescription></Field>}<Field><FieldLabel>时区</FieldLabel><Select defaultValue="shanghai"><SelectTrigger><SelectValue>Asia/Shanghai（UTC+08:00）</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="shanghai">Asia/Shanghai（UTC+08:00）</SelectItem><SelectItem value="local">跟随系统</SelectItem></SelectGroup></SelectContent></Select></Field><div className="rounded-lg border p-3"><div className="text-sm font-medium">接下来五次运行</div><div className="mt-2 grid gap-1 text-xs text-muted-foreground">{[3,4,5,6,7].map((day) => <span key={day}>2026 年 8 月 {day} 日 09:00</span>)}</div></div></FieldGroup> : null}
        {step === 4 ? <FieldGroup><Field><FieldLabel>审批策略</FieldLabel><RadioGroup value={approval === "bypass" ? "bypass" : approval} onValueChange={(value) => value === "bypass" ? setBypassOpen(true) : setApproval(value as "request" | "automatic")}><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="request" /><FieldGroup className="gap-0"><span>按需请求审批</span><FieldDescription>遇到受保护动作时等待桌面确认。</FieldDescription></FieldGroup></Field></FieldLabel><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="automatic" /><FieldGroup className="gap-0"><span>自动采用现有策略</span><FieldDescription>仍受当前审批策略和权限边界约束。</FieldDescription></FieldGroup></Field></FieldLabel><FieldLabel><Field orientation="horizontal" data-invalid={approval === "bypass"}><RadioGroupItem value="bypass" aria-invalid={approval === "bypass"} /><FieldGroup className="gap-0"><span>绕过审批</span><FieldDescription>高风险，仅用于明确授权的本地测试任务。</FieldDescription></FieldGroup></Field></FieldLabel></RadioGroup></Field><Field><FieldLabel htmlFor="miss-policy">错过计划</FieldLabel><Select defaultValue="skip"><SelectTrigger id="miss-policy"><SelectValue>跳过并记录</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="skip">跳过并记录</SelectItem><SelectItem value="next">下次启动时运行一次</SelectItem></SelectGroup></SelectContent></Select></Field></FieldGroup> : null}
        {step === 5 ? <FieldGroup><Field orientation="horizontal"><FieldLabel htmlFor="notify-failure">运行失败</FieldLabel><Switch id="notify-failure" checked={notifyFailure} onCheckedChange={setNotifyFailure} /></Field><Field orientation="horizontal"><FieldLabel htmlFor="notify-approval">等待审批</FieldLabel><Switch id="notify-approval" checked={notifyApproval} onCheckedChange={setNotifyApproval} /></Field><Separator /><div className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex items-center gap-2 font-medium"><CheckIcon className="size-4" />确认计划</div><dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground"><dt>任务</dt><dd className="text-foreground">{name}</dd><dt>执行</dt><dd>{taskTriggerLabels[executionType]}</dd><dt>计划</dt><dd>{scheduleMode === "cron" ? "0 9 * * 1-5" : "工作日 09:00"}</dd><dt>审批</dt><dd>{approval === "request" ? "按需请求" : approval === "automatic" ? "采用现有策略" : "绕过审批（高风险）"}</dd></dl></div></FieldGroup> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => step === 1 ? onOpenChange(false) : setStep(step - 1)}>{step === 1 ? "取消" : "上一步"}</Button>
          <Button onClick={() => step === 5 ? createTask() : setStep(step + 1)}>{step === 5 ? "创建 Mock 任务" : "下一步"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <AlertDialog open={bypassOpen} onOpenChange={setBypassOpen}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogMedia><ShieldAlertIcon /></AlertDialogMedia><AlertDialogTitle>确认绕过审批？</AlertDialogTitle><AlertDialogDescription>该选项会把任务标为高风险。当前实现不会真正执行，但未来接入调度器时必须再次验证权限。</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>保留审批</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { setApproval("bypass"); setBypassOpen(false) }}>确认高风险选项</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
}

function TaskDetails({ task, open, onOpenChange }: { task?: MockTask; open: boolean; onOpenChange: (open: boolean) => void }) {
  const runs = useTaskStore((state) => state.runs).filter((run) => run.taskId === task?.id)
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="sm:max-w-xl"><SheetHeader><SheetTitle>{task?.name ?? "任务详情"}</SheetTitle><SheetDescription>{task?.description ?? "未选择任务"}</SheetDescription></SheetHeader>{task ? <Tabs defaultValue="overview" className="min-h-0 px-4 pb-4"><TabsList className="w-full overflow-x-auto"><TabsTrigger className="min-w-fit" value="overview">概览</TabsTrigger><TabsTrigger className="min-w-fit" value="execution">执行</TabsTrigger><TabsTrigger className="min-w-fit" value="schedule">计划</TabsTrigger><TabsTrigger className="min-w-fit" value="policy">策略</TabsTrigger><TabsTrigger className="min-w-fit" value="notifications">通知</TabsTrigger><TabsTrigger className="min-w-fit" value="runs">记录</TabsTrigger></TabsList><div className="mt-4 min-h-0 overflow-y-auto"><TabsContent value="overview"><DefinitionRows rows={[["状态",task.enabled ? "已启用" : "已暂停"],["项目",task.project],["最近结果",taskResultLabels[task.lastResult]],["下次运行",task.nextRun ?? "—"]]} /></TabsContent><TabsContent value="execution"><DefinitionRows rows={[["类型",taskTriggerLabels[task.trigger]],["目标",task.target],["说明",task.description]]} /></TabsContent><TabsContent value="schedule"><DefinitionRows rows={[["计划",task.schedule],["Cron",task.cron],["时区",task.timezone]]} /><div className="mt-4 rounded-lg border p-3"><div className="text-sm font-medium">接下来五次</div><div className="mt-2 grid gap-1 text-sm text-muted-foreground">{task.nextRuns.map((value) => <span key={value}>{value}</span>)}</div></div></TabsContent><TabsContent value="policy"><DefinitionRows rows={[["审批",task.approval === "request" ? "按需请求" : task.approval === "automatic" ? "采用现有策略" : "绕过审批"],["风险",task.risk ? "高风险" : "常规"]]} />{task.risk ? <div className="mt-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><CircleAlertIcon className="size-4 shrink-0" />绕过审批的任务必须在接入真实调度前重新确认。</div> : null}</TabsContent><TabsContent value="notifications"><div className="grid gap-2">{task.notifications.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border p-3"><BellIcon className="size-4" />{item}</div>)}</div></TabsContent><TabsContent value="runs">{runs.length ? <div className="grid gap-2">{runs.map((run) => <div key={run.id} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-2"><span className="font-medium">{run.startedAt}</span><Badge>{taskResultLabels[run.result]}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{run.summary}</p></div>)}</div> : <p className="text-sm text-muted-foreground">暂无运行记录。</p>}</TabsContent></div></Tabs> : null}</SheetContent></Sheet>
}

function RunDetails({ run, open, onOpenChange }: { run?: ReturnType<typeof useTaskStore.getState>["runs"][number]; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="sm:max-w-xl"><SheetHeader><SheetTitle>{run?.taskName ?? "运行详情"}</SheetTitle><SheetDescription>{run ? `${run.scheduledAt} · ${taskResultLabels[run.result]}` : "未选择运行记录"}</SheetDescription></SheetHeader>{run ? <Tabs defaultValue="summary" className="px-4"><TabsList className="w-full overflow-x-auto"><TabsTrigger className="min-w-fit" value="summary">摘要</TabsTrigger><TabsTrigger className="min-w-fit" value="output">输出</TabsTrigger><TabsTrigger className="min-w-fit" value="tools">工具</TabsTrigger><TabsTrigger className="min-w-fit" value="logs">日志</TabsTrigger><TabsTrigger className="min-w-fit" value="cost">成本</TabsTrigger></TabsList><TabsContent value="summary" className="mt-4"><DefinitionRows rows={[["计划时间",run.scheduledAt],["实际开始",run.startedAt],["持续时间",run.duration],["结果",taskResultLabels[run.result]],["摘要",run.summary]]} /></TabsContent><TabsContent value="output" className="mt-4 text-sm text-muted-foreground">这是脱敏的本地 Mock 输出预览，没有调用模型或读取项目数据。</TabsContent><TabsContent value="tools" className="mt-4"><DefinitionRows rows={[["工具调用",String(run.toolCalls)],["工具状态",run.toolCalls ? "仅展示 Mock 记录" : "未调用"]]} /></TabsContent><TabsContent value="logs" className="mt-4 rounded-lg border bg-muted/20 p-3 font-mono text-xs">[mock] queued<br />[mock] policy checked<br />[mock] {run.result}</TabsContent><TabsContent value="cost" className="mt-4"><DefinitionRows rows={[["模型",run.model],["Token",run.tokens],["费用",run.cost]]} /></TabsContent></Tabs> : null}</SheetContent></Sheet>
}

function DefinitionRows({ rows }: { rows: Array<[string, string]> }) {
  return <dl className="divide-y rounded-lg border">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 px-3 py-2.5"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
}
