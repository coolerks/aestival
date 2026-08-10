import { lazy, Suspense, useEffect, useState } from "react"
import type { DragEvent } from "react"
import {
  BugIcon,
  FilePlusIcon,
  FileSearchIcon,
  FilesIcon,
  GripVerticalIcon,
  LogsIcon,
  MoreHorizontalIcon,
  PanelBottomIcon,
  PanelRightIcon,
  PinIcon,
  PlusIcon,
  RefreshCwIcon,
  ListTodoIcon,
  TerminalIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { panelTypeLabels, type WorkspacePanelInstance, type WorkspacePanelPlacement, type WorkspacePanelType } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import { FilesPanel } from "./files-panel"
import { DebugPanel, EmptyPanelSelection, LogsPanel, SearchPanel, TerminalPanel } from "./workspace-panel-content"

const ProjectBoardPanel = lazy(() => import("@/components/project-board/project-board-surface").then((module) => ({ default: () => <module.ProjectBoardSurface surface="right" /> })))

const panelIcons = { files: FilesIcon, terminal: TerminalIcon, search: FileSearchIcon, logs: LogsIcon, debug: BugIcon, board: ListTodoIcon}
const panelTypes = Object.keys(panelTypeLabels) as WorkspacePanelType[]

function ensurePlacementOpen(placement: WorkspacePanelPlacement) {
  const shell = useWorkspaceStore.getState()
  if (placement === "right" && !shell.rightPanelOpen) shell.toggleRightPanel()
  if (placement === "bottom" && !shell.bottomPanelOpen) shell.toggleBottomPanel()
}

function AddPanelMenu({ placement }: { placement: WorkspacePanelPlacement }) {
  const openPanel = useWorkspacePanelStore((state) => state.openPanel)
  const availableTypes = panelTypes.filter((type) => placement === "right" || type !== "board")
  return <DropdownMenu><Tooltip><TooltipTrigger render={<DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="添加面板" />} />}><PlusIcon /></TooltipTrigger><TooltipContent>添加面板</TooltipContent></Tooltip><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>添加到{placement === "right" ? "右侧" : "底部"}</DropdownMenuLabel>{availableTypes.map((type) => { const Icon = panelIcons[type]; return <DropdownMenuItem key={type} onClick={() => { openPanel(type, placement); ensurePlacementOpen(placement) }}><Icon />{panelTypeLabels[type]}{type === "terminal" ? null : <span className="ml-auto text-xs text-muted-foreground">单例</span>}</DropdownMenuItem> })}</DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
}

function PanelBody({ panel }: { panel: WorkspacePanelInstance }) {
  if (panel.type === "files") return <FilesPanel />
  if (panel.type === "terminal") return <TerminalPanel />
  if (panel.type === "search") return <SearchPanel />
  if (panel.type === "logs") return <LogsPanel />
  if (panel.type === "board") return <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">正在加载项目看板…</div>}><ProjectBoardPanel /></Suspense>
  return <DebugPanel />
}

function PanelMenu({ panel, placement }: { panel: WorkspacePanelInstance; placement: WorkspacePanelPlacement }) {
  const movePanel = useWorkspacePanelStore((state) => state.movePanel)
  const closePanel = useWorkspacePanelStore((state) => state.closePanel)
  return <DropdownMenu><Tooltip><TooltipTrigger render={<DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label={`${panel.title}更多操作`} />} />}><MoreHorizontalIcon /></TooltipTrigger><TooltipContent>{panel.title}更多操作</TooltipContent></Tooltip><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => useWorkspacePanelStore.getState().togglePinnedPanel(panel.id)}><PinIcon />{panel.pinned ? "取消固定" : "固定面板"}</DropdownMenuItem>{panel.type === "terminal" ? <DropdownMenuItem onClick={() => useWorkspacePanelStore.getState().setRenamePanelId(panel.id)}><GripVerticalIcon />重命名终端</DropdownMenuItem> : null}</DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup>{panel.type !== "board" ? <DropdownMenuItem onClick={() => { const target = placement === "right" ? "bottom" : "right"; movePanel(panel.id, target); ensurePlacementOpen(target) }}>{placement === "right" ? <PanelBottomIcon /> : <PanelRightIcon />}移到{placement === "right" ? "底部" : "右侧"}</DropdownMenuItem> : null}<DropdownMenuItem onClick={() => closePanel(placement, panel.id)}><XIcon />关闭面板</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
}

