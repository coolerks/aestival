import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"

import {
  SYSTEM_ALL_COLLECTION_ID,
  SYSTEM_CURATED_COLLECTION_ID,
} from "../src/data/mock-reading.ts"
import {
  getCollectionArticles,
  orderedReadingCollections,
} from "../src/lib/reading.ts"
import {
  selectReadingSnapshot,
  useReadingStore,
} from "../src/store/reading-store.ts"

beforeEach(() => {
  useReadingStore.getState().resetReadingDemo()
})

test("系统合集固定为精选和全部，并始终排在自定义合集之前", () => {
  const ordered = orderedReadingCollections(useReadingStore.getState().collections)
  assert.deepEqual(
    ordered.slice(0, 2).map((collection) => [collection.id, collection.immutable]),
    [
      [SYSTEM_CURATED_COLLECTION_ID, true],
      [SYSTEM_ALL_COLLECTION_ID, true],
    ],
  )
  assert.equal(ordered.filter((collection) => collection.immutable).length, 2)
})

test("全部和 AI 合集都按时间倒序，AI 只筛选不重排", () => {
  const snapshot = selectReadingSnapshot(useReadingStore.getState())
  const all = getCollectionArticles(snapshot, SYSTEM_ALL_COLLECTION_ID)
  const curated = getCollectionArticles(snapshot, SYSTEM_CURATED_COLLECTION_ID)
  const timestamps = curated.map((article) =>
    Date.parse(article.publishedAt ?? article.receivedAt),
  )
  assert.equal(all.length, snapshot.articles.length)
  assert.deepEqual(timestamps, [...timestamps].sort((left, right) => right - left))
  assert.ok(curated.every((article) =>
    snapshot.classifications.some(
      (classification) =>
        classification.articleId === article.id &&
        classification.collectionId === SYSTEM_CURATED_COLLECTION_ID &&
        classification.state === "matched",
    ),
  ))
})

test("相似报道逐篇保留，来源与文章允许进入多个合集", () => {
  const snapshot = selectReadingSnapshot(useReadingStore.getState())
  const all = getCollectionArticles(snapshot, SYSTEM_ALL_COLLECTION_ID)
  assert.ok(all.some((article) => article.id === "article-react-stream-a"))
  assert.ok(all.some((article) => article.id === "article-react-stream-b"))

  const article = snapshot.articles.find((item) => item.id === "article-local-agent-loop")
  assert.deepEqual(article?.sourceCollectionIds.sort(), ["collection-engineering", "collection-research"])
  assert.ok(getCollectionArticles(snapshot, "collection-local-ai").some((item) => item.id === article?.id))
  assert.ok(getCollectionArticles(snapshot, "collection-deep-reads").some((item) => item.id === article?.id))
})

test("显式反馈只作用当前合集并可撤销", () => {
  const store = useReadingStore.getState()
  const id = store.addFeedbackRule(
    "collection-local-ai",
    "article-local-agent-loop",
    "more",
    "需要复现步骤",
  )
  const created = useReadingStore.getState().feedbackRules.find((rule) => rule.id === id)
  assert.equal(created?.collectionId, "collection-local-ai")
  assert.equal(created?.direction, "more")
  assert.equal(created?.revokedAt, null)

  useReadingStore.getState().revokeFeedbackRule(id)
  assert.ok(useReadingStore.getState().feedbackRules.find((rule) => rule.id === id)?.revokedAt)
})

test("取消订阅默认保留历史，也可显式删除历史", () => {
  const retainedId = "feed-local-first"
  const retainedArticleId = "article-offline-sync"
  useReadingStore.getState().unsubscribeFeed(retainedId, false)
  assert.equal(useReadingStore.getState().feeds.some((feed) => feed.id === retainedId), false)
  assert.equal(useReadingStore.getState().articles.some((article) => article.id === retainedArticleId), true)

  useReadingStore.getState().resetReadingDemo()
  useReadingStore.getState().unsubscribeFeed(retainedId, true)
  assert.equal(useReadingStore.getState().articles.some((article) => article.id === retainedArticleId), false)
  assert.equal(useReadingStore.getState().classifications.some((item) => item.articleId === retainedArticleId), false)
})

test("来源合集与 AI 合集定义保持不可互换", () => {
  const store = useReadingStore.getState()
  const sourceId = store.addCollection({
    name: "测试来源合集",
    kind: "source",
    sourceIds: ["feed-open-models"],
    criteriaText: "",
    backfillScope: "30d",
  })
  const aiId = useReadingStore.getState().addCollection({
    name: "测试 AI 合集",
    kind: "ai",
    sourceIds: [],
    criteriaText: "包含原始数据",
    backfillScope: "30d",
  })
  const state = useReadingStore.getState()
  assert.equal(state.collections.find((item) => item.id === sourceId)?.kind, "source")
  assert.equal(state.collections.find((item) => item.id === aiId)?.kind, "ai")
  assert.deepEqual(state.collections.find((item) => item.id === aiId)?.sourceIds, [])
})

test("订阅候选按 Feed URL 合并，并可映射到多个来源合集", () => {
  const candidate = {
    id: "candidate-opml",
    title: "OPML 测试源",
    siteUrl: "https://example.com/opml-test",
    feedUrl: "https://example.com/opml-test/feed.xml",
    format: "rss",
    description: "测试候选",
    recentArticleTitles: [],
  }
  const before = useReadingStore.getState().feeds.length
  const firstId = useReadingStore.getState().addDemoFeed(candidate)
  const secondId = useReadingStore.getState().addDemoFeed(candidate)
  assert.equal(firstId, secondId)
  assert.equal(useReadingStore.getState().feeds.length, before + 1)

  useReadingStore.getState().assignFeedCollections(firstId, [
    "collection-engineering",
    "collection-research",
  ])
  assert.deepEqual(
    useReadingStore.getState().feeds.find((feed) => feed.id === firstId)
      ?.sourceCollectionIds,
    ["collection-engineering", "collection-research"],
  )
})
