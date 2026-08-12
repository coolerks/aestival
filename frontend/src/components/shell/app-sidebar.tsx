import { useEffect, useState } from "react"
import {
  ArchiveIcon,
  BookOpenIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  ImportIcon,
  InfoIcon,
  KeyboardIcon,
  LogOutIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  SquarePenIcon,
  PlusIcon,
} from "lucide-react"

import appIcon from "@/assets/icons/application/icon.svg"
import { SessionProjectGroup } from "@/components/session/session-project-group"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { navigationItems } from "@/data/mock-workspace"
import { collectionUnreadCount } from "@/lib/reading"
import { useReadingStore } from "@/store/reading-store"
import { activateWorkspaceProject } from "@/services/project-workspace-navigation"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useSettingsStore } from "@/store/settings-store"
import {
  type AgentMode,
  useWorkspaceStore,
} from "@/store/workspace-store"

export function AppSidebar() {
  const projects = useProjectWorkspaceStore((state) => state.projects)
  const activeWorkspaceProjectId = useProjectWorkspaceStore(
    (state) => state.activeProjectId,
  )
  const requestProjectDialog = useProjectWorkspaceStore(
    (state) => state.requestProjectDialog,
  )
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
    () => Object.fromEntries(projects.map((project) => [project.id, false])),
  )
  const mode = useWorkspaceStore((state) => state.mode)
  const setMode = useWorkspaceStore((state) => state.setMode)
  const activePage = useWorkspaceStore((state) => state.activePage)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const isTemporaryConversation = useWorkspaceStore(
    (state) => state.isTemporaryConversation
  )
  const setTemporaryCloseOpen = useWorkspaceStore(
    (state) => state.setTemporaryCloseOpen
  )
  const resetConversation = useWorkspaceStore(
    (state) => state.resetConversation
  )
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const sessions = useWorkspaceStore((state) => state.sessions)
  const showArchivedSessions = useWorkspaceStore(
    (state) => state.showArchivedSessions
  )
  const readingUnreadCount = useReadingStore((state) =>
    state.preferences.showUnreadCount
      ? collectionUnreadCount(
          {
            articles: state.articles,
            collections: state.collections,
            classifications: state.classifications,
          },
          state.selectedCollectionId,
        )
      : null,
  )
  const setShowArchivedSessions = useWorkspaceStore(
    (state) => state.setShowArchivedSessions
  )

  const setAllProjectsOpen = (open: boolean) => {
    setOpenProjects(
      Object.fromEntries(projects.map((project) => [project.id, open])),
    )
  }

  useEffect(() => {
    setOpenProjects((current) => {
      const next = { ...current }
      projects.forEach((project) => {
        next[project.id] ??= false
      })
      Object.keys(next).forEach((id) => {
        if (!projects.some((project) => project.id === id)) delete next[id]
      })
      if (activeWorkspaceProjectId) next[activeWorkspaceProjectId] = true
      return next
    })
  }, [activeWorkspaceProjectId, projects])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const projectId = sessions.find(
      (session) => session.id === conversationId
    )?.projectId
    if (!projectId) {
      return
    }

    setOpenProjects((current) =>
      current[projectId] ? current : { ...current, [projectId]: true }
    )
  }, [conversationId, sessions])

  return (
    <Sidebar
      collapsible="offcanvas"
      className="absolute! inset-y-0 h-full! group-data-[side=left]:border-r-0 [&>[data-slot=sidebar-inner]]:bg-transparent"
    >
      <ContextMenu>
        <ContextMenuTrigger className="flex min-h-0 flex-1 flex-col">
          <SidebarHeader className="gap-2 p-2" style={{borderBottom: 'rgb(140, 140, 140, 0.3) 1px solid'}}>
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as AgentMode)}
            >
              <TabsList className="grid w-full grid-cols-2 bg-sidebar-accent">
                <TabsTrigger
                  value="agent"
                  className="hover:bg-background/35 data-active:bg-background/65"
                >
                  <BotIcon data-icon="inline-start" />
                  代理
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="hover:bg-background/35 data-active:bg-background/65"
                >
                  <MessageCircleIcon data-icon="inline-start" />
                  聊天
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      aria-label={item.label}
                      tooltip={item.label}
                      isActive={
                        activePage === item.id &&
                        (item.id !== "new-task" || !conversationId)
                      }
                      onClick={() => {
                        if (item.id === "new-task") {
                          if (isTemporaryConversation) {
                            setTemporaryCloseOpen(true)
                            return
                          }
                          resetConversation()
                        }
                        setActivePage(item.id)
                      }}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.id === "reading" && readingUnreadCount ? (
                      <SidebarMenuBadge>{readingUnreadCount}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup className="group/projects gap-2">
              <SidebarGroupLabel>项目</SidebarGroupLabel>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <SidebarGroupAction
                      aria-label="添加项目"
                      className="pointer-events-none opacity-0 transition-opacity group-focus-within/projects:pointer-events-auto group-focus-within/projects:opacity-100 group-hover/projects:pointer-events-auto group-hover/projects:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
                      onClick={requestProjectDialog}
                    />
                  }
                >
                  <PlusIcon />
                </TooltipTrigger>
                <TooltipContent side="right">添加项目 · ⌘⇧O</TooltipContent>
              </Tooltip>
              <SidebarGroupContent>
                {projects.map((project) => (
                  <SessionProjectGroup
                    key={project.id}
                    projectId={project.id}
                    label={project.name}
                    kind={project.kind}
                    fixed={project.fixed}
                    roots={project.roots}
                    defaultRootId={project.defaultRootId}
                    open={Boolean(openProjects[project.id])}
                    onActivate={() => activateWorkspaceProject(project.id)}
                    onOpenChange={(open) =>
                      setOpenProjects((current) => ({
                        ...current,
                        [project.id]: open,
                      }))
                    }
                  />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2" style={{borderTop: 'rgb(140, 140, 140, 0.3) 1px solid'}}>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton size="lg" tooltip="Aestival 菜单" />
                    }
                  >
                    <img
                      src={appIcon}
                      alt=""
                      className="size-6 shrink-0"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">Aestival</span>
                      <span className="truncate text-xs text-muted-foreground">
                        本地工作区
                      </span>
                    </span>
                    <ChevronUpIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setCommandOpen(true)}>
                        <SearchIcon />
                        全局搜索
                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActivePage("settings")}>
                        <SettingsIcon />
                        打开设置
                        <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { useSettingsStore.getState().setActiveCategory("shortcuts"); setActivePage("settings") }}>
                        <KeyboardIcon />
                        键盘快捷键
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <FolderOpenIcon />
                        打开数据目录
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ImportIcon />
                        导入配置
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DownloadIcon />
                        导出配置
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <BookOpenIcon />
                        文档
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { useSettingsStore.getState().setActiveCategory("about"); setActivePage("settings") }}>
                        <InfoIcon />
                        关于 Aestival
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <RefreshCwIcon />
                        重新加载界面
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <LogOutIcon />
                        退出
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuGroup>
            <ContextMenuItem onClick={requestProjectDialog}>
              <FolderPlusIcon />
              新建项目
              <ContextMenuShortcut>⌘⇧O</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setActivePage("new-task")}>
              <SquarePenIcon />
              新建任务
              <ContextMenuShortcut>⌘N</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => setAllProjectsOpen(true)}>
              <ChevronDownIcon />
              全部展开
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setAllProjectsOpen(false)}>
              <ChevronUpIcon />
              全部收起
            </ContextMenuItem>
            <ContextMenuCheckboxItem
              checked={showArchivedSessions}
              onCheckedChange={setShowArchivedSessions}
            >
              <ArchiveIcon />
              显示已归档会话
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem>
              <RefreshCwIcon />
              刷新项目
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
      {/* 上延量与标题栏高度 53px 对齐，使 hover 高亮与点击区域从窗口顶部连续到底部 */}
      <SidebarRail className="-top-[53px]" />
    </Sidebar>
  )
}
