import { useMemo, useState } from "react"
import {
  BracesIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
  FilePlus2Icon,
  FileSearchIcon,
  FilesIcon,
  FolderPlusIcon,
  HashIcon,
  ListTreeIcon,
  MoreHorizontalIcon,
  MoveIcon,
  NetworkIcon,
  PanelRightOpenIcon,
  PencilIcon,
  RefreshCwIcon,
  SearchIcon,
  TagsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import markdownIcon from "@/assets/icons/material/markdown.svg"
import imageIcon from "@/assets/icons/material/image.svg"
import folderDocsIcon from "@/assets/icons/material/folder-docs.svg"
import { NoteGraph } from "@/components/notes/note-graph"
import { IconButton } from "@/components/shell/icon-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  sampleBacklinks,
  sampleMetadata,
  sampleOutlines,
} from "@/data/mock-project-workspace"
import { copyTextToClipboard } from "@/lib/context-menu-utils"
import { cn } from "@/lib/utils"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type {
  NoteEditorMode,
  NoteEntry,
  NotePanelType,
} from "@/types/project-workspace"

const panelInfo: Record<
  NotePanelType,
  { label: string; icon: typeof FilesIcon }
> = {
  files: { label: "文件", icon: FilesIcon },
  search: { label: "搜索", icon: FileSearchIcon },
  outline: { label: "大纲", icon: ListTreeIcon },
  backlinks: { label: "反向链接", icon: BracesIcon },
  metadata: { label: "标签与属性", icon: TagsIcon },
  "local-graph": { label: "局部图谱", icon: NetworkIcon },
}

function useActiveNoteId(projectId: string) {
  const snapshot = useProjectWorkspaceStore(
    (state) => state.noteWorkspaces[projectId],
  )
  const group = snapshot?.groups.find((item) => item.id === snapshot.focusedGroupId)
  const tab = group?.tabs.find((item) => item.id === group.activeTabId)
  return tab?.kind === "note" ? tab.resourceId : snapshot?.selectedGraphNodeId
}

type FileAction =
  | { kind: "new-note" | "new-folder"; targetId: string | null }
  | { kind: "rename" | "move"; targetId: string }
  | null

