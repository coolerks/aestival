import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import {
  AlertTriangleIcon,
  BinaryIcon,
  Columns2Icon,
  CopyIcon,
  FileWarningIcon,
  LockIcon,
  RefreshCwIcon,
  SaveIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IconButton } from "@/components/shell/icon-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockFiles, type MockFile } from "@/data/mock-workspace-panels"
import "@/lib/monaco-environment"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"

import appIcon from "@/assets/icons/application/logo.svg"

function CodePreview({ file }: { file: MockFile }) {
  const { resolvedTheme } = useTheme()
  const language = file.kind === "json" ? "json" : file.name.endsWith(".tsx") ? "typescript" : "plaintext"
  return <Editor path={`mock://${file.path}`} language={language} defaultValue={file.content} theme={resolvedTheme === "dark" ? "vs-dark" : "vs"} loading={<div className="grid size-full place-items-center text-xs text-muted-foreground">正在加载本地代码编辑器…</div>} options={{ ariaLabel: `预览 ${file.name}`, automaticLayout: true, contextmenu: false, fontFamily: "Geist Mono, ui-monospace, monospace", fontSize: 12, lineNumbersMinChars: 3, minimap: { enabled: false }, overviewRulerLanes: 0, padding: { top: 12, bottom: 12 }, readOnly: file.readonly, scrollBeyondLastLine: false, tabSize: 2, wordWrap: "on" }} />
}

function MarkdownPreview({ file }: { file: MockFile }) {
  return <Tabs defaultValue="preview" className="size-full gap-0"><TabsList variant="line" className="w-full justify-start border-b px-3"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="source">源代码</TabsTrigger></TabsList><TabsContent value="preview" className="min-h-0"><ScrollArea className="app-selectable-content size-full"><article className="mx-auto flex max-w-3xl flex-col gap-4 p-8"><h1 className="text-2xl font-semibold">Aestival</h1><p>本地优先、无登录的桌面 AI Agent 工作区。</p><h2 className="text-lg font-medium">当前阶段</h2><p>正在实现工作区面板与安全文件预览。</p></article></ScrollArea></TabsContent><TabsContent value="source" className="min-h-0"><CodePreview file={file} /></TabsContent></Tabs>
}

