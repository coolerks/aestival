import { useMemo } from "react"
import {
  BlocksIcon,
  BotIcon,
  BracesIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CodeXmlIcon,
  CopyIcon,
  EyeIcon,
  FilePenLineIcon,
  MoreHorizontalIcon,
  NetworkIcon,
  PauseCircleIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  WebhookIcon,
} from "lucide-react"
import { toast } from "sonner"

import { CapabilityOverlays } from "@/components/capabilities/capability-overlays"
import {
  ManagementEmpty,
  ManagementListFrame,
  ManagementMetricBand,
  ManagementPageHeader,
  ManagementToolbar,
} from "@/components/shared/management-page"
import { ManagementSearch } from "@/components/shared/management-search"
import { DropdownMenuIconTrigger } from "@/components/shell/icon-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dropdown-menu"
import { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  capabilityTabs,
  hookStages,
  statusLabels,
  type CapabilityRecord,
  type CapabilityStatus,
  type CapabilityTab,
} from "@/data/mock-capabilities"
import { useCapabilityStore } from "@/store/capability-store"

const tabIcons = { mcp: NetworkIcon, skills: SparklesIcon, agents: BotIcon, prompts: BracesIcon, hooks: WebhookIcon }

const statusIcons: Record<CapabilityStatus, typeof CircleCheckIcon> = {
  running: PlayIcon,
  enabled: CircleCheckIcon,
  disabled: PauseCircleIcon,
  error: CircleAlertIcon,
  update: RefreshCwIcon,
}

const statusVariants: Record<CapabilityStatus, "default" | "secondary" | "destructive" | "outline"> = {
  running: "default",
  enabled: "secondary",
  disabled: "outline",
  error: "destructive",
  update: "outline",
}

export function CapabilitiesPage() {
  const records = useCapabilityStore((state) => state.records)
  const activeTab = useCapabilityStore((state) => state.activeTab)
  const setActiveTab = useCapabilityStore((state) => state.setActiveTab)
  const search = useCapabilityStore((state) => state.search)
  const setSearch = useCapabilityStore((state) => state.setSearch)
  const statusFilter = useCapabilityStore((state) => state.statusFilter)
  const setStatusFilter = useCapabilityStore((state) => state.setStatusFilter)
  const sourceFilter = useCapabilityStore((state) => state.sourceFilter)
  const setSourceFilter = useCapabilityStore((state) => state.setSourceFilter)
  const hookStage = useCapabilityStore((state) => state.hookStage)
  const setHookStage = useCapabilityStore((state) => state.setHookStage)
  const setDialog = useCapabilityStore((state) => state.setDialog)

  const tab = capabilityTabs.find((item) => item.id === activeTab) ?? capabilityTabs[0]
  const tabRecords = records.filter((record) => record.tab === activeTab)
  const sources = [...new Set(tabRecords.map((record) => record.source))]
  const filteredRecords = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return tabRecords.filter((record) => {
      const matchesSearch = !normalized || [record.name, record.description, record.source, record.type, ...record.meta]
        .join(" ").toLowerCase().includes(normalized)
      const matchesStatus = statusFilter === "all" || record.status === statusFilter
      const matchesSource = sourceFilter === "all" || record.source === sourceFilter
      const matchesStage = activeTab !== "hooks" || hookStage === "all" || record.type === hookStage
      return matchesSearch && matchesStatus && matchesSource && matchesStage
    })
  }, [activeTab, hookStage, search, sourceFilter, statusFilter, tabRecords])

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ManagementPageHeader
        tabs={
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CapabilityTab)}>
            <TabsList className="max-w-full justify-start overflow-x-auto">
            {capabilityTabs.map((item) => {
              const Icon = tabIcons[item.id]
              return <TabsTrigger key={item.id} value={item.id}><Icon />{item.label}</TabsTrigger>
            })}
            </TabsList>
          </Tabs>
        }
        description={`${tab.description} 当前不会安装、联网或执行真实能力。`}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex w-full flex-col gap-4">
          <CapabilityMetrics records={tabRecords} />

          {activeTab === "mcp" || activeTab === "skills" ? (
            <Alert>
              <ShieldCheckIcon />
              <AlertTitle>安全边界已启用</AlertTitle>
              <AlertDescription>
                密钥不会写入普通状态；AI 配置只生成计划，市场内容来自本地缓存，真实连接与安装留待后端方案确认。
              </AlertDescription>
            </Alert>
          ) : null}

          {activeTab === "hooks" ? <HookTimeline value={hookStage} onChange={setHookStage} /> : null}

          <ManagementToolbar>
            <ManagementSearch value={search} onValueChange={setSearch} placeholder={`搜索${tab.label}…`} label={`搜索${tab.label}`} />
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as string)}>
              <SelectTrigger aria-label="筛选来源"><SelectValue>{sourceFilter === "all" ? "全部来源" : sourceFilter}</SelectValue></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="all">全部来源</SelectItem>{sources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger aria-label="筛选状态"><SelectValue>{statusFilter === "all" ? "全部状态" : statusLabels[statusFilter]}</SelectValue></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="all">全部状态</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Button onClick={() => setDialog("create")}><PlusIcon data-icon="inline-start" />{tab.action}</Button>
          </ManagementToolbar>

          {filteredRecords.length === 0 ? (
            <ManagementEmpty>
              <EmptyHeader><EmptyMedia variant="icon"><BlocksIcon /></EmptyMedia><EmptyTitle>没有匹配的{tab.label}</EmptyTitle><EmptyDescription>调整搜索词或筛选条件后重试。</EmptyDescription></EmptyHeader>
            </ManagementEmpty>
          ) : activeTab === "prompts" || activeTab === "hooks" ? (
            <CapabilityTable records={filteredRecords} />
          ) : (
            <ManagementListFrame><ItemGroup className="gap-0">{filteredRecords.map((record, index) => <CapabilityRow key={record.id} record={record} separated={index > 0} />)}</ItemGroup></ManagementListFrame>
          )}
        </div>
      </div>
      <CapabilityOverlays />
    </section>
  )
}