function NoteTreeEntry({
  projectId,
  entry,
  depth,
  onAction,
  onTrash,
}: {
  projectId: string
  entry: NoteEntry
  depth: number
  onAction: (action: Exclude<FileAction, null>) => void
  onTrash: (entry: NoteEntry) => void
}) {
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[projectId])
  const project = useProjectWorkspaceStore((state) =>
    state.projects.find((item) => item.id === projectId),
  )
  const entries = useProjectWorkspaceStore((state) => state.noteEntries)
  const toggle = useProjectWorkspaceStore((state) => state.toggleNoteEntry)
  const openNote = useProjectWorkspaceStore((state) => state.openNote)
  const setPanel = useProjectWorkspaceStore((state) => state.setActiveNotePanel)
  const isFolder = entry.kind === "folder"
  const isRoot = entry.parentId === null
  const expanded = workspace?.expandedEntryIds.includes(entry.id) ?? false
  const icon = isFolder ? folderDocsIcon : entry.kind === "image" ? imageIcon : markdownIcon
  const projectRoot = project?.roots.find((root) => root.id === entry.rootId)
  const relativePath = entry.relativePath || "."
  const absolutePath = entry.relativePath
    ? `${projectRoot?.path ?? ""}/${entry.relativePath}`
    : projectRoot?.path ?? ""
  const copyPath = (value: string, label: string) => {
    void copyTextToClipboard(value).then((copied) =>
      copied ? toast.success(`${label}已复制`) : toast.warning("无法写入剪贴板"),
    )
  }

  const menu = (
    <ContextMenuContent className="w-60">
      {isFolder ? (
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onAction({ kind: "new-note", targetId: entry.id })}>
            <FilePlus2Icon />新建笔记
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction({ kind: "new-folder", targetId: entry.id })}>
            <FolderPlusIcon />新建文件夹
          </ContextMenuItem>
        </ContextMenuGroup>
      ) : (
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => openNote(projectId, entry.id, true)}>
            <FilesIcon />打开
          </ContextMenuItem>
          <ContextMenuItem onClick={() => {
            openNote(projectId, entry.id, true)
            useProjectWorkspaceStore.getState().splitActiveNote(projectId)
          }}>
            <PanelRightOpenIcon />在侧边打开
          </ContextMenuItem>
          {entry.kind === "markdown" ? (
            <ContextMenuSub>
              <ContextMenuSubTrigger><PencilIcon />编辑模式</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {(["source", "split", "instant", "preview"] as NoteEditorMode[]).map((mode) => (
                  <ContextMenuItem key={mode} onClick={() => {
                    openNote(projectId, entry.id, true)
                    const state = useProjectWorkspaceStore.getState()
                    const groupId = state.noteWorkspaces[projectId]?.focusedGroupId
                    if (groupId) state.setNoteEditorMode(projectId, groupId, entry.id, mode)
                  }}>
                    <PencilIcon />{{ source: "源码", split: "并排", instant: "即时", preview: "预览" }[mode]}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          ) : null}
          <ContextMenuItem onClick={() => { setPanel(projectId, "right", "backlinks"); useWorkspaceStore.getState().setRightPanelOpen(true) }}>
            <BracesIcon />查看反向链接
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { setPanel(projectId, "right", "local-graph"); useWorkspaceStore.getState().setRightPanelOpen(true) }}>
            <NetworkIcon />打开局部图谱
          </ContextMenuItem>
        </ContextMenuGroup>
      )}
      {!isRoot ? <ContextMenuSeparator /> : null}
      <ContextMenuGroup>
        {!isRoot ? <ContextMenuItem onClick={() => onAction({ kind: "rename", targetId: entry.id })}><PencilIcon />重命名</ContextMenuItem> : null}
        {!isRoot ? <ContextMenuItem onClick={() => onAction({ kind: "move", targetId: entry.id })}><MoveIcon />移动</ContextMenuItem> : null}
        <ContextMenuSub>
          <ContextMenuSubTrigger><ClipboardCopyIcon />复制路径</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuItem onClick={() => copyPath(entry.name, "文件名")}><ClipboardCopyIcon />文件名</ContextMenuItem>
            <ContextMenuItem onClick={() => copyPath(relativePath, "相对路径")}><ClipboardCopyIcon />根目录相对路径</ContextMenuItem>
            <ContextMenuItem disabled={!absolutePath} onClick={() => copyPath(absolutePath, "完整路径")}><ClipboardCopyIcon />完整路径</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuGroup>
      {!isRoot ? <><ContextMenuSeparator /><ContextMenuItem variant="destructive" onClick={() => onTrash(entry)}><Trash2Icon />移到废纸篓</ContextMenuItem></> : null}
    </ContextMenuContent>
  )

  if (isFolder) {
    return (
      <Collapsible open={expanded} onOpenChange={() => toggle(projectId, entry.id)}>
        <ContextMenu>
          <ContextMenuTrigger
            render={<CollapsibleTrigger className="flex h-7 w-full items-center gap-1 rounded-md pr-2 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />}
          >
            <span className="shrink-0" style={{ width: depth * 14 }} />
            <ChevronRightIcon className={cn("size-3.5 shrink-0 transition-transform", expanded && "rotate-90")} />
            <img src={icon} alt="" className="size-4" />
            <span className="truncate font-medium">{entry.name}</span>
          </ContextMenuTrigger>
          {menu}
        </ContextMenu>
        <CollapsibleContent>
          {entry.children?.map((childId) => {
            const child = entries.find((item) => item.id === childId)
            return child ? <NoteTreeEntry key={child.id} projectId={projectId} entry={child} depth={depth + 1} onAction={onAction} onTrash={onTrash} /> : null
          })}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<Button variant="ghost" />}
        className="flex h-7 w-full items-center justify-start gap-1 rounded-md pr-2 text-left text-xs"
        style={{ paddingLeft: depth * 14 + 20 }}
        onClick={() => entry.kind === "markdown" ? openNote(projectId, entry.id, false) : toast.info("素材安全预览将在文件服务接入后启用")}
        onDoubleClick={() => entry.kind === "markdown" && openNote(projectId, entry.id, true)}
      >
        <img src={icon} alt="" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{entry.name}</span>
        {entry.readonly ? <span className="text-[10px] text-muted-foreground">只读</span> : null}
      </ContextMenuTrigger>
      {menu}
    </ContextMenu>
  )
}

