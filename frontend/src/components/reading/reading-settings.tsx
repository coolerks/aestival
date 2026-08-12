import { useMemo, useState } from "react"
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileInputIcon,
  FolderInputIcon,
  InfoIcon,
  ListIcon,
  MailIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  RssIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
  WandSparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  AddSubscriptionDialog,
  CollectionEditDialog,
  CollectionWizardDialog,
  DeleteCollectionDialog,
  FeedEditDialog,
  OpmlPreviewDialog,
  RemoteDisclosureDialog,
  UnsubscribeFeedDialog,
  type FeedDialogState,
} from "@/components/reading/reading-settings-overlays"
import { DropdownMenuIconTrigger } from "@/components/shell/icon-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { copyTextToClipboard } from "@/lib/context-menu-utils"
import {
  collectionArticleCount,
  collectionUnreadCount,
  orderedReadingCollections,
} from "@/lib/reading"
import { readingUiAdapter } from "@/services/reading-service"
import { isRemoteReadingModel, useReadingStore } from "@/store/reading-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type {
  FeedSubscription,
  FeedSubscriptionStatus,
  ReadingCollection,
  ReadingOpenMode,
  ReadingReadPolicy,
  ReadingSettingsTab,
} from "@/types/reading"

function SectionIntro({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

function feedStatusLabel(status: FeedSubscriptionStatus) {
  if (status === "draft") return "草稿"
  if (status === "validating") return "验证中"
  if (status === "active") return "活跃"
  if (status === "paused") return "已暂停"
  if (status === "restricted") return "受限"
  return "错误"
}

function FeedStatusBadge({ status }: { status: FeedSubscriptionStatus }) {
  const danger = status === "error" || status === "restricted"
  return (
    <Badge variant={danger ? "destructive" : "outline"}>
      {danger ? <CircleAlertIcon /> : status === "validating" ? <RefreshCwIcon className="animate-spin" /> : <CheckCircle2Icon />}
      {feedStatusLabel(status)}
    </Badge>
  )
}

function copyAddress(value: string, label: string) {
  void copyTextToClipboard(value).then((copied) =>
    copied ? toast.success(`已复制${label}`) : toast.warning("无法写入剪贴板"),
  )
}

function openExternal(value: string) {
  void readingUiAdapter.openExternalArticle(value).then((result) => {
    if (result.opened) toast.success("已交给系统默认浏览器")
    else if (result.reason === "desktop-runtime-unavailable") toast.warning("浏览器预览未连接桌面运行时；地址仍可复制")
    else toast.error("无法打开地址")
  })
}

type FeedActionHandlers = {
  edit: (state: Exclude<FeedDialogState, null>) => void
  unsubscribe: (feedId: string) => void
  refresh: (feed: FeedSubscription) => void
}

function FeedContextActions({ feed, handlers }: { feed: FeedSubscription; handlers: FeedActionHandlers }) {
  const setStatus = useReadingStore((state) => state.setFeedStatus)
  return (
    <>
      <ContextMenuGroup>
        <ContextMenuLabel>订阅源</ContextMenuLabel>
        <ContextMenuItem onClick={() => handlers.edit({ kind: "rename", feedId: feed.id })}><PencilIcon />重命名</ContextMenuItem>
        <ContextMenuItem onClick={() => setStatus(feed.id, feed.status === "paused" ? "active" : "paused")}>
          {feed.status === "paused" ? <PlayIcon /> : <PauseIcon />}{feed.status === "paused" ? "恢复" : "暂停"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handlers.refresh(feed)}><RefreshCwIcon />立即刷新（演示）</ContextMenuItem>
        <ContextMenuItem onClick={() => handlers.edit({ kind: "collections", feedId: feed.id })}><FolderInputIcon />分配合集</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => copyAddress(feed.feedUrl, " Feed 地址")}><CopyIcon />复制 Feed 地址</ContextMenuItem>
        <ContextMenuItem onClick={() => openExternal(feed.siteUrl)}><ExternalLinkIcon />打开网站</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onClick={() => handlers.unsubscribe(feed.id)}><Trash2Icon />取消订阅</ContextMenuItem>
    </>
  )
}

function FeedDropdownActions({ feed, handlers }: { feed: FeedSubscription; handlers: FeedActionHandlers }) {
  const setStatus = useReadingStore((state) => state.setFeedStatus)
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => handlers.edit({ kind: "rename", feedId: feed.id })}><PencilIcon />重命名</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus(feed.id, feed.status === "paused" ? "active" : "paused")}>
          {feed.status === "paused" ? <PlayIcon /> : <PauseIcon />}{feed.status === "paused" ? "恢复" : "暂停"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.refresh(feed)}><RefreshCwIcon />立即刷新（演示）</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.edit({ kind: "collections", feedId: feed.id })}><FolderInputIcon />分配合集</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => copyAddress(feed.feedUrl, " Feed 地址")}><CopyIcon />复制 Feed 地址</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openExternal(feed.siteUrl)}><ExternalLinkIcon />打开网站</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={() => handlers.unsubscribe(feed.id)}><Trash2Icon />取消订阅</DropdownMenuItem>
    </>
  )
}

