import type { MockComposerAttachment } from "@/data/mock-composer"

export type ConversationRunState =
  | "idle"
  | "waiting"
  | "thinking"
  | "awaiting-approval"
  | "streaming"
  | "completed"
  | "failed"
  | "cancelled"

export type MessageRole = "user" | "assistant"

export type MockConversationMessage = {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  attachments?: MockComposerAttachment[]
  lastDeltaSequence?: number
}

export type MockToolCallState =
  | "pending"
  | "running"
  | "succeeded"
  | "rejected"

export type MockToolCall = {
  id: string
  name: string
  target: string
  summary: string
  risk: string
  impact: string
  state: MockToolCallState
  decision?: "once" | "session" | "reject"
}

export const mockAssistantCopy: Record<
  Exclude<ConversationRunState, "idle">,
  string
> = {
  waiting: "任务已进入本地 Mock 队列，正在准备会话上下文。",
  thinking: "我正在梳理界面目标、项目约束与可验证的实现步骤。",
  "awaiting-approval":
    "实现路径已经整理完成。下一步需要模拟读取当前项目目录结构，请确认是否允许。",
  streaming:
    "正在生成本地 Mock 结果。这个过程不会读取真实文件或调用模型。",
  completed:
    "Mock 流程已完成：消息状态和结果展示均只存在于前端内存中。",
  failed:
    "Mock 流程遇到可恢复错误。草稿和已生成内容均已保留，可以重试。",
  cancelled: "已停止本次 Mock 运行，已生成内容会继续保留。",
}

export const mockStreamingMarkdown = `## Mock 流式结果

已按设计文档整理聊天渲染链路：**Markdown、公式、代码和 Mermaid** 都只在前端渲染，不会调用真实模型或写入文件。

- GFM 任务列表：
  - [x] 保留原始 Markdown 源文本
  - [x] 运行状态进入消息流
  - [ ] 等待后续接入真实事件
- 数学公式：$E = mc^2$

块级公式：

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$

\`\`\`tsx
type StreamEvent = { sequence: number; text: string }

export function appendDelta(source: string, event: StreamEvent) {
  return source + event.text
}
\`\`\`

\`\`\`mermaid
flowchart LR
  A[消息 delta] --> B[UI 适配器]
  B --> C[Markdown 渲染]
  C --> D[MessageScroller]
\`\`\`

流式过程中，已经闭合的内容块保持稳定；用户上滑时不会被强制拉回底部。`

export const mockProjectReadTool: MockToolCall = {
  id: "tool-read-project",
  name: "读取项目结构",
  target: "Aestival 当前工作区",
  summary: "列出顶层目录并读取项目约束，用于生成下一步 UI 实现建议。",
  risk: "只读操作；Mock 阶段不会访问真实文件。",
  impact: "未来接入后仅访问当前工作区，不写入文件、不执行命令。",
  state: "pending",
}

export function createMockConversationTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim()
  return compact.length > 18 ? `${compact.slice(0, 18)}…` : compact
}

export function createMockMessage(
  role: MessageRole,
  content: string,
  attachments?: MockComposerAttachment[]
): MockConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    attachments,
    lastDeltaSequence: 0,
    createdAt: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
  }
}
