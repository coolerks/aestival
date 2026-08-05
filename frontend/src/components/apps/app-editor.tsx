import { useDeferredValue, useMemo, useRef } from "react"
import Editor from "@monaco-editor/react"
import {
  ArrowLeftIcon,
  BugIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  ExternalLinkIcon,
  FileCode2Icon,
  FolderTreeIcon,
  MoreHorizontalIcon,
  PanelBottomCloseIcon,
  PanelBottomOpenIcon,
  PlayIcon,
  PlusIcon,
  Redo2Icon,
  RefreshCwIcon,
  SaveIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TabletIcon,
  Undo2Icon,
} from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MonacoContextMenu, type MonacoEditorInstance } from "@/components/shared/monaco-context-menu"
import { DropdownMenuIconTrigger } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { createMockPreviewDocument } from "@/data/mock-ai-app"
import { cn } from "@/lib/utils"
import "@/lib/monaco-environment"
import { useAppStore } from "@/store/app-store"

function ToolButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} />}>{children}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}

function PreviewSurface({ document, name, errorMessage, size }: { document: string; name: string; errorMessage?: string; size: "desktop" | "tablet" | "mobile" }) {
  const width = size === "mobile" ? "max-w-[390px]" : size === "tablet" ? "max-w-[768px]" : "max-w-none"
  return (
    <div className="flex size-full min-h-0 flex-col bg-muted/30">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b bg-background px-2">
        <ToolButton label="后退"><ChevronLeftIcon /></ToolButton><ToolButton label="前进"><ChevronRightIcon /></ToolButton><ToolButton label="刷新预览" onClick={() => toast.info("已刷新受限 Mock 预览")}><RefreshCwIcon /></ToolButton>
        <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">aestival-app://{name}</span>
        <ToolButton label="开发者工具" onClick={() => toast.info("开发者工具面板为 Mock") }><BugIcon /></ToolButton>
        <ToolButton label="在新窗口运行" onClick={() => toast.info("应用窗口服务尚未接入") }><ExternalLinkIcon /></ToolButton>
      </div>
      {errorMessage ? <Alert variant="destructive" className="m-2 shrink-0"><BugIcon /><AlertTitle>预览使用上次成功版本</AlertTitle><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-3">
        <iframe title={`${name} 受限 Mock 预览`} sandbox="allow-scripts" srcDoc={document} className={cn("h-full w-full rounded-lg bg-background shadow-sm ring-1 ring-foreground/10", width)} />
      </div>
    </div>
  )
}

function FilePanel({ appId, files, activeFileId, onSelect }: { appId: string; files: { id: string; name: string; language: string }[]; activeFileId: string | null; onSelect: (id: string) => void }) {
  return <div className="flex size-full min-h-0 flex-col bg-muted/20"><div className="flex h-10 shrink-0 items-center justify-between border-b px-3"><span className="text-xs font-medium text-muted-foreground">源文件</span><ToolButton label="新建文件" onClick={() => toast.info("文件创建为前端 Mock") }><PlusIcon /></ToolButton></div><ScrollArea className="min-h-0 flex-1"><div className="grid gap-0.5 p-2">{files.map((file) => <Button key={file.id} variant={file.id === activeFileId ? "secondary" : "ghost"} className="h-8 justify-start px-2 font-normal" onClick={() => onSelect(file.id)}><FileCode2Icon data-icon="inline-start" /><span className="truncate">{file.name}</span></Button>)}</div></ScrollArea><div className="border-t p-2 text-[11px] text-muted-foreground">{appId.startsWith("mock-app") ? "来自会话的未保存草稿" : "本地应用 Mock"}</div></div>
}

function CodeSurface({ name, language, content, onChange }: { name: string; language: string; content: string; onChange: (value: string) => void }) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<MonacoEditorInstance | null>(null)
  return <div className="flex size-full min-h-0 flex-col"><div className="flex h-10 shrink-0 items-center gap-2 border-b px-3"><FileCode2Icon className="size-4" /><span className="truncate text-sm font-medium">{name}</span><Badge variant="outline">{language}</Badge><span className="flex-1" /><ToolButton label="撤销"><Undo2Icon /></ToolButton><ToolButton label="重做"><Redo2Icon /></ToolButton></div><div className="app-selectable-content min-h-0 flex-1"><MonacoContextMenu editorRef={editorRef}><Editor path={name} language={language} value={content} onChange={(value) => onChange(value ?? "")} onMount={(editor) => { editorRef.current = editor }} theme={resolvedTheme === "dark" ? "vs-dark" : "vs"} loading={<div className="grid size-full place-items-center text-xs text-muted-foreground">正在加载本地代码编辑器…</div>} options={{ ariaLabel: `编辑 ${name}`, automaticLayout: true, contextmenu: false, fontFamily: "Geist Mono, ui-monospace, monospace", fontSize: 12, lineNumbersMinChars: 3, minimap: { enabled: false }, overviewRulerLanes: 0, padding: { top: 12, bottom: 12 }, scrollBeyondLastLine: false, tabSize: 2, wordWrap: "on" }} /></MonacoContextMenu></div><div className="flex h-7 shrink-0 items-center justify-between border-t px-3 text-[11px] text-muted-foreground"><span>{language} · UTF-8 · 空格: 2</span><span>{content.split("\n").length} 行</span></div></div>
}

