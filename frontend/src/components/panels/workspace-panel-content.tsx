import { useRef, useState } from "react"
import {
  BugIcon,
  ClipboardPasteIcon,
  ChevronDownIcon,
  CircleStopIcon,
  CopyIcon,
  DownloadIcon,
  EraserIcon,
  EyeIcon,
  ListFilterIcon,
  PanelBottomIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  SplitSquareVerticalIcon,
  TerminalIcon,
  TextSelectIcon,
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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { mockDebugEvents, mockLogs, mockSearchMatches } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import { copyTextToClipboard, readTextFromClipboard, selectElementContents, selectedText } from "@/lib/context-menu-utils"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"

function ClearPanelDialog({ open, onOpenChange, title, description, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; onConfirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><EraserIcon /></AlertDialogMedia><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={onConfirm}>确认清空</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}

export function TerminalPanel() {
  const [command, setCommand] = useState("")
  const [clearOpen, setClearOpen] = useState(false)
  const terminalSurfaceRef = useRef<HTMLDivElement>(null)
  const copyTerminal = () => {
    const surfaceText = terminalSurfaceRef.current?.textContent?.trim() ?? ""
    const selection = selectedText()
    const text = selection || surfaceText
    void copyTextToClipboard(text).then((copied) => {
      if (copied) toast.success(selection ? "已复制选中的终端文本" : "已复制终端内容")
      else toast.warning("无法写入剪贴板")
    })
  }
  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b px-2">
        <IconButton label="新建终端" onClick={() => toast.info("可通过面板加号创建新的 Mock 终端")}><PlusIcon /></IconButton>
        <IconButton label="拆分终端" onClick={() => toast.info("终端拆分仅展示交互，不创建真实进程")}><SplitSquareVerticalIcon /></IconButton>
        <IconButton label="停止终端" onClick={() => toast.info("当前没有真实终端进程")}><CircleStopIcon /></IconButton>
        <IconButton label="清空终端" onClick={() => setClearOpen(true)}><EraserIcon /></IconButton>
        <IconButton label="终端设置" onClick={() => toast.info("终端设置将在后续阶段接入")}><SettingsIcon /></IconButton>
        <Badge variant="outline" className="ml-auto">Mock</Badge>
      </div>
      <ContextMenu><ContextMenuTrigger className="min-h-0 flex-1">
        <div ref={terminalSurfaceRef} className="size-full min-h-0">
        <ScrollArea className="app-selectable-content size-full bg-muted/15 p-3 font-mono text-xs" tabIndex={0}>
          <p className="text-muted-foreground">Aestival Mock Terminal · 不会执行任何命令</p>
          <p className="mt-3">$ pwd</p><p>/mock/Aestival</p>
          <p className="mt-2">$ npm run build</p><p className="text-muted-foreground">等待接入真实终端服务…</p>
        </ScrollArea>
        </div>
      </ContextMenuTrigger><ContextMenuContent><ContextMenuGroup><ContextMenuItem onClick={copyTerminal}><CopyIcon />复制选中内容/终端内容<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem><ContextMenuItem onClick={() => { if (terminalSurfaceRef.current) selectElementContents(terminalSurfaceRef.current) }}><TextSelectIcon />全选<ContextMenuShortcut>⌘A</ContextMenuShortcut></ContextMenuItem><ContextMenuItem onClick={() => { void readTextFromClipboard().then((value) => { if (value === null) toast.warning("无法读取剪贴板"); else { setCommand((current) => `${current}${value}`); toast.success("已粘贴到命令输入框") } }) }}><ClipboardPasteIcon />粘贴到命令输入框<ContextMenuShortcut>⌘V</ContextMenuShortcut></ContextMenuItem></ContextMenuGroup><ContextMenuItem variant="destructive" onClick={() => setClearOpen(true)}><EraserIcon />清空视图<ContextMenuShortcut>⌘K</ContextMenuShortcut></ContextMenuItem></ContextMenuContent></ContextMenu>
      <form className="flex items-center gap-2 border-t p-2" onSubmit={(event) => { event.preventDefault(); if (!command.trim()) return; toast.info(`Mock：未执行 “${command.trim()}”`); setCommand("") }}>
        <TerminalIcon className="size-4 text-muted-foreground" />
        <Input className="h-7 border-0 font-mono text-xs shadow-none" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="输入命令（仅 Mock，不执行）" aria-label="Mock 终端命令" />
        <IconButton type="submit" label="提交 Mock 命令" disabled={!command.trim()}><PlayIcon /></IconButton>
      </form>
      <ClearPanelDialog open={clearOpen} onOpenChange={setClearOpen} title="清空终端视图？" description="当前只会清除可见的 Mock 输出，不会停止进程、删除历史或执行任何命令。" onConfirm={() => toast.success("Mock 终端视图已清空")} />
    </div>
  )
}

export function SearchPanel() {
  const query = useWorkspacePanelStore((state) => state.searchQuery)
  const replace = useWorkspacePanelStore((state) => state.replaceQuery)
  const replaceOpen = useWorkspacePanelStore((state) => state.replaceOpen)
  const options = useWorkspacePanelStore((state) => state.searchOptions)
  const dialogOpen = useWorkspacePanelStore((state) => state.replaceDialogOpen)
  const setQuery = useWorkspacePanelStore((state) => state.setSearchQuery)
  const setReplace = useWorkspacePanelStore((state) => state.setReplaceQuery)
  const setReplaceOpen = useWorkspacePanelStore((state) => state.setReplaceOpen)
  const setOptions = useWorkspacePanelStore((state) => state.setSearchOptions)
  const setDialogOpen = useWorkspacePanelStore((state) => state.setReplaceDialogOpen)
  const visible = mockSearchMatches.filter((match) => !query || `${match.before}${match.match}${match.after}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="flex size-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col gap-2 border-b p-2">
        <div className="flex gap-1"><IconButton label="展开替换" aria-expanded={replaceOpen} onClick={() => setReplaceOpen(!replaceOpen)}><ChevronDownIcon className={cn("transition-transform", !replaceOpen && "-rotate-90")} /></IconButton><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索文件内容" /></div>
        {replaceOpen ? <div className="flex gap-1 pl-8"><Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="替换为" /><Button variant="outline" onClick={() => setDialogOpen(true)}>全部替换</Button></div> : null}
        <ToggleGroup multiple value={options} onValueChange={(value) => setOptions(value)} size="sm" aria-label="搜索选项">
          <ToggleGroupItem value="case" aria-label="区分大小写">Aa</ToggleGroupItem><ToggleGroupItem value="word" aria-label="全字匹配">Ab</ToggleGroupItem><ToggleGroupItem value="regex" aria-label="正则表达式">.*</ToggleGroupItem>
        </ToggleGroup>
        <div className="grid grid-cols-2 gap-2"><Input placeholder="包含文件，例如 src/**" /><Input placeholder="排除文件，例如 dist/**" /></div>
      </div>
      <ScrollArea className="min-h-0 flex-1 p-2">
        <p className="mb-2 text-xs text-muted-foreground">{visible.length} 个 Mock 结果</p>
        <div className="flex flex-col gap-1">{visible.map((match) => <Button key={match.id} variant="ghost" className="h-auto w-full flex-col items-start rounded-md p-2 text-left text-xs" onClick={() => useWorkspacePanelStore.getState().openFile(match.fileId, true)}><span className="block max-w-full truncate font-medium">{match.path}:{match.line}</span><span className="app-selectable-content max-w-full truncate text-muted-foreground">{match.before}<mark className="bg-accent text-accent-foreground">{match.match}</mark>{match.after}</span></Button>)}</div>
      </ScrollArea>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>替换全部 Mock 结果？</AlertDialogTitle><AlertDialogDescription>此操作只演示确认流程，不会修改本地文件。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => toast.success("Mock：未写入任何文件")}>确认替换</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

export function LogsPanel() {
  const [clearOpen, setClearOpen] = useState(false)
  const source = useWorkspacePanelStore((state) => state.logSource)
  const level = useWorkspacePanelStore((state) => state.logLevel)
  const query = useWorkspacePanelStore((state) => state.logQuery)
  const auto = useWorkspacePanelStore((state) => state.autoScrollLogs)
  const cleared = useWorkspacePanelStore((state) => state.logsCleared)
  const setSource = useWorkspacePanelStore((state) => state.setLogSource)
  const setLevel = useWorkspacePanelStore((state) => state.setLogLevel)
  const setQuery = useWorkspacePanelStore((state) => state.setLogQuery)
  const entries = cleared ? [] : mockLogs.filter((log) => (source === "all" || log.source === source) && (level === "all" || log.level === level) && (!query || log.message.toLowerCase().includes(query.toLowerCase())))
  return <div className="flex size-full min-h-0 flex-col"><div className="flex flex-wrap items-center gap-1 border-b p-2"><Select value={source} onValueChange={(value) => value && setSource(value)}><SelectTrigger size="sm"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{["all","应用","代理","MCP","任务","应用运行"].map((x) => <SelectItem key={x} value={x}>{x === "all" ? "全部来源" : x}</SelectItem>)}</SelectGroup></SelectContent></Select><Select value={level} onValueChange={(value) => value && setLevel(value)}><SelectTrigger size="sm"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{["all","Trace","Debug","Info","Warn","Error"].map((x) => <SelectItem key={x} value={x}>{x === "all" ? "全部级别" : x}</SelectItem>)}</SelectGroup></SelectContent></Select><Input className="h-7 min-w-28 flex-1" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="筛选日志" /><label className="flex items-center gap-1 text-xs"><Switch checked={auto} onCheckedChange={useWorkspacePanelStore.getState().setAutoScrollLogs} />自动滚动</label><IconButton label="清空日志视图" onClick={() => setClearOpen(true)}><EraserIcon /></IconButton><IconButton label="导出脱敏日志" onClick={() => toast.success("已生成脱敏日志导出（Mock）")}><DownloadIcon /></IconButton></div><ScrollArea className="app-selectable-content min-h-0 flex-1 p-2"><div className="flex flex-col gap-1">{entries.length ? entries.map((log) => <Collapsible key={log.id}><CollapsibleTrigger className="grid w-full grid-cols-[4.5rem_3.5rem_4.5rem_minmax(0,1fr)] gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-accent"><span className="text-muted-foreground">{log.time}</span><Badge variant="outline">{log.level}</Badge><span>{log.source}</span><span className="truncate">{log.message}</span></CollapsibleTrigger><CollapsibleContent className="ml-2 border-l px-3 py-2 text-xs text-muted-foreground">{Object.entries(log.details).map(([key,value]) => <p key={key}><span className="font-medium text-foreground">{key}:</span> {value}</p>)}</CollapsibleContent></Collapsible>) : <Alert><ListFilterIcon /><AlertTitle>日志视图为空</AlertTitle><AlertDescription><Button variant="link" className="h-auto p-0" onClick={useWorkspacePanelStore.getState().restoreLogsView}>恢复 Mock 日志</Button></AlertDescription></Alert>}</div></ScrollArea><ClearPanelDialog open={clearOpen} onOpenChange={setClearOpen} title="清空日志视图？" description="只会隐藏当前前端 Mock 日志；不会删除本地日志文件或改变未来日志采集设置。" onConfirm={useWorkspacePanelStore.getState().clearLogsView} /></div>
}

export function DebugPanel() {
  const selectedId = useWorkspacePanelStore((state) => state.selectedDebugEventId)
  const tab = useWorkspacePanelStore((state) => state.debugTab)
  const dialogOpen = useWorkspacePanelStore((state) => state.sensitiveDialogOpen)
  const selected = mockDebugEvents.find((event) => event.id === selectedId) ?? mockDebugEvents[0]
  if (!selected) return null
  const contents = { overview: selected.message, request: selected.request, response: selected.response, tools: selected.tool, tokens: selected.tokens, raw: selected.raw }
  return <div className="flex size-full min-h-0 flex-col md:flex-row"><ScrollArea className="min-h-32 border-b md:w-48 md:border-r md:border-b-0"><div className="p-1">{mockDebugEvents.map((event) => <Button key={event.id} variant="ghost" onClick={() => useWorkspacePanelStore.getState().setSelectedDebugEventId(event.id)} className={cn("h-auto w-full flex-col items-start rounded-md p-2 text-left text-xs", event.id === selected.id && "bg-accent")}><span className="font-medium">{event.type}</span><span className="text-muted-foreground">{event.time} · {event.duration}</span></Button>)}</div></ScrollArea><div className="flex min-h-0 flex-1 flex-col"><div className="flex items-center gap-2 border-b p-2"><BugIcon className="size-4" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{selected.type} · {selected.model}</span><IconButton label="复制调试详情" onClick={() => toast.success("已复制脱敏详情（Mock）")}><CopyIcon /></IconButton><IconButton label="查看敏感字段" onClick={() => useWorkspacePanelStore.getState().setSensitiveDialogOpen(true)}><EyeIcon /></IconButton></div><Tabs value={tab} onValueChange={(value) => useWorkspacePanelStore.getState().setDebugTab(value as typeof tab)} className="min-h-0 flex-1 gap-0"><TabsList variant="line" className="w-full justify-start overflow-x-auto border-b px-2">{Object.entries({overview:"概览",request:"请求",response:"响应",tools:"工具",tokens:"Token",raw:"原始"}).map(([value,label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}</TabsList>{Object.keys(contents).map((key) => <TabsContent key={key} value={key} className="min-h-0"><ScrollArea className="app-selectable-content size-full p-3"><pre className="whitespace-pre-wrap text-xs">{contents[key as keyof typeof contents]}</pre></ScrollArea></TabsContent>)}</Tabs></div><AlertDialog open={dialogOpen} onOpenChange={useWorkspacePanelStore.getState().setSensitiveDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>敏感字段保持隐藏</AlertDialogTitle><AlertDialogDescription>真实密钥、Cookie 和 Authorization 不应进入普通前端状态。当前 Mock 只演示审批入口。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={() => toast.info("Mock 数据中没有可显示的敏感值")}>继续</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
}

export function EmptyPanelSelection({ onAdd }: { onAdd: () => void }) { return <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center"><PanelBottomIcon className="size-8 text-muted-foreground" /><div><p className="text-sm font-medium">没有打开的面板</p><p className="text-xs text-muted-foreground">添加文件、终端、搜索、日志或会话调试面板。</p></div><Button variant="outline" onClick={onAdd}><PlusIcon data-icon="inline-start" />添加面板</Button></div> }