function FeedRow({ feed, handlers }: { feed: FeedSubscription; handlers: FeedActionHandlers }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Item className="rounded-none border-0 px-3 py-3">
          <ItemMedia variant="icon"><RssIcon /></ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle>{feed.title}</ItemTitle>
            <ItemDescription>{feed.format} · {feed.articleCount} 篇 · {feed.unreadCount} 未读</ItemDescription>
            <code className="max-w-full truncate text-xs text-muted-foreground">{feed.feedUrl}</code>
            {feed.errorSummary ? <p className="line-clamp-2 text-xs text-destructive">{feed.errorSummary}</p> : null}
          </ItemContent>
          <div className="flex shrink-0 items-center gap-2">
            <FeedStatusBadge status={feed.status} />
            <DropdownMenu>
              <DropdownMenuIconTrigger label={`更多订阅源操作：${feed.title}`}><MoreHorizontalIcon /></DropdownMenuIconTrigger>
              <DropdownMenuContent align="end" className="w-56"><FeedDropdownActions feed={feed} handlers={handlers} /></DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Item>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-60"><FeedContextActions feed={feed} handlers={handlers} /></ContextMenuContent>
    </ContextMenu>
  )
}

function FeedSettings({
  onAdd,
  onOpml,
  setFeedDialog,
  setUnsubscribeId,
}: {
  onAdd: () => void
  onOpml: () => void
  setFeedDialog: (state: FeedDialogState) => void
  setUnsubscribeId: (id: string | null) => void
}) {
  const feeds = useReadingStore((state) => state.feeds)
  const offline = useReadingStore((state) => state.offline)
  const setFeedStatus = useReadingStore((state) => state.setFeedStatus)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | FeedSubscriptionStatus>("all")
  const filtered = feeds.filter((feed) => {
    const text = `${feed.title} ${feed.siteUrl} ${feed.feedUrl}`.toLowerCase()
    return (!search.trim() || text.includes(search.trim().toLowerCase())) && (status === "all" || feed.status === status)
  })

  const handlers: FeedActionHandlers = {
    edit: setFeedDialog,
    unsubscribe: setUnsubscribeId,
    refresh: (feed) => {
      if (offline) {
        toast.warning("离线示例中无法刷新")
        return
      }
      const previous = feed.status
      setFeedStatus(feed.id, "validating")
      window.setTimeout(() => setFeedStatus(feed.id, previous), 650)
      toast.info("UI 演示：未请求远程 Feed，状态稍后恢复")
    },
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="订阅源"
        description="添加公开 RSS、Atom 与 JSON Feed，管理暂停、错误、来源合集和取消订阅。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onOpml}><FileInputIcon data-icon="inline-start" />OPML 示例</Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("UI 演示：标准 OPML 只导出订阅源与来源合集，未写入文件")}><DownloadIcon data-icon="inline-start" />导出 OPML</Button>
            <Button size="sm" onClick={onAdd}><PlusIcon data-icon="inline-start" />添加订阅</Button>
          </>
        }
      />
      <Alert>
        <InfoIcon />
        <AlertTitle>后端未连接</AlertTitle>
        <AlertDescription>候选发现、刷新、OPML 文件读写和订阅持久化都只展示前端 Mock 流程。</AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-2">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索名称或地址…" aria-label="搜索订阅源" className="min-w-56 flex-1" />
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger className="w-36"><SelectValue>{status === "all" ? "全部状态" : feedStatusLabel(status)}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup><SelectItem value="all">全部状态</SelectItem>{(["draft", "validating", "active", "paused", "restricted", "error"] as FeedSubscriptionStatus[]).map((value) => <SelectItem key={value} value={value}>{feedStatusLabel(value)}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <div className="divide-y rounded-lg border">{filtered.map((feed) => <FeedRow key={feed.id} feed={feed} handlers={handlers} />)}</div>
      ) : (
        <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><RssIcon /></EmptyMedia><EmptyTitle>{feeds.length ? "没有匹配的订阅源" : "还没有订阅源"}</EmptyTitle><EmptyDescription>{feeds.length ? "调整搜索或状态筛选。" : "可以输入网站地址，或预览 OPML 导入流程。"}</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={onAdd}><PlusIcon data-icon="inline-start" />添加订阅</Button></EmptyContent></Empty>
      )}
    </div>
  )
}

