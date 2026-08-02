export type CapabilityTab = "mcp" | "skills" | "agents" | "prompts" | "hooks"
export type CapabilityStatus = "running" | "enabled" | "disabled" | "error" | "update"

export type CapabilityRecord = {
  id: string
  tab: CapabilityTab
  name: string
  description: string
  source: string
  type: string
  status: CapabilityStatus
  enabled: boolean
  updatedAt: string
  meta: string[]
  permissions: string[]
}

export const capabilityTabs: Array<{
  id: CapabilityTab
  label: string
  description: string
  action: string
}> = [
  { id: "mcp", label: "MCP", description: "管理本地与远程 MCP 服务、工具和连接状态。", action: "安装 MCP" },
  { id: "skills", label: "Skill", description: "管理技能说明、资源、脚本、触发器与权限。", action: "创建 Skill" },
  { id: "agents", label: "智能体", description: "组合模型、工具、Skill、指令和 Hooks。", action: "创建智能体" },
  { id: "prompts", label: "指令", description: "维护可复用指令、变量、作用域与引用关系。", action: "创建指令" },
  { id: "hooks", label: "Hooks", description: "按生命周期配置条件、动作、失败策略与顺序。", action: "创建 Hook" },
]

export const initialCapabilities: CapabilityRecord[] = [
  {
    id: "mcp-filesystem", tab: "mcp", name: "Filesystem", description: "受审批约束的本地文件读取与目录浏览。",
    source: "手动配置", type: "stdio", status: "running", enabled: true, updatedAt: "12 分钟前",
    meta: ["7 个工具", "最近调用 18 次"], permissions: ["读取工作区", "列出目录"],
  },
  {
    id: "mcp-browser", tab: "mcp", name: "Browser Tools", description: "通过 HTTP 连接浏览器控制服务。",
    source: "本地缓存市场", type: "HTTP", status: "error", enabled: false, updatedAt: "昨天",
    meta: ["4 个工具", "握手失败"], permissions: ["访问网络", "控制浏览器"],
  },
  {
    id: "mcp-github", tab: "mcp", name: "GitHub", description: "仓库、议题和拉取请求协作能力。",
    source: "导入配置", type: "stdio", status: "update", enabled: true, updatedAt: "3 天前",
    meta: ["12 个工具", "可更新"], permissions: ["访问网络", "读取仓库元数据"],
  },
  {
    id: "skill-review", tab: "skills", name: "代码审查", description: "检查变更风险、可维护性与测试覆盖。",
    source: "Aestival 内置", type: "Native", status: "enabled", enabled: true, updatedAt: "今天",
    meta: ["2 个智能体", "v1.4.0"], permissions: ["读取代码", "读取 Git 差异"],
  },
  {
    id: "skill-docs", tab: "skills", name: "文档维护", description: "按项目约束编写和校验结构化文档。",
    source: "本地自定义", type: "Codex", status: "enabled", enabled: true, updatedAt: "昨天",
    meta: ["1 个智能体", "v0.8.2"], permissions: ["读取文档", "建议文件修改"],
  },
  {
    id: "skill-research", tab: "skills", name: "联网研究", description: "检索并归纳外部资料，网络访问需审批。",
    source: "本地缓存市场", type: "Claude", status: "disabled", enabled: false, updatedAt: "5 天前",
    meta: ["0 个智能体", "v1.1.0"], permissions: ["访问网络"],
  },
  {
    id: "agent-general", tab: "agents", name: "通用智能体", description: "面向日常开发、文档与项目协作的默认智能体。",
    source: "本地", type: "通用", status: "enabled", enabled: true, updatedAt: "36 分钟前",
    meta: ["5 个工具", "3 个 Skill"], permissions: ["按工具单独审批"],
  },
  {
    id: "agent-reviewer", tab: "agents", name: "审查智能体", description: "只读检查变更，不直接修改工作区。",
    source: "本地", type: "只读", status: "enabled", enabled: true, updatedAt: "昨天",
    meta: ["2 个工具", "1 个 Skill"], permissions: ["只读工作区"],
  },
  {
    id: "agent-release", tab: "agents", name: "发布助手", description: "生成发布摘要与检查清单，暂未启用。",
    source: "本地", type: "工作流", status: "disabled", enabled: false, updatedAt: "6 天前",
    meta: ["3 个工具", "2 个 Hook"], permissions: ["读取版本信息"],
  },
  {
    id: "prompt-review", tab: "prompts", name: "严格代码审查", description: "从正确性、安全性和维护成本审查 {{scope}}。",
    source: "全局", type: "代码", status: "enabled", enabled: true, updatedAt: "今天",
    meta: ["变量 2", "引用 2"], permissions: [],
  },
  {
    id: "prompt-summary", tab: "prompts", name: "会话摘要", description: "将当前会话整理为目标、决定、风险和下一步。",
    source: "工作区", type: "协作", status: "enabled", enabled: true, updatedAt: "昨天",
    meta: ["变量 1", "引用 1"], permissions: [],
  },
  {
    id: "prompt-release", tab: "prompts", name: "发布说明", description: "根据提交记录生成面向用户的版本说明。",
    source: "工作区", type: "发布", status: "disabled", enabled: false, updatedAt: "8 天前",
    meta: ["变量 3", "引用 0"], permissions: [],
  },
  {
    id: "hook-session", tab: "hooks", name: "载入项目约束", description: "会话开始时读取允许范围内的项目约束。",
    source: "工作区", type: "SessionStart", status: "enabled", enabled: true, updatedAt: "今天",
    meta: ["优先级 10", "最近通过"], permissions: ["读取项目文档"],
  },
  {
    id: "hook-tool", tab: "hooks", name: "高风险工具确认", description: "工具调用前根据风险级别要求人工审批。",
    source: "全局", type: "PreToolUse", status: "enabled", enabled: true, updatedAt: "22 分钟前",
    meta: ["优先级 20", "命中 3 次"], permissions: ["阻止工具调用"],
  },
  {
    id: "hook-error", tab: "hooks", name: "失败诊断记录", description: "工具失败后记录已脱敏的诊断摘要。",
    source: "工作区", type: "PostToolUse", status: "error", enabled: false, updatedAt: "昨天",
    meta: ["优先级 30", "模拟测试失败"], permissions: ["写入本地日志"],
  },
]

export const hookStages = [
  "SessionStart", "UserPromptSubmit", "PreToolUse", "PostToolUse", "Notification", "Stop", "SessionEnd",
] as const

export const statusLabels: Record<CapabilityStatus, string> = {
  running: "运行中", enabled: "已启用", disabled: "已停用", error: "异常", update: "可更新",
}
