import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  MailIcon,
  MailOpenIcon,
  Maximize2Icon,
  MoreHorizontalIcon,
  PanelRightOpenIcon,
  SparklesIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenuIconTrigger,
  IconButton,
} from "@/components/shell/icon-button"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { copyTextToClipboard } from "@/lib/context-menu-utils"
import { getArticleClassification, isAiCollection } from "@/lib/reading"
import { cn } from "@/lib/utils"
import { useReadingStore } from "@/store/reading-store"
import type {
  AiFeedbackDirection,
  ReadingArticle,
  ReadingCollection,
} from "@/types/reading"

export type ReadingArticleHandlers = {
  openSplit: (articleId: string) => void
  openFull: (articleId: string) => void
  openExternal: (article: ReadingArticle) => void
  requestFeedback: (
    article: ReadingArticle,
    direction: AiFeedbackDirection,
  ) => void
}

function dateLabel(article: ReadingArticle) {
  const value = article.publishedAt ?? article.receivedAt
  const date = new Date(value)
  const formatted = new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
  return article.publishedAt ? formatted : `${formatted} · 按接收时间`
}

function copyArticleLink(article: ReadingArticle) {
  void copyTextToClipboard(article.url).then((copied) => {
    if (copied) toast.success("已复制文章链接")
    else toast.warning("无法写入剪贴板")
  })
}

function articleDomain(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

type ArticleActionProps = ReadingArticleHandlers & {
  article: ReadingArticle
  collection?: ReadingCollection
}

export function ReadingArticleContextActions({
  article,
  collection,
  openSplit,
  openFull,
  openExternal,
  requestFeedback,
}: ArticleActionProps) {
  const setArticleRead = useReadingStore((state) => state.setArticleRead)
  const toggleFavorite = useReadingStore((state) => state.toggleArticleFavorite)
  const classification = useReadingStore((state) =>
    collection
      ? getArticleClassification(
          state.classifications,
          article.id,
          collection.id,
        )
      : undefined,
  )
  const aiActions = isAiCollection(collection)

  return (
    <>
      <ContextMenuGroup>
        <ContextMenuLabel>阅读</ContextMenuLabel>
        <ContextMenuItem onClick={() => openSplit(article.id)}>
          <PanelRightOpenIcon />在阅读窗打开
        </ContextMenuItem>
        <ContextMenuItem onClick={() => openFull(article.id)}>
          <Maximize2Icon />整页阅读
        </ContextMenuItem>
        <ContextMenuItem onClick={() => openExternal(article)}>
          <ExternalLinkIcon />打开原文
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuLabel>状态</ContextMenuLabel>
        <ContextMenuItem
          onClick={() => setArticleRead(article.id, !article.isRead)}
        >
          {article.isRead ? <MailIcon /> : <MailOpenIcon />}
          {article.isRead ? "标记未读" : "标记已读"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toggleFavorite(article.id)}>
          <StarIcon fill={article.isFavorite ? "currentColor" : "none"} />
          {article.isFavorite ? "取消收藏" : "收藏"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copyArticleLink(article)}>
          <CopyIcon />复制链接
        </ContextMenuItem>
      </ContextMenuGroup>
      {aiActions ? (
        <>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>仅影响：{collection?.name}</ContextMenuLabel>
            <ContextMenuItem onClick={() => requestFeedback(article, "more")}>
              <ThumbsUpIcon />更符合
            </ContextMenuItem>
            <ContextMenuItem onClick={() => requestFeedback(article, "less")}>
              <ThumbsDownIcon />不符合
            </ContextMenuItem>
            <ContextMenuItem disabled={!classification?.reasonSummary}>
              <SparklesIcon />查看入选理由
            </ContextMenuItem>
          </ContextMenuGroup>
        </>
      ) : null}
    </>
  )
}

function ArticleDropdownActions(props: ArticleActionProps) {
  const { article, collection } = props
  const setArticleRead = useReadingStore((state) => state.setArticleRead)
  const toggleFavorite = useReadingStore((state) => state.toggleArticleFavorite)
  const aiActions = isAiCollection(collection)
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>临时打开方式</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => props.openSplit(article.id)}>
          <PanelRightOpenIcon />列表 + 阅读窗
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.openFull(article.id)}>
          <Maximize2Icon />整页阅读
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.openExternal(article)}>
          <ExternalLinkIcon />打开原文
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => setArticleRead(article.id, !article.isRead)}
        >
          {article.isRead ? <MailIcon /> : <MailOpenIcon />}
          {article.isRead ? "标记未读" : "标记已读"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleFavorite(article.id)}>
          <StarIcon fill={article.isFavorite ? "currentColor" : "none"} />
          {article.isFavorite ? "取消收藏" : "收藏"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyArticleLink(article)}>
          <CopyIcon />复制链接
        </DropdownMenuItem>
      </DropdownMenuGroup>
      {aiActions ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>仅影响：{collection?.name}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => props.requestFeedback(article, "more")}
            >
              <ThumbsUpIcon />更符合
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => props.requestFeedback(article, "less")}
            >
              <ThumbsDownIcon />不符合
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      ) : null}
    </>
  )
}

type ReadingArticleViewProps = ReadingArticleHandlers & {
  article: ReadingArticle | null
  collection?: ReadingCollection
  showBack: boolean
  onBack: () => void
}