function FilePanelActions() {
  return <><IconButton label="新建文件" onClick={() => toast.info("Mock：不会写入本地文件")}><FilePlusIcon /></IconButton><IconButton label="刷新文件树" onClick={() => toast.success("Mock 文件树已刷新")}><RefreshCwIcon /></IconButton></>
}

function RenamePanelDialog() {
  const renameId = useWorkspacePanelStore((state) => state.renamePanelId)
  const rightPanels = useWorkspacePanelStore((state) => state.rightPanels)
  const bottomPanels = useWorkspacePanelStore((state) => state.bottomPanels)
  const [title, setTitle] = useState("")
  const panel = [...rightPanels, ...bottomPanels].find((item) => item.id === renameId)
  useEffect(() => setTitle(panel?.title ?? ""), [panel?.title])
  return <Dialog open={Boolean(renameId)} onOpenChange={(open) => { if (!open) useWorkspacePanelStore.getState().setRenamePanelId(null) }}><DialogContent><DialogHeader><DialogTitle>重命名终端</DialogTitle><DialogDescription>名称仅保存在当前 Mock UI 状态中。</DialogDescription></DialogHeader><Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus /><DialogFooter><Button variant="outline" onClick={() => useWorkspacePanelStore.getState().setRenamePanelId(null)}>取消</Button><Button onClick={() => panel && title.trim() && useWorkspacePanelStore.getState().renamePanel(panel.id, title.trim())}>保存</Button></DialogFooter></DialogContent></Dialog>
}

export function WorkspacePanel({ placement }: { placement: WorkspacePanelPlacement }) {
  const panels = useWorkspacePanelStore((state) => placement === "right" ? state.rightPanels : state.bottomPanels)
  const activeId = useWorkspacePanelStore((state) => placement === "right" ? state.activeRightId : state.activeBottomId)
  const active = panels.find((panel) => panel.id === activeId) ?? null
  const setActive = useWorkspacePanelStore((state) => state.setActivePanel)
  const handleDrop = (event: DragEvent) => { event.preventDefault(); const id = event.dataTransfer.getData("application/aestival-panel"); if (id) { useWorkspacePanelStore.getState().movePanel(id, placement); ensurePlacementOpen(placement) } }

  return <aside className="flex size-full min-h-0 flex-col bg-background" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
    {placement === "right" ? <header className="flex h-9 shrink-0 items-center gap-1 px-2">{active ? (() => { const Icon = panelIcons[active.type]; return <><Icon className="size-4" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{active.title}</span><PanelMenu panel={active} placement={placement} />{active.type === "files" ? <FilePanelActions /> : null}</> })() : <span className="flex-1 text-xs text-muted-foreground">右侧面板</span>}<AddPanelMenu placement={placement} /></header> : <div className="flex h-9 shrink-0 items-center border-b px-1"><Tabs value={activeId ?? ""} onValueChange={(value) => setActive(placement, value)} className="min-w-0 flex-1 gap-0"><TabsList variant="line" className="h-8 max-w-full justify-start overflow-x-auto">{panels.map((panel) => { const Icon = panelIcons[panel.type]; return <div key={panel.id} className="group flex items-center" draggable onDragStart={(event) => event.dataTransfer.setData("application/aestival-panel", panel.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); const from = event.dataTransfer.getData("application/aestival-panel"); if (from) useWorkspacePanelStore.getState().reorderPanel(placement, from, panel.id) }}><TabsTrigger value={panel.id}><Icon />{panel.title}</TabsTrigger><IconButton label={`关闭${panel.title}`} className={cn("size-6 -ml-1", panel.id !== activeId && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} onClick={() => useWorkspacePanelStore.getState().closePanel(placement, panel.id)}><XIcon /></IconButton></div>})}</TabsList></Tabs>{active?.type === "files" ? <FilePanelActions /> : null}<AddPanelMenu placement={placement} /></div>}
    <div className="min-h-0 flex-1">{active ? <PanelBody panel={active} /> : <EmptyPanelSelection onAdd={() => useWorkspacePanelStore.getState().openPanel("terminal", placement)} />}</div>
    <RenamePanelDialog />
  </aside>
}
