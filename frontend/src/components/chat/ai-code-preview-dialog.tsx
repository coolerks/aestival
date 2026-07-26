import { useMemo, useState } from "react"
import { Code2Icon, EyeIcon, ShieldCheckIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  createMockPreviewDocument,
  type MockAiCodeBundle,
} from "@/data/mock-ai-app"

type AiCodePreviewDialogProps = {
  bundle: MockAiCodeBundle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiCodePreviewDialog({
  bundle,
  open,
  onOpenChange,
}: AiCodePreviewDialogProps) {
  const [selectedFileId, setSelectedFileId] = useState(
    bundle.files[0]?.id ?? ""
  )
  const previewDocument = useMemo(
    () => createMockPreviewDocument(bundle.files),
    [bundle.files]
  )
  const selectedFile =
    bundle.files.find((file) => file.id === selectedFileId) ??
    bundle.files[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>预览 · {bundle.suggestedName}</DialogTitle>
            <Badge variant="secondary">前端 Mock</Badge>
          </div>
          <DialogDescription>
            组合本条消息中的 HTML、CSS 和 JavaScript，在独立来源的受限 iframe
            中预览。
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <ShieldCheckIcon aria-hidden="true" />
          <AlertTitle>受限样例预览</AlertTitle>
          <AlertDescription>
            iframe 不共享 Aestival 的存储和 DOM；当前固定样例不包含网络、文件或剪贴板请求。
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="preview">
          <TabsList variant="line">
            <TabsTrigger value="preview">
              <EyeIcon data-icon="inline-start" />
              预览
            </TabsTrigger>
            <TabsTrigger value="source">
              <Code2Icon data-icon="inline-start" />
              源码
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="pt-3">
            <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full bg-muted-foreground/35"
                  aria-hidden="true"
                />
                <span>安全 Mock 预览 · 本地代码组合</span>
              </div>
              <iframe
                title={`${bundle.suggestedName} Mock 预览`}
                sandbox="allow-scripts"
                srcDoc={previewDocument}
                className="h-[420px] w-full bg-background"
              />
            </div>
          </TabsContent>
          <TabsContent value="source" className="pt-3">
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
                  <ScrollArea className="h-[390px] rounded-xl bg-muted/40 ring-1 ring-foreground/10">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
