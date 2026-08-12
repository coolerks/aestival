import { useState } from "react"
import { DropdownMenuIconTrigger, IconButton } from "@/components/shell/icon-button"
import {
  ActivityIcon,
  AlertTriangleIcon,
  CableIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleAlertIcon,
  DownloadIcon,
  EyeIcon,
  KeyRoundIcon,
  Link2OffIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

import { ManagementSearch } from "@/components/shared/management-search"
import { ReadingSettings } from "@/components/reading/reading-settings"
import {
  ManagementListFrame,
  ManagementMetricBand,
} from "@/components/shared/management-page"
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  connectionPlatforms,
  mockConnectionActivity,
  mockModels,
  mockPairingRequests,
  mockProviders,
  mockShortcuts,
  notificationEvents,
  usageTrend,
  type MockConnection,
  type SettingsCategory,
} from "@/data/mock-settings"
import { useSettingsStore } from "@/store/settings-store"

export function SettingsContent({ category }: { category: SettingsCategory }) {
  return <div className="flex w-full flex-col gap-4 p-4">
    {category === "models" ? <ModelSettings /> : category === "statistics" ? <StatisticsSettings /> : category === "connections" ? <ConnectionSettings /> : category === "reading" ? <ReadingSettings /> : category === "notifications" ? <NotificationSettings /> : category === "appearance" ? <AppearanceSettings /> : category === "shortcuts" ? <ShortcutSettings /> : <AboutSettings />}
    <SettingsOverlays />
  </div>
}

