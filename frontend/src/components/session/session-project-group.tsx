import { useState } from "react"
import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CopyIcon,
  EllipsisIcon,
  FilesIcon,
  FolderIcon,
  FolderMinusIcon,
  FolderOpenIcon,
  ListTodoIcon,
  MessageSquareIcon,
  NetworkIcon,
  NotebookPenIcon,
  PencilIcon,
  SearchIcon,
  Settings2Icon,
  ShieldQuestionIcon,
  SquarePenIcon,
  StarIcon,
  TerminalSquareIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  SessionContextMenuContent,
  SessionDropdownMenuContent,
} from "@/components/session/session-menu-content"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  sortMockSessions,
  type MockSessionProjectId,
} from "@/data/mock-session-management"
import { copyTextToClipboard } from "@/lib/context-menu-utils"
import {
  activateWorkspaceProject,
  openWorkspaceNoteGraph,
} from "@/services/project-workspace-navigation"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type { ProjectKind, ProjectRoot } from "@/types/project-workspace"

type SessionProjectGroupProps = {
  projectId: MockSessionProjectId
  label: string
  kind: ProjectKind
  fixed?: boolean
  roots: ProjectRoot[]
  defaultRootId: string | null
  open: boolean
  onActivate: () => void
  onOpenChange: (open: boolean) => void
}

function ProjectContextMenuContent({
  projectId,
  kind,
  fixed,
  roots,
  onActivate,
  onOpenChange,
  onRename,
  onSettings,
  onRemove,
}: {
  projectId: MockSessionProjectId
  kind: ProjectKind
  fixed?: boolean
  roots: ProjectRoot[]
  onActivate: () => void
  onOpenChange: (open: boolean) => void
  onRename: () => void
  onSettings: () => void
  onRemove: () => void
}) {
  const sessions = useWorkspaceStore((state) => state.sessions)
  const setSessionArchived = useWorkspaceStore(
    (state) => state.setSessionArchived,
  )
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const openProjectBoard = useWorkspaceStore((state) => state.openProjectBoard)
  const fixedProject = Boolean(fixed)
  const projectSessions = sessions.filter(
    (session) => session.projectId === projectId && !session.archived,
  )

  return (
    <ContextMenuContent className="w-64">
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() => {
            onActivate()
            const workspace = useWorkspaceStore.getState()
            workspace.setRightPanelOpen(true)
            if (kind === "note") {
              useProjectWorkspaceStore.getState().setActiveNotePanel(projectId, "right", "files")
            } else {
              const panels = useWorkspacePanelStore.getState()
              panels.openMockWorkspace()
              panels.openPanel("files", "right")
            }
          }}
        >
          <FilesIcon />
          在文件面板中显示
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => toast.info("系统文件管理器入口仍为前端 Mock")}
        >
          <FolderOpenIcon />
          在系统文件管理器中显示
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { onActivate(); setActivePage("new-task") }}>
          <SquarePenIcon />
          在此项目中新建任务
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>
        {kind === "project" ? (
          <>
            <ContextMenuItem onClick={() => { onActivate(); openProjectBoard() }}>
              <ListTodoIcon />
              打开项目看板
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => { onActivate(); useWorkspacePanelStore.getState().openPanel("terminal", "right") }}
            >
              <TerminalSquareIcon />
              新建终端
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => openWorkspaceNoteGraph(projectId)}>
              <NetworkIcon />
              打开全局图谱
            </ContextMenuItem>
            <ContextMenuItem onClick={() => { onActivate(); toast.info("请在笔记文件面板中选择“新建笔记”", { description: "本轮只更新内存 Mock，不会写入目录。" }) }}>
              <NotebookPenIcon />
              新建笔记
            </ContextMenuItem>
            <ContextMenuItem onClick={() => { onActivate(); useProjectWorkspaceStore.getState().setActiveNotePanel(projectId, "right", "search"); useWorkspaceStore.getState().setRightPanelOpen(true) }}>
              <SearchIcon />
              搜索笔记
            </ContextMenuItem>
          </>
        )}
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem
          disabled={fixedProject}
          onClick={onRename}
        >
          <PencilIcon />
          重命名
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={fixedProject}
          onClick={onSettings}
        >
          <Settings2Icon />
          项目设置
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            const path = roots[0]?.path
            if (!path) {
              toast.info("系统项目没有可复制的用户目录")
              return
            }
            void copyTextToClipboard(path).then((copied) =>
              copied ? toast.success("项目路径已复制") : toast.warning("无法写入剪贴板"),
            )
          }}
        >
          <CopyIcon />
          复制路径
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <MessageSquareIcon />
            会话
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={() => onOpenChange(true)}>
              <ChevronDownIcon />
              全部展开
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onOpenChange(false)}>
              <ChevronRightIcon />
              全部收起
            </ContextMenuItem>
            <ContextMenuItem
              disabled={projectSessions.length === 0}
              onClick={() => {
                projectSessions.forEach((session) =>
                  setSessionArchived(session.id, true),
                )
                toast.success("项目会话已归档（Mock）")
              }}
            >
              <ArchiveIcon />
              全部归档
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem
        disabled={fixedProject}
        variant="destructive"
        onClick={onRemove}
      >
        <FolderMinusIcon />
        从侧栏移除
      </ContextMenuItem>
    </ContextMenuContent>
  )
}