function NoteFilesPanel({ projectId }: { projectId: string }) {
  const project = useProjectWorkspaceStore((state) => state.projects.find((item) => item.id === projectId))
  const entries = useProjectWorkspaceStore((state) => state.noteEntries)
  const [action, setAction] = useState<FileAction>(null)
  const [actionValue, setActionValue] = useState("")
  const [trashEntry, setTrashEntry] = useState<NoteEntry | null>(null)
  const defaultRoot = project?.roots.find((root) => root.id === project.defaultRootId)

  if (!project) return null
  if (!project.sample) {
    return (
      <Empty className="h-full rounded-none border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon"><FilesIcon /></EmptyMedia>
          <EmptyTitle>文件读取服务尚未接入</EmptyTitle>
          <EmptyDescription>
            已授权 {project.roots.length} 个根目录，但本轮不会扫描、读取、监听或修改其中的内容。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const dialogTitle = action
    ? { "new-note": "新建笔记", "new-folder": "新建文件夹", rename: "重命名", move: "移动" }[action.kind]
    : "文件操作"
  const target = action?.targetId ? entries.find((entry) => entry.id === action.targetId) : null

  return (
    <div className="flex size-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b px-2">
        <IconButton label="新建笔记" onClick={() => { setActionValue(""); setAction({ kind: "new-note", targetId: null }) }}><FilePlus2Icon /></IconButton>
        <IconButton label="新建文件夹" onClick={() => { setActionValue(""); setAction({ kind: "new-folder", targetId: null }) }}><FolderPlusIcon /></IconButton>
        <IconButton label="刷新示例文件树" onClick={() => toast.success("示例文件树已刷新", { description: "未访问真实目录。" })}><RefreshCwIcon /></IconButton>
        <Badge variant="outline" className="ml-auto">示例数据</Badge>
      </div>
      <ScrollArea className="min-h-0 flex-1 p-1" tabIndex={0}>
        {project.roots.map((root, index) => {
          const rootEntry = entries.find((entry) => entry.rootId === root.id && entry.parentId === null)
          return (
            <section key={root.id} className={cn(index > 0 && "mt-2 border-t pt-2")}>
              <div className="flex h-7 items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                <span className="truncate">{root.displayName}</span>
                {root.id === defaultRoot?.id ? <Badge variant="secondary">默认</Badge> : null}
                <span className="ml-auto text-[10px]">{root.path}</span>
              </div>
              {rootEntry ? <NoteTreeEntry projectId={projectId} entry={rootEntry} depth={0} onAction={(next) => { setActionValue(next.kind === "rename" ? entries.find((entry) => entry.id === next.targetId)?.name ?? "" : ""); setAction(next) }} onTrash={setTrashEntry} /> : null}
            </section>
          )
        })}
      </ScrollArea>
      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {action?.kind === "move"
                ? `为“${target?.name ?? "所选条目"}”选择示例目标。`
                : "此操作只验证 UI 流程，不会写入或移动真实文件。"}
            </DialogDescription>
          </DialogHeader>
          {action?.kind === "move" ? (
            <ItemGroup className="gap-2">
              {entries.filter((entry) => entry.kind === "folder" && entry.id !== action.targetId && (!target || entry.rootId === target.rootId)).slice(0, 8).map((entry) => (
                <Item key={entry.id} variant="outline" render={<button type="button" onClick={() => setActionValue(entry.id)} />} className={cn("cursor-pointer", actionValue === entry.id && "border-primary bg-primary/5")}>
                  <ItemMedia variant="icon"><MoveIcon /></ItemMedia>
                  <ItemContent><ItemTitle>{entry.name}</ItemTitle><ItemDescription>{entry.relativePath || "根目录"}</ItemDescription></ItemContent>
                </Item>
              ))}
            </ItemGroup>
          ) : (
            <Input
              autoFocus
              value={actionValue}
              aria-invalid={!actionValue.trim()}
              placeholder={action?.kind === "new-note" ? "笔记名称（自动补 .md）" : "名称"}
              onChange={(event) => setActionValue(event.target.value)}
            />
          )}
          {action?.kind === "rename" ? (
            <Alert><BracesIcon /><AlertTitle>链接可能受影响</AlertTitle><AlertDescription>未来真实重命名需要先检查并更新显式链接；本轮不会改写任何来源。</AlertDescription></Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>取消</Button>
            <Button disabled={!actionValue.trim()} onClick={() => {
              const store = useProjectWorkspaceStore.getState()
              let completed = true
              if (action?.kind === "new-note" || action?.kind === "new-folder") {
                completed = Boolean(store.createNoteEntry(projectId, action.targetId, actionValue, action.kind === "new-note" ? "markdown" : "folder"))
              } else if (action?.kind === "rename" && action.targetId) {
                completed = store.renameNoteEntry(action.targetId, actionValue)
              } else if (action?.kind === "move" && action.targetId) {
                completed = store.moveNoteEntry(action.targetId, actionValue)
              }
              if (!completed) {
                toast.warning("名称冲突或目标不可用", { description: "请更换名称或目标文件夹。" })
                return
              }
              toast.success(`${dialogTitle}已完成（内存 Mock）`, { description: "文件树已更新，但没有写入、移动或重命名真实文件。" })
              setAction(null)
            }}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(trashEntry)} onOpenChange={(open) => !open && setTrashEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>将“{trashEntry?.name}”移到废纸篓？</AlertDialogTitle>
            <AlertDialogDescription>
              该对象可能被其他笔记链接。本轮只演示危险确认，不会删除、移动或修改真实文件。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (trashEntry) useProjectWorkspaceStore.getState().trashNoteEntry(trashEntry.id); toast.success("已移到内存废纸篓（Mock）", { description: "文件树已更新，真实文件未受影响。" }); setTrashEntry(null) }}>移到废纸篓</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function NoteSearchPanel({ projectId }: { projectId: string }) {
  const project = useProjectWorkspaceStore((state) => state.projects.find((item) => item.id === projectId))
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[projectId])
  const entries = useProjectWorkspaceStore((state) => state.noteEntries)
  const buffers = useProjectWorkspaceStore((state) => state.noteBuffers)
  const setQuery = useProjectWorkspaceStore((state) => state.setNoteSearchQuery)
  const openNote = useProjectWorkspaceStore((state) => state.openNote)
  const results = useMemo(() => {
    if (!project?.sample || !workspace) return []
    const query = workspace.searchQuery.trim().toLocaleLowerCase()
    return entries.filter((entry) => entry.kind === "markdown" && (!query || entry.name.toLocaleLowerCase().includes(query) || buffers[entry.id]?.markdown.toLocaleLowerCase().includes(query)))
  }, [buffers, entries, project?.sample, workspace])
  if (!workspace || !project) return null
  return (
    <div className="flex size-full min-h-0 flex-col">
      <div className="flex gap-1 border-b p-2"><SearchIcon className="mt-2 size-4 text-muted-foreground" /><Input value={workspace.searchQuery} onChange={(event) => setQuery(projectId, event.target.value)} placeholder="搜索当前笔记项目" /></div>
      <Alert className="m-2 mb-0 rounded-md py-2"><FileSearchIcon /><AlertTitle>示例索引 · 部分结果</AlertTitle><AlertDescription>{project.sample ? "只搜索明确标记的示例 Markdown。" : "真实目录索引尚未接入。"}</AlertDescription></Alert>
      <ScrollArea className="min-h-0 flex-1 p-2">
        {results.length ? <ItemGroup className="gap-1">{results.map((entry) => <Item key={entry.id} render={<button type="button" onClick={() => openNote(projectId, entry.id, true)} />} className="cursor-pointer text-left hover:bg-accent"><ItemMedia variant="icon"><img src={markdownIcon} alt="" className="size-4" /></ItemMedia><ItemContent><ItemTitle>{entry.name}</ItemTitle><ItemDescription>{entry.relativePath} · {project.roots.find((root) => root.id === entry.rootId)?.displayName}</ItemDescription></ItemContent></Item>)}</ItemGroup> : <Empty className="h-full rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><SearchIcon /></EmptyMedia><EmptyTitle>{project.sample ? "没有匹配笔记" : "索引服务尚未接入"}</EmptyTitle><EmptyDescription>{project.sample ? "尝试更短的标题或正文关键词。" : "不会搜索用户选择的真实目录。"}</EmptyDescription></EmptyHeader></Empty>}
      </ScrollArea>
    </div>
  )
}

function NoteOutlinePanel({ projectId }: { projectId: string }) {
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[projectId])
  const setQuery = useProjectWorkspaceStore((state) => state.setOutlineQuery)
  const noteId = useActiveNoteId(projectId)
  const items = sampleOutlines.filter((item) => item.noteId === noteId && (!workspace?.outlineQuery || item.title.toLocaleLowerCase().includes(workspace.outlineQuery.toLocaleLowerCase())))
  if (!workspace) return null
  return <div className="flex size-full min-h-0 flex-col"><div className="border-b p-2"><Input value={workspace.outlineQuery} onChange={(event) => setQuery(projectId, event.target.value)} placeholder="筛选标题" /></div><ScrollArea className="min-h-0 flex-1 p-1">{items.length ? items.map((item) => <Button key={item.id} variant="ghost" className="h-8 w-full justify-start text-xs" style={{ paddingLeft: (item.depth - 1) * 14 + 8 }} onClick={() => toast.info(`已定位到第 ${item.line} 行（Mock）`)}><HashIcon className="size-3.5" /><span className="truncate">{item.title}</span><span className="ml-auto text-[10px] text-muted-foreground">{item.line}</span></Button>) : <Empty className="h-full rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><ListTreeIcon /></EmptyMedia><EmptyTitle>{noteId ? "当前笔记没有匹配标题" : "当前不是 Markdown 笔记"}</EmptyTitle><EmptyDescription>打开笔记后，大纲会跟随当前活动文件。</EmptyDescription></EmptyHeader></Empty>}</ScrollArea></div>
}

function NoteBacklinksPanel({ projectId }: { projectId: string }) {
  const noteId = useActiveNoteId(projectId)
  const backlinks = noteId === "note-aestival" ? sampleBacklinks : []
  const openNote = useProjectWorkspaceStore((state) => state.openNote)
  return <div className="flex size-full min-h-0 flex-col"><Alert className="m-2 rounded-md py-2"><BracesIcon /><AlertTitle>示例索引 · partial</AlertTitle><AlertDescription>已链接提及进入图谱；未链接提及只作为文本结果。</AlertDescription></Alert><ScrollArea className="min-h-0 flex-1 px-2 pb-2">{backlinks.length ? ([true, false] as const).map((linked) => <section key={String(linked)} className="mb-3"><div className="mb-1 text-xs font-medium">{linked ? "已链接提及" : "未链接提及"}</div><ItemGroup className="gap-1">{backlinks.filter((item) => item.linked === linked).map((item) => <Item key={item.id} render={<button type="button" onClick={() => openNote(projectId, item.sourceNoteId, true)} />} className="cursor-pointer text-left hover:bg-accent"><ItemContent><ItemTitle>{item.sourceTitle}<Badge variant="outline">{item.rootLabel}</Badge></ItemTitle><ItemDescription className="app-selectable-content">{item.context} · 第 {item.line} 行</ItemDescription></ItemContent>{!linked ? <Button size="xs" variant="outline" onClick={(event) => { event.stopPropagation(); toast.info("转换为链接需要未来文件写入审批；本轮未修改正文。") }}>转换为链接</Button> : null}</Item>)}</ItemGroup></section>) : <Empty className="h-full rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><BracesIcon /></EmptyMedia><EmptyTitle>{noteId ? "没有反向链接" : "当前不是 Markdown 笔记"}</EmptyTitle><EmptyDescription>结果不会根据语义相似度或共同标签推测。</EmptyDescription></EmptyHeader></Empty>}</ScrollArea></div>
}

function NoteMetadataPanel({ projectId }: { projectId: string }) {
  const noteId = useActiveNoteId(projectId)
  const metadata = sampleMetadata.find((item) => item.noteId === noteId)
  if (!metadata) return <Empty className="h-full rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><TagsIcon /></EmptyMedia><EmptyTitle>{noteId ? "当前笔记没有示例属性" : "当前不是 Markdown 笔记"}</EmptyTitle><EmptyDescription>Front Matter 索引服务尚未接入；不会改写原文。</EmptyDescription></EmptyHeader></Empty>
  return <ScrollArea className="size-full p-3"><section><div className="mb-2 text-xs font-medium">标签</div><div className="flex flex-wrap gap-1">{metadata.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}</div></section><Separator className="my-3" /><section><div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium"><span>属性</span><Button size="xs" variant="ghost" onClick={() => toast.info("属性编辑只展示入口；不会重写 YAML Front Matter。")}>编辑</Button></div><ItemGroup className="gap-0 divide-y rounded-lg border">{metadata.properties.map((property) => <Item key={property.key} className="rounded-none border-0"><ItemContent><ItemTitle>{property.key}</ItemTitle><ItemDescription className="app-selectable-content">{property.value}</ItemDescription></ItemContent><Badge variant="outline">{property.readonly ? "未知 · 只读" : property.type}</Badge></Item>)}</ItemGroup></section><Alert className="mt-3"><TagsIcon /><AlertTitle>保留未知字段</AlertTitle><AlertDescription>UI 不识别的属性保持原值且只读，不会因编辑其他字段而删除。</AlertDescription></Alert></ScrollArea>
}

function PanelBody({ projectId, type }: { projectId: string; type: NotePanelType }) {
  if (type === "files") return <NoteFilesPanel projectId={projectId} />
  if (type === "search") return <NoteSearchPanel projectId={projectId} />
  if (type === "outline") return <NoteOutlinePanel projectId={projectId} />
  if (type === "backlinks") return <NoteBacklinksPanel projectId={projectId} />
  if (type === "metadata") return <NoteMetadataPanel projectId={projectId} />
  return <NoteGraph projectId={projectId} variant="local" />
}

export function NoteWorkspacePanel({
  projectId,
  placement,
}: {
  projectId: string
  placement: "right" | "bottom"
}) {
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[projectId])
  const setPanel = useProjectWorkspaceStore((state) => state.setActiveNotePanel)
  if (!workspace) return null
  const types = placement === "right" ? workspace.rightPanelTypes : workspace.bottomPanelTypes
  const active = placement === "right" ? workspace.activeRightPanel : workspace.activeBottomPanel
  const current = (types as NotePanelType[]).includes(active) ? active : types[0]
  const info = panelInfo[current]
  const Icon = info.icon
  return (
    <aside className="flex size-full min-h-0 flex-col bg-background">
      {placement === "right" ? (
        <header className="flex h-9 shrink-0 items-center gap-2 border-b px-2">
          <Icon className="size-4" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{info.label}</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="切换笔记面板" />}><MoreHorizontalIcon /></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>笔记面板</DropdownMenuLabel>{workspace.rightPanelTypes.map((type) => { const PanelIcon = panelInfo[type].icon; return <DropdownMenuItem key={type} onClick={() => setPanel(projectId, "right", type)}><PanelIcon />{panelInfo[type].label}</DropdownMenuItem> })}</DropdownMenuGroup></DropdownMenuContent>
          </DropdownMenu>
          <IconButton label="关闭右侧栏" onClick={() => { useProjectWorkspaceStore.getState().setNotePanelOpen(projectId, "right", false); useWorkspaceStore.getState().setRightPanelOpen(false) }}><XIcon /></IconButton>
        </header>
      ) : (
        <div className="flex h-9 shrink-0 items-center border-b px-1">
          <Tabs value={current} onValueChange={(value) => setPanel(projectId, "bottom", value as NotePanelType)} className="min-w-0 flex-1 gap-0">
            <TabsList variant="line" className="h-8 justify-start">{workspace.bottomPanelTypes.map((type) => { const PanelIcon = panelInfo[type].icon; return <TabsTrigger key={type} value={type}><PanelIcon />{panelInfo[type].label}</TabsTrigger> })}</TabsList>
          </Tabs>
          <IconButton label="关闭底部面板" onClick={() => { useProjectWorkspaceStore.getState().setNotePanelOpen(projectId, "bottom", false); useWorkspaceStore.getState().setBottomPanelOpen(false) }}><XIcon /></IconButton>
        </div>
      )}
      <div className="min-h-0 flex-1"><PanelBody projectId={projectId} type={current} /></div>
    </aside>
  )
}
