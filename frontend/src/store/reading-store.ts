import { create } from "zustand"

import {
  initialReadingSnapshot,
  SYSTEM_ALL_COLLECTION_ID,
  SYSTEM_CURATED_COLLECTION_ID,
} from "@/data/mock-reading"
import { getCollectionArticles } from "@/lib/reading"
import type {
  AiFeedbackDirection,
  FeedCandidatePreview,
  FeedSubscriptionStatus,
  ReadingArticleFilter,
  ReadingCollectionDraft,
  ReadingOpenMode,
  ReadingPreference,
  ReadingReadPolicy,
  ReadingSettingsTab,
  ReadingSnapshot,
} from "@/types/reading"

function cloneReadingSnapshot(snapshot: ReadingSnapshot): ReadingSnapshot {
  return {
    feeds: snapshot.feeds.map((feed) => ({
      ...feed,
      sourceCollectionIds: [...feed.sourceCollectionIds],
    })),
    articles: snapshot.articles.map((article) => ({
      ...article,
      sourceSnapshot: { ...article.sourceSnapshot },
      sourceCollectionIds: [...article.sourceCollectionIds],
      content: article.content.map((block) =>
        block.type === "list" ? { ...block, items: [...block.items] } : { ...block },
      ),
    })),
    collections: snapshot.collections.map((collection) => ({
      ...collection,
      sourceIds: [...collection.sourceIds],
    })),
    classifications: snapshot.classifications.map((classification) => ({
      ...classification,
    })),
    feedbackRules: snapshot.feedbackRules.map((rule) => ({ ...rule })),
    preferences: {
      ...snapshot.preferences,
      remoteDisclosureConsent: snapshot.preferences.remoteDisclosureConsent
        ? { ...snapshot.preferences.remoteDisclosureConsent }
        : null,
    },
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function snapshotFromState(state: ReadingStore): ReadingSnapshot {
  return {
    feeds: state.feeds,
    articles: state.articles,
    collections: state.collections,
    classifications: state.classifications,
    feedbackRules: state.feedbackRules,
    preferences: state.preferences,
  }
}

type ReadingStore = ReadingSnapshot & {
  selectedCollectionId: string
  selectedArticleId: string | null
  searchQuery: string
  articleFilter: ReadingArticleFilter
  selectedArticleIds: string[]
  viewMode: "split" | "full"
  settingsTab: ReadingSettingsTab
  offline: boolean
  selectCollection: (collectionId: string) => void
  selectArticle: (articleId: string) => void
  setSearchQuery: (query: string) => void
  setArticleFilter: (filter: ReadingArticleFilter) => void
  toggleArticleSelection: (articleId: string) => void
  clearArticleSelection: () => void
  setArticleRead: (articleId: string, read: boolean) => void
  toggleArticleFavorite: (articleId: string) => void
  setSelectedArticlesRead: (read: boolean) => void
  setSelectedArticlesFavorite: (favorite: boolean) => void
  setViewMode: (mode: "split" | "full") => void
  setSettingsTab: (tab: ReadingSettingsTab) => void
  setOffline: (offline: boolean) => void
  setFeedStatus: (feedId: string, status: FeedSubscriptionStatus) => void
  renameFeed: (feedId: string, title: string) => void
  assignFeedCollections: (feedId: string, collectionIds: string[]) => void
  addDemoFeed: (candidate: FeedCandidatePreview) => string
  unsubscribeFeed: (feedId: string, deleteHistory: boolean) => void
  addCollection: (draft: ReadingCollectionDraft) => string
  updateCollectionDefinition: (
    collectionId: string,
    draft: ReadingCollectionDraft,
  ) => void
  renameCollection: (collectionId: string, name: string) => void
  deleteCollection: (collectionId: string) => void
  moveCollection: (collectionId: string, direction: "up" | "down") => void
  setDefaultOpenMode: (mode: ReadingOpenMode) => void
  setReadPolicy: (policy: ReadingReadPolicy) => void
  setShowUnreadCount: (show: boolean) => void
  setGlobalModelRef: (modelRef: string) => void
  setCuratedCriteria: (criteria: string) => void
  grantRemoteDisclosure: (modelRef?: string) => void
  revokeRemoteDisclosure: () => void
  addFeedbackRule: (
    collectionId: string,
    articleId: string,
    direction: AiFeedbackDirection,
    note: string,
  ) => string
  revokeFeedbackRule: (ruleId: string) => void
  resetReadingDemo: () => void
}

const initial = cloneReadingSnapshot(initialReadingSnapshot)

export const useReadingStore = create<ReadingStore>((set, get) => ({
  ...initial,
  selectedCollectionId: SYSTEM_CURATED_COLLECTION_ID,
  selectedArticleId: "article-local-agent-loop",
  searchQuery: "",
  articleFilter: "all",
  selectedArticleIds: [],
  viewMode: "split",
  settingsTab: "feeds",
  offline: false,
  selectCollection: (selectedCollectionId) =>
    set((state) => {
      const articles = getCollectionArticles(
        snapshotFromState(state),
        selectedCollectionId,
      )
      return {
        selectedCollectionId,
        selectedArticleId: articles[0]?.id ?? null,
        searchQuery: "",
        articleFilter: "all",
        selectedArticleIds: [],
        viewMode: "split",
      }
    }),
  selectArticle: (selectedArticleId) => set({ selectedArticleId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setArticleFilter: (articleFilter) => set({ articleFilter }),
  toggleArticleSelection: (articleId) =>
    set((state) => ({
      selectedArticleIds: state.selectedArticleIds.includes(articleId)
        ? state.selectedArticleIds.filter((id) => id !== articleId)
        : [...state.selectedArticleIds, articleId],
    })),
  clearArticleSelection: () => set({ selectedArticleIds: [] }),
  setArticleRead: (articleId, read) =>
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === articleId ? { ...article, isRead: read } : article,
      ),
    })),
  toggleArticleFavorite: (articleId) =>
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === articleId
          ? { ...article, isFavorite: !article.isFavorite }
          : article,
      ),
    })),
  setSelectedArticlesRead: (read) =>
    set((state) => {
      const selected = new Set(state.selectedArticleIds)
      return {
        articles: state.articles.map((article) =>
          selected.has(article.id) ? { ...article, isRead: read } : article,
        ),
        selectedArticleIds: [],
      }
    }),
  setSelectedArticlesFavorite: (favorite) =>
    set((state) => {
      const selected = new Set(state.selectedArticleIds)
      return {
        articles: state.articles.map((article) =>
          selected.has(article.id)
            ? { ...article, isFavorite: favorite }
            : article,
        ),
        selectedArticleIds: [],
      }
    }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),
  setOffline: (offline) => set({ offline }),
  setFeedStatus: (feedId, status) =>
    set((state) => ({
      feeds: state.feeds.map((feed) =>
        feed.id === feedId ? { ...feed, status } : feed,
      ),
    })),
  renameFeed: (feedId, title) =>
    set((state) => ({
      feeds: state.feeds.map((feed) =>
        feed.id === feedId ? { ...feed, title: title.trim() || feed.title } : feed,
      ),
      articles: state.articles.map((article) =>
        article.feedId === feedId
          ? {
              ...article,
              sourceSnapshot: {
                ...article.sourceSnapshot,
                title: title.trim() || article.sourceSnapshot.title,
              },
            }
          : article,
      ),
    })),
  assignFeedCollections: (feedId, collectionIds) =>
    set((state) => ({
      feeds: state.feeds.map((feed) =>
        feed.id === feedId
          ? { ...feed, sourceCollectionIds: [...collectionIds] }
          : feed,
      ),
      collections: state.collections.map((collection) =>
        collection.kind !== "source"
          ? collection
          : {
              ...collection,
              sourceIds: collectionIds.includes(collection.id)
                ? Array.from(new Set([...collection.sourceIds, feedId]))
                : collection.sourceIds.filter((id) => id !== feedId),
            },
      ),
      articles: state.articles.map((article) =>
        article.feedId === feedId
          ? { ...article, sourceCollectionIds: [...collectionIds] }
          : article,
      ),
    })),
  addDemoFeed: (candidate) => {
    if (candidate.existingFeedId) return candidate.existingFeedId
    const existingFeed = get().feeds.find(
      (feed) => feed.feedUrl === candidate.feedUrl,
    )
    if (existingFeed) return existingFeed.id
    const id = createId("feed-demo")
    set((state) => ({
      feeds: [
        {
          id,
          title: candidate.title,
          siteUrl: candidate.siteUrl,
          feedUrl: candidate.feedUrl,
          format: candidate.format,
          status: "draft",
          sourceCollectionIds: [],
          lastRefreshAt: null,
          lastArticleAt: null,
          articleCount: 0,
          unreadCount: 0,
        },
        ...state.feeds,
      ],
    }))
    return id
  },
  unsubscribeFeed: (feedId, deleteHistory) =>
    set((state) => {
      const removedArticleIds = new Set(
        deleteHistory
          ? state.articles
              .filter((article) => article.feedId === feedId)
              .map((article) => article.id)
          : [],
      )
      const articles = deleteHistory
        ? state.articles.filter((article) => article.feedId !== feedId)
        : state.articles
      const selectedArticleId =
        state.selectedArticleId && removedArticleIds.has(state.selectedArticleId)
          ? articles[0]?.id ?? null
          : state.selectedArticleId
      return {
        feeds: state.feeds.filter((feed) => feed.id !== feedId),
        collections: state.collections.map((collection) =>
          collection.kind === "source"
            ? {
                ...collection,
                sourceIds: collection.sourceIds.filter((id) => id !== feedId),
              }
            : collection,
        ),
        articles,
        classifications: state.classifications.filter(
          (classification) => !removedArticleIds.has(classification.articleId),
        ),
        feedbackRules: state.feedbackRules.filter(
          (rule) => !removedArticleIds.has(rule.sourceArticleId),
        ),
        selectedArticleId,
        selectedArticleIds: state.selectedArticleIds.filter(
          (id) => !removedArticleIds.has(id),
        ),
      }
    }),
  addCollection: (draft) => {
    const id = createId(draft.kind === "source" ? "collection-source" : "collection-ai")
    set((state) => {
      const sortOrder = Math.max(1, ...state.collections.map((item) => item.sortOrder)) + 1
      const collection = {
        id,
        name: draft.name.trim(),
        kind: draft.kind,
        sourceIds: draft.kind === "source" ? [...draft.sourceIds] : [],
        criteriaText: draft.kind === "ai" ? draft.criteriaText.trim() : undefined,
        backfillScope: draft.kind === "ai" ? draft.backfillScope : undefined,
        modelOverrideRef:
          draft.kind === "ai" ? draft.modelOverrideRef : undefined,
        sortOrder,
        immutable: false,
      } as const
      return {
        collections: [...state.collections, collection],
        feeds: state.feeds.map((feed) =>
          draft.kind === "source" && draft.sourceIds.includes(feed.id)
            ? {
                ...feed,
                sourceCollectionIds: Array.from(
                  new Set([...feed.sourceCollectionIds, id]),
                ),
              }
            : feed,
        ),
        articles: state.articles.map((article) =>
          draft.kind === "source" && draft.sourceIds.includes(article.feedId)
            ? {
                ...article,
                sourceCollectionIds: Array.from(
                  new Set([...article.sourceCollectionIds, id]),
                ),
              }
            : article,
        ),
      }
    })
    return id
  },
  updateCollectionDefinition: (collectionId, draft) =>
    set((state) => {
      const current = state.collections.find(
        (collection) => collection.id === collectionId,
      )
      if (!current || current.immutable || current.kind !== draft.kind) return state
      const sourceIds = draft.kind === "source" ? [...draft.sourceIds] : []
      return {
        collections: state.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                name: draft.name.trim() || collection.name,
                sourceIds,
                criteriaText:
                  draft.kind === "ai" ? draft.criteriaText.trim() : undefined,
                backfillScope:
                  draft.kind === "ai" ? draft.backfillScope : undefined,
                modelOverrideRef:
                  draft.kind === "ai" ? draft.modelOverrideRef : undefined,
              }
            : collection,
        ),
        feeds: state.feeds.map((feed) => ({
          ...feed,
          sourceCollectionIds:
            draft.kind === "source" && sourceIds.includes(feed.id)
              ? Array.from(new Set([...feed.sourceCollectionIds, collectionId]))
              : feed.sourceCollectionIds.filter((id) => id !== collectionId),
        })),
        articles: state.articles.map((article) => ({
          ...article,
          sourceCollectionIds:
            draft.kind === "source" && sourceIds.includes(article.feedId)
              ? Array.from(
                  new Set([...article.sourceCollectionIds, collectionId]),
                )
              : article.sourceCollectionIds.filter((id) => id !== collectionId),
        })),
      }
    }),
  renameCollection: (collectionId, name) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === collectionId && !collection.immutable
          ? { ...collection, name: name.trim() || collection.name }
          : collection,
      ),
    })),
  deleteCollection: (collectionId) =>
    set((state) => {
      const collection = state.collections.find((item) => item.id === collectionId)
      if (!collection || collection.immutable) return state
      return {
        collections: state.collections.filter((item) => item.id !== collectionId),
        feeds: state.feeds.map((feed) => ({
          ...feed,
          sourceCollectionIds: feed.sourceCollectionIds.filter(
            (id) => id !== collectionId,
          ),
        })),
        articles: state.articles.map((article) => ({
          ...article,
          sourceCollectionIds: article.sourceCollectionIds.filter(
            (id) => id !== collectionId,
          ),
        })),
        classifications: state.classifications.filter(
          (classification) => classification.collectionId !== collectionId,
        ),
        feedbackRules: state.feedbackRules.filter(
          (rule) => rule.collectionId !== collectionId,
        ),
        selectedCollectionId:
          state.selectedCollectionId === collectionId
            ? SYSTEM_ALL_COLLECTION_ID
            : state.selectedCollectionId,
        selectedArticleIds: [],
        viewMode: "split",
      }
    }),
  moveCollection: (collectionId, direction) =>
    set((state) => {
      const custom = state.collections
        .filter((collection) => !collection.immutable)
        .sort((left, right) => left.sortOrder - right.sortOrder)
      const index = custom.findIndex((collection) => collection.id === collectionId)
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (index < 0 || targetIndex < 0 || targetIndex >= custom.length) return state
      const current = custom[index]
      const target = custom[targetIndex]
      return {
        collections: state.collections.map((collection) =>
          collection.id === current.id
            ? { ...collection, sortOrder: target.sortOrder }
            : collection.id === target.id
              ? { ...collection, sortOrder: current.sortOrder }
              : collection,
        ),
      }
    }),
  setDefaultOpenMode: (defaultOpenMode) =>
    set((state) => ({
      preferences: { ...state.preferences, defaultOpenMode },
    })),
  setReadPolicy: (readPolicy) =>
    set((state) => ({ preferences: { ...state.preferences, readPolicy } })),
  setShowUnreadCount: (showUnreadCount) =>
    set((state) => ({
      preferences: { ...state.preferences, showUnreadCount },
    })),
  setGlobalModelRef: (globalModelRef) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        globalModelRef,
        remoteDisclosureConsent:
          globalModelRef === "model-balanced"
            ? null
            : state.preferences.remoteDisclosureConsent,
      },
    })),
  setCuratedCriteria: (curatedCriteria) =>
    set((state) => ({
      preferences: { ...state.preferences, curatedCriteria },
    })),
  grantRemoteDisclosure: (modelRef) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        remoteDisclosureConsent: {
          provider: "OpenAI-工作",
          modelRef: modelRef ?? state.preferences.globalModelRef,
          disclosureVersion: "reading-remote-v1",
          acceptedAt: new Date().toISOString(),
        },
      },
    })),
  revokeRemoteDisclosure: () =>
    set((state) => ({
      preferences: { ...state.preferences, remoteDisclosureConsent: null },
    })),
  addFeedbackRule: (collectionId, articleId, direction, note) => {
    const id = createId("feedback")
    const article = get().articles.find((item) => item.id === articleId)
    const summary =
      direction === "more"
        ? `更多与“${article?.title ?? "这篇文章"}”具有相似可观察特征的内容`
        : `减少与“${article?.title ?? "这篇文章"}”具有相似可观察特征的内容`
    set((state) => ({
      feedbackRules: [
        {
          id,
          collectionId,
          direction,
          sourceArticleId: articleId,
          summary,
          note: note.trim() || undefined,
          createdAt: new Date().toISOString(),
          revokedAt: null,
        },
        ...state.feedbackRules,
      ],
    }))
    return id
  },
  revokeFeedbackRule: (ruleId) =>
    set((state) => ({
      feedbackRules: state.feedbackRules.map((rule) =>
        rule.id === ruleId && !rule.revokedAt
          ? { ...rule, revokedAt: new Date().toISOString() }
          : rule,
      ),
    })),
  resetReadingDemo: () => {
    const next = cloneReadingSnapshot(initialReadingSnapshot)
    set({
      ...next,
      selectedCollectionId: SYSTEM_CURATED_COLLECTION_ID,
      selectedArticleId: "article-local-agent-loop",
      searchQuery: "",
      articleFilter: "all",
      selectedArticleIds: [],
      viewMode: "split",
      settingsTab: "feeds",
      offline: false,
    })
  },
}))

export function selectReadingSnapshot(state: ReadingStore): ReadingSnapshot {
  return snapshotFromState(state)
}

export function isRemoteReadingModel(preference: ReadingPreference) {
  return preference.globalModelRef !== "model-balanced"
}