function CapabilityMetrics({ records }: { records: CapabilityRecord[] }) {
  const enabled = records.filter((record) => record.enabled).length
  const errors = records.filter((record) => record.status === "error").length
  const updates = records.filter((record) => record.status === "update").length
  return <ManagementMetricBand items={[{ label: "共计", value: records.length }, { label: "启用", value: enabled }, { label: "异常", value: errors }, { label: "更新", value: updates }]} />
}

function HookTimeline({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-lg border p-2">
      <div className="flex min-w-max items-center gap-1">
        <Button className="shrink-0" size="xs" variant={value === "all" ? "secondary" : "ghost"} onClick={() => onChange("all")}>全部阶段</Button>
        {hookStages.map((stage, index) => <div key={stage} className="flex shrink-0 items-center gap-1"><Separator className="w-4 shrink-0" /><Button className="shrink-0" size="xs" variant={value === stage ? "secondary" : "ghost"} onClick={() => onChange(stage)}>{index + 1}. {stage}</Button></div>)}
      </div>
    </div>
  )
}

function CapabilityRow({ record, separated }: { record: CapabilityRecord; separated: boolean }) {
  const openDetails = useCapabilityStore((state) => state.openDetails)
  const toggleEnabled = useCapabilityStore((state) => state.toggleEnabled)
  const Icon = tabIcons[record.tab]
  const StatusIcon = statusIcons[record.status]
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">
        {separated ? <Separator /> : null}
        <Item className="rounded-none px-3 py-3 hover:bg-muted/40" tabIndex={0} onDoubleClick={() => openDetails(record.id)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetails(record.id) } }}>
          <ItemMedia variant="icon" className="size-9 rounded-lg bg-muted"><Icon /></ItemMedia>
          <ItemContent className="min-w-44">
            <ItemTitle>{record.name}<Badge variant={statusVariants[record.status]}><StatusIcon />{statusLabels[record.status]}</Badge></ItemTitle>
            <ItemDescription>{record.description}</ItemDescription>
          </ItemContent>
          <div className="hidden min-w-36 flex-col gap-1 text-xs text-muted-foreground md:flex"><span>{record.source} · {record.type}</span><span>{record.meta.join(" · ")}</span></div>
          <ItemActions>
            <Switch checked={record.enabled} onCheckedChange={() => toggleEnabled(record.id)} aria-label={`${record.enabled ? "停用" : "启用"}${record.name}`} />
            <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`查看${record.name}详情`} onClick={() => openDetails(record.id)} />}><EyeIcon /></TooltipTrigger><TooltipContent>查看详情</TooltipContent></Tooltip>
            <RecordMenu record={record} />
          </ItemActions>
          </Item>
        </ContextMenuTrigger>
      <CapabilityContextMenuContent record={record} />
    </ContextMenu>
  )
}

