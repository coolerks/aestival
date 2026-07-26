import { useEffect, useState } from "react"
import {
  AppWindowIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileCode2Icon,
  ShieldAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import appIcon from "@/assets/icons/application/icon.svg"
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
} from "@/components/ui/field"
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
import { Switch } from "@/components/ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  type MockAiCodeBundle,
  type MockAppDraftInput,
  type MockAppNetworkPolicy,
  type MockAppWindowSize,
} from "@/data/mock-ai-app"

type AiAppCreateDialogProps = {
  bundle: MockAiCodeBundle
  conversationTitle: string
  messageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: MockAppDraftInput) => void
  onOpenEditor: () => void
}

const windowSizes: Array<{
  id: MockAppWindowSize
  label: string
}> = [
  { id: "900x680", label: "标准 · 900 × 680" },
  { id: "1200x800", label: "宽屏 · 1200 × 800" },
  { id: "390x844", label: "手机 · 390 × 844" },
]

export function AiAppCreateDialog({
  bundle,
  conversationTitle,
  messageId,
  open,
  onOpenChange,
  onCreate,
  onOpenEditor,
}: AiAppCreateDialogProps) {
  const [name, setName] = useState(bundle.suggestedName)
  const [description, setDescription] = useState(bundle.description)
  const [entryFile, setEntryFile] = useState(bundle.entryFile)
  const [windowSize, setWindowSize] =
    useState<MockAppWindowSize>("900x680")
  const [networkPolicy, setNetworkPolicy] =
    useState<MockAppNetworkPolicy>("off")
  const [allowedDomains, setAllowedDomains] = useState("")
  const [fileAccess, setFileAccess] = useState(false)
  const [clipboardRead, setClipboardRead] = useState(false)
  const [clipboardWrite, setClipboardWrite] = useState(false)
  const [iconConfirmed, setIconConfirmed] = useState(false)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setName(bundle.suggestedName)
    setDescription(bundle.description)
    setEntryFile(bundle.entryFile)
    setWindowSize("900x680")
    setNetworkPolicy("off")
    setAllowedDomains("")
    setFileAccess(false)
    setClipboardRead(false)
    setClipboardWrite(false)
    setIconConfirmed(false)
    setCreated(false)
  }, [bundle, open])

  const chooseNetworkPolicy = (values: readonly string[]) => {
    const value = values[0] as MockAppNetworkPolicy | undefined
    if (value) {
      setNetworkPolicy(value)
    }
  }
  const allowlistInvalid =
    networkPolicy === "allowlist" && !allowedDomains.trim()
  const canCreate =
    Boolean(name.trim()) && iconConfirmed && !allowlistInvalid

  const handleCreate = () => {
    if (!canCreate) {
      return
    }
    onCreate({
      name: name.trim(),
      description: description.trim(),
      entryFile,
      windowSize,
      networkPolicy,
      allowedDomains: allowedDomains.trim(),
      fileAccess,
      clipboardRead,
      clipboardWrite,
      sourceConversation: conversationTitle,
      sourceMessageId: messageId,
      sourceModel: "本地 Mock",
    })
    setCreated(true)
    toast.success("Mock 应用草稿已准备", {
      description: "未写入应用中心、文件系统或权限存储。",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {created ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>Mock 应用草稿已准备</DialogTitle>
                <Badge variant="secondary">未持久化</Badge>
              </div>
              <DialogDescription>
                已在前端内存中组合代码和权限设置；没有创建真实应用或文件。
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <CheckCircle2Icon aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">{name.trim()}</p>
                <p className="text-sm text-muted-foreground">
                  {bundle.files.length} 个代码文件 · 入口 {entryFile} ·
                  网络
                  {networkPolicy === "off"
                    ? "关闭"
                    : networkPolicy === "allowlist"
                      ? "指定域名"
                      : "全部"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                留在会话
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  onOpenEditor()
                }}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                打开 Mock 编辑器
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>从 AI 代码创建应用</DialogTitle>
                <Badge variant="secondary">前端 Mock</Badge>
              </div>
              <DialogDescription>
                确认代码组合、图标、入口、窗口和权限。默认不给予任何外部权限。
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field data-invalid={!name.trim()}>
                <FieldLabel htmlFor="mock-app-name">应用名称</FieldLabel>
                <Input
                  id="mock-app-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={!name.trim()}
                />
                {!name.trim() ? (
                  <FieldError>应用名称不能为空。</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="mock-app-description">
                  简短说明
                </FieldLabel>
                <Input
                  id="mock-app-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>

              <FieldSet>
                <FieldLegend variant="label">代码文件</FieldLegend>
                <FieldDescription>
                  已识别为可配对的 HTML、CSS 与 JavaScript。
                </FieldDescription>
                <div className="flex flex-col divide-y rounded-lg ring-1 ring-foreground/10">
                  {bundle.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <FileCode2Icon aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-mono text-xs">
                        {file.name}
                      </span>
                      <Badge variant="outline">{file.language}</Badge>
                    </div>
                  ))}
                </div>
              </FieldSet>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="mock-app-entry">
                    入口 HTML
                  </FieldLabel>
                  <Select
                    value={entryFile}
                    onValueChange={(value) => {
                      if (value) {
                        setEntryFile(value)
                      }
                    }}
                  >
                    <SelectTrigger id="mock-app-entry" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {bundle.files
                          .filter((file) => file.language === "html")
                          .map((file) => (
                            <SelectItem
                              key={file.id}
                              value={file.name}
                            >
                              {file.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="mock-app-window">
                    默认窗口
                  </FieldLabel>
                  <Select
                    value={windowSize}
                    onValueChange={(value) => {
                      if (value) {
                        setWindowSize(value as MockAppWindowSize)
                      }
                    }}
                  >
                    <SelectTrigger id="mock-app-window" className="w-full">
                      <SelectValue>
                        {(value) =>
                          windowSizes.find((item) => item.id === value)
                            ?.label ?? "选择窗口尺寸"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {windowSizes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <FieldSet>
                <FieldLegend variant="label">应用图标</FieldLegend>
                <Field
                  orientation="horizontal"
                  data-invalid={!iconConfirmed}
                >
                  <img
                    src={appIcon}
                    alt="Aestival 默认应用图标"
                    className="size-10 rounded-lg"
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="mock-app-icon-confirmed">
                      使用 Aestival 默认应用图标
                    </FieldLabel>
                    <FieldDescription>
                      后续可在应用编辑器中选择本地 PNG、JPEG 或 SVG。
                    </FieldDescription>
                  </FieldContent>
                  <Checkbox
                    id="mock-app-icon-confirmed"
                    checked={iconConfirmed}
                    onCheckedChange={setIconConfirmed}
                    aria-invalid={!iconConfirmed}
                  />
                </Field>
              </FieldSet>

              <Separator />

              <FieldSet>
                <FieldLegend variant="label">网络策略</FieldLegend>
                <ToggleGroup
                  value={[networkPolicy]}
                  onValueChange={chooseNetworkPolicy}
                  variant="outline"
                  spacing={0}
                  aria-label="应用网络策略"
                  className="max-w-full flex-wrap"
                >
                  <ToggleGroupItem value="off">关闭</ToggleGroupItem>
                  <ToggleGroupItem value="allowlist">
                    指定域名
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all">全部网络</ToggleGroupItem>
                </ToggleGroup>
                {networkPolicy === "allowlist" ? (
                  <Field data-invalid={allowlistInvalid}>
                    <FieldLabel htmlFor="mock-app-domains">
                      允许的域名
                    </FieldLabel>
                    <Input
                      id="mock-app-domains"
                      value={allowedDomains}
                      onChange={(event) =>
                        setAllowedDomains(event.target.value)
                      }
                      placeholder="api.example.com"
                      aria-invalid={allowlistInvalid}
                    />
                    {allowlistInvalid ? (
                      <FieldError>至少填写一个允许域名。</FieldError>
                    ) : null}
                  </Field>
                ) : null}
                {networkPolicy === "all" ? (
                  <Alert variant="destructive">
                    <ShieldAlertIcon aria-hidden="true" />
                    <AlertTitle>高风险网络权限</AlertTitle>
                    <AlertDescription>
                      “全部网络”会扩大生成代码的访问范围；Mock
                      阶段不会真正授予权限。
                    </AlertDescription>
                  </Alert>
                ) : null}
              </FieldSet>

              <FieldSet>
                <FieldLegend variant="label">本地权限</FieldLegend>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="mock-app-file-access">
                      本地文件访问
                    </FieldLabel>
                    <FieldDescription>
                      当前只记录 Mock 选择，不打开系统目录。
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="mock-app-file-access"
                    checked={fileAccess}
                    onCheckedChange={setFileAccess}
                  />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="mock-app-clipboard-read"
                    checked={clipboardRead}
                    onCheckedChange={setClipboardRead}
                  />
                  <FieldLabel htmlFor="mock-app-clipboard-read">
                    读取剪贴板
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="mock-app-clipboard-write"
                    checked={clipboardWrite}
                    onCheckedChange={setClipboardWrite}
                  />
                  <FieldLabel htmlFor="mock-app-clipboard-write">
                    写入剪贴板
                  </FieldLabel>
                </Field>
              </FieldSet>

              <Alert>
                <AppWindowIcon aria-hidden="true" />
                <AlertTitle>来源与权限摘要</AlertTitle>
                <AlertDescription>
                  来源：{conversationTitle} · 本地 Mock ·
                  默认权限全部关闭。生成草稿不会写入文件、应用数据库或系统权限。
                </AlertDescription>
              </Alert>
            </FieldGroup>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button disabled={!canCreate} onClick={handleCreate}>
                <AppWindowIcon data-icon="inline-start" />
                生成 Mock 应用草稿
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
