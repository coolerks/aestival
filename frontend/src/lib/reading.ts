import {
  SYSTEM_ALL_COLLECTION_ID,
  SYSTEM_CURATED_COLLECTION_ID,
} from "@/data/mock-reading"
import type {
  ArticleClassification,
  ReadingArticle,
  ReadingArticleFilter,
  ReadingCollection,
  ReadingSnapshot,
} from "@/types/reading"

function articleTimestamp(article: ReadingArticle) {
  const preferred = article.publishedAt ?? article.receivedAt
  const value = Date.parse(preferred)
  return Number.isFinite(value) ? value : Date.parse(article.receivedAt) || 0
}

export function sortReadingArticles(articles: ReadingArticle[]) {
  return [...articles].sort((left, right) => {
    const timeDifference = articleTimestamp(right) - articleTimestamp(left)
    if (timeDifference !== 0) return timeDifference
    const receivedDifference = Date.parse(right.receivedAt) - Date.parse(left.receivedAt)
    if (receivedDifference !== 0) return receivedDifference
    return left.id.localeCompare(right.id)
  })
}

export function getArticleClassification(
  classifications: ArticleClassification[],
  articleId: string,
  collectionId: string,
) {
  return classifications.find(
    (classification) =>
      classification.articleId === articleId &&
      classification.collectionId === collectionId,
  )
}

export function getCollectionArticles(
  snapshot: Pick<ReadingSnapshot, "articles" | "collections" | "classifications">,
  collectionId: string,
) {
  const collection = snapshot.collections.find((item) => item.id === collectionId)
  if (!collection || collection.id === SYSTEM_ALL_COLLECTION_ID) {
    return sortReadingArticles(snapshot.articles)
  }

  if (collection.kind === "source") {
    return sortReadingArticles(
      snapshot.articles.filter(
        (article) =>
          collection.sourceIds.includes(article.feedId) ||
          article.sourceCollectionIds.includes(collection.id),
      ),
    )
  }

  if (
    collection.id === SYSTEM_CURATED_COLLECTION_ID ||
    collection.kind === "ai"
  ) {
    const matchedIds = new Set(
      snapshot.classifications
        .filter(
          (classification) =>
            classification.collectionId === collection.id &&
            classification.state === "matched",
        )
        .map((classification) => classification.articleId),
    )
    return sortReadingArticles(
      snapshot.articles.filter((article) => matchedIds.has(article.id)),
    )
  }

  return sortReadingArticles(snapshot.articles)
}

export function filterReadingArticles(
  articles: ReadingArticle[],
  filter: ReadingArticleFilter,
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN")
  return articles.filter((article) => {
    if (filter === "unread" && article.isRead) return false
    if (filter === "favorite" && !article.isFavorite) return false
    if (!normalizedQuery) return true
    const searchable = [
      article.title,
      article.author ?? "",
      article.sourceSnapshot.title,
      article.summary,
      ...article.content.flatMap((block) =>
        block.type === "list" ? block.items : [block.text],
      ),
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
    return searchable.includes(normalizedQuery)
  })
}

export function collectionUnreadCount(
  snapshot: Pick<ReadingSnapshot, "articles" | "collections" | "classifications">,
  collectionId: string,
) {
  return getCollectionArticles(snapshot, collectionId).filter(
    (article) => !article.isRead,
  ).length
}

export function collectionArticleCount(
  snapshot: Pick<ReadingSnapshot, "articles" | "collections" | "classifications">,
  collectionId: string,
) {
  return getCollectionArticles(snapshot, collectionId).length
}

export function orderedReadingCollections(collections: ReadingCollection[]) {
  return [...collections].sort((left, right) => {
    if (left.kind === "system_curated") return -1
    if (right.kind === "system_curated") return 1
    if (left.kind === "system_all") return -1
    if (right.kind === "system_all") return 1
    return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "zh-CN")
  })
}

export function isAiCollection(collection?: ReadingCollection | null) {
  return collection?.kind === "system_curated" || collection?.kind === "ai"
}

export function validHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