function CapabilityContextMenuContent({ record }: { record: CapabilityRecord }) {
  const openDetails = useCapabilityStore((state) => state.openDetails)
  const toggleEnabled = useCapabilityStore((state) => state.toggleEnabled)
  const setDialog = useCapabilityStore((state) => state.setDialog)

  return (
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => openDetails(record.id)}>
          <EyeIcon />
          查看详情
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toast.info("已复制为前端 Mock 草稿")}>
          <CopyIcon />
          复制配置
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toggleEnabled(record.id)}>
          {record.enabled ? <PauseCircleIcon /> : <PlayIcon />}
          {record.enabled ? "停用" : "启用"}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        onClick={() => setDialog("delete", record.id)}
      >
        <Trash2Icon />
        删除
      </ContextMenuItem>
    </ContextMenuContent>
  )
}

function RecordMenu({ record }: { record: CapabilityRecord }) {
  const openDetails = useCapabilityStore((state) => state.openDetails)
  const setDialog = useCapabilityStore((state) => state.setDialog)
  return <DropdownMenu><DropdownMenuIconTrigger label={`${record.name}更多操作`}><MoreHorizontalIcon /></DropdownMenuIconTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => openDetails(record.id)}><FilePenLineIcon />查看与配置</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("导出仅生成前端 Mock 预览")}><CodeXmlIcon />导出配置</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDialog("delete", record.id)}><Trash2Icon />删除</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
}

function CapabilityTable({ records }: { records: CapabilityRecord[] }) {
  const toggleEnabled = useCapabilityStore((state) => state.toggleEnabled)
  return (
    <ManagementListFrame>
      <Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>分类 / 阶段</TableHead><TableHead>作用域</TableHead><TableHead className="hidden lg:table-cell">信息</TableHead><TableHead>状态</TableHead><TableHead className="w-20 text-right">操作</TableHead></TableRow></TableHeader><TableBody>
        {records.map((record) => { const StatusIcon = statusIcons[record.status]; return <ContextMenu key={record.id}><ContextMenuTrigger render={<TableRow tabIndex={0} className="cursor-default" onDoubleClick={() => useCapabilityStore.getState().openDetails(record.id)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); useCapabilityStore.getState().openDetails(record.id) } }} />}><TableCell><div className="font-medium">{record.name}</div><div className="max-w-72 truncate text-xs text-muted-foreground">{record.description}</div></TableCell><TableCell><Badge variant="outline">{record.type}</Badge></TableCell><TableCell>{record.source}</TableCell><TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{record.meta.join(" · ")}</TableCell><TableCell><Badge variant={statusVariants[record.status]}><StatusIcon />{statusLabels[record.status]}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Switch checked={record.enabled} onCheckedChange={() => toggleEnabled(record.id)} aria-label={`${record.enabled ? "停用" : "启用"}${record.name}`} /><RecordMenu record={record} /></div></TableCell></ContextMenuTrigger><CapabilityContextMenuContent record={record} /></ContextMenu> })}
      </TableBody></Table>
    </ManagementListFrame>
  )
}