function SectionIntro({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p></div>{action}</div>
}

function ModelSettings() {
  const tab = useSettingsStore((state) => state.modelTab)
  const setTab = useSettingsStore((state) => state.setModelTab)
  const setDialog = useSettingsStore((state) => state.setDialog)
  return <>
    <SectionIntro title="模型管理" description="集中管理本地和兼容供应商。密钥只显示引用，不写入普通前端状态。" action={<Button size="sm" onClick={() => setDialog(tab === "models" ? "model" : "provider")}><PlusIcon data-icon="inline-start" />{tab === "models" ? "添加模型" : "添加供应商"}</Button>} />
    <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}><TabsList variant="line"><TabsTrigger value="providers">供应商</TabsTrigger><TabsTrigger value="models">模型</TabsTrigger><TabsTrigger value="routing">路由</TabsTrigger><TabsTrigger value="limits">限制</TabsTrigger></TabsList>
      <TabsContent value="providers" className="mt-4"><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>供应商</TableHead><TableHead>Endpoint</TableHead><TableHead>状态</TableHead><TableHead>模型</TableHead><TableHead>最近测试</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{mockProviders.map((provider) => <TableRow key={provider.id}><TableCell><div className="font-medium">{provider.alias}</div><div className="text-xs text-muted-foreground">{provider.provider}{provider.isDefault ? " · 默认" : ""}</div></TableCell><TableCell className="max-w-64 truncate font-mono text-xs">{provider.endpoint}</TableCell><TableCell><StatusBadge value={provider.status === "ready" ? "就绪" : provider.status === "error" ? "错误" : "未测试"} danger={provider.status === "error"} /></TableCell><TableCell>{provider.modelCount}</TableCell><TableCell>{provider.testedAt}</TableCell><TableCell className="text-right"><IconButton label={`测试${provider.alias}`} onClick={() => toast.info("前端 Mock 不会发送连接请求")}><RefreshCwIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></div></TabsContent>
      <TabsContent value="models" className="mt-4"><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>模型</TableHead><TableHead>供应商</TableHead><TableHead>能力</TableHead><TableHead>上下文</TableHead><TableHead>用途</TableHead><TableHead>状态</TableHead></TableRow></TableHeader><TableBody>{mockModels.map((model) => <TableRow key={model.id}><TableCell><div className="font-medium">{model.name}</div><div className="font-mono text-xs text-muted-foreground">{model.modelId}</div></TableCell><TableCell>{model.provider}</TableCell><TableCell><div className="flex flex-wrap gap-1">{model.capabilities.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div></TableCell><TableCell>{model.context}</TableCell><TableCell>{model.usage}</TableCell><TableCell><StatusBadge value={model.status === "ready" ? "可用" : "已禁用"} /></TableCell></TableRow>)}</TableBody></Table></div></TabsContent>
      <TabsContent value="routing" className="mt-4"><div className="divide-y rounded-lg border"><SettingRow title="默认聊天模型" description="纯聊天模式，不允许工具调用"><Select defaultValue="fast"><SelectTrigger className="w-48"><SelectValue>Mock Fast</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="fast">Mock Fast</SelectItem><SelectItem value="balanced">Mock Balanced</SelectItem></SelectGroup></SelectContent></Select></SettingRow><SettingRow title="默认代理模型" description="受审批策略约束的工具任务"><Select defaultValue="balanced"><SelectTrigger className="w-48"><SelectValue>Mock Balanced</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="balanced">Mock Balanced</SelectItem><SelectItem value="fast">Mock Fast</SelectItem></SelectGroup></SelectContent></Select></SettingRow><SettingRow title="故障回退" description="供应商不可用时按顺序尝试"><Switch defaultChecked aria-label="启用模型回退" /></SettingRow></div></TabsContent>
      <TabsContent value="limits" className="mt-4"><div className="divide-y rounded-lg border"><SettingRow title="每日费用提醒" description="达到阈值时仅提示，不自动扣费"><div className="flex items-center gap-2"><Input className="w-24" defaultValue="20" aria-label="每日费用提醒阈值" /><span>元</span></div></SettingRow><SettingRow title="单次上下文上限" description="超出后要求压缩或开启新会话"><div className="w-56"><Progress value={64} /><div className="mt-1 text-xs text-muted-foreground">64k / 100k</div></div></SettingRow></div></TabsContent>
    </Tabs>
  </>
}

function StatisticsSettings() {
  return <>
    <SectionIntro title="信息统计" description="下面数据用于验证布局和筛选交互，费用与 Token 均为 Mock 估算。" action={<Button variant="outline" size="sm" onClick={() => toast.info("已生成脱敏 Mock 统计预览")}><DownloadIcon data-icon="inline-start" />导出</Button>} />
    <div className="flex flex-wrap gap-2">
      <Select defaultValue="7d"><SelectTrigger><SelectValue>最近 7 天</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="7d">最近 7 天</SelectItem><SelectItem value="30d">最近 30 天</SelectItem><SelectItem value="custom">自定义</SelectItem></SelectGroup></SelectContent></Select>
      <Select defaultValue="all"><SelectTrigger><SelectValue>全部模型</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部模型</SelectItem><SelectItem value="balanced">Mock Balanced</SelectItem></SelectGroup></SelectContent></Select>
    </div>
    <ManagementMetricBand items={[{ label: "消息", value: "343" }, { label: "Token", value: "143k" }, { label: "费用", value: "¥48（估算）" }, { label: "成功率", value: "96.2%" }]} />
    <div className="rounded-lg border p-3"><div className="mb-3 text-sm font-medium">消息与 Token 趋势</div><ChartContainer config={{ messages: { label: "消息", color: "var(--primary)" }, tokens: { label: "Token（千）", color: "var(--muted-foreground)" } }} className="h-64 w-full aspect-auto"><BarChart data={usageTrend}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="messages" fill="var(--color-messages)" radius={4} /><Bar dataKey="tokens" fill="var(--color-tokens)" radius={4} /></BarChart></ChartContainer></div>
    <ManagementListFrame><Table><TableHeader><TableRow><TableHead>工具</TableHead><TableHead>调用</TableHead><TableHead>成功率</TableHead><TableHead>平均耗时</TableHead></TableRow></TableHeader><TableBody>{[["文件读取","86","99%","42 ms"],["终端命令","31","94%","1.8 s"],["网络检索","18","89%","3.1 s"]].map((row) => <TableRow key={row[0]}>{row.map((value) => <TableCell key={value}>{value}</TableCell>)}</TableRow>)}</TableBody></Table></ManagementListFrame>
  </>
}

function ConnectionSettings() {
  const tab = useSettingsStore((state) => state.connectionTab)
  const setTab = useSettingsStore((state) => state.setConnectionTab)
  const setDialog = useSettingsStore((state) => state.setDialog)
  return <><SectionIntro title="连接" description="管理 Telegram、飞书、Discord、钉钉、微信与 QQ 外部消息入口。Aestival 不提供登录或云账户。" action={<Button size="sm" onClick={() => setDialog("connection")}><PlusIcon data-icon="inline-start" />添加连接</Button>} /><div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><div className="flex items-center gap-2 font-medium text-destructive"><ShieldCheckIcon className="size-4" />默认拒绝远程高风险权限</div><p className="mt-1 text-muted-foreground">外部发送者不能绕过聊天/代理模式、允许列表或桌面审批。</p></div><Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}><TabsList variant="line"><TabsTrigger value="connections">连接</TabsTrigger><TabsTrigger value="pairings">配对请求</TabsTrigger><TabsTrigger value="activity">活动记录</TabsTrigger></TabsList><TabsContent value="connections" className="mt-4"><ConnectionList /></TabsContent><TabsContent value="pairings" className="mt-4"><PairingList /></TabsContent><TabsContent value="activity" className="mt-4"><ActivityList /></TabsContent></Tabs></>
}

function ConnectionList() {
  const connections = useSettingsStore((state) => state.connections)
  const search = useSettingsStore((state) => state.connectionSearch)
  const setSearch = useSettingsStore((state) => state.setConnectionSearch)
  const riskOnly = useSettingsStore((state) => state.riskOnly)
  const setRiskOnly = useSettingsStore((state) => state.setRiskOnly)
  const filtered = connections.filter((item) => (!search || `${item.platform} ${item.alias} ${item.identity}`.toLowerCase().includes(search.toLowerCase())) && (!riskOnly || item.risk))
  return <div className="flex flex-col gap-3"><div className="flex flex-wrap gap-2"><ManagementSearch value={search} onValueChange={setSearch} placeholder="搜索连接…" label="搜索连接" /><Label className="rounded-lg border px-2.5"><Checkbox checked={riskOnly} onCheckedChange={(value) => setRiskOnly(Boolean(value))} />仅风险项</Label></div>{filtered.length ? <ManagementListFrame><ItemGroup className="gap-0">{filtered.map((connection,index) => <ConnectionItem key={connection.id} connection={connection} separated={index>0} />)}</ItemGroup></ManagementListFrame> : <Empty className="min-h-48 rounded-lg border"><EmptyHeader><EmptyMedia variant="icon"><CableIcon /></EmptyMedia><EmptyTitle>没有匹配连接</EmptyTitle><EmptyDescription>调整搜索词或取消“仅风险项”后重试。</EmptyDescription></EmptyHeader></Empty>}</div>
}

function ConnectionItem({ connection, separated }: { connection: MockConnection; separated: boolean }) {
  const openDetails = useSettingsStore((state) => state.openConnectionDetails)
  const toggle = useSettingsStore((state) => state.toggleConnection)
  const setDialog = useSettingsStore((state) => state.setDialog)
  return <>{separated ? <Separator /> : null}<Item><ItemMedia variant="icon"><CableIcon /></ItemMedia><ItemContent><ItemTitle>{connection.alias}{connection.risk ? <Badge variant="destructive">风险</Badge> : null}</ItemTitle><ItemDescription>{connection.identity} · {connection.scope}</ItemDescription><div className="flex flex-wrap gap-1"><StatusBadge value={connection.status === "online" ? "在线" : connection.status === "paused" ? "已暂停" : connection.status === "limited" ? "受限" : connection.status === "auth" ? "需认证" : "错误"} danger={connection.status === "error" || connection.status === "auth"} /><Badge variant="outline">{connection.mode}</Badge><Badge variant="outline">{connection.transport}</Badge></div></ItemContent><ItemActions><IconButton label={`查看${connection.alias}`} onClick={() => openDetails(connection.id)}><ChevronRightIcon /></IconButton><DropdownMenu><DropdownMenuIconTrigger label={`${connection.alias}更多操作`}><MoreHorizontalIcon /></DropdownMenuIconTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => openDetails(connection.id)}><EyeIcon />查看详情</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("前端 Mock 不会向外部平台发送请求")}><ActivityIcon />测试连接</DropdownMenuItem><DropdownMenuItem onClick={() => toggle(connection.id)}><SlidersHorizontalIcon />{connection.status === "paused" ? "恢复" : "暂停"}</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => setDialog("disconnect", connection.id)}><Link2OffIcon />断开并删除</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></ItemActions></Item></>
}

