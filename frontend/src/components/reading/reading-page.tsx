import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  FolderInputIcon,
  ListIcon,
  MailIcon,
  MailOpenIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  RssIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  WandSparklesIcon,
  WifiOffIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  ReadingArticleContextActions,
  ReadingArticleView,
  type ReadingArticleHandlers,
} from "@/components/reading/reading-article"
import {
  DropdownMenuIconTrigger,
  IconButton,
} from "@/components/shell/icon-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
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
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  SYSTEM_ALL_COLLECTION_ID,
  SYSTEM_CURATED_COLLECTION_ID,
} from "@/data/mock-reading"
import { useNarrowWorkspace } from "@/hooks/use-narrow-workspace"
import {
  collectionUnreadCount,
  filterReadingArticles,
  getArticleClassification,
  getCollectionArticles,
  isAiCollection,
  orderedReadingCollections,
} from "@/lib/reading"
import { cn } from "@/lib/utils"
import { readingUiAdapter } from "@/services/reading-service"
import { useReadingStore } from "@/store/reading-store"
import { useSettingsStore } from "@/store/settings-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type {
  AiFeedbackDirection,
  ArticleClassificationState,
  ReadingArticle,
  ReadingArticleFilter,
  ReadingCollection,
  ReadingSettingsTab,
} from "@/types/reading"

function collectionIcon(collection: ReadingCollection) {
  if (collection.kind === "system_curated") return SparklesIcon
  if (collection.kind === "system_all") return ListIcon
  if (collection.kind === "source") return FolderInputIcon
  return WandSparklesIcon
}

function classificationLabel(state: ArticleClassificationState) {
  if (state === "queued") return "排队"
  if (state === "analyzing") return "分析中"
  if (state === "failed") return "分析失败"
  if (state === "unconfigured") return "未配置"
  return null
}

function articleTime(article: ReadingArticle) {
  const value = article.publishedAt ?? article.receivedAt
  const date = new Date(value)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  const formatted = new Intl.DateTimeFormat("zh-CN", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { month: "short", day: "numeric" }).format(date)
  return article.publishedAt ? formatted : `${formatted} · 接收`
}

function openReadingSettings(tab: ReadingSettingsTab) {
  useReadingStore.getState().setSettingsTab(tab)
  useSettingsStore.getState().setActiveCategory("reading")
  useWorkspaceStore.getState().setActivePage("settings")
}

