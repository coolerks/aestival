export type FeedFormat = "rss" | "atom" | "json-feed"
export type FeedSubscriptionStatus =
  | "draft"
  | "validating"
  | "active"
  | "paused"
  | "restricted"
  | "error"

export type ReadingCollectionKind =
  | "system_curated"
  | "system_all"
  | "source"
  | "ai"

export type ReadingBackfillScope = "new" | "7d" | "30d" | "90d" | "all"
export type ReadingOpenMode = "split" | "full" | "external"
export type ReadingReadPolicy = "on-open" | "on-bottom" | "manual"
export type ReadingArticleFilter = "all" | "unread" | "favorite"
export type ReadingSettingsTab = "feeds" | "collections" | "ai" | "preferences"
export type ArticleClassificationState =
  | "unconfigured"
  | "queued"
  | "analyzing"
  | "matched"
  | "not_matched"
  | "failed"

export type FeedSubscription = {
  id: string
  title: string
  siteUrl: string
  feedUrl: string
  format: FeedFormat
  status: FeedSubscriptionStatus
  sourceCollectionIds: string[]
  lastRefreshAt: string | null
  lastArticleAt: string | null
  errorSummary?: string
  articleCount: number
  unreadCount: number
}

export type ReadingContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }

export type ReadingArticle = {
  id: string
  feedId: string
  sourceSnapshot: {
    title: string
    siteUrl: string
  }
  title: string
  url: string
  author?: string
  publishedAt: string | null
  receivedAt: string
  contentKind: "full" | "summary"
  summary: string
  content: ReadingContentBlock[]
  isRead: boolean
  isFavorite: boolean
  sourceCollectionIds: string[]
  estimatedMinutes: number
}

export type ReadingCollection = {
  id: string
  name: string
  kind: ReadingCollectionKind
  sourceIds: string[]
  criteriaText?: string
  backfillScope?: ReadingBackfillScope
  modelOverrideRef?: string
  sortOrder: number
  immutable: boolean
}

export type RemoteDisclosureConsent = {
  provider: string
  modelRef: string
  disclosureVersion: string
  acceptedAt: string
}

export type ReadingPreference = {
  defaultOpenMode: ReadingOpenMode
  readPolicy: ReadingReadPolicy
  showUnreadCount: boolean
  globalModelRef: string
  curatedCriteria: string
  remoteDisclosureConsent: RemoteDisclosureConsent | null
}

export type ArticleClassification = {
  articleId: string
  collectionId: string
  state: ArticleClassificationState
  reasonSummary?: string
  modelRef?: string
  evaluatedAt?: string
  errorCode?: string
  errorSummary?: string
}

export type AiFeedbackDirection = "more" | "less"

export type AiFeedbackRule = {
  id: string
  collectionId: string
  direction: AiFeedbackDirection
  sourceArticleId: string
  summary: string
  note?: string
  createdAt: string
  revokedAt: string | null
}

export type ReadingSnapshot = {
  feeds: FeedSubscription[]
  articles: ReadingArticle[]
  collections: ReadingCollection[]
  classifications: ArticleClassification[]
  feedbackRules: AiFeedbackRule[]
  preferences: ReadingPreference
}

export type FeedCandidatePreview = {
  id: string
  title: string
  siteUrl: string
  feedUrl: string
  format: FeedFormat
  description: string
  recentArticleTitles: string[]
  existingFeedId?: string
}

export type OpmlPreviewItem = {
  id: string
  title: string
  feedUrl: string
  folder: string
  result: "new" | "merged" | "invalid" | "unsupported"
  detail: string
}

export type ReadingCollectionDraft = {
  name: string
  kind: "source" | "ai"
  sourceIds: string[]
  criteriaText: string
  backfillScope: ReadingBackfillScope
  modelOverrideRef?: string
}