function PairingList() {
  const ids = useSettingsStore((state) => state.pairingIds)
  const setDialog = useSettingsStore((state) => state.setDialog)
  const rows = mockPairingRequests.filter((request) => ids.includes(request.id))
  return rows.length ? <ManagementListFrame><Table><TableHeader><TableRow><TableHead>请求方</TableHead><TableHead>来源</TableHead><TableHead>配对码</TableHead><TableHead>有效期</TableHead><TableHead>风险</TableHead><TableHead className="text-right">处理</TableHead></TableRow></TableHeader><TableBody>{rows.map((request) => <TableRow key={request.id}><TableCell><div className="font-medium">{request.requester}</div><div className="font-mono text-xs text-muted-foreground">{request.stableId}</div></TableCell><TableCell>{request.source}</TableCell><TableCell className="font-mono">{request.code}</TableCell><TableCell>{request.expires}</TableCell><TableCell><Badge variant="outline">{request.risk}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="xs" onClick={() => setDialog("pairing", request.id)}>检查</Button></TableCell></TableRow>)}</TableBody></Table></ManagementListFrame> : <Empty className="min-h-48 rounded-lg border"><EmptyHeader><EmptyMedia variant="icon"><KeyRoundIcon /></EmptyMedia><EmptyTitle>暂无配对请求</EmptyTitle><EmptyDescription>新的外部发送者申请配对后会显示在这里。</EmptyDescription></EmptyHeader></Empty>
}