function CollectionSelector() {
  const [open, setOpen] = useState(false)
  const selectedCollectionId = useReadingStore(
    (state) => state.selectedCollectionId,
  )
  const collections = useReadingStore((state) => state.collections)
  const articles = useReadingStore((state) => state.articles)
  const classifications = useReadingStore((state) => state.classifications)
  const showUnread = useReadingStore(
    (state) => state.preferences.showUnreadCount,
  )
  const selectCollection = useReadingStore((state) => state.selectCollection)
  const ordered = orderedReadingCollections(collections)
  const selected =
    ordered.find((collection) => collection.id === selectedCollectionId) ??
    ordered[0]
  const SelectedIcon = selected ? collectionIcon(selected) : ListIcon
  const snapshot = { articles, collections, classifications }

  const renderCollection = (collection: ReadingCollection) => {
    const Icon = collectionIcon(collection)
    const unread = collectionUnreadCount(snapshot, collection.id)
    return (
      <CommandItem
        key={collection.id}
        value={`${collection.name} ${collection.kind}`}
        onSelect={() => {
          selectCollection(collection.id)
          setOpen(false)
        }}
      >
        <Icon />
        <span className="min-w-0 flex-1 truncate">{collection.name}</span>
        {showUnread && unread > 0 ? (
          <span className="text-xs text-muted-foreground">{unread}</span>
        ) : null}
        {collection.id === selectedCollectionId ? <CheckIcon /> : null}
      </CommandItem>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="min-w-0 flex-1 justify-start px-2"
            aria-label="选择阅读合集"
          />
        }
      >
        <SelectedIcon data-icon="inline-start" />
        <span className="min-w-0 flex-1 truncate text-left">
          {selected?.name ?? "选择合集"}
        </span>
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(340px,calc(100vw-2rem))] p-0">
        <Command>
          <CommandInput placeholder="搜索合集…" />
          <CommandList>
            <CommandEmpty>没有找到合集。</CommandEmpty>
            <CommandGroup heading="系统合集">
              {ordered.filter((collection) => collection.immutable).map(renderCollection)}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="自定义合集">
              {ordered.filter((collection) => !collection.immutable).map(renderCollection)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type ReadingListPaneProps = ReadingArticleHandlers & {
  openArticleWithDefault: (article: ReadingArticle) => void
  initialScrollTop?: number
  onScrollTopChange?: (scrollTop: number) => void
}

function ReadingListPane({
  openArticleWithDefault,
  initialScrollTop = 0,
  onScrollTopChange,
  ...handlers
}: ReadingListPaneProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const collectionId = useReadingStore((state) => state.selectedCollectionId)
  const collections = useReadingStore((state) => state.collections)
  const feeds = useReadingStore((state) => state.feeds)
  const articles = useReadingStore((state) => state.articles)
  const classifications = useReadingStore((state) => state.classifications)
  const selectedArticleId = useReadingStore((state) => state.selectedArticleId)
  const search = useReadingStore((state) => state.searchQuery)
  const filter = useReadingStore((state) => state.articleFilter)
  const selectedIds = useReadingStore((state) => state.selectedArticleIds)
  const offline = useReadingStore((state) => state.offline)
  const remoteConsent = useReadingStore(
    (state) => state.preferences.remoteDisclosureConsent,
  )
  const setSearch = useReadingStore((state) => state.setSearchQuery)
  const setFilter = useReadingStore((state) => state.setArticleFilter)
  const toggleSelection = useReadingStore(
    (state) => state.toggleArticleSelection,
  )
  const clearSelection = useReadingStore((state) => state.clearArticleSelection)
  const setSelectedRead = useReadingStore(
    (state) => state.setSelectedArticlesRead,
  )
  const setSelectedFavorite = useReadingStore(
    (state) => state.setSelectedArticlesFavorite,
  )
  const setOffline = useReadingStore((state) => state.setOffline)
  const resetDemo = useReadingStore((state) => state.resetReadingDemo)
  const collection = collections.find((item) => item.id === collectionId)
  const collectionArticles = getCollectionArticles(
    { articles, collections, classifications },
    collectionId,
  )
  const visibleArticles = filterReadingArticles(collectionArticles, filter, search)
  const aiCollection = isAiCollection(collection)
  const classificationCounts = classifications
    .filter((item) => item.collectionId === collectionId)
    .reduce(
      (counts, item) => ({
        queued: counts.queued + (item.state === "queued" ? 1 : 0),
        analyzing: counts.analyzing + (item.state === "analyzing" ? 1 : 0),
        failed: counts.failed + (item.state === "failed" ? 1 : 0),
      }),
      { queued: 0, analyzing: 0, failed: 0 },
    )

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) return
    viewport.scrollTop = initialScrollTop
    if (!onScrollTopChange) return
    const rememberScroll = () => onScrollTopChange(viewport.scrollTop)
    viewport.addEventListener("scroll", rememberScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", rememberScroll)
  }, [initialScrollTop, onScrollTopChange])

  return (
    <div className="flex size-full min-h-0 flex-col overflow-hidden bg-muted/10">
      <div className="flex shrink-0 flex-col gap-2 p-3 pb-2">
        <div className="flex items-center gap-1.5">
          <CollectionSelector />
          <IconButton
            label="刷新订阅（UI 演示）"
            disabled={offline}
            onClick={() => toast.info("UI 演示：未请求网络或刷新文章")}
          >
            <RefreshCwIcon />
          </IconButton>
          <IconButton label="添加订阅" onClick={() => openReadingSettings("feeds")}>
            <PlusIcon />
          </IconButton>
          <IconButton label="管理阅读" onClick={() => openReadingSettings("collections")}>
            <Settings2Icon />
          </IconButton>
          <DropdownMenu>
            <DropdownMenuIconTrigger label="更多阅读选项">
              <MoreHorizontalIcon />
            </DropdownMenuIconTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>UI 状态演示</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setOffline(!offline)}>
                  <WifiOffIcon />{offline ? "恢复在线界面" : "模拟离线"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openReadingSettings("ai")}>
                  <SparklesIcon />AI 与精选设置
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  resetDemo()
                  toast.success("已恢复阅读 UI 示例数据")
                }}
              >
                <RefreshCwIcon />重置界面演示
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索当前合集…"
            aria-label="搜索当前阅读合集"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ToggleGroup
            value={[filter]}
            onValueChange={(values) => {
              const next = values[0]
              if (next) setFilter(next as ReadingArticleFilter)
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="文章筛选"
          >
            <ToggleGroupItem value="all">全部文章</ToggleGroupItem>
            <ToggleGroupItem value="unread">未读</ToggleGroupItem>
            <ToggleGroupItem value="favorite">收藏</ToggleGroupItem>
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">
            {visibleArticles.length} 篇 · 发布时间倒序
          </span>
        </div>
      </div>

      {offline ? (
        <Alert className="mx-3 mb-2 w-auto">
          <WifiOffIcon />
          <AlertTitle>当前为离线界面示例</AlertTitle>
          <AlertDescription>历史文章、搜索、已读与收藏仍可使用；网络动作已禁用。</AlertDescription>
        </Alert>
      ) : null}
      {!feeds.length ? (
        <Alert className="mx-3 mb-2 w-auto">
          <RssIcon />
          <AlertTitle>没有活跃订阅</AlertTitle>
          <AlertDescription>保留的历史文章仍会出现在“全部”与原来源合集。</AlertDescription>
        </Alert>
      ) : null}
      {aiCollection && !remoteConsent ? (
        <Alert className="mx-3 mb-2 w-auto">
          <AlertTriangleIcon />
          <AlertTitle>远程阅读模型尚未授权</AlertTitle>
          <AlertDescription>
            现有示例匹配仍可查看；不会发送新文章。可在“AI 与精选”查看披露范围。
          </AlertDescription>
        </Alert>
      ) : null}
      {aiCollection && (classificationCounts.queued || classificationCounts.analyzing || classificationCounts.failed) ? (
        <div className="mx-3 mb-2 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {classificationCounts.queued ? <Badge variant="outline">排队 {classificationCounts.queued}</Badge> : null}
          {classificationCounts.analyzing ? <Badge variant="outline">分析中 {classificationCounts.analyzing}</Badge> : null}
          {classificationCounts.failed ? <Badge variant="destructive">失败 {classificationCounts.failed}</Badge> : null}
          <span className="self-center">示例状态不会隐藏“全部”中的文章</span>
        </div>
      ) : null}

      {selectedIds.length ? (
        <div className="mx-3 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border bg-background p-2">
          <span className="mr-auto text-xs font-medium">已选 {selectedIds.length} 篇</span>
          <Button size="xs" variant="outline" onClick={() => setSelectedRead(true)}>
            <MailOpenIcon data-icon="inline-start" />标记已读
          </Button>
          <Button size="xs" variant="outline" onClick={() => setSelectedRead(false)}>
            <MailIcon data-icon="inline-start" />标记未读
          </Button>
          <Button size="xs" variant="outline" onClick={() => setSelectedFavorite(true)}>
            <StarIcon data-icon="inline-start" />收藏
          </Button>
          <IconButton label="清除选择" size="icon-xs" onClick={clearSelection}>
            <XIcon />
          </IconButton>
        </div>
      ) : null}

      <Separator />
      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1">
        {visibleArticles.length ? (
          <div role="listbox" aria-label={`${collection?.name ?? "当前合集"}文章`} className="divide-y">
            {visibleArticles.map((article) => {
              const classificationCollectionId =
                collectionId === SYSTEM_ALL_COLLECTION_ID
                  ? SYSTEM_CURATED_COLLECTION_ID
                  : collectionId
              const classification = getArticleClassification(
                classifications,
                article.id,
                classificationCollectionId,
              )
              const stateLabel = classificationLabel(classification?.state ?? "not_matched")
              const selected = selectedArticleId === article.id
              return (
                <ContextMenu key={article.id}>
                  <ContextMenuTrigger>
                    <Item
                      role="option"
                      tabIndex={0}
                      aria-selected={selected}
                      data-article-id={article.id}
                      data-reading-article-row
                      className={cn(
                        "relative cursor-default flex-nowrap rounded-none border-0 px-3 py-3 focus-visible:ring-inset",
                        selected && "bg-accent/70 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary",
                        !article.isRead && "font-medium",
                      )}
                      onClick={() => openArticleWithDefault(article)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          openArticleWithDefault(article)
                        } else if (
                          event.key === "ArrowDown" ||
                          event.key === "ArrowUp"
                        ) {
                          event.preventDefault()
                          const rows = Array.from(
                            document.querySelectorAll<HTMLElement>(
                              "[data-reading-article-row]",
                            ),
                          )
                          const currentIndex = rows.indexOf(event.currentTarget)
                          const offset = event.key === "ArrowDown" ? 1 : -1
                          rows[currentIndex + offset]?.focus()
                        }
                      }}
                    >
                      <ItemMedia className="self-start pt-0.5">
                        <div className="flex flex-col items-center gap-2">
                          <Checkbox
                            checked={selectedIds.includes(article.id)}
                            aria-label={`选择文章：${article.title}`}
                            onClick={(event) => event.stopPropagation()}
                            onCheckedChange={() => toggleSelection(article.id)}
                          />
                          <span
                            className={cn(
                              "size-1.5 rounded-full border",
                              article.isRead ? "border-muted-foreground/40" : "border-primary bg-primary",
                            )}
                            aria-label={article.isRead ? "已读" : "未读"}
                          />
                        </div>
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-1.5">
                        <div className="flex items-start gap-2">
                          <ItemTitle className="line-clamp-2 flex-1 leading-snug">
                            {article.title}
                          </ItemTitle>
                          {article.isFavorite ? (
                            <StarIcon className="mt-0.5 size-3.5 shrink-0" fill="currentColor" aria-label="已收藏" />
                          ) : null}
                        </div>
                        <ItemDescription className="line-clamp-1 text-xs">
                          {article.sourceSnapshot.title}{article.author ? ` · ${article.author}` : ""} · {articleTime(article)}
                        </ItemDescription>
                        {aiCollection && classification?.reasonSummary ? (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            <SparklesIcon className="mr-1 inline size-3" />
                            {classification.reasonSummary}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-1">
                          {article.contentKind === "summary" ? <Badge variant="outline">仅摘要</Badge> : null}
                          {stateLabel ? (
                            <Badge variant={classification?.state === "failed" ? "destructive" : "outline"}>
                              {classification?.state === "failed" ? <CircleAlertIcon /> : <SparklesIcon />}
                              {stateLabel}
                            </Badge>
                          ) : null}
                          {!article.publishedAt ? <Badge variant="outline">发布时间缺失</Badge> : null}
                        </div>
                      </ItemContent>
                    </Item>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-60">
                    <ReadingArticleContextActions
                      article={article}
                      collection={collection}
                      {...handlers}
                    />
                  </ContextMenuContent>
                </ContextMenu>
              )
            })}
          </div>
        ) : (
          <Empty className="min-h-[320px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {search ? <SearchIcon /> : aiCollection ? <WandSparklesIcon /> : <RssIcon />}
              </EmptyMedia>
              <EmptyTitle>
                {search
                  ? "当前关键词没有匹配"
                  : aiCollection
                    ? "当前要求没有示例匹配"
                    : "当前合集没有文章"}
              </EmptyTitle>
              <EmptyDescription>
                {search
                  ? "搜索不会按相关度重排；清除关键词后仍按发布时间倒序。"
                  : aiCollection
                    ? "零匹配不是错误。可以编辑文字要求、查看匹配预览或返回全部。"
                    : "添加订阅后，新文章会在未来适配器接入时显示在这里。"}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {search ? (
                <Button variant="outline" onClick={() => setSearch("")}>清除搜索</Button>
              ) : aiCollection ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openReadingSettings("collections")}>编辑要求</Button>
                  <Button onClick={() => useReadingStore.getState().selectCollection(SYSTEM_ALL_COLLECTION_ID)}>查看全部</Button>
                </div>
              ) : (
                <Button onClick={() => openReadingSettings("feeds")}>
                  <PlusIcon data-icon="inline-start" />添加订阅
                </Button>
              )}
            </EmptyContent>
          </Empty>
        )}
      </ScrollArea>
    </div>
  )
}

