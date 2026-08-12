export type SettingsCategory = "models" | "statistics" | "connections" | "reading" | "notifications" | "appearance" | "shortcuts" | "about"
export type ConnectionStatus = "online" | "limited" | "auth" | "error" | "paused"

export const settingsCategories: Array<{ id: SettingsCategory; label: string; description: string; keywords: string }> = [
  { id: "models", label: "模型管理", description: "供应商、模型、路由与使用限制", keywords: "API Key Endpoint 路由 回退 费用 Token" },
  { id: "statistics", label: "信息统计", description: "用量、费用、响应与工具调用", keywords: "图表 热力图 会话 消息 导出" },
  { id: "connections", label: "连接", description: "外部消息平台与访问策略", keywords: "Telegram 飞书 Discord 钉钉 微信 QQ 配对" },
  { id: "reading", label: "阅读", description: "RSS、合集、精选与阅读偏好", keywords: "RSS Feed Atom JSON OPML 精选 合集 已读 收藏 AI" },
  { id: "notifications", label: "通知", description: "事件、渠道、勿扰与隐私", keywords: "系统 声音 审批 失败 前台" },
  { id: "appearance", label: "外观", description: "主题、动画、字体与密度", keywords: "浅色 深色 字号 圆角 reduced motion" },
  { id: "shortcuts", label: "快捷键", description: "绑定、冲突、预设与录制", keywords: "键盘 Mod Command Ctrl" },
  { id: "about", label: "关于", description: "版本、目录、诊断与维护", keywords: "更新 许可证 日志 缓存 恢复" },
]

export type MockProvider = { id: string; provider: string; alias: string; endpoint: string; status: "ready" | "untested" | "error"; modelCount: number; testedAt: string; isDefault: boolean }
export const mockProviders: MockProvider[] = [
  { id: "provider-ollama-local", provider: "Ollama", alias: "Ollama-本机", endpoint: "http://127.0.0.1:11434", status: "ready", modelCount: 3, testedAt: "8 分钟前", isDefault: true },
  { id: "provider-openai-work", provider: "OpenAI", alias: "OpenAI-工作", endpoint: "https://api.openai.com/v1", status: "untested", modelCount: 2, testedAt: "尚未测试", isDefault: false },
  { id: "provider-openrouter", provider: "OpenRouter", alias: "OpenRouter-回退", endpoint: "https://openrouter.ai/api/v1", status: "error", modelCount: 4, testedAt: "昨天", isDefault: false },
]

export const providerPresets = ["OpenRouter", "Ollama", "Anthropic", "OpenAI", "Gemini", "MiniMax（中国）", "MiniMax（国际）", "Groq", "Poe", "Hugging Face", "硅基流动", "智谱（Z.AI）", "阿里云百炼", "腾讯云", "阶跃星辰", "火山引擎", "月之暗面", "DeepSeek", "自定义"]

export type MockModel = { id: string; name: string; modelId: string; provider: string; capabilities: string[]; context: string; price: string; status: "ready" | "disabled"; usage: string }
export const mockModels: MockModel[] = [
  { id: "model-balanced", name: "Mock Balanced", modelId: "qwen3:14b", provider: "Ollama-本机", capabilities: ["文本", "工具", "思考"], context: "128k", price: "本地资源", status: "ready", usage: "默认代理" },
  { id: "model-fast", name: "Mock Fast", modelId: "gpt-4.1-mini", provider: "OpenAI-工作", capabilities: ["文本", "视觉", "工具"], context: "1M", price: "待配置", status: "ready", usage: "默认聊天" },
  { id: "model-embed", name: "本地嵌入", modelId: "nomic-embed-text", provider: "Ollama-本机", capabilities: ["嵌入"], context: "8k", price: "本地资源", status: "disabled", usage: "嵌入" },
]

export type MockConnection = { id: string; platform: string; alias: string; identity: string; scope: string; route: string; mode: "聊天" | "代理"; access: string; transport: string; status: ConnectionStatus; recent: string; risk: boolean; capabilities: string[] }
export const mockConnections: MockConnection[] = [
  { id: "connection-telegram", platform: "Telegram", alias: "Telegram-个人", identity: "@aestival_local_bot", scope: "私聊配对；群组关闭", route: "任务 / 通用智能体", mode: "聊天", access: "配对 + 允许列表", transport: "长轮询", status: "online", recent: "入站 18 分钟前", risk: false, capabilities: ["文本可用", "图片待验证", "流式不支持"] },
  { id: "connection-feishu", platform: "飞书", alias: "飞书-研发", identity: "Aestival 研发助手", scope: "2 个群组；必须提及", route: "Aestival / 审查智能体", mode: "代理", access: "允许列表；桌面审批", transport: "WebSocket", status: "limited", recent: "出站 昨天", risk: false, capabilities: ["文本可用", "卡片受限", "文件待验证"] },
  { id: "connection-wechat", platform: "微信", alias: "微信-实验", identity: "外部连接器", scope: "私聊配对", route: "任务 / 受限代理", mode: "代理", access: "配对；低风险远程审批", transport: "外部连接器", status: "auth", recent: "3 天前", risk: true, capabilities: ["文本待验证", "群聊不支持", "连接器未签名"] },
]