function ActivityList() {
  const activities = mockConnectionActivity
  return <ManagementListFrame><Table><TableHeader><TableRow><TableHead>时间</TableHead><TableHead>方向</TableHead><TableHead>连接 / 范围</TableHead><TableHead>策略</TableHead><TableHead>路由</TableHead><TableHead>结果</TableHead></TableRow></TableHeader><TableBody>{activities.map((activity) => <TableRow key={activity.id}><TableCell>{activity.time}</TableCell><TableCell>{activity.direction}</TableCell><TableCell><div>{activity.connection}</div><div className="text-xs text-muted-foreground">{activity.scope}</div></TableCell><TableCell>{activity.policy}</TableCell><TableCell>{activity.route}</TableCell><TableCell><div>{activity.result}</div><div className="font-mono text-xs text-muted-foreground">{activity.fingerprint}</div></TableCell></TableRow>)}</TableBody></Table></ManagementListFrame>
}

function NotificationSettings() {
  const enabled = useSettingsStore((state) => state.notificationEnabled)
  const setEnabled = useSettingsStore((state) => state.setNotificationEnabled)
  const quiet = useSettingsStore((state) => state.quietHours)
  const setQuiet = useSettingsStore((state) => state.setQuietHours)
  return <><SectionIntro title="通知" description="控制本地桌面通知、事件类型与隐私预览。" /><div className="divide-y rounded-lg border">{notificationEvents.map((event) => <SettingRow key={event} title={event} description={event.includes("外部") ? "通知中隐藏正文与稳定标识" : "通过系统通知中心显示简短状态"}><Switch checked={enabled[event] ?? ["代理完成","请求审批","代理/工具失败"].includes(event)} onCheckedChange={(value) => setEnabled(event,value)} aria-label={`切换${event}通知`} /></SettingRow>)}</div><SectionIntro title="勿扰与隐私" description="勿扰期间保留应用内记录，不弹出系统通知。" /><div className="divide-y rounded-lg border"><SettingRow title="勿扰模式" description="每天 22:00 至次日 08:00"><Switch checked={quiet} onCheckedChange={setQuiet} aria-label="切换勿扰模式" /></SettingRow><SettingRow title="隐藏敏感内容" description="通知仅显示应用名和事件类别"><Switch defaultChecked aria-label="隐藏敏感通知内容" /></SettingRow><SettingRow title="声音" description="审批请求使用轻提示音"><Switch defaultChecked aria-label="通知声音" /></SettingRow></div></>
}

function AppearanceSettings() {
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const motion = useSettingsStore((state) => state.motion)
  const setMotion = useSettingsStore((state) => state.setMotion)
  const welcomePoemMetadata = useSettingsStore(
    (state) => state.welcomePoemMetadata
  )
  const setWelcomePoemMetadata = useSettingsStore(
    (state) => state.setWelcomePoemMetadata
  )
  const fontSize = useSettingsStore((state) => state.fontSize)
  const setFontSize = useSettingsStore((state) => state.setFontSize)
  const codeFont = useSettingsStore((state) => state.codeFontSize)
  const setCodeFont = useSettingsStore((state) => state.setCodeFontSize)
  return <><SectionIntro title="外观" description="主题选择只更新 Mock 设置；接入持久化前不会更改系统主题。" /><FieldSet><FieldLegend>主题</FieldLegend><ToggleGroup value={[theme]} onValueChange={(values) => values[0] && setTheme(values[0] as typeof theme)} variant="outline" className="grid grid-cols-3" spacing={1}><ToggleGroupItem value="light">浅色</ToggleGroupItem><ToggleGroupItem value="dark">深色</ToggleGroupItem><ToggleGroupItem value="system">跟随系统</ToggleGroupItem></ToggleGroup></FieldSet><div className="divide-y rounded-lg border"><SettingRow title="界面字号" description={`${fontSize}px`}><Slider className="w-48" min={12} max={18} step={1} value={[fontSize]} onValueChange={(values) => setFontSize(values[0] ?? 14)} /></SettingRow><SettingRow title="代码字号" description={`${codeFont}px`}><Slider className="w-48" min={11} max={18} step={1} value={[codeFont]} onValueChange={(values) => setCodeFont(values[0] ?? 13)} /></SettingRow><SettingRow title="界面动画" description="遵循系统减少动态效果设置"><Switch checked={motion} onCheckedChange={setMotion} aria-label="界面动画" /></SettingRow><SettingRow title="欢迎诗句署名" description="默认只显示诗句正文"><Select value={welcomePoemMetadata} onValueChange={(value) => setWelcomePoemMetadata(value as typeof welcomePoemMetadata)}><SelectTrigger className="w-36" aria-label="欢迎诗句署名"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="none">不显示</SelectItem><SelectItem value="author">显示作者</SelectItem><SelectItem value="title">显示题名</SelectItem><SelectItem value="author-title">作者与题名</SelectItem></SelectGroup></SelectContent></Select></SettingRow><SettingRow title="紧凑密度" description="缩短列表与工具栏间距"><Switch aria-label="紧凑密度" /></SettingRow></div></>
}

