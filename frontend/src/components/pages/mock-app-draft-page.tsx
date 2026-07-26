import { useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  Code2Icon,
  EyeIcon,
  PlayIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  createMockPreviewDocument,
  type MockAppDraft,
} from "@/data/mock-ai-app"
import { useWorkspaceStore } from "@/store/workspace-store"

type MockAppDraftPageProps = {
  draft: MockAppDraft
}

export function MockAppDraftPage({ draft }: MockAppDraftPageProps) {
  const [view, setView] = useState("code")
  const [selectedFileId, setSelectedFileId] = useState(
    draft.files[0]?.id ?? ""
  )
  const returnToSourceConversation = useWorkspaceStore(
    (state) => state.returnToSourceConversation
  )
  const selectedFile =
    draft.files.find((file) => file.id === selectedFileId) ??
    draft.files[0]
  const previewDocument = useMemo(
    () => createMockPreviewDocument(draft.files),
    [draft.files]
  )

  return (
    <section
      className="flex min-h-0 flex-1 flex-col bg-background"
      aria-label={`${draft.name} Mock 应用编辑器`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={returnToSourceConversation}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          返回来源会话
        </Button>
        <Badge variant="secondary">未保存 Mock 草稿</Badge>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          来源：{draft.sourceConversation} · {draft.sourceModel}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView("preview")}
        >
          <PlayIcon data-icon="inline-start" />
          运行预览
        </Button>
      </div>

      <div className="min-h-0 flex-1 p-4">
        <Tabs
          value={view}
          onValueChange={(value) => {
            if (value) {
              setView(value)
            }
          }}
          className="flex h-full min-h-0 flex-col"
        >
          <TabsList variant="line">
            <TabsTrigger value="code">
              <Code2Icon data-icon="inline-start" />
              代码
            </TabsTrigger>
            <TabsTrigger value="preview">
              <EyeIcon data-icon="inline-start" />
              实时预览
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <ShieldCheckIcon data-icon="inline-start" />
              权限
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="min-h-0 flex-1 pt-3">
            <Tabs
              value={selectedFile?.id}
              onValueChange={(value) => {
                if (value) {
                  setSelectedFileId(value)
                }
              }}
              className="flex h-full min-h-0 flex-col"
            >
              <ScrollArea className="w-full shrink-0">
                <TabsList variant="line">
                  {draft.files.map((file) => (
                    <TabsTrigger key={file.id} value={file.id}>
                      {file.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {draft.files.map((file) => (
                <TabsContent
                  key={file.id}
                  value={file.id}
                  className="min-h-0 flex-1 pt-3"
                >
                  <ScrollArea className="size-full rounded-xl bg-muted/40 ring-1 ring-foreground/10">
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

          <TabsContent value="preview" className="min-h-0 flex-1 pt-3">
            <div className="flex size-full min-h-80 flex-col overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full bg-muted-foreground/35"
                  aria-hidden="true"
                />
                <span>
                  {draft.windowSize} · sandbox · 权限策略仅作 Mock 展示
                </span>
              </div>
              <iframe
                title={`${draft.name} Mock 编辑器预览`}
                sandbox="allow-scripts"
                srcDoc={previewDocument}
                className="min-h-0 flex-1 bg-background"
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="pt-3">
            <Alert>
              <ShieldCheckIcon aria-hidden="true" />
              <AlertTitle>当前 Mock 权限摘要</AlertTitle>
              <AlertDescription>
                网络：
                {draft.networkPolicy === "off"
                  ? "关闭"
                  : draft.networkPolicy === "allowlist"
                    ? `仅 ${draft.allowedDomains}`
                    : "全部网络"}
                ；文件：{draft.fileAccess ? "已选择" : "关闭"}；剪贴板读取：
                {draft.clipboardRead ? "已选择" : "关闭"}；剪贴板写入：
                {draft.clipboardWrite ? "已选择" : "关闭"}。这些设置尚未写入权限存储。
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
