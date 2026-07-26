import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  EyeOffIcon,
  FileTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { KnowledgeSourceIcon } from "@/components/knowledge/knowledge-shared"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  getKnowledgeSourceDefinition,
  knowledgeSourceDefinitions,
  type KnowledgeSourceCategory,
  type KnowledgeSourceType,
} from "@/data/mock-knowledge"
import { useNarrowWorkspace } from "@/hooks/use-narrow-workspace"
import { cn } from "@/lib/utils"
import { useKnowledgeStore } from "@/store/knowledge-store"

function WizardProgress({
  step,
  labels,
}: {
  step: number
  labels: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          第 {step} 步，共 {labels.length} 步
        </span>
        <span>{labels[step - 1]}</span>
      </div>
      <Progress value={(step / labels.length) * 100} />
    </div>
  )
}

function WizardFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  const narrow = useNarrowWorkspace()

  if (narrow) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="[--drawer-height:calc(100dvh-2rem)]">
          <DrawerHeader className="border-b pb-4 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          <DrawerFooter className="border-t pt-4">{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(88vh,760px)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">{children}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WizardFooter({
  step,
  total,
  canContinue = true,
  onBack,
  onNext,
  onFinish,
  finishLabel,
}: {
  step: number
  total: number
  canContinue?: boolean
  onBack: () => void
  onNext: () => void
  onFinish: () => void
  finishLabel: string
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={step === 1}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        上一步
      </Button>
      {step === total ? (
        <Button onClick={onFinish} disabled={!canContinue}>
          <CheckIcon data-icon="inline-start" />
          {finishLabel}
        </Button>
      ) : (
        <Button onClick={onNext} disabled={!canContinue}>
          下一步
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}

const connectionSteps = ["选择类型", "连接配置", "测试连接", "确认"]

export function NewConnectionWizard() {
  const open = useKnowledgeStore((state) => state.newConnectionOpen)
  const setOpen = useKnowledgeStore((state) => state.setNewConnectionOpen)
  const createConnection = useKnowledgeStore(
    (state) => state.createConnection
  )
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<KnowledgeSourceCategory | "全部">(
    "全部"
  )
  const [type, setType] = useState<KnowledgeSourceType>("files")
  const [name, setName] = useState("项目资料")
  const [address, setAddress] = useState("~/Documents/Aestival")
  const [credential, setCredential] = useState("")
  const [environmentVariable, setEnvironmentVariable] = useState("")
  const [readOnly, setReadOnly] = useState(true)
  const [followSymlinks, setFollowSymlinks] = useState(false)
  const [testing, setTesting] = useState(false)
  const [tested, setTested] = useState(false)
  const definition = getKnowledgeSourceDefinition(type)
  const filteredDefinitions =
    category === "全部"
      ? knowledgeSourceDefinitions
      : knowledgeSourceDefinitions.filter(
          (source) => source.category === category
        )

  useEffect(() => {
    if (!testing) return
    const timeout = window.setTimeout(() => {
      setTesting(false)
      setTested(true)
    }, 850)
    return () => window.clearTimeout(timeout)
  }, [testing])

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep(1)
      setTesting(false)
      setTested(false)
      setCredential("")
    }
  }

  const next = () => {
    if (step === 2) {
      setStep(3)
      setTesting(true)
      setTested(false)
      return
    }
    setStep((current) => Math.min(4, current + 1))
  }

  const finish = () => {
    createConnection({
      name: name.trim(),
      type,
      address: address.trim(),
      capabilities: definition?.defaultCapabilities ?? [],
      readOnly,
    })
    toast.success("数据连接已创建（前端 Mock）")
    close(false)
  }

  return (
    <WizardFrame
      open={open}
      onOpenChange={close}
      title="新建数据连接"
      description="配置只保存在前端内存，不建立网络连接或保存凭据。"
      footer={
        <WizardFooter
          step={step}
          total={4}
          canContinue={
            step === 1
              ? Boolean(type)
              : step === 2
                ? Boolean(name.trim() && address.trim())
                : step === 3
                  ? tested
                  : true
          }
          onBack={() => setStep((current) => Math.max(1, current - 1))}
          onNext={next}
          onFinish={finish}
          finishLabel="创建连接"
        />
      }
    >
      <div className="flex flex-col gap-4 py-1">
        <WizardProgress step={step} labels={connectionSteps} />
        {step === 1 ? (
          <>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as typeof category)
              }
            >
              <SelectTrigger className="w-48" aria-label="筛选数据源类别">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部类别</SelectItem>
                <SelectItem value="关系数据库">关系数据库</SelectItem>
                <SelectItem value="向量数据库">向量数据库</SelectItem>
                <SelectItem value="搜索引擎">搜索引擎</SelectItem>
                <SelectItem value="本地文件">本地文件</SelectItem>
              </SelectContent>
            </Select>
            <ItemGroup className="grid gap-2 sm:grid-cols-2">
              {filteredDefinitions.map((source) => (
                <Item
                  key={source.type}
                  variant="outline"
                  className={cn(
                    "cursor-pointer items-start",
                    type === source.type && "border-ring bg-muted/60"
                  )}
                  render={
                    <button
                      type="button"
                      onClick={() => {
                        setType(source.type)
                        setAddress(source.defaultAddress)
                        setName(source.name)
                      }}
                    />
                  }
                >
                  <ItemMedia variant="icon">
                    <KnowledgeSourceIcon type={source.type} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {source.name}
                      {type === source.type ? <CheckIcon /> : null}
                    </ItemTitle>
                    <ItemDescription>
                      {source.description}
                    </ItemDescription>
                    <div className="flex flex-wrap gap-1">
                      {source.defaultCapabilities.map((capability) => (
                        <Badge key={capability} variant="outline">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </>
        ) : null}
        {step === 2 ? (
          <FieldGroup>
            <Field data-invalid={!name.trim()}>
              <FieldLabel htmlFor="connection-name">连接名称</FieldLabel>
              <Input
                id="connection-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!name.trim()}
              />
            </Field>
            <Field data-invalid={!address.trim()}>
              <FieldLabel htmlFor="connection-address">
                地址或路径
              </FieldLabel>
              <Input
                id="connection-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                aria-invalid={!address.trim()}
              />
              <FieldDescription>
                仅展示与校验格式，不会尝试访问该地址。
              </FieldDescription>
            </Field>
            {type !== "files" ? (
              <>
                <Field>
                  <FieldLabel htmlFor="connection-credential">
                    密码 / API Key
                  </FieldLabel>
                  <Input
                    id="connection-credential"
                    type="password"
                    value={credential}
                    onChange={(event) => setCredential(event.target.value)}
                    autoComplete="new-password"
                    placeholder="不会保存"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="connection-env">
                    或引用环境变量
                  </FieldLabel>
                  <Input
                    id="connection-env"
                    value={environmentVariable}
                    onChange={(event) =>
                      setEnvironmentVariable(event.target.value)
                    }
                    placeholder="例如 AESTIVAL_DB_TOKEN"
                  />
                  <FieldDescription>
                    只保留变量名，不读取或展示变量值。
                  </FieldDescription>
                </Field>
              </>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="include-glob">包含规则</FieldLabel>
                  <Input id="include-glob" defaultValue="**/*.{md,txt,pdf}" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="exclude-glob">排除规则</FieldLabel>
                  <Input
                    id="exclude-glob"
                    defaultValue="**/{node_modules,.git}/**"
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="follow-symlinks">
                    跟随符号链接
                  </FieldLabel>
                  <Switch
                    id="follow-symlinks"
                    checked={followSymlinks}
                    onCheckedChange={setFollowSymlinks}
                  />
                </Field>
              </>
            )}
            <Field orientation="horizontal">
              <FieldLabel htmlFor="connection-readonly">只读</FieldLabel>
              <Switch
                id="connection-readonly"
                checked={readOnly}
                onCheckedChange={setReadOnly}
              />
              <FieldDescription>当前默认并建议保持只读。</FieldDescription>
            </Field>
            <Accordion>
              <AccordionItem value="security">
                <AccordionTrigger>SSL / TLS</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox defaultChecked />
                      验证服务器证书
                    </label>
                    <Input placeholder="CA 文件路径（可选）" />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="advanced">
                <AccordionTrigger>高级参数</AccordionTrigger>
                <AccordionContent>
                  <Input placeholder="连接超时：10 秒" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FieldGroup>
        ) : null}
        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <ItemGroup className="gap-0 rounded-lg border p-2">
              {[
                "地址解析",
                "认证",
                "权限",
                "版本与能力探测",
                "可选向量能力探测",
              ].map((label, index) => {
                const passed = tested || (!testing && index === 0)
                return (
                  <Item key={label} size="sm">
                    <ItemMedia variant="icon">
                      {passed ? <CheckIcon /> : <ShieldCheckIcon />}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{label}</ItemTitle>
                      <ItemDescription>
                        {tested
                          ? "Mock 检查完成"
                          : testing
                            ? "正在模拟检查…"
                            : "等待"}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )
              })}
            </ItemGroup>
            <Progress value={tested ? 100 : testing ? 62 : 0} />
            {tested ? (
              <Alert>
                <CheckIcon />
                <AlertTitle>前端 Mock 测试通过</AlertTitle>
                <AlertDescription>
                  未发起网络请求。能力来自数据源定义，不代表真实服务器一定支持。
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}
        {step === 4 ? (
          <div className="flex flex-col gap-4">
            <Item variant="outline">
              <ItemMedia variant="icon">
                <KnowledgeSourceIcon type={type} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription>{address}</ItemDescription>
                <div className="flex flex-wrap gap-1">
                  {definition?.defaultCapabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                  <Badge variant="secondary">
                    {readOnly ? "只读" : "可写"}
                  </Badge>
                </div>
              </ItemContent>
            </Item>
            <Alert>
              <EyeOffIcon />
              <AlertTitle>敏感字段不会持久化</AlertTitle>
              <AlertDescription>
                密码与 Token 已从向导状态中隔离；创建连接后会清空。测试成功不代表已创建知识库。
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
      </div>
    </WizardFrame>
  )
}

const knowledgeSteps = [
  "基本信息",
  "选择来源",
  "内容与元数据",
  "嵌入与切分",
  "同步与确认",
]

export function NewKnowledgeWizard() {
  const open = useKnowledgeStore((state) => state.newKnowledgeOpen)
  const setOpen = useKnowledgeStore((state) => state.setNewKnowledgeOpen)
  const connections = useKnowledgeStore((state) => state.connections)
  const createKnowledgeBase = useKnowledgeStore(
    (state) => state.createKnowledgeBase
  )
  const [step, setStep] = useState(1)
  const [name, setName] = useState("项目知识库")
  const [description, setDescription] = useState(
    "面向本地智能体的项目文档与协作规范。"
  )
  const [agentScope, setAgentScope] = useState("所有智能体")
  const [connectionId, setConnectionId] = useState(
    connections[0]?.id ?? ""
  )
  const [sourceLabel, setSourceLabel] = useState("docs/**/*.md")
  const [embeddingModel, setEmbeddingModel] = useState("Mock Embed 1024")
  const [chunkSize, setChunkSize] = useState(800)
  const [overlap, setOverlap] = useState(120)
  const [syncMode, setSyncMode] = useState("manual")
  const selectedConnection = connections.find(
    (connection) => connection.id === connectionId
  )
  const sourcePreview = useMemo(
    () => [
      "docs/设计方案/05-知识库与全局搜索.md",
      "docs/协作同步/当前状态.md",
      "AGENTS.md",
    ],
    []
  )

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setStep(1)
  }

  const finish = () => {
    const id = createKnowledgeBase({
      name: name.trim(),
      description: description.trim(),
      connectionId,
      sourceLabel: sourceLabel.trim(),
      embeddingModel,
      agentScope,
    })
    if (!id) {
      toast.error("请选择有效的数据连接")
      return
    }
    toast.success("知识库已创建，初次同步为前端 Mock")
    close(false)
  }

  return (
    <WizardFrame
      open={open}
      onOpenChange={close}
      title="新建知识库"
      description="组织来源、切片与检索配置；不执行真实索引或嵌入。"
      footer={
        <WizardFooter
          step={step}
          total={5}
          canContinue={
            step === 1
              ? Boolean(name.trim())
              : step === 2
                ? Boolean(connectionId && sourceLabel.trim())
                : true
          }
          onBack={() => setStep((current) => Math.max(1, current - 1))}
          onNext={() =>
            setStep((current) => Math.min(5, current + 1))
          }
          onFinish={finish}
          finishLabel="创建并同步"
        />
      }
    >
      <div className="flex flex-col gap-4 py-1">
        <WizardProgress step={step} labels={knowledgeSteps} />
        {step === 1 ? (
          <FieldGroup>
            <Field data-invalid={!name.trim()}>
              <FieldLabel htmlFor="knowledge-name">名称</FieldLabel>
              <Input
                id="knowledge-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!name.trim()}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="knowledge-description">说明</FieldLabel>
              <Textarea
                id="knowledge-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>颜色标记</FieldLabel>
              <div className="flex gap-2">
                {["bg-primary", "bg-chart-1", "bg-chart-2", "bg-chart-3"].map(
                  (color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "size-7 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        color,
                        index === 0 && "ring-2 ring-ring ring-offset-2"
                      )}
                      aria-label={`颜色标记 ${index + 1}`}
                    />
                  )
                )}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="knowledge-scope">可使用范围</FieldLabel>
              <Select
                value={agentScope}
                onValueChange={(value) => {
                  if (value) setAgentScope(value)
                }}
              >
                <SelectTrigger id="knowledge-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="所有智能体">所有智能体</SelectItem>
                  <SelectItem value="通用智能体、代码审查">
                    通用智能体、代码审查
                  </SelectItem>
                  <SelectItem value="产品智能体">产品智能体</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        ) : null}
        {step === 2 ? (
          <FieldGroup>
            <Field data-invalid={!connectionId}>
              <FieldLabel htmlFor="knowledge-connection">
                数据连接
              </FieldLabel>
              <Select
                value={connectionId}
                onValueChange={(value) => {
                  if (value) setConnectionId(value)
                }}
              >
                <SelectTrigger
                  id="knowledge-connection"
                  aria-invalid={!connectionId}
                >
                  <SelectValue placeholder="选择连接">
                    {selectedConnection?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                数据库连接默认只读；连接与知识库配置相互独立。
              </FieldDescription>
            </Field>
            <Field data-invalid={!sourceLabel.trim()}>
              <FieldLabel htmlFor="knowledge-source">
                Schema / Table / Collection / 路径规则
              </FieldLabel>
              <Input
                id="knowledge-source"
                value={sourceLabel}
                onChange={(event) => setSourceLabel(event.target.value)}
                aria-invalid={!sourceLabel.trim()}
              />
            </Field>
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">来源预览</p>
              <ItemGroup className="gap-0">
                {sourcePreview.map((source) => (
                  <Item key={source} size="xs">
                    <ItemMedia variant="icon">
                      <FileTextIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{source}</ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
              <p className="mt-2 text-xs text-muted-foreground">
                Mock 预览：匹配 146 个文件，排除 2 个目录。
              </p>
            </div>
          </FieldGroup>
        ) : null}
        {step === 3 ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="content-parser">内容解析器</FieldLabel>
              <Select defaultValue="auto">
                <SelectTrigger id="content-parser">
                  <SelectValue>自动识别</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动识别</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plain">纯文本</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="title-field">标题字段</FieldLabel>
              <Input id="title-field" defaultValue="title" />
            </Field>
            <Field>
              <FieldLabel>保留元数据</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {["路径", "修改时间", "标签", "语言"].map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    <Checkbox defaultChecked />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="query-template">关系查询模板</FieldLabel>
              <Textarea
                id="query-template"
                defaultValue="SELECT id, title, body FROM documents WHERE updated_at > :cursor"
              />
              <FieldDescription>
                仅保存参数化只读模板，不在 UI 中执行。
              </FieldDescription>
            </Field>
          </FieldGroup>
        ) : null}
        {step === 4 ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="embedding-model">嵌入模型</FieldLabel>
              <Select
                value={embeddingModel}
                onValueChange={(value) => {
                  if (value) setEmbeddingModel(value)
                }}
              >
                <SelectTrigger id="embedding-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mock Embed 1024">
                    Mock Embed 1024
                  </SelectItem>
                  <SelectItem value="Mock Embed 1536">
                    Mock Embed 1536
                  </SelectItem>
                  <SelectItem value="使用已有向量 · 1024">
                    使用已有向量 · 1024
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="chunk-size">
                Chunk 大小：{chunkSize}
              </FieldLabel>
              <div className="flex items-center gap-3">
                <Slider
                  id="chunk-size"
                  min={200}
                  max={2000}
                  step={50}
                  value={[chunkSize]}
                  onValueChange={(value) =>
                    setChunkSize(value[0] ?? chunkSize)
                  }
                />
                <Input
                  className="w-24"
                  type="number"
                  value={chunkSize}
                  onChange={(event) =>
                    setChunkSize(Number(event.target.value))
                  }
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="chunk-overlap">
                Overlap：{overlap}
              </FieldLabel>
              <div className="flex items-center gap-3">
                <Slider
                  id="chunk-overlap"
                  min={0}
                  max={500}
                  step={10}
                  value={[overlap]}
                  onValueChange={(value) =>
                    setOverlap(value[0] ?? overlap)
                  }
                />
                <Input
                  className="w-24"
                  type="number"
                  value={overlap}
                  onChange={(event) =>
                    setOverlap(Number(event.target.value))
                  }
                />
              </div>
            </Field>
            <Field>
              <FieldLabel>切片预览</FieldLabel>
              <Carousel className="mx-10">
                <CarouselContent>
                  {[
                    "连接描述数据从哪里来；知识库描述如何组织和检索内容。",
                    "全局标题栏显示当前名称，内容顶部不重复页面名称。",
                    "结果默认使用连续 Item 列表，调试过程不暴露凭据。",
                  ].map((preview, index) => (
                    <CarouselItem key={preview}>
                      <div className="min-h-24 rounded-lg border p-3">
                        <Badge variant="outline">切片 {index + 1}</Badge>
                        <p className="mt-2 text-sm">{preview}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </Field>
          </FieldGroup>
        ) : null}
        {step === 5 ? (
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="sync-mode">同步方式</FieldLabel>
              <Select
                value={syncMode}
                onValueChange={(value) => {
                  if (value) setSyncMode(value)
                }}
              >
                <SelectTrigger id="sync-mode">
                  <SelectValue>
                    {syncMode === "manual"
                      ? "手动"
                      : syncMode === "startup"
                        ? "启动时"
                        : "定时任务"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">手动</SelectItem>
                  <SelectItem value="startup">启动时</SelectItem>
                  <SelectItem value="schedule">定时任务</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Item variant="outline">
              <ItemMedia variant="icon">
                {selectedConnection ? (
                  <KnowledgeSourceIcon type={selectedConnection.type} />
                ) : (
                  <DatabaseIcon />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription>
                  {selectedConnection?.name ?? "未选择连接"} · {sourceLabel}
                </ItemDescription>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{embeddingModel}</Badge>
                  <Badge variant="outline">
                    Chunk {chunkSize} / {overlap}
                  </Badge>
                  <Badge variant="secondary">
                    {syncMode === "manual"
                      ? "手动同步"
                      : syncMode === "startup"
                        ? "启动时同步"
                        : "定时同步"}
                  </Badge>
                </div>
              </ItemContent>
            </Item>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">预计条目</p>
                <p className="font-medium">约 684</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">索引空间</p>
                <p className="font-medium">约 18.6 MB</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">嵌入费用</p>
                <p className="font-medium">Mock ¥0.38</p>
              </div>
            </div>
            <Alert>
              <SparklesIcon />
              <AlertTitle>创建后开始前端 Mock 同步</AlertTitle>
              <AlertDescription>
                进度和记录可交互，但不会读取文件正文、调用模型或写入索引。
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
      </div>
    </WizardFrame>
  )
}
