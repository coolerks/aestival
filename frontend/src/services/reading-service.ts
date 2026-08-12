import { Browser } from "@wailsio/runtime"

import {
  mockOpmlPreviewItems,
} from "@/data/mock-reading"
import { validHttpUrl } from "@/lib/reading"
import type {
  FeedCandidatePreview,
  OpmlPreviewItem,
} from "@/types/reading"

type WailsRuntimeWindow = Window & {
  _wails?: {
    environment?: unknown
  }
}

export type ExternalOpenResult =
  | { opened: true }
  | { opened: false; reason: "invalid-url" | "desktop-runtime-unavailable" | "runtime-error" }

export type ReadingUiAdapter = {
  previewFeedAddress: (address: string) => Promise<FeedCandidatePreview[]>
  previewExampleOpml: () => Promise<OpmlPreviewItem[]>
  openExternalArticle: (url: string) => Promise<ExternalOpenResult>
}

function waitForMockPreview(delay = 420) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, delay))
}

function normalizedSiteUrl(address: string) {
  const url = new URL(address)
  return `${url.protocol}//${url.host}`
}

function demoCandidates(address: string): FeedCandidatePreview[] {
  const siteUrl = normalizedSiteUrl(address)
  const lower = address.toLowerCase()
  const likelyJson = lower.endsWith(".json") || lower.includes("json")
  const likelyFeed = /(?:feed|rss|atom|xml|json)/.test(lower)
  const directFormat = likelyJson ? "json-feed" : lower.includes("atom") ? "atom" : "rss"

  if (address.includes("practical-ai")) {
    return [
      {
        id: "candidate-existing",
        title: "Practical AI Notes",
        siteUrl: "https://example.com/practical-ai",
        feedUrl: "https://example.com/practical-ai/feed.xml",
        format: "rss",
        description: "示例重复候选：将使用已有订阅，不创建第二份 Feed。",
        recentArticleTitles: ["把本地 Agent 的评估环路拆成可复现的五步"],
        existingFeedId: "feed-practical-ai",
      },
    ]
  }

  if (likelyFeed) {
    return [
      {
        id: "candidate-direct",
        title: "界面演示订阅源",
        siteUrl,
        feedUrl: address,
        format: directFormat,
        description: "按输入地址生成的示例候选；未请求或验证远程内容。",
        recentArticleTitles: ["示例文章标题一", "示例文章标题二"],
      },
    ]
  }

  return [
    {
      id: "candidate-rss",
      title: "界面演示 · 文章",
      siteUrl,
      feedUrl: `${siteUrl}/feed.xml`,
      format: "rss",
      description: "网站地址的 RSS 示例候选；未执行真实自动发现。",
      recentArticleTitles: ["示例 RSS 文章", "另一个示例条目"],
    },
    {
      id: "candidate-json",
      title: "界面演示 · 更新",
      siteUrl,
      feedUrl: `${siteUrl}/feed.json`,
      format: "json-feed",
      description: "网站地址的 JSON Feed 示例候选；需由用户明确选择。",
      recentArticleTitles: ["示例 JSON Feed 条目"],
    },
  ]
}

export const readingUiAdapter: ReadingUiAdapter = {
  async previewFeedAddress(address) {
    if (!validHttpUrl(address)) {
      throw new Error("请输入有效的 http/https 网站或 Feed 地址")
    }
    await waitForMockPreview()
    return demoCandidates(address)
  },
  async previewExampleOpml() {
    await waitForMockPreview(300)
    return mockOpmlPreviewItems.map((item) => ({ ...item }))
  },
  async openExternalArticle(url) {
    if (!validHttpUrl(url)) return { opened: false, reason: "invalid-url" }
    const hasDesktopRuntime = Boolean(
      (window as WailsRuntimeWindow)._wails?.environment,
    )
    if (!hasDesktopRuntime) {
      return { opened: false, reason: "desktop-runtime-unavailable" }
    }
    try {
      await Browser.OpenURL(url)
      return { opened: true }
    } catch {
      return { opened: false, reason: "runtime-error" }
    }
  },
}
