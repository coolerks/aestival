import {useMemo} from "react"
import {
  AppWindowIcon,
  ArrowDownAZIcon,
  CirclePauseIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileArchiveIcon,
  FileCode2Icon,
  FolderOpenIcon,
  Grid2X2Icon,
  ImageIcon,
  ImportIcon,
  ListIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react"
import {toast} from "sonner"

import appIcon from "@/assets/icons/application/icon.svg"
import {
  ManagementEmpty,
  ManagementListFrame,
  ManagementMetricBand,
  ManagementToolbar,
} from "@/components/shared/management-page"
import {ManagementSearch} from "@/components/shared/management-search"
import {AspectRatio} from "@/components/ui/aspect-ratio"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {Item, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle} from "@/components/ui/item"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import {
  appPermissionLabels,
  type AppPermissions,
  appSourceLabels,
  appStatusLabels,
  type MockLocalApp,
} from "@/data/mock-app-center"
import {useAppStore} from "@/store/app-store"

const statusVariant = {
  runnable: "secondary",
  draft: "outline",
  error: "destructive",
  disabled: "outline",
} as const

function PermissionSummary({ permissions }: { permissions: AppPermissions }) {
  const enabled = Object.entries(permissions)
    .filter(([, value]) => value)
    .map(([key]) => appPermissionLabels[key as keyof AppPermissions])
  return (
    <span className="truncate text-xs text-muted-foreground">
      {enabled.length ? `权限：${enabled.join("、")}` : "未授予敏感权限"}
    </span>
  )
}

function AppMenu({ app }: { app: MockLocalApp }) {
  const openEditor = useAppStore((state) => state.openEditor)
  const duplicateApp = useAppStore((state) => state.duplicateApp)
  const toggleDisabled = useAppStore((state) => state.toggleDisabled)
  const setDialog = useAppStore((state) => state.setDialog)
  return (
    <>
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => openEditor(app.id)}><PlayIcon />打开</ContextMenuItem>
        <ContextMenuItem onClick={() => toast.info("新窗口运行仍为 Mock") }><ExternalLinkIcon />在新窗口打开</ContextMenuItem>
        <ContextMenuItem onClick={() => openEditor(app.id)}><PencilIcon />编辑代码</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => duplicateApp(app.id)}><CopyIcon />创建副本</ContextMenuItem>
        <ContextMenuItem onClick={() => setDialog("icon", app.id)}><ImageIcon />更换图标</ContextMenuItem>
        <ContextMenuItem onClick={() => toast.info("已准备导出 Mock 包", { description: "当前不会写入本地文件。" })}><FileArchiveIcon />导出应用</ContextMenuItem>
        <ContextMenuItem onClick={() => toast.info("源码目录尚未写入磁盘") }><FolderOpenIcon />显示源文件</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => toggleDisabled(app.id)}><CirclePauseIcon />{app.status === "disabled" ? "启用应用" : "停用应用"}</ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => setDialog("delete", app.id)}><Trash2Icon />删除应用</ContextMenuItem>
      </ContextMenuGroup>
    </>
  )
}

