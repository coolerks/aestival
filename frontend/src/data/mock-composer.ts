import {
  BlocksIcon,
  BotIcon,
  ChartNoAxesCombinedIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderIcon,
  GitForkIcon,
  ImageIcon,
  ListTodoIcon,
  SearchCodeIcon,
  ShrinkIcon,
  SparklesIcon,
  TargetIcon,
  type LucideIcon,
} from "lucide-react"

export type ComposerMode = "standard" | "plan" | "goal"
export type ApprovalPolicy = "request" | "auto" | "bypass"
export type MockAttachmentKind = "file" | "folder" | "image"

export type MockComposerAttachment = {
  id: string
  kind: MockAttachmentKind
  name: string
  description: string
  state: "processing" | "done"
}

export type MockAgentOption = {
  id: string
  name: string
  description: string
  tools: string
  icon: LucideIcon
  agentOnly?: boolean
}

export type MockModelOption = {
  id: string
  name: string
  provider: string
  description: string
  context: string
  icon: LucideIcon
}

export type SlashCommandOption = {
  id: "compact" | "plan" | "goal" | "fork" | "stats" | "skill"
  command: string
  label: string
  keywords: string
  icon: LucideIcon
  agentOnly?: boolean
}

export const mockAgents: MockAgentOption[] = [
  {
    id: "general",
    name: "通用智能体",
    description: "适合代码、文档和多步骤任务",
    tools: "按审批策略使用工作区工具",
    icon: BotIcon,
  },
  {
    id: "reviewer",
    name: "代码审查",
    description: "聚焦风险、规范和可维护性",
    tools: "只读代码与诊断工具",
    icon: SearchCodeIcon,
  },
  {
    id: "builder",
    name: "界面构建",
    description: "根据设计方案组合前端界面",
    tools: "组件检索与工作区工具",
    icon: SparklesIcon,
    agentOnly: true,
  },
]

export const mockModels: MockModelOption[] = [
  {
    id: "local-mock",
    name: "本地 Mock",
    provider: "Aestival",
    description: "仅演示 UI 状态，不调用模型",
    context: "128K",
    icon: BotIcon,
  },
  {
    id: "mock-balanced",
    name: "Mock Balanced",
    provider: "示例供应商",
    description: "平衡速度与推理的占位配置",
    context: "200K",
    icon: SparklesIcon,
  },
  {
    id: "mock-code",
    name: "Mock Code",
    provider: "示例供应商",
    description: "面向代码任务的占位配置",
    context: "128K",
    icon: FileCode2Icon,
  },
]

export const slashCommands: SlashCommandOption[] = [
  {
    id: "compact",
    command: "/compact",
    label: "压缩上下文",
    keywords: "compact 压缩 上下文",
    icon: ShrinkIcon,
  },
  {
    id: "plan",
    command: "/plan",
    label: "切换计划模式",
    keywords: "plan 计划 模式",
    icon: ListTodoIcon,
    agentOnly: true,
  },
  {
    id: "goal",
    command: "/goal",
    label: "切换目标模式",
    keywords: "goal 目标 模式",
    icon: TargetIcon,
    agentOnly: true,
  },
  {
    id: "fork",
    command: "/fork",
    label: "从当前消息分叉",
    keywords: "fork 分叉 会话",
    icon: GitForkIcon,
  },
  {
    id: "stats",
    command: "/stats",
    label: "查看会话统计",
    keywords: "stats 统计 token 费用",
    icon: ChartNoAxesCombinedIcon,
  },
  {
    id: "skill",
    command: "/skill",
    label: "选择 Skill",
    keywords: "skill 能力 技能",
    icon: BlocksIcon,
    agentOnly: true,
  },
]

const attachmentSamples: Record<
  MockAttachmentKind,
  Omit<MockComposerAttachment, "id" | "kind">
> = {
  file: {
    name: "AGENTS.md",
    description: "Markdown · 仅引用",
    state: "done",
  },
  folder: {
    name: "frontend/src",
    description: "文件夹 · Mock 范围",
    state: "done",
  },
  image: {
    name: "interface-reference.png",
    description: "PNG · 处理中",
    state: "processing",
  },
}

export function createMockAttachment(
  kind: MockAttachmentKind
): MockComposerAttachment {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    ...attachmentSamples[kind],
  }
}

export const attachmentKindIcons: Record<MockAttachmentKind, LucideIcon> = {
  file: FileTextIcon,
  folder: FolderIcon,
  image: ImageIcon,
}