function CsvPreview({ file }: { file: MockFile }) {
  const rows = file.content.split("\n").map((row) => row.split(","))
  return <ScrollArea className="app-selectable-content size-full p-4"><Table><TableHeader><TableRow>{rows[0]?.map((cell) => <TableHead key={cell}>{cell}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.slice(1).map((row) => <TableRow key={row.join("-")}>{row.map((cell, index) => <TableCell key={`${cell}-${index}`}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table></ScrollArea>
}

function PdfPreview({ file }: { file: MockFile }) {
  return <ScrollArea className="app-selectable-content size-full bg-muted/30"><div className="mx-auto flex max-w-2xl flex-col gap-4 p-6"><Alert><LockIcon /><AlertTitle>安全 PDF 预览</AlertTitle><AlertDescription>脚本、表单提交和外部资源已禁用。{file.content}</AlertDescription></Alert>{[1,2,3].map((page) => <div key={page} className="aspect-[1/1.414] rounded-sm border bg-background p-10 shadow-sm"><p className="text-xs text-muted-foreground">第 {page} 页</p><h2 className="mt-8 text-xl font-semibold">Aestival 工作区设计说明</h2><div className="mt-6 h-px bg-border" /><p className="mt-6 text-sm text-muted-foreground">这是安全的本地 Mock 页面，不会加载真实 PDF 内容或外部链接。</p></div>)}</div></ScrollArea>
}

function FileSurface({ file }: { file: MockFile }) {
  if (file.kind === "code" || file.kind === "json") return <CodePreview file={file} />
  if (file.kind === "markdown") return <MarkdownPreview file={file} />
  if (file.kind === "csv") return <CsvPreview file={file} />
  if (file.kind === "image") return <div className="grid size-full place-items-center bg-muted/20 p-8"><AspectRatio ratio={16/9} className="w-full max-w-xl rounded-lg border bg-background"><img src={appIcon} alt="Aestival 应用图标安全预览" className="size-full object-contain p-12" /></AspectRatio></div>
  if (file.kind === "pdf") return <PdfPreview file={file} />
  return <div className="flex size-full flex-col gap-4 p-6"><Alert variant="destructive"><FileWarningIcon /><AlertTitle>大型二进制文件</AlertTitle><AlertDescription>{file.size}，默认不加载完整内容，以防内存占用过高。</AlertDescription></Alert><div className="app-selectable-content rounded-lg border bg-muted/20 p-4 font-mono text-xs"><BinaryIcon className="mb-3 size-5" />{file.content}</div></div>
}

export function WorkspaceFilePreview({ fileId }: { fileId: string }) {
  const file = mockFiles.find((item) => item.id === fileId)
  const closeId = useWorkspacePanelStore((state) => state.closeFileDialogId)
  if (!file) return null
  return <div className="flex size-full min-h-0 flex-col">
    <div className="flex h-9 shrink-0 items-center gap-1 border-b px-3 text-xs"><span className="text-muted-foreground">Aestival</span><span>/</span><span className="text-muted-foreground">{file.parent}</span><span>/</span><span className="font-medium">{file.name}</span><span className="flex-1" />{file.readonly ? <Badge variant="outline"><LockIcon />只读</Badge> : null}{file.dirty ? <Badge variant="secondary">未保存</Badge> : null}{file.externalChange ? <Badge variant="outline"><AlertTriangleIcon />外部变更</Badge> : null}<IconButton label="保存文件" onClick={() => toast.info("Mock：不会写入本地文件")}><SaveIcon /></IconButton></div>
    <ContextMenu><ContextMenuTrigger className="app-selectable-content min-h-0 flex-1"><FileSurface file={file} /></ContextMenuTrigger><ContextMenuContent><ContextMenuGroup><ContextMenuItem onClick={() => toast.success("文件路径已复制（Mock）")}><CopyIcon />复制路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut></ContextMenuItem><ContextMenuItem onClick={() => toast.info("Mock：不会写入本地文件")}><SaveIcon />保存<ContextMenuShortcut>⌘S</ContextMenuShortcut></ContextMenuItem><ContextMenuItem onClick={() => useWorkspacePanelStore.getState().requestCloseFile(file.id)}><XIcon />关闭文件<ContextMenuShortcut>⌘W</ContextMenuShortcut></ContextMenuItem></ContextMenuGroup></ContextMenuContent></ContextMenu>
    <div className="flex h-7 shrink-0 items-center gap-3 border-t px-3 text-[11px] text-muted-foreground"><span>{file.language}</span><span>{file.encoding}</span><span>{file.lineEnding}</span><span className="ml-auto">{file.size} · {file.modifiedAt}</span></div>
    <AlertDialog open={closeId === file.id} onOpenChange={(open) => { if (!open) useWorkspacePanelStore.getState().setCloseFileDialogId(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{file.externalChange ? "文件已在外部改变" : "保存文件更改？"}</AlertDialogTitle><AlertDialogDescription>{file.externalChange ? "可比较、重新载入或覆盖。当前 Mock 不会读写真实文件。" : "关闭前请选择如何处理未保存内容；当前操作只改变 Mock 标签状态。"}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel>{file.externalChange ? <><Button variant="outline" onClick={() => toast.info("Mock：打开差异比较视图")}><Columns2Icon data-icon="inline-start" />比较</Button><Button variant="outline" onClick={() => useWorkspacePanelStore.getState().closeFile(file.id)}><RefreshCwIcon data-icon="inline-start" />重新载入</Button></> : <Button variant="outline" onClick={() => useWorkspacePanelStore.getState().closeFile(file.id)}>不保存</Button>}<AlertDialogAction variant={file.externalChange ? "destructive" : "default"} onClick={() => { toast.success(file.externalChange ? "Mock：未覆盖本地文件" : "Mock：未写入本地文件"); useWorkspacePanelStore.getState().closeFile(file.id) }}>{file.externalChange ? "覆盖" : "保存"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}