function DebugPanel({ appName }: { appName: string }) {
  return <Tabs defaultValue="console" className="flex size-full min-h-0 flex-col"><div className="flex h-9 shrink-0 items-center border-b px-2"><TabsList variant="line"><TabsTrigger value="console">控制台</TabsTrigger><TabsTrigger value="network">网络</TabsTrigger><TabsTrigger value="permissions">权限日志</TabsTrigger></TabsList></div><TabsContent value="console" className="app-selectable-content min-h-0 flex-1 overflow-auto p-3 font-mono text-xs"><p className="text-muted-foreground">[Mock] {appName} 预览已装载。</p><p>受限 iframe：网络、文件与宿主 DOM 默认不可访问。</p></TabsContent><TabsContent value="network" className="p-3 text-xs text-muted-foreground">没有网络请求。网络权限默认关闭。</TabsContent><TabsContent value="permissions" className="p-3 text-xs text-muted-foreground">本次预览没有触发权限请求。</TabsContent></Tabs>
}

export function AppEditor() {
  const apps = useAppStore((state) => state.apps)
  const selectedAppId = useAppStore((state) => state.selectedAppId)
  const activeFileId = useAppStore((state) => state.activeFileId)
  const debugOpen = useAppStore((state) => state.debugOpen)
  const previewSize = useAppStore((state) => state.previewSize)
  const closeEditor = useAppStore((state) => state.closeEditor)
  const setActiveFile = useAppStore((state) => state.setActiveFile)
  const updateActiveFile = useAppStore((state) => state.updateActiveFile)
  const saveApp = useAppStore((state) => state.saveApp)
  const setDialog = useAppStore((state) => state.setDialog)
  const setDebugOpen = useAppStore((state) => state.setDebugOpen)
  const setPreviewSize = useAppStore((state) => state.setPreviewSize)
  const app = apps.find((item) => item.id === selectedAppId)
  const activeFile = app?.files.find((file) => file.id === activeFileId) ?? app?.files[0]
  const deferredFiles = useDeferredValue(app?.files ?? [])
  const previewDocument = useMemo(() => createMockPreviewDocument(deferredFiles), [deferredFiles])

  if (!app || !activeFile) {
    return <div className="grid size-full place-items-center"><Button onClick={closeEditor}><ArrowLeftIcon data-icon="inline-start" />返回应用中心</Button></div>
  }

  const preview = <PreviewSurface document={previewDocument} name={app.name} errorMessage={app.errorMessage} size={previewSize} />
  const files = <FilePanel appId={app.id} files={app.files} activeFileId={activeFile.id} onSelect={setActiveFile} />
  const code = <CodeSurface name={activeFile.name} language={activeFile.language} content={activeFile.content} onChange={updateActiveFile} />

  return (
    <section className="flex size-full min-h-0 flex-col" aria-label={`${app.name} 应用编辑器`}>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <Button variant="ghost" size="sm" onClick={closeEditor}><ArrowLeftIcon data-icon="inline-start" />应用中心</Button>
        <SeparatorLike />
        <Badge variant={app.status === "error" ? "destructive" : app.status === "draft" ? "outline" : "secondary"}>{app.status === "draft" ? "未保存" : app.status === "error" ? "预览错误" : "已保存"}</Badge>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">入口：{app.entryFile}</span>
        <Select value={previewSize} onValueChange={(value) => setPreviewSize(value as typeof previewSize)}><SelectTrigger size="sm" aria-label="预览尺寸"><SelectValue>{previewSize === "desktop" ? "桌面" : previewSize === "tablet" ? "平板" : "手机"}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="desktop"><FolderTreeIcon />桌面</SelectItem><SelectItem value="tablet"><TabletIcon />平板</SelectItem><SelectItem value="mobile"><SmartphoneIcon />手机</SelectItem></SelectGroup></SelectContent></Select>
        <Button variant="outline" size="sm" onClick={() => setDialog("permissions", app.id)}><ShieldCheckIcon data-icon="inline-start" />权限</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info("应用窗口服务尚未接入") }><PlayIcon data-icon="inline-start" />运行</Button>
        <Button size="sm" onClick={() => { saveApp(); toast.success("已保存到前端 Mock 状态") }}><SaveIcon data-icon="inline-start" />保存</Button>
        <DropdownMenu><DropdownMenuIconTrigger label="应用编辑器更多操作"><MoreHorizontalIcon /></DropdownMenuIconTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => toast.info("导出为 Mock") }><ExternalLinkIcon />导出应用</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("源码尚未写入磁盘") }><FolderTreeIcon />显示源文件</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
      </div>

      <div className="hidden min-h-0 flex-1 lg:block">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel id="app-workbench" minSize="55%">
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel id="app-files" defaultSize="17%" minSize="160px" maxSize="260px">{files}</ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="app-code" defaultSize="43%" minSize="280px">{code}</ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="app-preview" defaultSize="40%" minSize="320px">{preview}</ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          {debugOpen ? <><ResizableHandle withHandle /><ResizablePanel id="app-debug" defaultSize="24%" minSize="120px" maxSize="40%"><DebugPanel appName={app.name} /></ResizablePanel></> : null}
        </ResizablePanelGroup>
      </div>

      <Tabs defaultValue="code" className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex items-center justify-between border-b px-2"><TabsList variant="line"><TabsTrigger value="files"><FolderTreeIcon />文件</TabsTrigger><TabsTrigger value="code"><Code2Icon />代码</TabsTrigger><TabsTrigger value="preview"><PlayIcon />预览</TabsTrigger><TabsTrigger value="debug"><BugIcon />调试</TabsTrigger></TabsList></div>
        <TabsContent value="files" className="min-h-0 flex-1">{files}</TabsContent><TabsContent value="code" className="min-h-0 flex-1">{code}</TabsContent><TabsContent value="preview" className="min-h-0 flex-1">{preview}</TabsContent><TabsContent value="debug" className="min-h-0 flex-1"><DebugPanel appName={app.name} /></TabsContent>
      </Tabs>
      <Button variant="ghost" size="sm" className="absolute right-3 bottom-3 z-10 hidden lg:flex" onClick={() => setDebugOpen(!debugOpen)}>{debugOpen ? <PanelBottomCloseIcon data-icon="inline-start" /> : <PanelBottomOpenIcon data-icon="inline-start" />}{debugOpen ? "收起调试" : "打开调试"}</Button>
    </section>
  )
}

function SeparatorLike() {
  return <span className="h-5 w-px bg-border" aria-hidden="true" />
}