export function SessionProjectGroup({
  projectId,
  label,
  kind,
  fixed,
  roots,
  defaultRootId,
  open,
  onActivate,
  onOpenChange,
}: SessionProjectGroupProps) {
  const [archiveSessionId, setArchiveSessionId] = useState<string | null>(
    null
  )
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(label)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const sessions = useWorkspaceStore((state) => state.sessions)
  const sessionSearchQuery = useWorkspaceStore(
    (state) => state.sessionSearchQuery
  )
  const showArchivedSessions = useWorkspaceStore(
    (state) => state.showArchivedSessions
  )
  const visibleCount = useWorkspaceStore(
    (state) => state.sessionVisibleCounts[projectId] ?? 5
  )
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const runState = useWorkspaceStore((state) => state.runState)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const openMockConversation = useWorkspaceStore(
    (state) => state.openMockConversation
  )
  const loadMoreSessions = useWorkspaceStore(
    (state) => state.loadMoreSessions
  )
  const setSessionArchived = useWorkspaceStore(
    (state) => state.setSessionArchived
  )
  const query = sessionSearchQuery.trim().toLocaleLowerCase()
  const filteredSessions = sortMockSessions(
    sessions.filter(
      (session) =>
        session.projectId === projectId &&
        (showArchivedSessions || !session.archived) &&
        (!query || session.title.toLocaleLowerCase().includes(query))
    )
  )
  const visibleSessions = query
    ? filteredSessions
    : filteredSessions.slice(0, visibleCount)
  const hasMore = visibleSessions.length < filteredSessions.length
  const effectiveOpen = open || Boolean(query)
  const activeProjectId = useProjectWorkspaceStore((state) => state.activeProjectId)

  return (
    <SidebarMenu>
      <Collapsible open={effectiveOpen} onOpenChange={onOpenChange}>
        <SidebarMenuItem>
          <ContextMenu>
            <ContextMenuTrigger className="block w-full">
              <CollapsibleTrigger
                onClick={onActivate}
                onKeyDown={(event) => {
                  if (event.key === "F2" && !fixed) {
                    event.preventDefault()
                    event.stopPropagation()
                    setRenameValue(label)
                    setRenameOpen(true)
                  }
                }}
                render={
                  <SidebarMenuButton tooltip={label} isActive={activeProjectId === projectId} />
                }
              >
                {effectiveOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                <FolderIcon />
                <span>{label}</span>
              </CollapsibleTrigger>
            </ContextMenuTrigger>
            <ProjectContextMenuContent
              projectId={projectId}
              kind={kind}
              fixed={fixed}
              roots={roots}
              onActivate={onActivate}
              onOpenChange={onOpenChange}
              onRename={() => { setRenameValue(label); setRenameOpen(true) }}
              onSettings={() => setSettingsOpen(true)}
              onRemove={() => setRemoveOpen(true)}
            />
          </ContextMenu>
          <CollapsibleContent>
            <SidebarMenuSub className="mx-0 w-full border-l-0 px-0 py-0.5">
              {visibleSessions.map((session) => {
                const isCurrent = session.id === conversationId
                const activeRunning =
                  isCurrent &&
                  (runState === "waiting" ||
                    runState === "thinking" ||
                    runState === "streaming")
                const awaitingApproval =
                  (isCurrent && runState === "awaiting-approval") ||
                  (!isCurrent && session.status === "awaiting-approval")
                const failed =
                  (isCurrent && runState === "failed") ||
                  (!isCurrent && session.status === "failed")

                return (
                  <SidebarMenuSubItem
                    key={session.id}
                    className="w-full"
                  >
                    <HoverCard>
                      <HoverCardTrigger
                        render={<div className="block w-full" />}
                      >
                        <ContextMenu>
                          <ContextMenuTrigger className="block w-full">
                            <SidebarMenuSubButton
                              href="#"
                              isActive={isCurrent}
                              className="h-8 w-full px-2 pr-14 pl-8"
                              onClick={(event) => {
                                event.preventDefault()
                                onActivate()
                                if (isCurrent) {
                                  setActivePage("new-task")
                                } else {
                                  openMockConversation(session.id)
                                }
                              }}
                            >
                              {session.starred ? (
                                <StarIcon
                                  fill="currentColor"
                                  aria-label="已 Star"
                                />
                              ) : null}
                              <span className="min-w-0 flex-1 truncate">
                                {session.title}
                              </span>
                              {activeRunning ? (
                                <Spinner
                                  className="shrink-0 transition-opacity group-focus-within/menu-sub-item:opacity-0 group-hover/menu-sub-item:opacity-0"
                                  aria-label="会话运行中"
                                />
                              ) : awaitingApproval ? (
                                <ShieldQuestionIcon
                                  className="shrink-0 transition-opacity group-focus-within/menu-sub-item:opacity-0 group-hover/menu-sub-item:opacity-0"
                                  aria-label="等待审批"
                                />
                              ) : failed ? (
                                <CircleAlertIcon
                                  className="shrink-0 text-destructive transition-opacity group-focus-within/menu-sub-item:opacity-0 group-hover/menu-sub-item:opacity-0"
                                  aria-label="运行失败"
                                />
                              ) : null}
                            </SidebarMenuSubButton>
                          </ContextMenuTrigger>
                          <SessionContextMenuContent
                            sessionId={session.id}
                          />
                        </ContextMenu>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="start"
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-start gap-2">
                          {session.starred ? (
                            <StarIcon
                              className="mt-0.5 size-4 shrink-0"
                              fill="currentColor"
                              aria-hidden="true"
                            />
                          ) : (
                            <FolderIcon
                              className="mt-0.5 size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium">{session.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {label} · {session.relativeTime}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activeRunning
                            ? "Mock 会话运行中"
                            : awaitingApproval
                              ? "正在等待审批"
                              : failed
                                ? "最近一次运行失败"
                                : "最近一次运行已完成"}
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                    <div className="absolute top-1/2 right-2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity has-[:focus-visible]:opacity-100 group-hover/menu-sub-item:opacity-100">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`归档会话“${session.title}”`}
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                setArchiveSessionId(session.id)
                              }}
                            />
                          }
                        >
                          <ArchiveIcon />
                        </TooltipTrigger>
                        <TooltipContent>归档会话</TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`${session.title} 会话更多操作`}
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                  />
                                }
                              />
                            }
                          >
                            <EllipsisIcon />
                          </TooltipTrigger>
                          <TooltipContent>更多会话操作</TooltipContent>
                        </Tooltip>
                        <SessionDropdownMenuContent
                          sessionId={session.id}
                        />
                      </DropdownMenu>
                    </div>
                  </SidebarMenuSubItem>
                )
              })}
              {visibleSessions.length === 0 ? (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    aria-disabled
                    className="text-muted-foreground"
                  >
                    <span>{query ? "没有匹配会话" : "暂无会话"}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : null}
              {!query && hasMore ? (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    href="#"
                    className="pl-8 text-muted-foreground"
                    onClick={(event) => {
                      event.preventDefault()
                      loadMoreSessions(projectId)
                    }}
                  >
                    <ChevronDownIcon />
                    <span>展开更多</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : null}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      <AlertDialog
        open={Boolean(archiveSessionId)}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveSessionId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              归档“
              {sessions.find((session) => session.id === archiveSessionId)
                ?.title ?? "当前会话"}
              ”？
            </AlertDialogTitle>
            <AlertDialogDescription>
              归档后该会话将从默认列表隐藏，所属项目保持不变。本次操作只更新
              前端 Mock 状态，不会移动或删除本地文件。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!archiveSessionId) {
                  return
                }
                setSessionArchived(archiveSessionId, true)
                setArchiveSessionId(null)
                toast.success("会话已归档（Mock）", {
                  description: "会话已从默认列表隐藏，项目未受影响。",
                })
              }}
            >
              确认归档
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重命名项目</DialogTitle>
            <DialogDescription>名称只保存在本次运行的前端 Mock 状态中。</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            autoFocus
            aria-invalid={!renameValue.trim()}
            onChange={(event) => setRenameValue(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>取消</Button>
            <Button
              disabled={!renameValue.trim()}
              onClick={() => {
                useProjectWorkspaceStore.getState().renameProject(projectId, renameValue)
                setRenameOpen(false)
                toast.success("项目名称已更新（仅本次运行）")
              }}
            >保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>项目设置</DialogTitle>
            <DialogDescription>
              本轮只展示不可转换的类型和已授权根目录，不保存设置或读取目录。
            </DialogDescription>
          </DialogHeader>
          <ItemGroup className="gap-2">
            <Item variant="outline">
              <ItemMedia variant="icon">
                {kind === "note" ? <NotebookPenIcon /> : <TerminalSquareIcon />}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>类型：{kind === "note" ? "笔记" : "项目"}</ItemTitle>
                <ItemDescription>类型创建后不可转换；需要更换时请新建工作区。</ItemDescription>
              </ItemContent>
              <Badge variant="secondary">只读</Badge>
            </Item>
            {roots.length ? roots.map((root) => (
              <Item key={root.id} variant="outline">
                <ItemMedia variant="icon"><FolderIcon /></ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {root.displayName}
                    {defaultRootId === root.id ? <Badge variant="outline">默认</Badge> : null}
                  </ItemTitle>
                  <ItemDescription className="app-selectable-content break-all">{root.path}</ItemDescription>
                </ItemContent>
              </Item>
            )) : (
              <Item variant="outline">
                <ItemMedia variant="icon"><FolderOpenIcon /></ItemMedia>
                <ItemContent>
                  <ItemTitle>未配置用户根目录</ItemTitle>
                  <ItemDescription>这是既有种子项目；本轮不会补扫或猜测目录。</ItemDescription>
                </ItemContent>
              </Item>
            )}
          </ItemGroup>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>从侧栏移除“{label}”？</AlertDialogTitle>
            <AlertDialogDescription>
              只会移除本次运行中的项目 Mock；不会删除、移动或修改任何本地文件夹和文件。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const projects = useProjectWorkspaceStore.getState()
                const removedActiveProject = projects.activeProjectId === projectId
                projects.removeProject(projectId)
                if (removedActiveProject) activateWorkspaceProject("task")
                toast.success("项目已从侧栏移除", { description: "本地目录未受影响。" })
              }}
            >确认移除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  )
}
