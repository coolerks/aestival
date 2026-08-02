import { lazy, Suspense } from "react"
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  CodeXmlIcon,
  FileCode2Icon,
  GlobeIcon,
  KeyRoundIcon,
  NetworkIcon,
  PlayIcon,
  SaveIcon,
  ShieldAlertIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { CompactDefinitionList } from "@/components/shared/compact-definition-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { capabilityTabs, hookStages, statusLabels } from "@/data/mock-capabilities"
import { useCapabilityStore } from "@/store/capability-store"

const CapabilityCodeEditor = lazy(() => import("@/components/capabilities/capability-code-editor").then((module) => ({ default: module.CapabilityCodeEditor })))

const skillTemplate = `---
name: project-review
description: 按项目约束审查当前变更
compatibility: aestival
---

# 项目审查

1. 读取项目约束。
2. 检查变更范围与风险。
3. 输出可执行的审查结论。`

const promptTemplate = `你是 {{role}}。请针对 {{scope}} 完成审查：

- 先说明最重要的风险
- 引用可以验证的证据
- 给出最小可行修复建议`

export function CapabilityOverlays() {
  const records = useCapabilityStore((state) => state.records)
  const activeTab = useCapabilityStore((state) => state.activeTab)
  const selectedId = useCapabilityStore((state) => state.selectedId)
  const detailsOpen = useCapabilityStore((state) => state.detailsOpen)
  const setDetailsOpen = useCapabilityStore((state) => state.setDetailsOpen)
  const dialog = useCapabilityStore((state) => state.dialog)
  const dialogId = useCapabilityStore((state) => state.dialogId)
  const setDialog = useCapabilityStore((state) => state.setDialog)
  const deleteRecord = useCapabilityStore((state) => state.deleteRecord)
  const selected = records.find((record) => record.id === selectedId) ?? null
  const pendingDelete = records.find((record) => record.id === dialogId) ?? null

  return (
    <>
      <DetailsSheet record={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />
      <CreateDialog open={dialog === "create"} tab={activeTab} onOpenChange={(open) => !open && setDialog(null)} />
      <AlertDialog open={dialog === "delete"} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogMedia><Trash2Icon /></AlertDialogMedia><AlertDialogTitle>删除“{pendingDelete?.name ?? "此能力"}”？</AlertDialogTitle><AlertDialogDescription>这只会删除当前前端 Mock 记录。真实文件、服务和凭据不会被修改；后续接入后端时需重新定义引用清理策略。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => pendingDelete && deleteRecord(pendingDelete.id)}>删除 Mock 记录</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DetailsSheet({ record, open, onOpenChange }: { record: ReturnType<typeof useCapabilityStore.getState>["records"][number] | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const toggleEnabled = useCapabilityStore((state) => state.toggleEnabled)
  if (!record) return null
  const tabs = record.tab === "mcp" ? ["概览", "工具", "配置", "日志", "用量"] : record.tab === "skills" ? ["概览", "SKILL.md", "资源", "触发器", "权限"] : record.tab === "agents" ? ["概览", "工具与 Skill", "指令", "Hooks", "测试"] : record.tab === "prompts" ? ["概览", "指令内容", "变量", "引用"] : ["概览", "条件与动作", "顺序", "测试日志"]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(92vw,48rem)] sm:max-w-3xl">
        <SheetHeader className="border-b"><div className="flex items-center gap-2"><SheetTitle>{record.name}</SheetTitle><Badge variant={record.status === "error" ? "destructive" : "secondary"}>{statusLabels[record.status]}</Badge></div><SheetDescription>{record.description}</SheetDescription></SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4">
          <Tabs defaultValue={tabs[0]} className="py-1">
            <TabsList className="w-full overflow-x-auto">{tabs.map((tab) => <TabsTrigger key={tab} value={tab} className="min-w-fit">{tab}</TabsTrigger>)}</TabsList>
            {tabs.map((tab, index) => <TabsContent key={tab} value={tab} className="py-4">{index === 0 ? <Overview record={record} /> : <DetailPanel record={record} tab={tab} />}</TabsContent>)}
          </Tabs>
        </ScrollArea>
        <SheetFooter className="flex-row justify-between border-t"><Button variant="outline" onClick={() => toast.info("配置已导出为前端 Mock 预览")}>导出配置</Button><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{record.enabled ? "已启用" : "已停用"}</span><Switch checked={record.enabled} onCheckedChange={() => toggleEnabled(record.id)} aria-label={`${record.enabled ? "停用" : "启用"}${record.name}`} /></div></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Overview({ record }: { record: ReturnType<typeof useCapabilityStore.getState>["records"][number] }) {
  return <div className="flex flex-col gap-4"><CompactDefinitionList rows={[{ label: "来源与类型", value: `${record.source} · ${record.type}` }, { label: "最近活动", value: `${record.updatedAt} · ${record.meta.join(" · ")}` }, { label: "权限摘要", value: record.permissions.length ? record.permissions.join("、") : "不请求额外权限" }]} />{record.status === "error" ? <Alert variant="destructive"><CircleAlertIcon /><AlertTitle>Mock 状态异常</AlertTitle><AlertDescription>示例诊断已脱敏。真实错误日志将在后端连接方案确认后接入。</AlertDescription></Alert> : null}</div>
}

function DetailPanel({ record, tab }: { record: ReturnType<typeof useCapabilityStore.getState>["records"][number]; tab: string }) {
  if ((record.tab === "skills" && tab === "SKILL.md") || (record.tab === "prompts" && tab === "指令内容")) return <EditorSurface language={record.tab === "skills" ? "markdown" : "plaintext"} value={record.tab === "skills" ? skillTemplate : promptTemplate} />
  if (tab.includes("日志") || tab === "测试") return <div className="flex flex-col gap-3"><Alert><CircleDashedIcon /><AlertTitle>尚未执行真实测试</AlertTitle><AlertDescription>这里只显示本地模拟检查；命令、HTTP、工具调用和模型请求均未发生。</AlertDescription></Alert><pre className="select-text overflow-x-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs">{`[mock] configuration loaded\n[mock] secrets redacted\n[mock] awaiting backend adapter`}</pre></div>
  if (tab === "工具" || tab === "工具与 Skill") return <div className="overflow-hidden rounded-lg border"><Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>范围</TableHead><TableHead>审批</TableHead></TableRow></TableHeader><TableBody>{["读取项目", "搜索内容", "生成建议"].map((name, index) => <TableRow key={name}><TableCell>{name}</TableCell><TableCell>{index === 0 ? "工作区" : "当前任务"}</TableCell><TableCell><Badge variant="outline">{index === 2 ? "始终" : "按策略"}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
  return <div className="flex flex-col gap-3"><FieldGroup><Field><FieldLabel htmlFor={`detail-name-${record.id}`}>显示名称</FieldLabel><Input id={`detail-name-${record.id}`} defaultValue={record.name} /></Field><Field><FieldLabel>配置说明</FieldLabel><Textarea defaultValue={record.description} /></Field></FieldGroup><Alert><ShieldAlertIcon /><AlertTitle>保存只更新前端 Mock</AlertTitle><AlertDescription>当前不会写入文件、启动进程、请求网络或改变系统设置。</AlertDescription></Alert><Button className="self-end" onClick={() => toast.success("已保存到前端 Mock") }><SaveIcon data-icon="inline-start" />保存 Mock</Button></div>
}

function EditorSurface({ language, value }: { language: string; value: string }) {
  return <Suspense fallback={<div className="flex flex-col gap-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-72 w-full" /></div>}><CapabilityCodeEditor language={language} value={value} /></Suspense>
}

function CreateDialog({ open, tab, onOpenChange }: { open: boolean; tab: "mcp" | "skills" | "agents" | "prompts" | "hooks"; onOpenChange: (open: boolean) => void }) {
  const definition = capabilityTabs.find((item) => item.id === tab) ?? capabilityTabs[0]
  const wizardStep = useCapabilityStore((state) => state.wizardStep)
  const setWizardStep = useCapabilityStore((state) => state.setWizardStep)
  const validationProgress = useCapabilityStore((state) => state.validationProgress)
  const validateMock = useCapabilityStore((state) => state.validateMock)
  const method = useCapabilityStore((state) => state.installMethod)
  const setMethod = useCapabilityStore((state) => state.setInstallMethod)
  const maxStep = tab === "agents" ? 7 : tab === "hooks" ? 6 : 1
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{definition.action}</DialogTitle><DialogDescription>创建和测试均为本地前端 Mock；不会连接服务、安装包或执行命令。</DialogDescription></DialogHeader>
        {tab === "mcp" ? <McpForm method={method} setMethod={setMethod} progress={validationProgress} /> : tab === "skills" ? <SkillForm /> : tab === "agents" ? <AgentForm step={wizardStep} /> : tab === "prompts" ? <PromptForm /> : <HookForm step={wizardStep} />}
        <DialogFooter className="sm:justify-between">
          <div>{maxStep > 1 ? <Button variant="outline" disabled={wizardStep === 1} onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}>上一步</Button> : null}</div>
          <div className="flex gap-2"><Button variant="outline" onClick={validateMock}><PlayIcon data-icon="inline-start" />校验 Mock</Button>{maxStep > 1 && wizardStep < maxStep ? <Button onClick={() => setWizardStep(Math.min(maxStep, wizardStep + 1))}>下一步</Button> : <Button onClick={() => { toast.success("草稿已保存到前端 Mock"); onOpenChange(false) }}><SaveIcon data-icon="inline-start" />保存草稿</Button>}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function McpForm({ method, setMethod, progress }: { method: "manual" | "ai" | "market"; setMethod: (value: "manual" | "ai" | "market") => void; progress: number }) {
  return <Tabs value={method} onValueChange={(value) => setMethod(value as typeof method)}><TabsList className="grid w-full grid-cols-3"><TabsTrigger value="manual"><CodeXmlIcon />手动配置</TabsTrigger><TabsTrigger value="ai"><SparklesIcon />AI 计划</TabsTrigger><TabsTrigger value="market"><GlobeIcon />市场缓存</TabsTrigger></TabsList><TabsContent value="manual" className="pt-4"><FieldGroup><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="mcp-name">名称</FieldLabel><Input id="mcp-name" placeholder="例如 Filesystem" /></Field><Field><FieldLabel>传输方式</FieldLabel><Select defaultValue="stdio"><SelectTrigger className="w-full"><SelectValue>stdio</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="stdio">stdio</SelectItem><SelectItem value="http">HTTP / SSE</SelectItem></SelectGroup></SelectContent></Select></Field></div><Field><FieldLabel htmlFor="mcp-command">命令或端点</FieldLabel><Input id="mcp-command" placeholder="npx @example/server 或 https://…" /></Field><Field><FieldLabel htmlFor="mcp-env">环境变量</FieldLabel><Textarea id="mcp-env" placeholder="TOKEN=••••••（仅展示脱敏预览）" /><FieldDescription>敏感值不会写入普通 Zustand 持久化。</FieldDescription></Field></FieldGroup>{progress ? <Progress value={progress} className="mt-4"><ProgressLabel>配置检查</ProgressLabel><ProgressValue>{(_formatted, value) => `${value ?? 0}% · 仅完成静态校验`}</ProgressValue></Progress> : null}</TabsContent><TabsContent value="ai" className="pt-4"><Alert><ShieldAlertIcon /><AlertTitle>AI 只生成安装计划</AlertTitle><AlertDescription>计划会列出文件写入、依赖、网络、进程与密钥副作用；必须单独审批后才可由未来后端执行。</AlertDescription></Alert><Textarea className="mt-4" placeholder="描述你希望接入的 MCP 服务…" /></TabsContent><TabsContent value="market" className="pt-4"><Alert><GlobeIcon /><AlertTitle>本地缓存 · 2026-07-30</AlertTitle><AlertDescription>当前未联网，以下条目不是实时市场结果。</AlertDescription></Alert><ItemGroup className="mt-3 gap-2">{["SQLite 工具集", "Git 仓库助手", "浏览器自动化"].map((name) => <Item key={name} variant="outline"><ItemMedia variant="icon"><NetworkIcon /></ItemMedia><ItemContent><ItemTitle>{name}</ItemTitle><ItemDescription>缓存详情可浏览；安装服务尚未接入。</ItemDescription></ItemContent><ItemActions><Button size="xs" variant="outline" disabled>待后端接入</Button></ItemActions></Item>)}</ItemGroup></TabsContent></Tabs>
}

function SkillForm() {
  return <Tabs defaultValue="basic"><TabsList variant="line" className="w-full justify-start overflow-x-auto"><TabsTrigger value="basic">基本信息</TabsTrigger><TabsTrigger value="editor">SKILL.md</TabsTrigger><TabsTrigger value="assets">资源与脚本</TabsTrigger><TabsTrigger value="permissions">权限</TabsTrigger><TabsTrigger value="test">测试</TabsTrigger></TabsList><TabsContent value="basic" className="pt-4"><FieldGroup><Field><FieldLabel htmlFor="skill-name">名称</FieldLabel><Input id="skill-name" placeholder="project-review" /></Field><Field><FieldLabel>兼容格式</FieldLabel><Select defaultValue="native"><SelectTrigger className="w-full"><SelectValue>Aestival Native</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="native">Aestival Native</SelectItem><SelectItem value="claude">Claude</SelectItem><SelectItem value="codex">Codex</SelectItem></SelectGroup></SelectContent></Select></Field></FieldGroup></TabsContent><TabsContent value="editor" className="pt-4"><EditorSurface language="markdown" value={skillTemplate} /></TabsContent><TabsContent value="assets" className="pt-4"><Alert><FileCode2Icon /><AlertTitle>目录结构检查</AlertTitle><AlertDescription>Mock 规则将检查 SKILL.md、references/、scripts/ 与 assets/ 的相对引用，不会运行脚本。</AlertDescription></Alert></TabsContent><TabsContent value="permissions" className="pt-4"><PermissionFields /></TabsContent><TabsContent value="test" className="pt-4"><MockTestNotice /></TabsContent></Tabs>
}

function AgentForm({ step }: { step: number }) {
  const labels = ["基本信息", "角色约束", "工具", "Skills", "指令", "Hooks", "测试"]
  return <div className="flex flex-col gap-4"><StepHeader step={step} labels={labels} />{step === 1 ? <FieldGroup><Field><FieldLabel htmlFor="agent-name">名称</FieldLabel><Input id="agent-name" placeholder="例如：只读审查智能体" /></Field><Field><FieldLabel>默认模型</FieldLabel><Select defaultValue="balanced"><SelectTrigger className="w-full"><SelectValue>Mock Balanced</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="balanced">Mock Balanced</SelectItem><SelectItem value="fast">Mock Fast</SelectItem></SelectGroup></SelectContent></Select></Field></FieldGroup> : step === 2 ? <Field><FieldLabel>角色与约束</FieldLabel><Textarea placeholder="说明智能体必须做什么、禁止做什么…" /></Field> : step === 7 ? <MockTestNotice /> : <SelectableMockList title={labels[step - 1]} />}</div>
}

function PromptForm() {
  return <FieldGroup><div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="prompt-name">名称</FieldLabel><Input id="prompt-name" placeholder="严格代码审查" /></Field><Field><FieldLabel>作用域</FieldLabel><Select defaultValue="workspace"><SelectTrigger className="w-full"><SelectValue>当前工作区</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="global">全局</SelectItem><SelectItem value="workspace">当前工作区</SelectItem><SelectItem value="agent">指定智能体</SelectItem></SelectGroup></SelectContent></Select></Field></div><Field><FieldLabel>指令内容</FieldLabel><EditorSurface language="plaintext" value={promptTemplate} /><FieldDescription>已识别变量：role、scope。预览不会调用模型。</FieldDescription></Field></FieldGroup>
}

function HookForm({ step }: { step: number }) {
  const labels = ["生命周期", "作用域", "条件", "动作", "失败策略", "模拟测试"]
  return <div className="flex flex-col gap-4"><StepHeader step={step} labels={labels} />{step === 1 ? <Field><FieldLabel>生命周期阶段</FieldLabel><Select defaultValue="PreToolUse"><SelectTrigger className="w-full"><SelectValue>PreToolUse</SelectValue></SelectTrigger><SelectContent><SelectGroup>{hookStages.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : step === 2 ? <SelectableMockList title="作用域" /> : step === 3 ? <Field><FieldLabel>匹配条件</FieldLabel><Textarea placeholder="tool.risk == 'high'" /><FieldDescription>条件仅做静态语法校验。</FieldDescription></Field> : step === 4 ? <Field><FieldLabel>动作类型</FieldLabel><Select defaultValue="approval"><SelectTrigger className="w-full"><SelectValue>请求审批</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="approval">请求审批</SelectItem><SelectItem value="command">本地命令（需审批）</SelectItem><SelectItem value="http">HTTP（需审批）</SelectItem><SelectItem value="notification">本地通知</SelectItem></SelectGroup></SelectContent></Select></Field> : step === 5 ? <FailurePolicy /> : <MockTestNotice />}</div>
}

function StepHeader({ step, labels }: { step: number; labels: string[] }) {
  return <div className="flex items-center gap-1 overflow-x-auto">{labels.map((label, index) => <div key={label} className="flex items-center gap-1"><Badge variant={step === index + 1 ? "default" : step > index + 1 ? "secondary" : "outline"}>{step > index + 1 ? <CheckIcon /> : index + 1} {label}</Badge>{index < labels.length - 1 ? <Separator className="w-3" /> : null}</div>)}</div>
}

function SelectableMockList({ title }: { title: string }) {
  return <div className="flex flex-col gap-2"><FieldTitle>选择{title}</FieldTitle>{["读取项目", "代码审查", "项目约束"].map((name, index) => <Item key={name} variant="outline"><ItemMedia variant="icon">{title === "作用域" ? <GlobeIcon /> : <SparklesIcon />}</ItemMedia><ItemContent><ItemTitle>{name}</ItemTitle><ItemDescription>前端 Mock 选项，保存前可调整。</ItemDescription></ItemContent><Switch defaultChecked={index === 0} aria-label={`选择${name}`} /></Item>)}</div>
}

function PermissionFields() {
  return <ItemGroup className="gap-2">{[["读取工作区", "允许读取当前工作区文件"], ["访问网络", "默认关闭，启用后仍需审批"], ["运行脚本", "默认关闭，不会在 Mock 中执行"]].map(([title, description], index) => <Item key={title} variant="outline"><ItemMedia variant="icon"><KeyRoundIcon /></ItemMedia><ItemContent><ItemTitle>{title}</ItemTitle><ItemDescription>{description}</ItemDescription></ItemContent><Switch defaultChecked={index === 0} aria-label={`${title}权限`} /></Item>)}</ItemGroup>
}

function FailurePolicy() {
  return <Field><FieldLabel>动作失败时</FieldLabel><RadioGroup defaultValue="block"><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="block" /><FieldContentLite title="阻止后续流程" description="适合审批与关键安全检查。" /></Field></FieldLabel><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="warn" /><FieldContentLite title="警告并继续" description="记录脱敏摘要，不中断当前任务。" /></Field></FieldLabel><FieldLabel><Field orientation="horizontal"><RadioGroupItem value="ignore" /><FieldContentLite title="忽略" description="仅建议用于非关键通知。" /></Field></FieldLabel></RadioGroup></Field>
}

function FieldContentLite({ title, description }: { title: string; description: string }) {
  return <div className="flex flex-col gap-0.5"><span className="text-sm font-medium">{title}</span><span className="text-xs text-muted-foreground">{description}</span></div>
}

function MockTestNotice() {
  return <Alert><PlayIcon /><AlertTitle>模拟测试待运行</AlertTitle><AlertDescription>运行后只校验前端配置与引用结构；不会调用模型、工具、命令或 HTTP 端点。</AlertDescription></Alert>
}