type CollectionActionHandlers = {
  open: (collection: ReadingCollection) => void
  edit: (collectionId: string) => void
  remove: (collectionId: string) => void
  move: (collectionId: string, direction: "up" | "down") => void
}

function CollectionRow({ collection, handlers }: { collection: ReadingCollection; handlers: CollectionActionHandlers }) {
  const articles = useReadingStore((state) => state.articles)
  const collections = useReadingStore((state) => state.collections)
  const classifications = useReadingStore((state) => state.classifications)
  const feeds = useReadingStore((state) => state.feeds)
  const count = collectionArticleCount({ articles, collections, classifications }, collection.id)
  const unread = collectionUnreadCount({ articles, collections, classifications }, collection.id)
  const Icon = collection.kind === "source" ? FolderInputIcon : WandSparklesIcon
  const sourceNames = collection.sourceIds.map((id) => feeds.find((feed) => feed.id === id)?.title).filter(Boolean)
  const description = collection.kind === "source"
    ? `${sourceNames.length} 个来源 · ${sourceNames.slice(0, 2).join("、")}${sourceNames.length > 2 ? "…" : ""}`
    : collection.criteriaText
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Item className="rounded-none border-0 px-3 py-3">
          <ItemMedia variant="icon"><Icon /></ItemMedia>
          <ItemContent className="min-w-0"><ItemTitle>{collection.name}</ItemTitle><ItemDescription>{description}</ItemDescription><div className="flex gap-1"><Badge variant="outline">{collection.kind === "source" ? "订阅源合集" : "AI 合集"}</Badge>{collection.modelOverrideRef ? <Badge variant="outline">模型覆盖</Badge> : null}</div></ItemContent>
          <div className="shrink-0 text-right text-xs text-muted-foreground"><div>{count} 篇</div><div>{unread} 未读</div></div>
          <DropdownMenu>
            <DropdownMenuIconTrigger label={`更多合集操作：${collection.name}`}><MoreHorizontalIcon /></DropdownMenuIconTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup><DropdownMenuItem onClick={() => handlers.open(collection)}><ExternalLinkIcon />打开合集</DropdownMenuItem><DropdownMenuItem onClick={() => handlers.edit(collection.id)}><PencilIcon />编辑定义</DropdownMenuItem>{collection.kind === "ai" ? <DropdownMenuItem onClick={() => toast.info("示例匹配预览已在新建/编辑流程中展示；未调用模型")}><SparklesIcon />匹配预览</DropdownMenuItem> : null}</DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup><DropdownMenuItem onClick={() => handlers.move(collection.id, "up")}><ArrowUpIcon />上移</DropdownMenuItem><DropdownMenuItem onClick={() => handlers.move(collection.id, "down")}><ArrowDownIcon />下移</DropdownMenuItem></DropdownMenuGroup>
              <DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => handlers.remove(collection.id)}><Trash2Icon />删除合集</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Item>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup><ContextMenuLabel>{collection.kind === "source" ? "订阅源合集" : "AI 合集"}</ContextMenuLabel><ContextMenuItem onClick={() => handlers.open(collection)}><ExternalLinkIcon />打开合集</ContextMenuItem><ContextMenuItem onClick={() => handlers.edit(collection.id)}><PencilIcon />编辑定义</ContextMenuItem>{collection.kind === "ai" ? <ContextMenuItem onClick={() => toast.info("UI 演示：未运行模型预览")}><SparklesIcon />匹配预览</ContextMenuItem> : null}</ContextMenuGroup>
        <ContextMenuSeparator /><ContextMenuGroup><ContextMenuItem onClick={() => handlers.move(collection.id, "up")}><ArrowUpIcon />上移</ContextMenuItem><ContextMenuItem onClick={() => handlers.move(collection.id, "down")}><ArrowDownIcon />下移</ContextMenuItem></ContextMenuGroup>
        <ContextMenuSeparator /><ContextMenuItem variant="destructive" onClick={() => handlers.remove(collection.id)}><Trash2Icon />删除合集</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function CollectionSettings({ onCreate, onEdit, onDelete }: { onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const collections = useReadingStore((state) => state.collections)
  const articles = useReadingStore((state) => state.articles)
  const classifications = useReadingStore((state) => state.classifications)
  const selectCollection = useReadingStore((state) => state.selectCollection)
  const moveCollection = useReadingStore((state) => state.moveCollection)
  const ordered = orderedReadingCollections(collections)
  const system = ordered.filter((collection) => collection.immutable)
  const custom = ordered.filter((collection) => !collection.immutable)
  const handlers: CollectionActionHandlers = {
    open: (collection) => { selectCollection(collection.id); useWorkspaceStore.getState().setActivePage("reading") },
    edit: onEdit,
    remove: onDelete,
    move: (id, direction) => { moveCollection(id, direction); toast.success("已更新前端 Mock 合集顺序") },
  }
  return (
    <div className="flex flex-col gap-5">
      <SectionIntro title="合集" description="系统合集固定；自定义合集分为不可互换的来源合集与 AI 合集。" actions={<Button size="sm" onClick={onCreate}><PlusIcon data-icon="inline-start" />新建合集</Button>} />
      <section className="flex flex-col gap-2"><div><h3 className="font-medium">系统合集</h3><p className="text-xs text-muted-foreground">只有精选和全部，不可重命名、删除或重排。</p></div><div className="divide-y rounded-lg border">{system.map((collection) => { const Icon = collection.kind === "system_curated" ? SparklesIcon : ListIcon; const count = collectionArticleCount({ articles, collections, classifications }, collection.id); return <Item key={collection.id} className="rounded-none border-0 px-3 py-3"><ItemMedia variant="icon"><Icon /></ItemMedia><ItemContent><ItemTitle>{collection.name}</ItemTitle><ItemDescription>{collection.kind === "system_curated" ? "AI 按质量基线与用户要求筛选，不改变排序" : "所有订阅与保留历史的完整时间线"}</ItemDescription></ItemContent><Badge variant="outline">{count} 篇 · 已锁定</Badge><Button variant="ghost" size="sm" onClick={() => handlers.open(collection)}>打开</Button></Item> })}</div></section>
      <section className="flex flex-col gap-2"><div><h3 className="font-medium">自定义合集</h3><p className="text-xs text-muted-foreground">来源和文章都可以同时属于多个合集。</p></div>{custom.length ? <div className="divide-y rounded-lg border">{custom.map((collection) => <CollectionRow key={collection.id} collection={collection} handlers={handlers} />)}</div> : <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><FolderInputIcon /></EmptyMedia><EmptyTitle>还没有自定义合集</EmptyTitle><EmptyDescription>按来源整理，或用文字要求建立 AI 合集。</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={onCreate}>新建合集</Button></EmptyContent></Empty>}</section>
    </div>
  )
}

function AiSettings({ onDisclosure }: { onDisclosure: () => void }) {
  const preferences = useReadingStore((state) => state.preferences)
  const collections = useReadingStore((state) => state.collections)
  const classifications = useReadingStore((state) => state.classifications)
  const feedbackRules = useReadingStore((state) => state.feedbackRules)
  const articles = useReadingStore((state) => state.articles)
  const setModel = useReadingStore((state) => state.setGlobalModelRef)
  const setCurated = useReadingStore((state) => state.setCuratedCriteria)
  const revokeRule = useReadingStore((state) => state.revokeFeedbackRule)
  const revokeDisclosure = useReadingStore((state) => state.revokeRemoteDisclosure)
  const [criteria, setCriteria] = useState(preferences.curatedCriteria)
  const [scope, setScope] = useState("new")
  const [revokeOpen, setRevokeOpen] = useState(false)
  const activeRules = feedbackRules.filter((rule) => !rule.revokedAt)
  const queue = classifications.reduce((result, item) => ({ queued: result.queued + (item.state === "queued" ? 1 : 0), analyzing: result.analyzing + (item.state === "analyzing" ? 1 : 0), failed: result.failed + (item.state === "failed" ? 1 : 0) }), { queued: 0, analyzing: 0, failed: 0 })
  const remote = isRemoteReadingModel(preferences)
  return (
    <div className="flex flex-col gap-5">
      <SectionIntro title="AI 与精选" description="设置阅读模型、精选要求、远程数据授权、分类队列与显式反馈规则。" />
      <Alert><SparklesIcon /><AlertTitle>模型判断不等于事实保证</AlertTitle><AlertDescription>精选参考可信度、证据丰富度、信息密度、原创性、新鲜度与用户相关性；AI 只筛选，不重排。</AlertDescription></Alert>
      <section className="divide-y rounded-lg border">
        <Field orientation="horizontal" className="flex-wrap items-center justify-between gap-3 p-3"><FieldContent><FieldLabel>阅读默认模型</FieldLabel><FieldDescription>精选使用全局模型；单个 AI 合集可以覆盖。</FieldDescription></FieldContent><Select value={preferences.globalModelRef} onValueChange={(value) => { if (!value) return; setModel(value); toast.success("已更新后续阅读分类模型；未触发重跑") }}><SelectTrigger className="w-52"><SelectValue>{preferences.globalModelRef === "model-balanced" ? "Mock Balanced · 本地" : "Mock Fast · 远程"}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="model-balanced">Mock Balanced · 本地</SelectItem><SelectItem value="model-fast">Mock Fast · 远程</SelectItem></SelectGroup></SelectContent></Select></Field>
        <Field orientation="horizontal" className="flex-wrap items-center justify-between gap-3 p-3"><FieldContent><FieldLabel>远程数据授权</FieldLabel><FieldDescription>{remote ? preferences.remoteDisclosureConsent ? `已授权 · ${preferences.remoteDisclosureConsent.disclosureVersion}` : "未授权；不会发送新文章" : "本地模型无需远程发送"}</FieldDescription></FieldContent><div className="flex gap-2">{remote && preferences.remoteDisclosureConsent ? <Button variant="destructive" size="sm" onClick={() => setRevokeOpen(true)}>撤销授权</Button> : <Button variant="outline" size="sm" disabled={!remote} onClick={onDisclosure}><ShieldCheckIcon data-icon="inline-start" />查看披露</Button>}</div></Field>
      </section>
      {remote && !preferences.remoteDisclosureConsent ? <Alert><AlertTriangleIcon /><AlertTitle>远程模型尚未授权</AlertTitle><AlertDescription>全部和来源合集继续可用；精选和 AI 合集不会发送新文章。</AlertDescription></Alert> : null}
      <section className="flex flex-col gap-3"><div><h3 className="font-medium">精选要求</h3><p className="text-xs text-muted-foreground">保存用户原文；显式反馈规则不会静默改写这里。</p></div><Textarea value={criteria} onChange={(event) => setCriteria(event.target.value)} rows={5} aria-label="精选用户要求" /><div className="flex flex-wrap items-center justify-end gap-2"><Select value={scope} onValueChange={(value) => value && setScope(value)}><SelectTrigger className="w-44"><SelectValue>{scope === "new" ? "仅影响新文章" : `显式重跑 ${scope}`}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="new">仅影响新文章</SelectItem><SelectItem value="7d">重跑 7 天</SelectItem><SelectItem value="30d">重跑 30 天</SelectItem><SelectItem value="90d">重跑 90 天</SelectItem><SelectItem value="all">重跑全部</SelectItem></SelectGroup></SelectContent></Select><Button onClick={() => { setCurated(criteria); toast.success(scope === "new" ? "已保存精选要求；只影响未来前端 Mock 状态" : `已保存设置；未实际执行 ${scope} 重跑`) }}>保存设置</Button></div></section>
      <Separator />
      <section className="flex flex-col gap-3"><div><h3 className="font-medium">分类队列概览</h3><p className="text-xs text-muted-foreground">示例队列独立于“全部”文章可见性。</p></div><div className="grid grid-cols-3 divide-x rounded-lg border"><div className="p-3"><div className="text-xl font-semibold">{queue.queued}</div><div className="text-xs text-muted-foreground">排队</div></div><div className="p-3"><div className="text-xl font-semibold">{queue.analyzing}</div><div className="text-xs text-muted-foreground">分析中</div></div><div className="p-3"><div className="text-xl font-semibold text-destructive">{queue.failed}</div><div className="text-xs text-muted-foreground">失败</div></div></div><Button variant="outline" size="sm" className="self-start" onClick={() => toast.info("UI 演示：未重试分类或调用模型")}><RefreshCwIcon data-icon="inline-start" />重试失败项（演示）</Button></section>
      <Separator />
      <section className="flex flex-col gap-3"><div><h3 className="font-medium">反馈规则</h3><p className="text-xs text-muted-foreground">只有“更符合/不符合”会形成规则；阅读、收藏、跳过和停留不会暗中学习。</p></div>{activeRules.length ? <div className="divide-y rounded-lg border">{activeRules.map((rule) => { const article = articles.find((item) => item.id === rule.sourceArticleId); const collection = collections.find((item) => item.id === rule.collectionId); return <Item key={rule.id} className="rounded-none border-0"><ItemMedia variant="icon">{rule.direction === "more" ? <StarIcon /> : <MailIcon />}</ItemMedia><ItemContent><ItemTitle>{rule.summary}</ItemTitle><ItemDescription>{collection?.name ?? "已删除合集"} · 来源：{article?.title ?? "文章已删除"}{rule.note ? ` · ${rule.note}` : ""}</ItemDescription></ItemContent><Button variant="outline" size="xs" onClick={() => { revokeRule(rule.id); toast.success("已撤销反馈规则；未改写原始要求") }}>撤销</Button></Item> })}</div> : <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><SparklesIcon /></EmptyMedia><EmptyTitle>没有生效中的反馈规则</EmptyTitle><EmptyDescription>在精选或 AI 合集的文章上选择“更符合”或“不符合”。</EmptyDescription></EmptyHeader></Empty>}</section>
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><ShieldCheckIcon /></AlertDialogMedia><AlertDialogTitle>撤销远程阅读授权？</AlertDialogTitle><AlertDialogDescription>之后不会发送新文章；全部、来源合集和已有示例结果仍可查看。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { revokeDisclosure(); toast.success("已撤销前端 Mock 授权") }}>撤销授权</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

function PreferenceSettings() {
  const preferences = useReadingStore((state) => state.preferences)
  const setOpenMode = useReadingStore((state) => state.setDefaultOpenMode)
  const setReadPolicy = useReadingStore((state) => state.setReadPolicy)
  const setShowUnread = useReadingStore((state) => state.setShowUnreadCount)
  return (
    <div className="flex flex-col gap-5">
      <SectionIntro title="阅读偏好" description="设置后只影响未来操作，不追溯改写已有阅读状态。" />
      <FieldSet><FieldLegend>默认打开方式</FieldLegend><RadioGroup value={preferences.defaultOpenMode} onValueChange={(value) => { setOpenMode(value as ReadingOpenMode); toast.success("已更新后续文章打开方式") }} className="divide-y rounded-lg border">{[["split", "列表 + 阅读窗", "默认；适合连续扫读"], ["full", "整页阅读", "使用主内容全部宽度"], ["external", "直接打开原网页", "交给系统默认浏览器"]].map(([value, title, description]) => <FieldLabel key={value} className="rounded-none border-0"><Field orientation="horizontal" className="p-3"><RadioGroupItem value={value} /><div><div className="font-medium">{title}</div><FieldDescription>{description}</FieldDescription></div></Field></FieldLabel>)}</RadioGroup></FieldSet>
      <FieldSet><FieldLegend>标记已读</FieldLegend><RadioGroup value={preferences.readPolicy} onValueChange={(value) => { setReadPolicy(value as ReadingReadPolicy); toast.success("已更新后续已读策略") }} className="divide-y rounded-lg border">{[["on-open", "打开时", "默认；打开阅读窗、整页或原网页时标记"], ["on-bottom", "滚动到底", "正文末尾进入可见区域时标记"], ["manual", "仅手动", "只通过文章动作改变状态"]].map(([value, title, description]) => <FieldLabel key={value} className="rounded-none border-0"><Field orientation="horizontal" className="p-3"><RadioGroupItem value={value} /><div><div className="font-medium">{title}</div><FieldDescription>{description}</FieldDescription></div></Field></FieldLabel>)}</RadioGroup></FieldSet>
      <Field orientation="horizontal" className="items-center justify-between gap-3 rounded-lg border p-3"><FieldContent><FieldLabel>显示未读数字</FieldLabel><FieldDescription>隐藏数字不会删除已读状态，未读筛选仍可使用。</FieldDescription></FieldContent><Switch checked={preferences.showUnreadCount} onCheckedChange={(checked) => { setShowUnread(checked); toast.success(checked ? "已显示未读数字" : "已隐藏未读数字") }} aria-label="显示未读数字" /></Field>
    </div>
  )
}

export function ReadingSettings() {
  const tab = useReadingStore((state) => state.settingsTab)
  const setTab = useReadingStore((state) => state.setSettingsTab)
  const [addOpen, setAddOpen] = useState(false)
  const [opmlOpen, setOpmlOpen] = useState(false)
  const [feedDialog, setFeedDialog] = useState<FeedDialogState>(null)
  const [unsubscribeId, setUnsubscribeId] = useState<string | null>(null)
  const [collectionWizardOpen, setCollectionWizardOpen] = useState(false)
  const [editCollectionId, setEditCollectionId] = useState<string | null>(null)
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null)
  const [disclosureOpen, setDisclosureOpen] = useState(false)
  const [disclosureModelRef, setDisclosureModelRef] = useState<string>()
  const tabs: Array<{ value: ReadingSettingsTab; label: string }> = useMemo(() => [
    { value: "feeds", label: "订阅源" },
    { value: "collections", label: "合集" },
    { value: "ai", label: "AI 与精选" },
    { value: "preferences", label: "阅读偏好" },
  ], [])
  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as ReadingSettingsTab)}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto no-scrollbar">{tabs.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList>
        <TabsContent value="feeds" className="mt-4"><FeedSettings onAdd={() => setAddOpen(true)} onOpml={() => setOpmlOpen(true)} setFeedDialog={setFeedDialog} setUnsubscribeId={setUnsubscribeId} /></TabsContent>
        <TabsContent value="collections" className="mt-4"><CollectionSettings onCreate={() => setCollectionWizardOpen(true)} onEdit={setEditCollectionId} onDelete={setDeleteCollectionId} /></TabsContent>
        <TabsContent value="ai" className="mt-4"><AiSettings onDisclosure={() => setDisclosureOpen(true)} /></TabsContent>
        <TabsContent value="preferences" className="mt-4"><PreferenceSettings /></TabsContent>
      </Tabs>
      <AddSubscriptionDialog open={addOpen} onOpenChange={setAddOpen} />
      <OpmlPreviewDialog open={opmlOpen} onOpenChange={setOpmlOpen} />
      <FeedEditDialog state={feedDialog} onOpenChange={(open) => { if (!open) setFeedDialog(null) }} />
      <UnsubscribeFeedDialog feedId={unsubscribeId} onOpenChange={(open) => { if (!open) setUnsubscribeId(null) }} />
      <CollectionWizardDialog open={collectionWizardOpen} onOpenChange={setCollectionWizardOpen} onRequestConsent={(modelRef) => { setDisclosureModelRef(modelRef); setDisclosureOpen(true) }} />
      <CollectionEditDialog collectionId={editCollectionId} onOpenChange={(open) => { if (!open) setEditCollectionId(null) }} />
      <DeleteCollectionDialog collectionId={deleteCollectionId} onOpenChange={(open) => { if (!open) setDeleteCollectionId(null) }} />
      <RemoteDisclosureDialog open={disclosureOpen} onOpenChange={(open) => { setDisclosureOpen(open); if (!open) setDisclosureModelRef(undefined) }} modelRef={disclosureModelRef} />
    </div>
  )
}
