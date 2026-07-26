export type ComparisonLayout = "tabs" | "side-by-side"

export type MockModelResponse = {
  id: string
  model: string
  provider: string
  latency: string
  inputTokens: number
  outputTokens: number
  estimatedCost: string
  content: string
}

export type MockCompressionEvent = {
  id: string
  beforeTokens: number
  afterTokens: number
  range: string
  summary: string
  updatedAt: string
}

export const mockModelResponses: MockModelResponse[] = [
  {
    id: "mock-balanced",
    model: "Mock Balanced",
    provider: "示例供应商",
    latency: "2.4 秒",
    inputTokens: 3820,
    outputTokens: 684,
    estimatedCost: "¥0.08",
    content:
      "建议先保持现有会话结构不变，把多模型回答作为同一轮次的并列结果。默认用 Tabs 节省宽度，宽屏时再切到双列比较；用户消息只渲染一次。",
  },
  {
    id: "mock-code",
    model: "Mock Code",
    provider: "示例供应商",
    latency: "3.1 秒",
    inputTokens: 3916,
    outputTokens: 742,
    estimatedCost: "¥0.11",
    content:
      "实现上可把模型结果与会话消息分离：消息流保存轮次，结果区只消费当前轮次的候选回复。这样未来接入真实流式输出时，各模型状态和 Token 统计不会互相覆盖。",
  },
]

export const mockConversationStats = {
  overview: [
    ["智能体", "通用智能体"],
    ["模型", "本地 Mock + 2 个比较模型"],
    ["消息", "8 条"],
    ["运行时长", "3 分 42 秒"],
    ["工具调用", "2 次"],
  ],
  tokens: [
    ["输入", "12,480", "估算"],
    ["输出", "2,116", "估算"],
    ["缓存读取", "4,320", "Mock"],
    ["缓存写入", "1,024", "Mock"],
    ["压缩节省", "6,280", "估算"],
  ],
  costs: [
    ["Mock Balanced", "¥0.18", "估算"],
    ["Mock Code", "¥0.24", "估算"],
    ["本地 Mock", "¥0.00", "不计费"],
  ],
  billingSegments: [
    ["0–32K", "9,600", "¥0.018 / 1K", "¥0.17"],
    ["32K–128K", "2,880", "¥0.026 / 1K", "¥0.07"],
    ["缓存读取", "4,320", "¥0.004 / 1K", "¥0.02"],
  ],
  tools: [
    ["读取项目结构", "1", "成功", "0.8 秒"],
    ["检查组件约束", "1", "成功", "1.2 秒"],
  ],
}

export function createMockCompressionEvent(
  previous?: MockCompressionEvent | null
): MockCompressionEvent {
  const recompressed = Boolean(previous)
  return {
    id: `compression-${Date.now()}`,
    beforeTokens: recompressed ? 15120 : 18420,
    afterTokens: recompressed ? 7320 : 8940,
    range: recompressed ? "第 1–7 条消息" : "第 1–6 条消息",
    summary: recompressed
      ? "重新归纳了 UI 约束、已完成的窗口修复和当前 Mock 交互边界，并保留最新一轮多模型结果。"
      : "保留项目约束、已确认的窗口行为和当前实现结论；省略重复的视觉微调过程与中间状态。",
    updatedAt: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
  }
}