export const connectionPlatforms = [
  { id: "telegram", label: "Telegram", identity: "Bot Token", transport: "长轮询 / Webhook", maturity: "设计可用" },
  { id: "feishu", label: "飞书", identity: "企业自建应用", transport: "WebSocket / Webhook", maturity: "待适配器" },
  { id: "discord", label: "Discord", identity: "Developer Bot", transport: "Gateway", maturity: "待适配器" },
  { id: "dingtalk", label: "钉钉", identity: "企业应用", transport: "Stream / 回调", maturity: "待适配器" },
  { id: "wechat", label: "微信", identity: "经验证的外部连接器", transport: "扫码连接器", maturity: "实验性" },
  { id: "qq", label: "QQ", identity: "QQ Bot", transport: "官方 Bot 网关", maturity: "待适配器" },
]

export type MockPairingRequest = { id: string; requester: string; stableId: string; source: string; code: string; requestedAt: string; expires: string; risk: string }
export const mockPairingRequests: MockPairingRequest[] = [
  { id: "pair-001", requester: "Lin", stableId: "tg:83•••19", source: "Telegram-个人 · 私聊", code: "•• 41", requestedAt: "21:16", expires: "剩余 6 分钟", risk: "新账号" },
  { id: "pair-002", requester: "研发测试群", stableId: "oc_7d•••e2", source: "飞书-研发 · 群组", code: "•• 08", requestedAt: "20:42", expires: "已过期", risk: "未知群组" },
]

export type MockConnectionActivity = { id: string; time: string; direction: "入站" | "出站"; connection: string; scope: string; policy: string; route: string; result: string; fingerprint: string }
export const mockConnectionActivity: MockConnectionActivity[] = [
  { id: "activity-001", time: "21:22:14", direction: "入站", connection: "Telegram-个人", scope: "私聊 · tg:83•••19", policy: "等待配对", route: "未进入会话", result: "已拒绝正文采集", fingerprint: "evt…7A2F" },
  { id: "activity-002", time: "20:38:02", direction: "出站", connection: "飞书-研发", scope: "群组 · oc_2f•••91", policy: "允许列表", route: "Aestival / 会话 #184", result: "已投递", fingerprint: "evt…901C" },
  { id: "activity-003", time: "昨天 18:04", direction: "入站", connection: "微信-实验", scope: "私聊 · wx:•••52", policy: "需重新认证", route: "未进入会话", result: "连接器未认证", fingerprint: "evt…2D11" },
]

export const usageTrend = [
  { day: "周一", messages: 42, tokens: 18, cost: 6 },
  { day: "周二", messages: 58, tokens: 24, cost: 8 },
  { day: "周三", messages: 35, tokens: 15, cost: 5 },
  { day: "周四", messages: 76, tokens: 32, cost: 11 },
  { day: "周五", messages: 64, tokens: 27, cost: 9 },
  { day: "周六", messages: 20, tokens: 8, cost: 2 },
  { day: "周日", messages: 48, tokens: 19, cost: 7 },
]

export type MockShortcut = { id: string; category: string; action: string; binding: string; scope: string; source: string; conflict?: string }
export const mockShortcuts: MockShortcut[] = [
  { id: "shortcut-new", category: "全局", action: "新建任务", binding: "⌘N", scope: "应用", source: "默认" },
  { id: "shortcut-search", category: "全局", action: "全局搜索", binding: "⌘K", scope: "应用", source: "默认" },
  { id: "shortcut-settings", category: "全局", action: "设置", binding: "⌘,", scope: "应用", source: "默认" },
  { id: "shortcut-sidebar", category: "布局", action: "显示/隐藏左侧栏", binding: "⌘B", scope: "应用", source: "默认" },
  { id: "shortcut-terminal", category: "面板", action: "清空终端", binding: "⌘K", scope: "终端", source: "默认" },
  { id: "shortcut-run-task", category: "任务", action: "立即运行当前任务", binding: "⌘Enter", scope: "任务中心", source: "默认" },
  { id: "shortcut-conflict", category: "会话", action: "自定义审查动作", binding: "⌘K", scope: "应用", source: "自定义", conflict: "与“全局搜索”冲突" },
]

export const notificationEvents = ["代理完成", "请求审批", "代理/工具失败", "定时任务开始/成功/失败", "模型不可用或限流", "费用/Token 阈值", "MCP/Skill 更新", "新的外部渠道配对请求", "外部连接需认证或离线", "应用运行错误"]