export function ReadingArticleView({
  article,
  collection,
  showBack,
  onBack,
  ...handlers
}: ReadingArticleViewProps) {
  const [reasonOpen, setReasonOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const readPolicy = useReadingStore((state) => state.preferences.readPolicy)
  const setArticleRead = useReadingStore((state) => state.setArticleRead)
  const toggleFavorite = useReadingStore((state) => state.toggleArticleFavorite)
  const classification = useReadingStore((state) =>
    article && collection
      ? getArticleClassification(
          state.classifications,
          article.id,
          collection.id,
        )
      : undefined,
  )
  const feedbackRules = useReadingStore((state) => state.feedbackRules)
  const collectionRules = useMemo(
    () =>
      collection
        ? feedbackRules.filter(
            (rule) => rule.collectionId === collection.id && !rule.revokedAt,
          )
        : [],
    [collection, feedbackRules],
  )

  useEffect(() => {
    if (!article || readPolicy !== "on-bottom" || article.isRead) return
    const node = bottomRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArticleRead(article.id, true)
        }
      },
      { threshold: 1 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [article, readPolicy, setArticleRead])

  const metadata = useMemo(() => {
    if (!article) return []
    return [
      article.sourceSnapshot.title,
      article.author,
      dateLabel(article),
      `${article.estimatedMinutes} 分钟`,
    ].filter(Boolean)
  }, [article])

  if (!article) {
    return (
      <div className="flex size-full items-center justify-center p-6 text-sm text-muted-foreground">
        选择一篇文章开始阅读。
      </div>
    )
  }

  const aiArticle = isAiCollection(collection)

  return (
    <div className="flex size-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-1">
          {showBack ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeftIcon data-icon="inline-start" />返回列表
            </Button>
          ) : null}
          <Badge variant="outline">
            {article.isRead ? <CheckIcon /> : <MailIcon />}
            {article.isRead ? "已读" : "未读"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setArticleRead(article.id, !article.isRead)}
          >
            {article.isRead ? (
              <MailIcon data-icon="inline-start" />
            ) : (
              <MailOpenIcon data-icon="inline-start" />
            )}
            {article.isRead ? "设为未读" : "设为已读"}
          </Button>
          <IconButton
            label={article.isFavorite ? "取消收藏" : "收藏"}
            onClick={() => toggleFavorite(article.id)}
          >
            <StarIcon fill={article.isFavorite ? "currentColor" : "none"} />
          </IconButton>
          <IconButton label="复制链接" onClick={() => copyArticleLink(article)}>
            <CopyIcon />
          </IconButton>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlers.openExternal(article)}
          >
            <ExternalLinkIcon data-icon="inline-start" />打开原文
          </Button>
          <DropdownMenu>
            <DropdownMenuIconTrigger label="更多文章操作">
              <MoreHorizontalIcon />
            </DropdownMenuIconTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <ArticleDropdownActions
                article={article}
                collection={collection}
                {...handlers}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1">
        <article className="app-selectable-content mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-8 sm:px-9">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {metadata.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {article.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {articleDomain(article.url)} · 内容由 Feed 提供
            </p>
          </header>

          {article.contentKind === "summary" ? (
            <Alert>
              <ExternalLinkIcon />
              <AlertTitle>此订阅源只提供摘要</AlertTitle>
              <AlertDescription>
                Aestival 不会抓取网页全文。阅读完整内容请打开原文。
              </AlertDescription>
              <AlertAction>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handlers.openExternal(article)}
                >
                  打开原文
                </Button>
              </AlertAction>
            </Alert>
          ) : null}

          {aiArticle && classification?.reasonSummary ? (
            <Collapsible open={reasonOpen} onOpenChange={setReasonOpen}>
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <CollapsibleTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-0 hover:bg-transparent"
                    />
                  }
                >
                  <SparklesIcon data-icon="inline-start" />
                  为什么在“{collection?.name}”
                  <ChevronDownIcon
                    data-icon="inline-end"
                    className={cn("ml-auto transition-transform", reasonOpen && "rotate-180")}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                  <p>{classification.reasonSummary}</p>
                  <dl className="mt-3 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                    <dt>模型引用</dt>
                    <dd>{classification.modelRef ?? "未记录"}</dd>
                    <dt>分析时间</dt>
                    <dd>{classification.evaluatedAt ? new Date(classification.evaluatedAt).toLocaleString("zh-CN") : "示例队列中"}</dd>
                    <dt>反馈规则</dt>
                    <dd>{collectionRules.length ? `${collectionRules.length} 条当前规则` : "无"}</dd>
                  </dl>
                  <p className="mt-3 text-xs">
                    这是示例模型判断，不是事实正确性或可靠性保证；不会展示内部思维链。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handlers.requestFeedback(article, "more")}
                    >
                      <ThumbsUpIcon data-icon="inline-start" />更符合
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handlers.requestFeedback(article, "less")}
                    >
                      <ThumbsDownIcon data-icon="inline-start" />不符合
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ) : null}

          <div className="markdown-content text-[15px] leading-7">
            {article.content.map((block, index) => {
              const key = `${article.id}-${index}`
              if (block.type === "heading") {
                return <h2 key={key}>{block.text}</h2>
              }
              if (block.type === "quote") {
                return <blockquote key={key}>{block.text}</blockquote>
              }
              if (block.type === "list") {
                return (
                  <ul key={key}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              }
              return <p key={key}>{block.text}</p>
            })}
          </div>
          <div ref={bottomRef} className="h-px" aria-label="文章末尾" />
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
            <span>正文到此结束 · Feed 内容未经过网页全文提取</span>
            <Button variant="link" size="xs" onClick={() => handlers.openExternal(article)}>
              打开原文<ExternalLinkIcon data-icon="inline-end" />
            </Button>
          </footer>
        </article>
      </ScrollArea>
    </div>
  )
}