function ShortcutSettings() {
  const [restoreOpen, setRestoreOpen] = useState(false)
  const search = useSettingsStore((state) => state.shortcutSearch)
  const setSearch = useSettingsStore((state) => state.setShortcutSearch)
  const conflicts = useSettingsStore((state) => state.shortcutConflictsOnly)
  const setConflicts = useSettingsStore((state) => state.setShortcutConflictsOnly)
  const setDialog = useSettingsStore((state) => state.setDialog)
  const filtered = mockShortcuts.filter((item) => (!search || `${item.action} ${item.binding} ${item.category}`.toLowerCase().includes(search.toLowerCase())) && (!conflicts || item.conflict))
  return <><SectionIntro title="快捷键" description="查看作用域、来源与冲突。快捷键录制当前为前端 Mock。" action={<Button variant="outline" size="sm" onClick={() => setRestoreOpen(true)}><RotateCcwIcon data-icon="inline-start" />恢复默认</Button>} /><div className="flex flex-wrap gap-2"><ManagementSearch value={search} onValueChange={setSearch} placeholder="搜索快捷键…" label="搜索快捷键" /><Label className="rounded-lg border px-2.5"><Checkbox checked={conflicts} onCheckedChange={(value) => setConflicts(Boolean(value))} />仅冲突</Label></div><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>操作</TableHead><TableHead>快捷键</TableHead><TableHead>作用域</TableHead><TableHead>来源</TableHead><TableHead>状态</TableHead><TableHead className="text-right">编辑</TableHead></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={item.id}><TableCell><div className="font-medium">{item.action}</div><div className="text-xs text-muted-foreground">{item.category}</div></TableCell><TableCell><Kbd>{item.binding}</Kbd></TableCell><TableCell>{item.scope}</TableCell><TableCell>{item.source}</TableCell><TableCell>{item.conflict ? <Badge variant="destructive">{item.conflict}</Badge> : <Badge variant="outline">可用</Badge>}</TableCell><TableCell className="text-right"><IconButton label={`编辑${item.action}快捷键`} onClick={() => setDialog("shortcut",item.id)}><MoreHorizontalIcon /></IconButton></TableCell></TableRow>)}</TableBody></Table></div><AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><RotateCcwIcon /></AlertDialogMedia><AlertDialogTitle>恢复默认快捷键？</AlertDialogTitle><AlertDialogDescription>自定义绑定将被默认组合替换。当前只更新前端 Mock 状态，不写入系统快捷键。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => toast.info("已恢复 Mock 默认绑定")}>恢复默认</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
}

function AboutSettings() {
  const setDialog = useSettingsStore((state) => state.setDialog)
  return <><SectionIntro title="关于 Aestival" description="本地优先、无登录、无注册、无云账户入口的桌面 AI Agent 工作区。" /><div className="divide-y rounded-lg border"><SettingRow title="版本" description="0.1.0-dev · Wails 3 + React + TypeScript"><Button variant="outline" size="sm" onClick={() => toast.info("当前为开发版本，未请求网络更新")}>检查更新</Button></SettingRow><SettingRow title="数据目录" description="~/Library/Application Support/Aestival"><Button variant="outline" size="sm" onClick={() => toast.info("Mock：未打开系统目录")}>打开目录</Button></SettingRow><SettingRow title="诊断信息" description="默认排除凭据、消息正文与完整环境变量"><Button variant="outline" size="sm" onClick={() => toast.info("已生成脱敏 Mock 诊断预览")}>导出诊断</Button></SettingRow><SettingRow title="开源许可" description="第三方组件与字体许可"><Button variant="ghost" size="sm">查看许可</Button></SettingRow></div><div className="rounded-lg border border-destructive/30 p-4"><div className="font-medium text-destructive">维护操作</div><p className="mt-1 text-sm text-muted-foreground">清理缓存或恢复默认设置需要二次确认。</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setDialog("cache")}><Trash2Icon data-icon="inline-start" />清理缓存</Button><Button variant="destructive" size="sm" onClick={() => setDialog("reset")}><RotateCcwIcon data-icon="inline-start" />恢复默认设置</Button></div></div></>
}

