import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileInputIcon,
  FolderInputIcon,
  InfoIcon,
  LinkIcon,
  RssIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  WandSparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { validHttpUrl } from "@/lib/reading"
import { readingUiAdapter } from "@/services/reading-service"
import { useReadingStore } from "@/store/reading-store"
import type {
  FeedCandidatePreview,
  OpmlPreviewItem,
  ReadingBackfillScope,
  ReadingCollectionDraft,
} from "@/types/reading"

export type FeedDialogState =
  | { kind: "rename"; feedId: string }
  | { kind: "collections"; feedId: string }
  | null

export function AddSubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [address, setAddress] = useState("https://example.com/interface")
  const [phase, setPhase] = useState<"input" | "validating" | "candidates">("input")
  const [candidates, setCandidates] = useState<FeedCandidatePreview[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [error, setError] = useState("")
  const addDemoFeed = useReadingStore((state) => state.addDemoFeed)
  const selected = candidates.find((candidate) => candidate.id === selectedId)

  const preview = () => {
    setError("")
    if (!validHttpUrl(address)) {
      setError("请输入有效的 http/https 网站或 Feed 地址")
      return
    }
    setPhase("validating")
    void readingUiAdapter
      .previewFeedAddress(address)
      .then((result) => {
        setCandidates(result)
        setSelectedId(result[0]?.id ?? "")
        setPhase("candidates")
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "无法生成示例候选")
        setPhase("input")
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加订阅源</DialogTitle>
          <DialogDescription>
            输入网站或公开 Feed 地址。当前只生成示例候选，不访问网络或验证远程内容。
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <InfoIcon />
          <AlertTitle>UI 演示边界</AlertTitle>
          <AlertDescription>
            支持 RSS、Atom 与 JSON Feed 的候选预览流程；私有鉴权 Feed 不在首版范围。
          </AlertDescription>
        </Alert>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="reading-feed-address">网站或 Feed 地址</FieldLabel>
            <Input
              id="reading-feed-address"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value)
                setError("")
                if (phase === "candidates") setPhase("input")
              }}
              aria-invalid={Boolean(error)}
              placeholder="https://example.com 或 /feed.xml"
            />
            <FieldDescription>地址只保留在当前表单草稿中。</FieldDescription>
            <FieldError>{error}</FieldError>
          </Field>
        </FieldGroup>

        {phase === "validating" ? (
          <div className="flex flex-col gap-3 rounded-lg border p-4" aria-live="polite">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Spinner />正在生成示例候选
            </div>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : null}

        {phase === "candidates" ? (
          <FieldSet>
            <FieldLegend>候选订阅源</FieldLegend>
            <RadioGroup value={selectedId} onValueChange={setSelectedId}>
              {candidates.map((candidate) => (
                <FieldLabel key={candidate.id}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value={candidate.id} />
                    <Item size="sm" className="min-w-0 flex-1 border-0 p-0">
                      <ItemMedia variant="icon"><RssIcon /></ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle>{candidate.title}</ItemTitle>
                        <ItemDescription>{candidate.description}</ItemDescription>
                        <div className="flex flex-wrap gap-1 pt-1">
                          <Badge variant="outline">{candidate.format}</Badge>
                          {candidate.existingFeedId ? <Badge variant="outline">重复合并</Badge> : <Badge variant="outline">示例候选</Badge>}
                        </div>
                      </ItemContent>
                    </Item>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            {selected ? (
              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                <div className="font-mono break-all">{selected.feedUrl}</div>
                <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
                  {selected.recentArticleTitles.map((title) => <li key={title}>{title}</li>)}
                </ul>
              </div>
            ) : null}
          </FieldSet>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          {phase === "candidates" ? (
            <Button
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                addDemoFeed(selected)
                toast.success(
                  selected.existingFeedId
                    ? "已定位到现有 Mock 订阅；未创建重复项"
                    : "已加入订阅草稿；未请求网络",
                )
                onOpenChange(false)
              }}
            >
              <CheckCircle2Icon data-icon="inline-start" />
              {selected?.existingFeedId ? "使用现有订阅" : "加入订阅草稿"}
            </Button>
          ) : (
            <Button disabled={phase === "validating"} onClick={preview}>
              <LinkIcon data-icon="inline-start" />查看示例候选
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OpmlPreviewDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<OpmlPreviewItem[]>([])
  const addDemoFeed = useReadingStore((state) => state.addDemoFeed)
  const addCollection = useReadingStore((state) => state.addCollection)
  const assignFeedCollections = useReadingStore(
    (state) => state.assignFeedCollections,
  )

  useEffect(() => {
    if (!open || items.length) return
    setLoading(true)
    void readingUiAdapter.previewExampleOpml().then((result) => {
      setItems(result)
      setLoading(false)
    })
  }, [items.length, open])

  const counts = useMemo(
    () =>
      items.reduce<Record<OpmlPreviewItem["result"], number>>(
        (result, item) => ({ ...result, [item.result]: result[item.result] + 1 }),
        { new: 0, merged: 0, invalid: 0, unsupported: 0 },
      ),
    [items],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(780px,calc(100vh-2rem))] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>OPML 导入预览</DialogTitle>
          <DialogDescription>
            当前展示内置示例，不读取本地文件。真实导入需未来文件与 Feed 适配器。
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col gap-3 py-6" aria-live="polite">
            <Progress value={55} />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner />正在准备示例结果</div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">新增 {counts.new}</Badge>
              <Badge variant="outline">重复合并 {counts.merged}</Badge>
              <Badge variant="destructive">无效 {counts.invalid}</Badge>
              <Badge variant="outline">不支持 {counts.unsupported}</Badge>
            </div>
            <div className="divide-y rounded-lg border">
              {items.map((item) => (
                <Item key={item.id} size="sm" className="rounded-none border-0">
                  <ItemMedia variant="icon"><FileInputIcon /></ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemDescription>{item.folder} · {item.detail}</ItemDescription>
                    <code className="truncate text-xs text-muted-foreground">{item.feedUrl}</code>
                  </ItemContent>
                  <Badge variant={item.result === "invalid" ? "destructive" : "outline"}>
                    {item.result === "new" ? "新增" : item.result === "merged" ? "重复合并" : item.result === "invalid" ? "无效" : "不支持"}
                  </Badge>
                </Item>
              ))}
            </div>
            <Alert>
              <FolderInputIcon />
              <AlertTitle>文件夹映射与导出边界</AlertTitle>
              <AlertDescription>
                OPML 文件夹会映射为来源合集；同一 Feed 可进入多个合集。标准 OPML 不包含 AI 合集、反馈规则或模型引用。
              </AlertDescription>
            </Alert>
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={loading || !items.length}
            onClick={() => {
              const interfaceFeedId = addDemoFeed({
                id: "opml-interface",
                title: "Interface Notes",
                siteUrl: "https://example.com/interface",
                feedUrl: "https://example.com/interface/feed.xml",
                format: "rss",
                description: "OPML 示例",
                recentArticleTitles: [],
              })
              const researchFeedId = addDemoFeed({
                id: "opml-research",
                title: "Research JSON",
                siteUrl: "https://example.com/research",
                feedUrl: "https://example.com/research/feed.json",
                format: "json-feed",
                description: "OPML 示例",
                recentArticleTitles: [],
              })
              const practicalFeedId = addDemoFeed({
                id: "opml-practical-existing",
                title: "Practical AI Notes",
                siteUrl: "https://example.com/practical-ai",
                feedUrl: "https://example.com/practical-ai/feed.xml",
                format: "rss",
                description: "OPML 示例重复项",
                recentArticleTitles: [],
                existingFeedId: "feed-practical-ai",
              })
              const state = useReadingStore.getState()
              const designCollection = state.collections.find(
                (collection) =>
                  collection.kind === "source" && collection.name === "设计",
              )
              if (designCollection) {
                assignFeedCollections(
                  interfaceFeedId,
                  Array.from(
                    new Set([
                      ...state.feeds.find(
                        (feed) => feed.id === interfaceFeedId,
                      )?.sourceCollectionIds ?? [],
                      designCollection.id,
                    ]),
                  ),
                )
              } else {
                addCollection({
                  name: "设计",
                  kind: "source",
                  sourceIds: [interfaceFeedId],
                  criteriaText: "",
                  backfillScope: "30d",
                })
              }
              assignFeedCollections(researchFeedId, ["collection-research"])
              assignFeedCollections(practicalFeedId, [
                "collection-engineering",
                "collection-research",
              ])
              toast.success("已应用可导入项到前端 Mock；未读取或写入文件")
              onOpenChange(false)
            }}
          >
            应用示例结果
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FeedEditDialog({
  state,
  onOpenChange,
}: {
  state: FeedDialogState
  onOpenChange: (open: boolean) => void
}) {
  const feed = useReadingStore((store) =>
    state ? store.feeds.find((item) => item.id === state.feedId) : undefined,
  )
  const allCollections = useReadingStore((store) => store.collections)
  const collections = useMemo(
    () =>
      allCollections.filter((collection) => collection.kind === "source"),
    [allCollections],
  )
  const renameFeed = useReadingStore((store) => store.renameFeed)
  const assignFeedCollections = useReadingStore(
    (store) => store.assignFeedCollections,
  )
  const [name, setName] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  useEffect(() => {
    setName(feed?.title ?? "")
    setSelectedCollections(feed?.sourceCollectionIds ?? [])
  }, [feed])

  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{state?.kind === "rename" ? "重命名订阅源" : "分配来源合集"}</DialogTitle>
          <DialogDescription>
            {state?.kind === "rename"
              ? "只修改本地显示名称，不修改 Feed 地址。"
              : "同一订阅源可以同时属于多个来源合集。"}
          </DialogDescription>
        </DialogHeader>
        {state?.kind === "rename" ? (
          <Field data-invalid={!name.trim()}>
            <FieldLabel htmlFor="reading-feed-name">显示名称</FieldLabel>
            <Input id="reading-feed-name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={!name.trim()} />
            {!name.trim() ? <FieldError>名称不能为空</FieldError> : null}
          </Field>
        ) : (
          <FieldSet>
            <FieldLegend>来源合集</FieldLegend>
            <div className="divide-y rounded-lg border">
              {collections.map((collection) => (
                <FieldLabel key={collection.id} className="rounded-none border-0">
                  <Field orientation="horizontal" className="p-3">
                    <Checkbox
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={(checked) =>
                        setSelectedCollections((current) =>
                          checked
                            ? [...current, collection.id]
                            : current.filter((id) => id !== collection.id),
                        )
                      }
                    />
                    <span>{collection.name}</span>
                  </Field>
                </FieldLabel>
              ))}
            </div>
          </FieldSet>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={!feed || (state?.kind === "rename" && !name.trim())}
            onClick={() => {
              if (!feed || !state) return
              if (state.kind === "rename") renameFeed(feed.id, name)
              else assignFeedCollections(feed.id, selectedCollections)
              toast.success("已更新前端 Mock 订阅设置")
              onOpenChange(false)
            }}
          >保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UnsubscribeFeedDialog({
  feedId,
  onOpenChange,
}: {
  feedId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const feed = useReadingStore((state) =>
    state.feeds.find((item) => item.id === feedId),
  )
  const allArticles = useReadingStore((state) => state.articles)
  const articles = useMemo(
    () => allArticles.filter((article) => article.feedId === feedId),
    [allArticles, feedId],
  )
  const unsubscribe = useReadingStore((state) => state.unsubscribeFeed)
  const [history, setHistory] = useState<"retain" | "delete">("retain")

  useEffect(() => {
    if (feedId) setHistory("retain")
  }, [feedId])

  return (
    <AlertDialog open={Boolean(feedId)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Trash2Icon /></AlertDialogMedia>
          <AlertDialogTitle>取消订阅“{feed?.title ?? "该来源"}”？</AlertDialogTitle>
          <AlertDialogDescription>
            这会移除活跃订阅关系。默认保留 {articles.length} 篇历史文章及其已读、收藏和合集快照。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <RadioGroup value={history} onValueChange={(value) => setHistory(value as typeof history)}>
          <FieldLabel>
            <Field orientation="horizontal">
              <RadioGroupItem value="retain" />
              <div><div className="font-medium">保留历史文章</div><FieldDescription>推荐；全部和原来源合集仍可查看。</FieldDescription></div>
            </Field>
          </FieldLabel>
          <FieldLabel>
            <Field orientation="horizontal" data-invalid={history === "delete"}>
              <RadioGroupItem value="delete" aria-invalid={history === "delete"} />
              <div><div className="font-medium text-destructive">同时删除历史</div><FieldDescription>文章、收藏、分类与相关反馈规则会从 Mock 状态移除。</FieldDescription></div>
            </Field>
          </FieldLabel>
        </RadioGroup>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (!feedId) return
              unsubscribe(feedId, history === "delete")
              toast.success(history === "delete" ? "已从前端 Mock 取消并删除历史" : "已从前端 Mock 取消订阅并保留历史")
            }}
          >确认取消订阅</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function CollectionWizardDialog({
  open,
  onOpenChange,
  onRequestConsent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestConsent: (modelRef: string) => void
}) {
  const feeds = useReadingStore((state) => state.feeds)
  const collections = useReadingStore((state) => state.collections)
  const preferences = useReadingStore((state) => state.preferences)
  const addCollection = useReadingStore((state) => state.addCollection)
  const [kind, setKind] = useState<"source" | "ai">("source")
  const [name, setName] = useState("")
  const [sourceIds, setSourceIds] = useState<string[]>([])
  const [criteria, setCriteria] = useState("")
  const [backfill, setBackfill] = useState<ReadingBackfillScope>("30d")
  const [model, setModel] = useState("inherit")
  const [preview, setPreview] = useState<"idle" | "loading" | "ready" | "zero">("idle")
  const duplicateName = collections.some(
    (collection) => collection.name.trim() === name.trim() && name.trim(),
  )
  const valid = Boolean(
    name.trim() &&
      !duplicateName &&
      (kind === "source" ? sourceIds.length : criteria.trim()),
  )
  const effectiveModel = model === "inherit" ? preferences.globalModelRef : model
  const needsConsent = effectiveModel !== "model-balanced" && !preferences.remoteDisclosureConsent

  const reset = () => {
    setKind("source")
    setName("")
    setSourceIds([])
    setCriteria("")
    setBackfill("30d")
    setModel("inherit")
    setPreview("idle")
  }

  const runPreview = () => {
    if (!criteria.trim()) return
    if (needsConsent) {
      onRequestConsent(effectiveModel)
      return
    }
    setPreview("loading")
    window.setTimeout(() => {
      setPreview(criteria.toLowerCase().includes("绝不可能匹配") ? "zero" : "ready")
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(820px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>新建合集</DialogTitle>
          <DialogDescription>
            两种类型不可互换。关闭后当前表单草稿会保留在本次界面会话中。
          </DialogDescription>
        </DialogHeader>
        <FieldSet>
          <FieldLegend>合集类型</FieldLegend>
          <ToggleGroup
            value={[kind]}
            onValueChange={(values) => {
              const next = values[0]
              if (next === "source" || next === "ai") {
                setKind(next)
                setPreview("idle")
              }
            }}
            variant="outline"
            spacing={0}
            className="w-full"
          >
            <ToggleGroupItem value="source" className="min-w-0 flex-1">
              <FolderInputIcon data-icon="inline-start" />订阅源合集
            </ToggleGroupItem>
            <ToggleGroupItem value="ai" className="min-w-0 flex-1">
              <WandSparklesIcon data-icon="inline-start" />AI 合集
            </ToggleGroupItem>
          </ToggleGroup>
          <FieldDescription>
            {kind === "source"
              ? "选择一个或多个 Feed，包含这些来源的全部文章。"
              : "不选择来源；按文字要求分析全部活跃订阅的新文章。"}
          </FieldDescription>
        </FieldSet>
        <Field data-invalid={duplicateName || (Boolean(name) && !name.trim())}>
          <FieldLabel htmlFor="reading-collection-name">名称</FieldLabel>
          <Input id="reading-collection-name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={duplicateName || (Boolean(name) && !name.trim())} placeholder={kind === "source" ? "例如：工程阅读" : "例如：本地 AI 工程"} />
          {duplicateName ? <FieldError>已有同名合集</FieldError> : null}
        </Field>

        {kind === "source" ? (
          <FieldSet data-invalid={!sourceIds.length}>
            <FieldLegend>订阅源</FieldLegend>
            {feeds.length ? (
              <div className="max-h-64 overflow-y-auto divide-y rounded-lg border">
                {feeds.map((feed) => (
                  <FieldLabel key={feed.id} className="rounded-none border-0">
                    <Field orientation="horizontal" className="p-3">
                      <Checkbox
                        checked={sourceIds.includes(feed.id)}
                        aria-invalid={!sourceIds.length}
                        onCheckedChange={(checked) =>
                          setSourceIds((current) =>
                            checked
                              ? [...current, feed.id]
                              : current.filter((id) => id !== feed.id),
                          )
                        }
                      />
                      <div className="min-w-0"><div className="truncate font-medium">{feed.title}</div><FieldDescription>{feed.status} · {feed.format}</FieldDescription></div>
                    </Field>
                  </FieldLabel>
                ))}
              </div>
            ) : (
              <Empty className="border">
                <EmptyHeader><EmptyMedia variant="icon"><RssIcon /></EmptyMedia><EmptyTitle>还没有订阅源</EmptyTitle><EmptyDescription>先添加订阅，再创建来源合集。</EmptyDescription></EmptyHeader>
              </Empty>
            )}
            {!sourceIds.length ? <FieldError>至少选择一个订阅源</FieldError> : null}
          </FieldSet>
        ) : (
          <FieldGroup>
            <Field data-invalid={Boolean(criteria) && !criteria.trim()}>
              <FieldLabel htmlFor="reading-ai-criteria">分类要求</FieldLabel>
              <Textarea id="reading-ai-criteria" value={criteria} onChange={(event) => { setCriteria(event.target.value); setPreview("idle") }} aria-invalid={Boolean(criteria) && !criteria.trim()} rows={4} placeholder="描述该合集应当包含什么样的文章，以及要排除什么…" />
              <FieldDescription>保存用户原文；反馈规则会单独记录，不会静默改写。</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>模型</FieldLabel>
              <Select value={model} onValueChange={(value) => value && setModel(value)}>
                <SelectTrigger><SelectValue>{model === "inherit" ? "继承阅读默认模型" : model === "model-balanced" ? "Mock Balanced · 本地" : "Mock Fast · 远程"}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="inherit">继承阅读默认模型</SelectItem>
                    <SelectItem value="model-balanced">Mock Balanced · 本地</SelectItem>
                    <SelectItem value="model-fast">Mock Fast · 远程</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {needsConsent ? (
              <Alert>
                <ShieldCheckIcon />
                <AlertTitle>远程模型尚未授权</AlertTitle>
                <AlertDescription>可先保存为未配置合集；匹配预览和发送会被阻止。</AlertDescription>
              </Alert>
            ) : null}
            <FieldSet>
              <FieldLegend>历史处理范围</FieldLegend>
              <RadioGroup value={backfill} onValueChange={(value) => setBackfill(value as ReadingBackfillScope)} className="grid sm:grid-cols-2">
                {[
                  ["new", "仅新文章"],
                  ["7d", "回溯 7 天"],
                  ["30d", "回溯 30 天（默认）"],
                  ["90d", "回溯 90 天"],
                  ["all", "全部历史"],
                ].map(([value, label]) => (
                  <FieldLabel key={value}><Field orientation="horizontal"><RadioGroupItem value={value} /><span>{label}</span></Field></FieldLabel>
                ))}
              </RadioGroup>
            </FieldSet>
            <div className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><div className="font-medium">匹配预览</div><p className="text-xs text-muted-foreground">仅展示固定样本；不调用模型或发送文章。</p></div>
                <Button variant="outline" size="sm" disabled={!criteria.trim() || preview === "loading"} onClick={runPreview}>
                  {preview === "loading" ? <Spinner /> : <SparklesIcon data-icon="inline-start" />}生成示例预览
                </Button>
              </div>
              {preview === "loading" ? <div className="mt-3 flex flex-col gap-2"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : null}
              {preview === "ready" ? (
                <div className="mt-3 divide-y rounded-lg border">
                  <div className="p-3 text-sm"><Badge variant="outline">示例命中</Badge><div className="mt-1 font-medium">把本地 Agent 的评估环路拆成可复现的五步</div><p className="mt-1 text-xs text-muted-foreground">示例理由：包含复现步骤，并与文字要求中的工程实践相符。</p></div>
                  <div className="p-3 text-sm"><Badge variant="outline">示例不命中</Badge><div className="mt-1 font-medium">React 流式界面的错误边界应该放在哪里</div><p className="mt-1 text-xs text-muted-foreground">示例理由：信息有用，但与当前主题要求相关性较弱。</p></div>
                </div>
              ) : null}
              {preview === "zero" ? (
                <Empty className="mt-3 border"><EmptyHeader><EmptyMedia variant="icon"><WandSparklesIcon /></EmptyMedia><EmptyTitle>示例零匹配</EmptyTitle><EmptyDescription>这不是错误；可以调整要求或仍然创建合集。</EmptyDescription></EmptyHeader></Empty>
              ) : null}
            </div>
          </FieldGroup>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const draft: ReadingCollectionDraft = {
                name,
                kind,
                sourceIds,
                criteriaText: criteria,
                backfillScope: backfill,
                modelOverrideRef: model === "inherit" ? undefined : model,
              }
              addCollection(draft)
              toast.success(kind === "source" ? "已创建前端 Mock 来源合集" : needsConsent ? "已创建未配置的前端 Mock AI 合集" : "已创建前端 Mock AI 合集；未运行分类")
              reset()
              onOpenChange(false)
            }}
          >创建合集</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CollectionEditDialog({
  collectionId,
  onOpenChange,
}: {
  collectionId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const collection = useReadingStore((state) =>
    state.collections.find((item) => item.id === collectionId),
  )
  const collections = useReadingStore((state) => state.collections)
  const feeds = useReadingStore((state) => state.feeds)
  const updateDefinition = useReadingStore(
    (state) => state.updateCollectionDefinition,
  )
  const [name, setName] = useState("")
  const [sourceIds, setSourceIds] = useState<string[]>([])
  const [criteria, setCriteria] = useState("")
  const [backfill, setBackfill] = useState<ReadingBackfillScope>("30d")
  const [model, setModel] = useState("inherit")

  useEffect(() => {
    setName(collection?.name ?? "")
    setSourceIds(collection?.sourceIds ?? [])
    setCriteria(collection?.criteriaText ?? "")
    setBackfill(collection?.backfillScope ?? "30d")
    setModel(collection?.modelOverrideRef ?? "inherit")
  }, [collection])

  const duplicate = collections.some(
    (item) =>
      item.id !== collectionId &&
      item.name.trim() === name.trim() &&
      Boolean(name.trim()),
  )
  const valid = Boolean(
    collection &&
      !collection.immutable &&
      name.trim() &&
      !duplicate &&
      (collection.kind === "source"
        ? sourceIds.length
        : collection.kind === "ai" && criteria.trim()),
  )

  return (
    <Dialog open={Boolean(collectionId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>编辑“{collection?.name ?? "合集"}”</DialogTitle>
          <DialogDescription>
            合集类型不可转换。修改 AI 要求不会静默重跑历史分类。
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={duplicate || !name.trim()}>
          <FieldLabel htmlFor="reading-edit-collection-name">名称</FieldLabel>
          <Input id="reading-edit-collection-name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={duplicate || !name.trim()} />
          {duplicate ? <FieldError>已有同名合集</FieldError> : null}
        </Field>
        {collection?.kind === "source" ? (
          <FieldSet data-invalid={!sourceIds.length}>
            <FieldLegend>订阅源</FieldLegend>
            <div className="max-h-64 overflow-y-auto divide-y rounded-lg border">
              {feeds.map((feed) => (
                <FieldLabel key={feed.id} className="rounded-none border-0">
                  <Field orientation="horizontal" className="p-3">
                    <Checkbox
                      checked={sourceIds.includes(feed.id)}
                      aria-invalid={!sourceIds.length}
                      onCheckedChange={(checked) =>
                        setSourceIds((current) =>
                          checked
                            ? [...current, feed.id]
                            : current.filter((id) => id !== feed.id),
                        )
                      }
                    />
                    <div><div className="font-medium">{feed.title}</div><FieldDescription>{feed.status} · {feed.format}</FieldDescription></div>
                  </Field>
                </FieldLabel>
              ))}
            </div>
            {!sourceIds.length ? <FieldError>至少选择一个订阅源</FieldError> : null}
          </FieldSet>
        ) : collection?.kind === "ai" ? (
          <FieldGroup>
            <Field data-invalid={!criteria.trim()}>
              <FieldLabel htmlFor="reading-edit-criteria">分类要求</FieldLabel>
              <Textarea id="reading-edit-criteria" rows={4} value={criteria} onChange={(event) => setCriteria(event.target.value)} aria-invalid={!criteria.trim()} />
              <FieldDescription>保存用户原文；已有反馈规则仍单独保留。</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>模型覆盖</FieldLabel>
              <Select value={model} onValueChange={(value) => value && setModel(value)}>
                <SelectTrigger><SelectValue>{model === "inherit" ? "继承阅读默认模型" : model === "model-balanced" ? "Mock Balanced · 本地" : "Mock Fast · 远程"}</SelectValue></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value="inherit">继承阅读默认模型</SelectItem><SelectItem value="model-balanced">Mock Balanced · 本地</SelectItem><SelectItem value="model-fast">Mock Fast · 远程</SelectItem></SelectGroup></SelectContent>
              </Select>
            </Field>
            <FieldSet>
              <FieldLegend>后续显式重跑范围</FieldLegend>
              <RadioGroup value={backfill} onValueChange={(value) => setBackfill(value as ReadingBackfillScope)} className="grid sm:grid-cols-2">
                {[["new", "仅新文章"], ["7d", "7 天"], ["30d", "30 天"], ["90d", "90 天"], ["all", "全部"]].map(([value, label]) => <FieldLabel key={value}><Field orientation="horizontal"><RadioGroupItem value={value} /><span>{label}</span></Field></FieldLabel>)}
              </RadioGroup>
              <FieldDescription>保存定义后不会自动发送或重跑；后续需再次显式确认。</FieldDescription>
            </FieldSet>
          </FieldGroup>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={!valid || !collection || (collection.kind !== "source" && collection.kind !== "ai")}
            onClick={() => {
              if (!collection || (collection.kind !== "source" && collection.kind !== "ai")) return
              updateDefinition(collection.id, {
                name,
                kind: collection.kind,
                sourceIds,
                criteriaText: criteria,
                backfillScope: backfill,
                modelOverrideRef: model === "inherit" ? undefined : model,
              })
              toast.success(collection.kind === "ai" ? "已保存定义；未重跑或发送文章" : "已更新前端 Mock 来源合集")
              onOpenChange(false)
            }}
          >保存定义</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteCollectionDialog({
  collectionId,
  onOpenChange,
}: {
  collectionId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const collection = useReadingStore((state) =>
    state.collections.find((item) => item.id === collectionId),
  )
  const deleteCollection = useReadingStore((state) => state.deleteCollection)
  return (
    <AlertDialog open={Boolean(collectionId)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Trash2Icon /></AlertDialogMedia>
          <AlertDialogTitle>删除“{collection?.name ?? "该合集"}”？</AlertDialogTitle>
          <AlertDialogDescription>
            {collection?.kind === "ai"
              ? "会删除该合集的示例分类和反馈规则；不会删除文章、订阅源、已读或收藏状态。"
              : "只删除来源合集关系；不会删除订阅源或文章。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (collectionId) deleteCollection(collectionId)
              toast.success("已删除前端 Mock 合集")
            }}
          >删除合集</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RemoteDisclosureDialog({
  open,
  onOpenChange,
  modelRef,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelRef?: string
}) {
  const preferences = useReadingStore((state) => state.preferences)
  const grant = useReadingStore((state) => state.grantRemoteDisclosure)
  const effectiveModel = modelRef ?? preferences.globalModelRef
  const remote = effectiveModel !== "model-balanced"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>启用远程模型用于阅读</DialogTitle>
          <DialogDescription>
            首次使用前确认发送范围。当前操作只更新前端 Mock 授权状态，不发送任何文章。
          </DialogDescription>
        </DialogHeader>
        {!remote ? (
          <Alert><InfoIcon /><AlertTitle>当前选择本地模型</AlertTitle><AlertDescription>本地模型不需要远程发送授权。</AlertDescription></Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-lg border p-3">
              <h3 className="flex items-center gap-2 font-medium"><SparklesIcon className="size-4" />会发送</h3>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
                <li>文章标题、作者、发布时间</li>
                <li>来源名称、URL、Feed 正文或摘要</li>
                <li>当前合集文字要求</li>
                <li>仅作用于当前合集的反馈规则</li>
              </ul>
            </section>
            <section className="rounded-lg border p-3">
              <h3 className="flex items-center gap-2 font-medium"><ShieldCheckIcon className="size-4" />不会发送</h3>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
                <li>Feed 鉴权凭据或应用 Secret</li>
                <li>完整订阅配置</li>
                <li>无关阅读历史和其他合集要求</li>
                <li>工具、文件或 Agent 权限</li>
              </ul>
            </section>
          </div>
        )}
        <Alert>
          <AlertTriangleIcon />
          <AlertTitle>用途与判断边界</AlertTitle>
          <AlertDescription>数据仅用于示例分类与简短理由。模型判断不保证事实正确，文章内容不能触发工具或副作用。</AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={!remote}
            onClick={() => {
              grant(effectiveModel)
              toast.success("已记录前端 Mock 授权；未发送文章")
              onOpenChange(false)
            }}
          ><ShieldCheckIcon data-icon="inline-start" />同意并启用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
