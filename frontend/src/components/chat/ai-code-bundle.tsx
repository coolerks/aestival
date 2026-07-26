import { useState } from "react"
import {
  AppWindowIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AiAppCreateDialog } from "@/components/chat/ai-app-create-dialog"
import { AiCodePreviewDialog } from "@/components/chat/ai-code-preview-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  type MockAiCodeBundle,
  type MockAppDraft,
  type MockAppDraftInput,
  type MockCodeFile,
} from "@/data/mock-ai-app"

type AiCodeBundleProps = {
  bundle: MockAiCodeBundle
  conversationTitle: string
  messageId: string
  createdDraft: MockAppDraft | null
  onCreateDraft: (
    input: MockAppDraftInput,
    files: MockCodeFile[]
  ) => void
  onOpenEditor: () => void
}

export function AiCodeBundle({
  bundle,
  conversationTitle,
  messageId,
  createdDraft,
  onCreateDraft,
  onOpenEditor,
}: AiCodeBundleProps) {
  const [selectedFileId, setSelectedFileId] = useState(
    bundle.files[0]?.id ?? ""
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const selectedFile =
    bundle.files.find((file) => file.id === selectedFileId) ??
    bundle.files[0]
  const isCreated = createdDraft?.sourceMessageId === messageId

  const copyCode = async () => {
    if (!selectedFile) {
      return
    }
    try {
      await navigator.clipboard.writeText(selectedFile.content)
      toast.success(`已复制 ${selectedFile.name}`)
    } catch {
      toast.error("无法访问剪贴板")
    }
  }

  return (
    <>
      <Card size="sm" className="mt-4 max-w-3xl">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {bundle.suggestedName}
            <Badge variant="outline">HTML + CSS + JavaScript</Badge>
            {isCreated ? (
              <Badge variant="secondary">
                <CheckIcon data-icon="inline-start" />
                已生成 Mock 草稿
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>{bundle.description}</CardDescription>
          <CardAction className="flex flex-wrap justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <EyeIcon data-icon="inline-start" />
              预览
            </Button>
            <Button
              variant={isCreated ? "secondary" : "outline"}
              size="sm"
              onClick={() =>
                isCreated ? onOpenEditor() : setCreateOpen(true)
              }
            >
              <AppWindowIcon data-icon="inline-start" />
              {isCreated ? "打开 Mock 编辑器" : "添加到应用"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <Tabs
            value={selectedFile?.id}
            onValueChange={(value) => {
              if (value) {
                setSelectedFileId(value)
              }
            }}
          >
            <ScrollArea className="w-full">
              <TabsList variant="line">
                {bundle.files.map((file) => (
                  <TabsTrigger key={file.id} value={file.id}>
                    {file.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {bundle.files.map((file) => (
              <TabsContent key={file.id} value={file.id} className="pt-3">
                <ScrollArea className="h-64 rounded-lg bg-muted/40 ring-1 ring-foreground/10">
                  <pre
                    className="app-selectable-content min-w-max p-4 font-mono text-xs leading-5"
                    tabIndex={0}
                  >
                    <code>{file.content}</code>
                  </pre>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {selectedFile?.language ?? "code"} ·{" "}
            {selectedFile?.content.split("\n").length ?? 0} 行
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => void copyCode()}>
              <CopyIcon data-icon="inline-start" />
              复制代码
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.info("保存文件为前端 Mock", {
                  description: "当前不会打开目录选择器或写入本地文件。",
                })
              }
            >
              <SaveIcon data-icon="inline-start" />
              保存为文件
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AiCodePreviewDialog
        bundle={bundle}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
      <AiAppCreateDialog
        bundle={bundle}
        conversationTitle={conversationTitle}
        messageId={messageId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(input) => onCreateDraft(input, bundle.files)}
        onOpenEditor={onOpenEditor}
      />
    </>
  )
}