type FeedbackTarget = {
  article: ReadingArticle
  direction: AiFeedbackDirection
}

function FeedbackDialog({
  target,
  onOpenChange,
}: {
  target: FeedbackTarget | null
  onOpenChange: (open: boolean) => void
}) {
  const [note, setNote] = useState("")
  const collectionId = useReadingStore((state) => state.selectedCollectionId)
  const collection = useReadingStore((state) =>
    state.collections.find((item) => item.id === state.selectedCollectionId),
  )
  const addRule = useReadingStore((state) => state.addFeedbackRule)
  const revokeRule = useReadingStore((state) => state.revokeFeedbackRule)

  useEffect(() => {
    if (target) setNote("")
  }, [target])

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{target?.direction === "more" ? "这篇更符合" : "这篇不符合"}</DialogTitle>
          <DialogDescription>
            仅影响“{collection?.name ?? "当前合集"}”。规则独立保存，不会改写原始文字要求，也不会影响排序。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="font-medium">{target?.article.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              将生成一条可查看、可撤销的前端 Mock 规则；未调用模型。
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reading-feedback-note" className="text-sm font-medium">补充原因（可选）</label>
            <Textarea
              id="reading-feedback-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="例如：希望有更多可复现步骤"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            onClick={() => {
              if (!target) return
              const ruleId = addRule(collectionId, target.article.id, target.direction, note)
              onOpenChange(false)
              toast.success("已添加当前合集的 Mock 反馈规则", {
                action: { label: "撤销", onClick: () => revokeRule(ruleId) },
              })
            }}
          >
            {target?.direction === "more" ? <ThumbsUpIcon data-icon="inline-start" /> : <ThumbsDownIcon data-icon="inline-start" />}
            保存规则
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReadingPage() {
  const narrow = useNarrowWorkspace()
  const [narrowDetail, setNarrowDetail] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null)
  const narrowListScrollTopRef = useRef(0)
  const collectionId = useReadingStore((state) => state.selectedCollectionId)
  const collection = useReadingStore((state) =>
    state.collections.find((item) => item.id === state.selectedCollectionId),
  )
  const selectedArticle = useReadingStore((state) =>
    state.articles.find((article) => article.id === state.selectedArticleId) ?? null,
  )
  const defaultOpenMode = useReadingStore(
    (state) => state.preferences.defaultOpenMode,
  )
  const readPolicy = useReadingStore((state) => state.preferences.readPolicy)
  const viewMode = useReadingStore((state) => state.viewMode)
  const selectArticle = useReadingStore((state) => state.selectArticle)
  const setArticleRead = useReadingStore((state) => state.setArticleRead)
  const setViewMode = useReadingStore((state) => state.setViewMode)

  useEffect(() => {
    narrowListScrollTopRef.current = 0
    setNarrowDetail(false)
  }, [collectionId])

  const rememberNarrowListScroll = useCallback((scrollTop: number) => {
    narrowListScrollTopRef.current = scrollTop
  }, [])

  const openExternal = (article: ReadingArticle) => {
    selectArticle(article.id)
    if (readPolicy === "on-open") setArticleRead(article.id, true)
    void readingUiAdapter.openExternalArticle(article.url).then((result) => {
      if (result.opened) {
        toast.success("已交给系统默认浏览器")
      } else if (result.reason === "desktop-runtime-unavailable") {
        toast.warning("浏览器预览未连接桌面运行时；原文地址仍可复制")
      } else if (result.reason === "invalid-url") {
        toast.error("原文地址无效")
      } else {
        toast.error("无法打开原文；可复制链接后重试")
      }
    })
  }

  const handlers: ReadingArticleHandlers = {
    openSplit: (articleId) => {
      selectArticle(articleId)
      if (readPolicy === "on-open") setArticleRead(articleId, true)
      setViewMode("split")
      if (narrow) setNarrowDetail(true)
    },
    openFull: (articleId) => {
      selectArticle(articleId)
      if (readPolicy === "on-open") setArticleRead(articleId, true)
      setViewMode("full")
      setNarrowDetail(true)
    },
    openExternal,
    requestFeedback: (article, direction) =>
      setFeedbackTarget({ article, direction }),
  }

  const openWithDefault = (article: ReadingArticle) => {
    if (defaultOpenMode === "external") {
      openExternal(article)
    } else if (defaultOpenMode === "full") {
      handlers.openFull(article.id)
    } else {
      handlers.openSplit(article.id)
    }
  }

  const articleView = (
    <ReadingArticleView
      article={selectedArticle}
      collection={collection}
      showBack={narrow || viewMode === "full"}
      onBack={() => {
        setViewMode("split")
        setNarrowDetail(false)
        window.setTimeout(() => {
          document
            .querySelector<HTMLElement>(`[data-article-id="${selectedArticle?.id ?? ""}"]`)
            ?.focus({ preventScroll: true })
        }, 0)
      }}
      {...handlers}
    />
  )

  let content
  if (viewMode === "full") {
    content = articleView
  } else if (narrow) {
    content = narrowDetail ? articleView : (
      <ReadingListPane
        openArticleWithDefault={openWithDefault}
        initialScrollTop={narrowListScrollTopRef.current}
        onScrollTopChange={rememberNarrowListScroll}
        {...handlers}
      />
    )
  } else {
    content = (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="reading-list" defaultSize="36%" minSize="320px" maxSize="460px">
          <ReadingListPane openArticleWithDefault={openWithDefault} {...handlers} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="reading-article" defaultSize="64%" minSize="480px">
          {articleView}
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <section className="flex size-full min-h-0 overflow-hidden" aria-label="RSS 阅读">
      {content}
      <FeedbackDialog
        target={feedbackTarget}
        onOpenChange={(open) => {
          if (!open) setFeedbackTarget(null)
        }}
      />
    </section>
  )
}

export function readingSidebarUnreadCount() {
  const state = useReadingStore.getState()
  if (!state.preferences.showUnreadCount) return null
  return collectionUnreadCount(
    {
      articles: state.articles,
      collections: state.collections,
      classifications: state.classifications,
    },
    state.selectedCollectionId || SYSTEM_CURATED_COLLECTION_ID,
  )
}
