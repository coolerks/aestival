import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  mockSessionProjects,
  type MockApprovalMode,
  type MockScheduledTaskInput,
  type MockScheduleMode,
  type MockSessionProjectId,
  type MockSessionRecord,
} from "@/data/mock-session-management"

type ScheduledTaskDialogProps = {
  open: boolean
  session: MockSessionRecord
  onOpenChange: (open: boolean) => void
  onCreate: (input: MockScheduledTaskInput) => void
}

const steps = [
  "基本信息",
  "执行内容",
  "触发时间",
  "运行策略",
  "通知与确认",
] as const

const notificationOptions = [
  ["started", "开始时"],
  ["succeeded", "成功时"],
  ["failed", "失败时"],
  ["approval", "等待审批时"],
  ["guardrail", "超过费用或时长阈值时"],
] as const

function chooseSingle<T extends string>(
  values: readonly string[],
  setter: (value: T) => void
) {
  const value = values[0] as T | undefined
  if (value) {
    setter(value)
  }
}

export function ScheduledTaskDialog({
  open,
  session,
  onOpenChange,
  onCreate,
}: ScheduledTaskDialogProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState(`继续：${session.title}`)
  const [description, setDescription] = useState(
    "按计划继续当前会话，并在任务中心等待需要的审批。"
  )
  const [projectId, setProjectId] =
    useState<MockSessionProjectId>(session.projectId)
  const [enabled, setEnabled] = useState(true)
  const [scheduleMode, setScheduleMode] =
    useState<MockScheduleMode>("simple")
  const [simpleSchedule, setSimpleSchedule] = useState("每天 09:00")
  const [cron, setCron] = useState("0 9 * * 1-5")
  const [maxDuration, setMaxDuration] = useState("30 分钟")
  const [retries, setRetries] = useState("2 次")
  const [overlapPolicy, setOverlapPolicy] = useState("跳过")
  const [missedRunPolicy, setMissedRunPolicy] = useState("下次启动补跑")
  const [autoCompact, setAutoCompact] = useState(true)
  const [tokenGuardrail, setTokenGuardrail] = useState("32000")
  const [approvalMode, setApprovalMode] =
    useState<MockApprovalMode>("request")
  const [notifications, setNotifications] = useState<string[]>([
    "failed",
    "approval",
    "guardrail",
  ])
  const nameInvalid = name.trim().length === 0
  const cronInvalid = scheduleMode === "cron" && cron.trim().length === 0

  useEffect(() => {
    if (!open) {
      return
    }
    setStep(1)
    setName(`继续：${session.title}`)
    setDescription("按计划继续当前会话，并在任务中心等待需要的审批。")
    setProjectId(session.projectId)
    setEnabled(true)
    setScheduleMode("simple")
    setSimpleSchedule("每天 09:00")
    setCron("0 9 * * 1-5")
    setMaxDuration("30 分钟")
    setRetries("2 次")
    setOverlapPolicy("跳过")
    setMissedRunPolicy("下次启动补跑")
    setAutoCompact(true)
    setTokenGuardrail("32000")
    setApprovalMode("request")
    setNotifications(["failed", "approval", "guardrail"])
  }, [open, session.projectId, session.title])

  const projectLabel = useMemo(
    () =>
      mockSessionProjects.find((project) => project.id === projectId)?.label ??
      "任务",
    [projectId]
  )
  const scheduleSummary =
    scheduleMode === "cron" ? `Cron：${cron}` : simpleSchedule
  const canContinue =
    (step !== 1 || !nameInvalid) && (step !== 3 || !cronInvalid)

  const createTask = () => {
    if (nameInvalid || cronInvalid) {
      return
    }
    onCreate({
      sessionId: session.id,
      name: name.trim(),
      description: description.trim(),
      projectId,
      enabled,
      scheduleMode,
      simpleSchedule,
      cron,
      timezone: "Asia/Shanghai（UTC+08:00）",
      maxDuration,
      retries,
      overlapPolicy,
      missedRunPolicy,
      autoCompact,
      tokenGuardrail,
      approvalMode,
      notifications,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>创建定时任务</DialogTitle>
            <Badge variant="secondary">前端 Mock</Badge>
          </div>
          <DialogDescription>
            从“{session.title}”创建继续会话任务；不会注册真实调度器。
          </DialogDescription>
        </DialogHeader>

        <Progress value={step * 20}>
          <ProgressLabel>
            第 {step} 步 · {steps[step - 1]}
          </ProgressLabel>
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">
            {step}/5
          </span>
        </Progress>

        {step === 1 ? (
          <FieldGroup>
            <Field data-invalid={nameInvalid}>
              <FieldLabel htmlFor="scheduled-task-name">名称</FieldLabel>
              <Input
                id="scheduled-task-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={nameInvalid}
                autoFocus
              />
              {nameInvalid ? <FieldError>请输入任务名称。</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="scheduled-task-description">
                说明
              </FieldLabel>
              <Textarea
                id="scheduled-task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="scheduled-task-project">
                所属项目
              </FieldLabel>
              <Select
                value={projectId}
                onValueChange={(value) => {
                  if (value) {
                    setProjectId(value as MockSessionProjectId)
                  }
                }}
              >
                <SelectTrigger id="scheduled-task-project" className="w-full">
                  <SelectValue>
                    {(value) =>
                      mockSessionProjects.find(
                        (project) => project.id === value
                      )?.label ?? "选择项目"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {mockSessionProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="scheduled-task-enabled">
                  创建后启用
                </FieldLabel>
                <FieldDescription>
                  当前只记录 Mock 状态，不会真正触发运行。
                </FieldDescription>
              </FieldContent>
              <Switch
                id="scheduled-task-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </Field>
          </FieldGroup>
        ) : null}

        {step === 2 ? (
          <FieldGroup>
            <Alert>
              <MessageSquareIcon aria-hidden="true" />
              <AlertTitle>继续指定会话</AlertTitle>
              <AlertDescription>
                每次运行从“{session.title}”的最新上下文继续，不复制为新会话。
              </AlertDescription>
            </Alert>
            <FieldSet>
              <FieldLegend variant="label">会话上下文</FieldLegend>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>允许自动压缩</FieldTitle>
                  <FieldDescription>
                    上下文接近限制时生成压缩摘要，真实策略待后端方案确定。
                  </FieldDescription>
                </FieldContent>
                <Switch
                  checked={autoCompact}
                  onCheckedChange={setAutoCompact}
                  aria-label="允许自动压缩"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="deleted-session-policy">
                  会话被删除时
                </FieldLabel>
                <Select defaultValue="pause">
                  <SelectTrigger
                    id="deleted-session-policy"
                    className="w-full"
                  >
                    <SelectValue>
                      {(value) =>
                        value === "cancel"
                          ? "取消任务"
                          : "暂停并等待处理"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pause">暂停并等待处理</SelectItem>
                      <SelectItem value="cancel">取消任务</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldSet>
          </FieldGroup>
        ) : null}

        {step === 3 ? (
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">计划类型</FieldLegend>
              <ToggleGroup
                value={[scheduleMode]}
                onValueChange={(values) =>
                  chooseSingle<MockScheduleMode>(values, setScheduleMode)
                }
                variant="outline"
                spacing={0}
                aria-label="计划类型"
              >
                <ToggleGroupItem value="simple">简单计划</ToggleGroupItem>
                <ToggleGroupItem value="cron">Cron 表达式</ToggleGroupItem>
              </ToggleGroup>
            </FieldSet>
            {scheduleMode === "simple" ? (
              <Field>
                <FieldLabel htmlFor="simple-schedule">运行频率</FieldLabel>
                <Select
                  value={simpleSchedule}
                  onValueChange={(value) => {
                    if (value) {
                      setSimpleSchedule(value)
                    }
                  }}
                >
                  <SelectTrigger id="simple-schedule" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="每天 09:00">每天 09:00</SelectItem>
                      <SelectItem value="工作日 09:00">
                        工作日 09:00
                      </SelectItem>
                      <SelectItem value="每周一 09:00">
                        每周一 09:00
                      </SelectItem>
                      <SelectItem value="每月 1 日 09:00">
                        每月 1 日 09:00
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field data-invalid={cronInvalid}>
                <FieldLabel htmlFor="scheduled-task-cron">
                  Cron 表达式
                </FieldLabel>
                <Input
                  id="scheduled-task-cron"
                  value={cron}
                  onChange={(event) => setCron(event.target.value)}
                  aria-invalid={cronInvalid}
                  className="font-mono"
                />
                <FieldDescription>
                  当前 Mock 只校验非空；示例表示工作日 09:00。
                </FieldDescription>
                {cronInvalid ? (
                  <FieldError>请输入 Cron 表达式。</FieldError>
                ) : null}
              </Field>
            )}
            <Alert>
              <Clock3Icon aria-hidden="true" />
              <AlertTitle>Asia/Shanghai（UTC+08:00）</AlertTitle>
              <AlertDescription>
                接下来 5 次：明天、后天以及随后 3 天的 09:00。
              </AlertDescription>
            </Alert>
          </FieldGroup>
        ) : null}

        {step === 4 ? (
          <FieldGroup>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="scheduled-max-duration">
                  最大运行时长
                </FieldLabel>
                <Select
                  value={maxDuration}
                  onValueChange={(value) => {
                    if (value) {
                      setMaxDuration(value)
                    }
                  }}
                >
                  <SelectTrigger
                    id="scheduled-max-duration"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="15 分钟">15 分钟</SelectItem>
                      <SelectItem value="30 分钟">30 分钟</SelectItem>
                      <SelectItem value="1 小时">1 小时</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="scheduled-retries">
                  失败重试
                </FieldLabel>
                <Select
                  value={retries}
                  onValueChange={(value) => {
                    if (value) {
                      setRetries(value)
                    }
                  }}
                >
                  <SelectTrigger id="scheduled-retries" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="不重试">不重试</SelectItem>
                      <SelectItem value="1 次">1 次</SelectItem>
                      <SelectItem value="2 次">2 次</SelectItem>
                      <SelectItem value="3 次">3 次</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="scheduled-overlap">
                  上次未完成时
                </FieldLabel>
                <Select
                  value={overlapPolicy}
                  onValueChange={(value) => {
                    if (value) {
                      setOverlapPolicy(value)
                    }
                  }}
                >
                  <SelectTrigger id="scheduled-overlap" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="跳过">跳过</SelectItem>
                      <SelectItem value="排队">排队</SelectItem>
                      <SelectItem value="并行">并行</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="scheduled-missed-run">
                  错过运行时
                </FieldLabel>
                <Select
                  value={missedRunPolicy}
                  onValueChange={(value) => {
                    if (value) {
                      setMissedRunPolicy(value)
                    }
                  }}
                >
                  <SelectTrigger
                    id="scheduled-missed-run"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="跳过">跳过</SelectItem>
                      <SelectItem value="下次启动补跑">
                        下次启动补跑
                      </SelectItem>
                      <SelectItem value="立即补跑">立即补跑</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor="scheduled-token-guardrail">
                最大 Token guardrail
              </FieldLabel>
              <Input
                id="scheduled-token-guardrail"
                inputMode="numeric"
                value={tokenGuardrail}
                onChange={(event) => setTokenGuardrail(event.target.value)}
              />
            </Field>
            <FieldSet>
              <FieldLegend variant="label">审批策略</FieldLegend>
              <ToggleGroup
                value={[approvalMode]}
                onValueChange={(values) =>
                  chooseSingle<MockApprovalMode>(values, setApprovalMode)
                }
                variant="outline"
                spacing={0}
                aria-label="审批策略"
              >
                <ToggleGroupItem value="request">请求审批</ToggleGroupItem>
                <ToggleGroupItem value="automatic">
                  预授权范围内自动审批
                </ToggleGroupItem>
              </ToggleGroup>
              <FieldDescription>
                未提供绕过审批选项；真实授权范围待后端安全方案确定。
              </FieldDescription>
            </FieldSet>
          </FieldGroup>
        ) : null}

        {step === 5 ? (
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">通知</FieldLegend>
              <FieldGroup data-slot="checkbox-group" className="grid sm:grid-cols-2">
                {notificationOptions.map(([id, label]) => (
                  <Field key={id} orientation="horizontal">
                    <Checkbox
                      id={`scheduled-notification-${id}`}
                      checked={notifications.includes(id)}
                      onCheckedChange={(checked) =>
                        setNotifications((current) =>
                          checked
                            ? [...current, id]
                            : current.filter((item) => item !== id)
                        )
                      }
                    />
                    <FieldLabel htmlFor={`scheduled-notification-${id}`}>
                      {label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <Alert>
              <ShieldCheckIcon aria-hidden="true" />
              <AlertTitle>{name}</AlertTitle>
              <AlertDescription>
                继续“{session.title}” · {projectLabel} · {scheduleSummary} ·{" "}
                {approvalMode === "request"
                  ? "请求审批"
                  : "预授权范围内自动审批"}
                · Token 上限 {tokenGuardrail || "未设置"}。
              </AlertDescription>
            </Alert>
          </FieldGroup>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              step === 1 ? onOpenChange(false) : setStep(step - 1)
            }
          >
            {step > 1 ? (
              <ArrowLeftIcon data-icon="inline-start" />
            ) : null}
            {step === 1 ? "取消" : "上一步"}
          </Button>
          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue}
            >
              下一步
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : (
            <Button onClick={createTask}>
              <CheckIcon data-icon="inline-start" />
              创建 Mock 任务
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
