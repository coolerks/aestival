import { useState } from "react"
import {
  ArchiveIcon,
  BookOpenIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  ImportIcon,
  InfoIcon,
  KeyboardIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  SquarePenIcon,
} from "lucide-react"

import appIcon from "@/assets/icons/application/icon.svg"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockSessions, navigationItems } from "@/data/mock-workspace"
import {
  type AgentMode,
  useWorkspaceStore,
} from "@/store/workspace-store"

export function AppSidebar() {
  const [projectOpen, setProjectOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const mode = useWorkspaceStore((state) => state.mode)
  const setMode = useWorkspaceStore((state) => state.setMode)
  const activePage = useWorkspaceStore((state) => state.activePage)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen)

  return (
    <Sidebar
      collapsible="offcanvas"
      className="absolute! inset-y-0 h-full! group-data-[side=left]:border-r-0 [&>[data-slot=sidebar-inner]]:bg-transparent"
    >
      <ContextMenu>
        <ContextMenuTrigger className="flex min-h-0 flex-1 flex-col">
          <SidebarHeader className="gap-2 border-b p-2">
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
                      tooltip={item.label}
                      isActive={activePage === item.id}
                      onClick={() => setActivePage(item.id)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>项目</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible open={projectOpen} onOpenChange={setProjectOpen}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            tooltip="任务"
                            isActive={activePage === "new-task"}
                            onClick={() => setActivePage("new-task")}
                          />
                        }
                      >
                        {projectOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        <FolderIcon />
                        <span>任务</span>
                      </CollapsibleTrigger>
                      <SidebarMenuAction
                        aria-label="任务项目更多操作"
                        showOnHover
                      >
                        <MoreHorizontalIcon />
                      </SidebarMenuAction>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mx-3 border-l-0 px-2.5">
                          {mockSessions.map((session) => (
                            <SidebarMenuSubItem key={session.id}>
                              <SidebarMenuSubButton
                                href="#"
                                onClick={(event) => event.preventDefault()}
                              >
                                <span>{session.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              href="#"
                              onClick={(event) => event.preventDefault()}
                              className="text-muted-foreground"
                            >
                              <span>展开更多</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
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
                      <DropdownMenuItem>
                        <SettingsIcon />
                        打开设置
                        <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
                      <DropdownMenuItem>
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
            <ContextMenuItem onClick={() => setActivePage("new-task")}>
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
            <ContextMenuItem onClick={() => setProjectOpen(true)}>
              <ChevronDownIcon />
              全部展开
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setProjectOpen(false)}>
              <ChevronUpIcon />
              全部收起
            </ContextMenuItem>
            <ContextMenuCheckboxItem
              checked={showArchived}
              onCheckedChange={setShowArchived}
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
      <SidebarRail className="-top-[50px]" />
    </Sidebar>
  )
}
