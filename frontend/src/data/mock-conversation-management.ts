import type { MockConversationMessage } from "@/data/mock-conversation"

export type MockAssistantVersion = {
  id: string
  label: string
  content: string
  createdAt: string
  estimatedExtraCost: string
}

export type MockVersionSet = {
  messageId: string
  selectedId: string
  versions: MockAssistantVersion[]
}

export type MockForkRelation = {
  branchPointId: string
  originTitle: string
  branchTitle: string
  originMessages: MockConversationMessage[]
  branchMessages: MockConversationMessage[]
  active: "origin" | "branch"
}

export type MockExportFormat = "markdown" | "html" | "pdf" | "word"
export type MockExportScope = "conversation" | "branch" | "selection"
export type MockExportMedia = "embed" | "copy" | "links"

export const mockExportFormats: Array<{
  id: MockExportFormat
  label: string
  extension: string
}> = [
  { id: "markdown", label: "Markdown", extension: ".md" },
  { id: "html", label: "HTML", extension: ".html" },
  { id: "pdf", label: "PDF", extension: ".pdf" },
  { id: "word", label: "Word", extension: ".docx" },
]

export const mockForkProjects = [
  { id: "task", label: "任务" },
  { id: "ui-review", label: "UI 评审" },
  { id: "temporary", label: "临时项目" },
]

function nowLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())
}

export function createMockVersionSet(
  message: MockConversationMessage
): MockVersionSet {
  const first: MockAssistantVersion = {
    id: `${message.id}-v1`,
    label: "版本 1",
    content: message.content,
    createdAt: message.createdAt,
    estimatedExtraCost: "原始回复",
  }
  const second: MockAssistantVersion = {
    id: `${message.id}-v2`,
    label: "版本 2",
    content:
      "这是重新生成的本地 Mock 版本。旧版本仍然保留，可通过版本页签来回切换；当前没有调用模型，也没有产生真实费用。",
    createdAt: nowLabel(),
    estimatedExtraCost: "预计增加 ¥0.06",
  }

  return {
    messageId: message.id,
    selectedId: second.id,
    versions: [first, second],
  }
}

export function appendMockVersion(
  versionSet: MockVersionSet
): MockVersionSet {
  const number = versionSet.versions.length + 1
  const version: MockAssistantVersion = {
    id: `${versionSet.messageId}-v${number}`,
    label: `版本 ${number}`,
    content: `这是第 ${number} 个本地 Mock 版本。它用于验证重新生成不会覆盖旧回答，并继续保留版本切换和预计费用提示。`,
    createdAt: nowLabel(),
    estimatedExtraCost: "预计增加 ¥0.06",
  }

  return {
    ...versionSet,
    selectedId: version.id,
    versions: [...versionSet.versions, version],
  }
}