function SettingsOverlays() {
  const dialog = useSettingsStore((state) => state.dialog)
  const dialogId = useSettingsStore((state) => state.dialogId)
  const setDialog = useSettingsStore((state) => state.setDialog)
  const connections = useSettingsStore((state) => state.connections)
  const selectedId = useSettingsStore((state) => state.selectedConnectionId)
  const detailsOpen = useSettingsStore((state) => state.connectionDetailsOpen)
  const setDetailsOpen = useSettingsStore((state) => state.setConnectionDetailsOpen)
  const disconnect = useSettingsStore((state) => state.disconnectConnection)
  const resolvePairing = useSettingsStore((state) => state.resolvePairing)
  const selected = connections.find((item) => item.id === selectedId)
  const disconnectTarget = connections.find((item) => item.id === dialogId)
  const pairTarget = mockPairingRequests.find((item) => item.id === dialogId)
  return <><ProviderDialog open={dialog === "provider"} onOpenChange={(open) => !open && setDialog(null)} /><ConnectionWizard open={dialog === "connection"} onOpenChange={(open) => !open && setDialog(null)} /><Dialog open={dialog === "model" || dialog === "shortcut"} onOpenChange={(open) => !open && setDialog(null)}><DialogContent><DialogHeader><DialogTitle>{dialog === "model" ? "添加模型" : "录制快捷键"}</DialogTitle><DialogDescription>{dialog === "model" ? "选择供应商并填写模型标识；当前不会访问供应商。" : "请按下新的组合键。当前仅展示录制界面。"}</DialogDescription></DialogHeader>{dialog === "model" ? <FieldGroup><Field><FieldLabel>供应商</FieldLabel><Select defaultValue="ollama"><SelectTrigger><SelectValue>Ollama-本机</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="ollama">Ollama-本机</SelectItem><SelectItem value="openai">OpenAI-工作</SelectItem></SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="model-id">模型 ID</FieldLabel><Input id="model-id" placeholder="例如 qwen3:14b" /></Field></FieldGroup> : <div className="rounded-lg border border-dashed p-8 text-center font-mono">等待按键…</div>}<DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>取消</Button><Button onClick={() => { toast.success("已保存到前端 Mock 设置"); setDialog(null) }}>保存</Button></DialogFooter></DialogContent></Dialog><AlertDialog open={dialog === "disconnect"} onOpenChange={(open) => !open && setDialog(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><Link2OffIcon /></AlertDialogMedia><AlertDialogTitle>断开“{disconnectTarget?.alias ?? "该连接"}”？</AlertDialogTitle><AlertDialogDescription>本地连接配置会从 Mock 列表移除。不会向外部平台发送撤销请求。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => dialogId && disconnect(dialogId)}>断开并删除</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><AlertDialog open={dialog === "pairing"} onOpenChange={(open) => !open && setDialog(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><KeyRoundIcon /></AlertDialogMedia><AlertDialogTitle>检查配对请求</AlertDialogTitle><AlertDialogDescription>{pairTarget ? `${pairTarget.requester} · ${pairTarget.source} · ${pairTarget.risk}` : "请求不存在"}。只允许你认识且已核对稳定标识的发送者。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => dialogId && resolvePairing(dialogId)}>拒绝</AlertDialogCancel><AlertDialogAction onClick={() => { if (dialogId) resolvePairing(dialogId); toast.success("已加入前端 Mock 允许列表") }}>允许配对</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><MaintenanceDialog kind={dialog === "reset" ? "reset" : "cache"} open={dialog === "reset" || dialog === "cache"} onClose={() => setDialog(null)} /><ConnectionDetails connection={selected} open={detailsOpen} onOpenChange={setDetailsOpen} /></>
}

function ProviderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>添加模型供应商</DialogTitle><DialogDescription>凭据将来由安全存储适配层保存；此处不收集真实 Key。</DialogDescription></DialogHeader><FieldGroup><Field><FieldLabel>供应商</FieldLabel><Select defaultValue="ollama"><SelectTrigger><SelectValue>Ollama</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="ollama">Ollama</SelectItem><SelectItem value="openai">OpenAI</SelectItem><SelectItem value="custom">自定义 OpenAI 兼容</SelectItem></SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="provider-alias">别名</FieldLabel><Input id="provider-alias" defaultValue="本地模型" /></Field><Field><FieldLabel htmlFor="provider-endpoint">Endpoint</FieldLabel><Input id="provider-endpoint" defaultValue="http://127.0.0.1:11434" /><FieldDescription>测试按钮只显示 Mock 反馈。</FieldDescription></Field><Field><FieldLabel htmlFor="provider-secret">凭据引用</FieldLabel><Input id="provider-secret" value="secure://provider/new" readOnly /></Field></FieldGroup><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={() => { toast.info("Mock 测试完成：未发送网络请求"); onOpenChange(false) }}>保存 Mock 配置</Button></DialogFooter></DialogContent></Dialog>
}

function ConnectionWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const step = useSettingsStore((state) => state.wizardStep)
  const setStep = useSettingsStore((state) => state.setWizardStep)
  const platform = useSettingsStore((state) => state.selectedPlatform)
  const setPlatform = useSettingsStore((state) => state.setSelectedPlatform)
  const policy = useSettingsStore((state) => state.privatePolicy)
  const setPolicy = useSettingsStore((state) => state.setPrivatePolicy)
  const [allowOpen, setAllowOpen] = useState(false)
  return <><Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[min(780px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>添加外部消息连接</DialogTitle><DialogDescription>第 {step} 步，共 6 步。所有连接状态均为 Mock，未访问外部平台。</DialogDescription></DialogHeader><div className="grid grid-cols-6 gap-1">{[1,2,3,4,5,6].map((value) => <span key={value} className={`h-1 rounded-full ${value <= step ? "bg-primary" : "bg-muted"}`} />)}</div>{step === 1 ? <FieldSet><FieldLegend>选择平台</FieldLegend><RadioGroup className="grid sm:grid-cols-2" value={platform} onValueChange={setPlatform}>{connectionPlatforms.map((item) => <FieldLabel key={item.id}><Field orientation="horizontal"><RadioGroupItem value={item.id} /><FieldGroup className="gap-0"><span>{item.label}</span><FieldDescription>{item.identity} · {item.maturity}</FieldDescription></FieldGroup></Field></FieldLabel>)}</RadioGroup></FieldSet> : null}{step === 2 ? <FieldGroup><Field><FieldLabel htmlFor="connection-alias">连接别名</FieldLabel><Input id="connection-alias" defaultValue={`${connectionPlatforms.find((item) => item.id === platform)?.label ?? "平台"}-个人`} /></Field><Field><FieldLabel htmlFor="connection-secret">凭据引用</FieldLabel><Input id="connection-secret" value={`secure://connections/${platform}/new`} readOnly /><FieldDescription>不在前端状态中输入或持久化 Token。</FieldDescription></Field></FieldGroup> : null}{step === 3 ? <FieldGroup><Field><FieldLabel>默认路由</FieldLabel><Select defaultValue="tasks"><SelectTrigger><SelectValue>任务 / 通用智能体</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="tasks">任务 / 通用智能体</SelectItem><SelectItem value="aestival">Aestival / 审查智能体</SelectItem></SelectGroup></SelectContent></Select></Field><Field><FieldLabel>默认模式</FieldLabel><ToggleGroup value={["chat"]} variant="outline"><ToggleGroupItem value="chat">聊天</ToggleGroupItem><ToggleGroupItem value="agent">代理</ToggleGroupItem></ToggleGroup></Field></FieldGroup> : null}{step === 4 ? <FieldSet><FieldLegend>私聊访问策略</FieldLegend><RadioGroup value={policy} onValueChange={(value) => value === "open" ? setAllowOpen(true) : setPolicy(value as typeof policy)}>{[["pairing","配对后允许","推荐；新发送者只获得一次性配对码"],["allowlist","仅允许列表","拒绝所有未预先登记的稳定标识"],["disabled","关闭私聊","不接受任何私聊消息"],["open","开放私聊","高风险；任何发送者都可进入聊天入口"]].map(([value,title,description]) => <FieldLabel key={value}><Field orientation="horizontal" data-invalid={policy === "open" && value === "open"}><RadioGroupItem value={value} aria-invalid={policy === "open" && value === "open"} /><FieldGroup className="gap-0"><span>{title}</span><FieldDescription>{description}</FieldDescription></FieldGroup></Field></FieldLabel>)}</RadioGroup></FieldSet> : null}{step === 5 ? <FieldGroup><div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"><div className="font-medium text-destructive">远程权限边界</div><p className="mt-1 text-sm text-muted-foreground">外部入口不会获得桌面文件、终端或审批绕过能力。高风险操作始终要求本机确认。</p></div><SettingRow title="允许低风险远程审批" description="只适用于明确列出的低风险动作"><Switch aria-label="允许低风险远程审批" /></SettingRow><SettingRow title="记录脱敏活动" description="不保存消息正文与完整标识"><Switch defaultChecked aria-label="记录脱敏活动" /></SettingRow></FieldGroup> : null}{step === 6 ? <div className="rounded-lg border p-4"><div className="font-medium">确认 Mock 连接</div><dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm"><dt className="text-muted-foreground">平台</dt><dd>{connectionPlatforms.find((item) => item.id === platform)?.label}</dd><dt className="text-muted-foreground">私聊</dt><dd>{policy}</dd><dt className="text-muted-foreground">状态</dt><dd>未测试</dd></dl></div> : null}<DialogFooter><Button variant="outline" onClick={() => step === 1 ? onOpenChange(false) : setStep(step-1)}>{step === 1 ? "取消" : "上一步"}</Button><Button onClick={() => step === 6 ? (toast.success("已保存 Mock 连接草稿"),onOpenChange(false)) : setStep(step+1)}>{step === 6 ? "保存草稿" : "下一步"}</Button></DialogFooter></DialogContent></Dialog><AlertDialog open={allowOpen} onOpenChange={setAllowOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><AlertTriangleIcon /></AlertDialogMedia><AlertDialogTitle>确认开放私聊？</AlertDialogTitle><AlertDialogDescription>任何外部发送者都可能创建聊天入口。即使开启，代理能力和高风险权限仍保持关闭。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>保持配对</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { setPolicy("open"); setAllowOpen(false) }}>确认开放</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
}

function ConnectionDetails({ connection, open, onOpenChange }: { connection?: MockConnection; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="sm:max-w-xl"><SheetHeader><SheetTitle>{connection?.alias ?? "连接详情"}</SheetTitle><SheetDescription>{connection ? `${connection.platform} · ${connection.identity}` : "未选择连接"}</SheetDescription></SheetHeader>{connection ? <Tabs defaultValue="overview" className="min-h-0 px-4"><TabsList variant="line" className="w-full justify-start overflow-x-auto"><TabsTrigger value="overview">概览</TabsTrigger><TabsTrigger value="access">访问</TabsTrigger><TabsTrigger value="routing">路由</TabsTrigger><TabsTrigger value="approval">审批</TabsTrigger><TabsTrigger value="capability">能力</TabsTrigger><TabsTrigger value="activity">活动</TabsTrigger><TabsTrigger value="diagnostics">诊断</TabsTrigger></TabsList><TabsContent value="overview" className="mt-4"><DefinitionRows rows={[["状态",connection.status],["传输",connection.transport],["最近活动",connection.recent],["范围",connection.scope]]} /></TabsContent><TabsContent value="access" className="mt-4"><DefinitionRows rows={[["访问策略",connection.access],["身份",connection.identity]]} /></TabsContent><TabsContent value="routing" className="mt-4"><DefinitionRows rows={[["路由",connection.route],["模式",connection.mode]]} /></TabsContent><TabsContent value="approval" className="mt-4 text-sm text-muted-foreground">高风险操作必须在桌面端审批；外部发送者不可扩大权限。</TabsContent><TabsContent value="capability" className="mt-4"><div className="grid gap-2">{connection.capabilities.map((item) => <div key={item} className="rounded-lg border p-3">{item}</div>)}</div></TabsContent><TabsContent value="activity" className="mt-4 text-sm text-muted-foreground">只展示脱敏指纹、方向和策略结果，不展示消息正文。</TabsContent><TabsContent value="diagnostics" className="mt-4"><Button variant="outline" onClick={() => toast.info("Mock：未向外部平台发送测试请求")}><ActivityIcon data-icon="inline-start" />测试连接</Button></TabsContent></Tabs> : null}</SheetContent></Sheet>
}

function MaintenanceDialog({ kind, open, onClose }: { kind: "reset" | "cache"; open: boolean; onClose: () => void }) {
  return <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia>{kind === "reset" ? <RotateCcwIcon /> : <Trash2Icon />}</AlertDialogMedia><AlertDialogTitle>{kind === "reset" ? "恢复默认设置？" : "清理本地缓存？"}</AlertDialogTitle><AlertDialogDescription>{kind === "reset" ? "将重置当前前端 Mock 偏好，但不会删除项目文件。" : "仅清理可重新生成的 Mock 缓存，不删除会话、项目或安全凭据。"}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { toast.success(kind === "reset" ? "已恢复 Mock 默认设置" : "已清理 Mock 缓存"); onClose() }}>确认</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Field orientation="horizontal" className="flex flex-wrap items-center justify-between gap-3 p-3"><FieldContent className="min-w-0"><FieldLabel>{title}</FieldLabel><FieldDescription className="text-xs">{description}</FieldDescription></FieldContent><div className="shrink-0">{children}</div></Field>
}

function StatusBadge({ value, danger = false }: { value: string; danger?: boolean }) {
  return <Badge variant={danger ? "destructive" : "outline"}>{danger ? <CircleAlertIcon /> : <CheckCircle2Icon />}{value}</Badge>
}

function DefinitionRows({ rows }: { rows: Array<[string,string]> }) {
  return <dl className="divide-y rounded-lg border">{rows.map(([label,value]) => <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 px-3 py-2.5"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
}