function AppCard({ app }: { app: MockLocalApp }) {
  const openEditor = useAppStore((state) => state.openEditor)
  const setDialog = useAppStore((state) => state.setDialog)
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block h-full">
        <Card className="h-full transition-colors hover:bg-muted/20">
          <CardHeader>
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-muted p-2 ring-1 ring-foreground/10">
                <AspectRatio ratio={1}><img src={appIcon} alt="Aestival 默认应用图标" className="size-full object-contain" /></AspectRatio>
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate">{app.name}</CardTitle>
                <Badge variant={statusVariant[app.status]} className="mt-1">{appStatusLabels[app.status]}</Badge>
              </div>
            </div>
            <CardAction>
              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger render={<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${app.name} 更多操作`} />} />}>
                    <MoreHorizontalIcon />
                  </TooltipTrigger>
                  <DropdownMenuContent align="end" className="w-52"><AppDropdownItems app={app} /></DropdownMenuContent>
                </DropdownMenu>
                <TooltipContent>更多操作</TooltipContent>
              </Tooltip>
            </CardAction>
            <CardDescription className="line-clamp-2 min-h-10">{app.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{appSourceLabels[app.source]}</Badge>
              <span>更新于 {app.updatedAt}</span>
            </div>
            <PermissionSummary permissions={app.permissions} />
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground">{app.lastRunAt ? `最近运行 ${app.lastRunAt}` : "尚未运行"}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setDialog("details", app.id)}>详情</Button>
              <Button size="sm" onClick={() => openEditor(app.id)}><PlayIcon data-icon="inline-start" />打开</Button>
            </div>
          </CardFooter>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56"><AppMenu app={app} /></ContextMenuContent>
    </ContextMenu>
  )
}

function AppDropdownItems({ app }: { app: MockLocalApp }) {
  const openEditor = useAppStore((state) => state.openEditor)
  const duplicateApp = useAppStore((state) => state.duplicateApp)
  const toggleDisabled = useAppStore((state) => state.toggleDisabled)
  const setDialog = useAppStore((state) => state.setDialog)
  return (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={() => openEditor(app.id)}><PencilIcon />编辑</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setDialog("details", app.id)}><AppWindowIcon />查看详情</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setDialog("permissions", app.id)}><ShieldCheckIcon />权限</DropdownMenuItem>
      <DropdownMenuItem onClick={() => duplicateApp(app.id)}><CopyIcon />创建副本</DropdownMenuItem>
      <DropdownMenuItem onClick={() => toggleDisabled(app.id)}><CirclePauseIcon />{app.status === "disabled" ? "启用" : "停用"}</DropdownMenuItem>
      <DropdownMenuItem variant="destructive" onClick={() => setDialog("delete", app.id)}><Trash2Icon />删除</DropdownMenuItem>
    </DropdownMenuGroup>
  )
}

function AppListRow({ app }: { app: MockLocalApp }) {
  const openEditor = useAppStore((state) => state.openEditor)
  const setDialog = useAppStore((state) => state.setDialog)
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">
        <Item className="rounded-none px-1" size="sm">
          <img src={appIcon} alt="" className="size-8 shrink-0" />
          <ItemContent>
            <ItemTitle>{app.name}<Badge variant={statusVariant[app.status]}>{appStatusLabels[app.status]}</Badge></ItemTitle>
            <ItemDescription>{app.description}</ItemDescription>
          </ItemContent>
          <div className="hidden min-w-32 text-xs text-muted-foreground md:block">{appSourceLabels[app.source]}</div>
          <div className="hidden min-w-32 text-xs text-muted-foreground lg:block">{app.updatedAt}</div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setDialog("details", app.id)}>详情</Button>
            <Button size="sm" onClick={() => openEditor(app.id)}>打开</Button>
          </div>
        </Item>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56"><AppMenu app={app} /></ContextMenuContent>
    </ContextMenu>
  )
}

export function AppLibrary() {
  const apps = useAppStore((state) => state.apps)
  const search = useAppStore((state) => state.search)
  const sourceFilter = useAppStore((state) => state.sourceFilter)
  const statusFilter = useAppStore((state) => state.statusFilter)
  const sort = useAppStore((state) => state.sort)
  const viewMode = useAppStore((state) => state.viewMode)
  const setSearch = useAppStore((state) => state.setSearch)
  const setSourceFilter = useAppStore((state) => state.setSourceFilter)
  const setStatusFilter = useAppStore((state) => state.setStatusFilter)
  const setSort = useAppStore((state) => state.setSort)
  const setViewMode = useAppStore((state) => state.setViewMode)
  const setDialog = useAppStore((state) => state.setDialog)
  const enabledPermissions = apps.reduce((total, app) => total + Object.values(app.permissions).filter(Boolean).length, 0)
  const filteredApps = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    return [...apps]
      .filter((app) => !needle || `${app.name} ${app.description}`.toLocaleLowerCase().includes(needle))
      .filter((app) => sourceFilter === "all" || app.source === sourceFilter)
      .filter((app) => statusFilter === "all" || app.status === statusFilter)
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "zh-CN") : sort === "recent" ? b.runCount - a.runCount : apps.indexOf(a) - apps.indexOf(b))
  }, [apps, search, sourceFilter, statusFilter, sort])

  return (
    <section className="flex size-full min-h-0 flex-col" aria-label="应用中心">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
      <ManagementMetricBand
        items={[
          { label: "应用总数", value: apps.length },
          { label: "最近运行", value: apps.filter((app) => app.lastRunAt).length },
          { label: "需要修复", value: apps.filter((app) => app.status === "error").length },
          { label: "已授予权限", value: enabledPermissions },
        ]}
      />
      <ManagementToolbar>
        <ManagementSearch value={search} onValueChange={setSearch} placeholder="搜索本地应用…" label="搜索本地应用" />
        <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as typeof sourceFilter)}><SelectTrigger aria-label="筛选应用来源"><SelectValue>{sourceFilter === "all" ? "全部来源" : appSourceLabels[sourceFilter]}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部来源</SelectItem><SelectItem value="manual">手动创建</SelectItem><SelectItem value="ai">AI 会话</SelectItem><SelectItem value="imported">本地导入</SelectItem></SelectGroup></SelectContent></Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger aria-label="筛选应用状态"><SelectValue>{statusFilter === "all" ? "全部状态" : appStatusLabels[statusFilter]}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部状态</SelectItem><SelectItem value="runnable">可运行</SelectItem><SelectItem value="draft">草稿</SelectItem><SelectItem value="error">需要修复</SelectItem><SelectItem value="disabled">已停用</SelectItem></SelectGroup></SelectContent></Select>
        <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" aria-label="应用排序" />}><ArrowDownAZIcon data-icon="inline-start" />排序</DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => setSort("updated")}><FileCode2Icon />最近更新</DropdownMenuItem><DropdownMenuItem onClick={() => setSort("recent")}><PlayIcon />最近运行</DropdownMenuItem><DropdownMenuItem onClick={() => setSort("name")}><ArrowDownAZIcon />名称</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
        <ToggleGroup value={[viewMode]} onValueChange={(value) => value[0] && setViewMode(value[0] as typeof viewMode)} variant="outline" size="default" spacing={0} aria-label="应用显示方式">
          <ToggleGroupItem value="grid" aria-label="网格显示"><Grid2X2Icon /></ToggleGroupItem><ToggleGroupItem value="list" aria-label="列表显示"><ListIcon /></ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline" onClick={() => setDialog("import")}><ImportIcon data-icon="inline-start" />导入</Button>
        <Button onClick={() => setDialog("create")}><PlusIcon data-icon="inline-start" />新建应用</Button>
      </ManagementToolbar>
          {filteredApps.length ? viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredApps.map((app) => <AppCard key={app.id} app={app} />)}</div>
          ) : (
            <ManagementListFrame><ItemGroup className="gap-0">{filteredApps.map((app, index) => <div key={app.id}>{index > 0 ? <ItemSeparator className="my-0" /> : null}<AppListRow app={app} /></div>)}</ItemGroup></ManagementListFrame>
          ) : (
            <ManagementEmpty><EmptyHeader><EmptyMedia variant="icon"><AppWindowIcon /></EmptyMedia><EmptyTitle>没有匹配的应用</EmptyTitle><EmptyDescription>调整搜索或筛选条件，或者创建一个本地应用。</EmptyDescription></EmptyHeader></ManagementEmpty>
          )}
        </div>
      </div>
    </section>
  )
}
