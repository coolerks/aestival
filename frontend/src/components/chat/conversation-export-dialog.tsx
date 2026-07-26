import { useEffect, useMemo, useState } from "react"
import {
  EyeIcon,
  FileOutputIcon,
  FolderOpenIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "sonner"

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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  mockExportFormats,
  type MockExportFormat,
  type MockExportMedia,
  type MockExportScope,
} from "@/data/mock-conversation-management"

type ConversationExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialScope: MockExportScope
  initialFormat: MockExportFormat
  conversationTitle: string
}

const contentOptions = [
  ["outline", "思考大纲"],
  ["tools", "工具输入输出"],
  ["citations", "引用"],
  ["attachments", "附件目录"],
  ["stats", "会话统计"],
] as const

export function ConversationExportDialog({
  open,
  onOpenChange,
  initialScope,
  initialFormat,
  conversationTitle,
}: ConversationExportDialogProps) {
  const [scope, setScope] = useState<MockExportScope>(initialScope)
  const [format, setFormat] = useState<MockExportFormat>(initialFormat)
  const [media, setMedia] = useState<MockExportMedia>("links")
  const [contents, setContents] = useState<string[]>(
    contentOptions.map(([id]) => id)
  )
  const [redact, setRedact] = useState(true)
  const [progress, setProgress] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setScope(initialScope)
    setFormat(initialFormat)
    setProgress(0)
    setExporting(false)
    setPreviewReady(false)
  }, [initialFormat, initialScope, open])

  useEffect(() => {
    if (!exporting) {
      return
    }

    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + 20))
    }, 120)
    return () => window.clearInterval(timer)
  }, [exporting])

  useEffect(() => {
    if (!exporting || progress < 100) {
      return
    }
    setExporting(false)
    setPreviewReady(true)
    toast.success("Mock 导出预览已生成", {
      description: "未创建文件，也未打开系统保存位置。",
      action: {
        label: "查看预览",
        onClick: () => setPreviewReady(true),
      },
    })
  }, [exporting, progress])

  const extension =
    mockExportFormats.find((item) => item.id === format)?.extension ?? ".md"
  const previewName = useMemo(
    () =>
      `${conversationTitle.replace(/[\\/:*?"<>|]/g, "-") || "Aestival 会话"}${extension}`,
    [conversationTitle, extension]
  )

  const chooseSingle = <T extends string>(
    values: readonly string[],
    setter: (value: T) => void
  ) => {
    const value = values[0] as T | undefined
    if (value) {
      setter(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>导出会话</DialogTitle>
            <Badge variant="secondary">仅生成 Mock 预览</Badge>
          </div>
          <DialogDescription>
            配置导出范围、内容、隐私和媒体策略。当前不会写入本地文件。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">范围</FieldLegend>
            <ToggleGroup
              value={[scope]}
              onValueChange={(values) =>
                chooseSingle<MockExportScope>(values, setScope)
              }
              variant="outline"
              spacing={0}
              aria-label="导出范围"
              className="max-w-full flex-wrap"
            >
              <ToggleGroupItem value="conversation">
                完整会话
              </ToggleGroupItem>
              <ToggleGroupItem value="branch">当前分支</ToggleGroupItem>
              <ToggleGroupItem value="selection">
                选定消息
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label">内容</FieldLegend>
            <FieldGroup data-slot="checkbox-group" className="grid sm:grid-cols-2">
              {contentOptions.map(([id, label]) => (
                <Field key={id} orientation="horizontal">
                  <Checkbox
                    id={`export-${id}`}
                    checked={contents.includes(id)}
                    onCheckedChange={(checked) =>
                      setContents((current) =>
                        checked
                          ? [...current, id]
                          : current.filter((item) => item !== id)
                      )
                    }
                  />
                  <FieldLabel htmlFor={`export-${id}`}>{label}</FieldLabel>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal">
            <Checkbox
              id="export-redact"
              checked={redact}
              onCheckedChange={setRedact}
            />
            <FieldContent>
              <FieldLabel htmlFor="export-redact">
                自动脱敏敏感字段
              </FieldLabel>
              <FieldDescription>
                隐藏 API URL、路径、环境变量与调试字段。
              </FieldDescription>
            </FieldContent>
          </Field>

          <FieldSet>
            <FieldLegend variant="label">媒体</FieldLegend>
            <ToggleGroup
              value={[media]}
              onValueChange={(values) =>
                chooseSingle<MockExportMedia>(values, setMedia)
              }
              variant="outline"
              spacing={0}
              aria-label="媒体处理方式"
              className="max-w-full flex-wrap"
            >
              <ToggleGroupItem value="embed">嵌入</ToggleGroupItem>
              <ToggleGroupItem value="copy">复制到资源目录</ToggleGroupItem>
              <ToggleGroupItem value="links">只保留链接</ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label">格式</FieldLegend>
            <ToggleGroup
              value={[format]}
              onValueChange={(values) =>
                chooseSingle<MockExportFormat>(values, setFormat)
              }
              variant="outline"
              spacing={0}
              aria-label="导出格式"
              className="max-w-full flex-wrap"
            >
              {mockExportFormats.map((item) => (
                <ToggleGroupItem key={item.id} value={item.id}>
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>

          <Field>
            <FieldLabel htmlFor="export-location">保存位置</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="export-location"
                value="未选择（Mock，不会写入文件）"
                readOnly
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast.info("系统目录选择器尚未接入", {
                    description: "当前不会请求文件系统权限。",
                  })
                }
              >
                <FolderOpenIcon data-icon="inline-start" />
                选择
              </Button>
            </div>
          </Field>
        </FieldGroup>

        <Separator />

        <section className="flex flex-col gap-3" aria-label="导出预览">
          <div className="flex flex-wrap items-center gap-2">
            <EyeIcon aria-hidden="true" />
            <span className="text-sm font-medium">格式预览</span>
            <Badge variant="outline">{previewName}</Badge>
          </div>
          <p className="app-selectable-content text-sm leading-6 text-muted-foreground">
            {scope === "conversation"
              ? "完整会话"
              : scope === "branch"
                ? "当前分支"
                : "选定消息"}
            · {contents.length} 类附加内容 ·
            {redact ? " 已启用脱敏" : " 未启用脱敏"} ·
            {media === "embed"
              ? "媒体嵌入"
              : media === "copy"
                ? "复制媒体"
                : "保留媒体链接"}
          </p>
          {exporting || previewReady ? (
            <Progress value={progress}>
              <ProgressLabel>
                {previewReady ? "Mock 预览已完成" : "正在生成 Mock 预览"}
              </ProgressLabel>
              <ProgressValue>
                {(_formattedValue, value) => `${value ?? 0}%`}
              </ProgressValue>
            </Progress>
          ) : null}
          {previewReady ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheckIcon aria-hidden="true" />
              已完成内存预览；没有创建、覆盖或保存任何文件。
            </div>
          ) : null}
        </section>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button
            disabled={exporting || contents.length === 0}
            onClick={() => {
              setProgress(0)
              setPreviewReady(false)
              setExporting(true)
            }}
          >
            <FileOutputIcon data-icon="inline-start" />
            生成 Mock 预览
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
