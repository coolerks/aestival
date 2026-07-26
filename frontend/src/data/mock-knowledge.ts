export type KnowledgeTab =
  | "libraries"
  | "connections"
  | "retrieval"
  | "sync"

export type KnowledgeViewMode = "list" | "grid"

export type KnowledgeBaseStatus =
  | "ready"
  | "syncing"
  | "needs-update"
  | "error"
  | "disabled"

export type KnowledgeConnectionStatus =
  | "online"
  | "offline"
  | "auth-error"
  | "untested"

export type KnowledgeSourceType =
  | "postgresql"
  | "mysql"
  | "milvus"
  | "weaviate"
  | "chroma"
  | "elasticsearch"
  | "redis"
  | "oracle"
  | "files"

export type KnowledgeSourceCategory =
  | "关系数据库"
  | "向量数据库"
  | "搜索引擎"
  | "本地文件"

export type KnowledgeCapability =
  | "关系"
  | "向量"
  | "全文"
  | "混合"
  | "文件"

export type MockKnowledgeSourceDefinition = {
  type: KnowledgeSourceType
  name: string
  category: KnowledgeSourceCategory
  description: string
  defaultAddress: string
  defaultCapabilities: KnowledgeCapability[]
}

export type MockKnowledgeConnection = {
  id: string
  name: string
  type: KnowledgeSourceType
  address: string
  capabilities: KnowledgeCapability[]
  linkedKnowledgeCount: number
  status: KnowledgeConnectionStatus
  lastTest: string
  readOnly: boolean
  diagnostic: string
}

export type MockKnowledgeBase = {
  id: string
  name: string
  description: string
  connectionId: string
  sourceLabel: string
  sourceType: KnowledgeSourceType
  embeddingModel: string
  documentCount: number
  recordCount: number
  vectorCount: number
  lastSync: string
  status: KnowledgeBaseStatus
  retrievals24h: number
  pendingSources: number
  tags: string[]
  indexSize: string
  agentScope: string
}

export type MockKnowledgeContent = {
  id: string
  knowledgeBaseId: string
  title: string
  source: string
  chunkCount: number
  updatedAt: string
  status: "indexed" | "excluded" | "failed"
  excerpt: string
  metadata: Record<string, string>
}

export type MockRetrievalResult = {
  id: string
  knowledgeBaseId: string
  knowledgeBaseName: string
  rank: number
  score: number
  vectorScore: number
  keywordScore: number
  rerankScore: number
  source: string
  location: string
  excerpt: string
  metadata: Record<string, string>
}

export type MockSyncStatus =
  | "completed"
  | "running"
  | "partial"
  | "failed"

export type MockSyncRecord = {
  id: string
  knowledgeBaseId: string
  knowledgeBaseName: string
  trigger: string
  startedAt: string
  endedAt: string
  scanned: number
  created: number
  updated: number
  deleted: number
  failed: number
  embeddingTokens: number
  estimatedCost: string
  status: MockSyncStatus
}

export type CreateMockConnectionInput = {
  name: string
  type: KnowledgeSourceType
  address: string
  capabilities: KnowledgeCapability[]
  readOnly: boolean
}

export type CreateMockKnowledgeBaseInput = {
  name: string
  description: string
  connectionId: string
  sourceLabel: string
  embeddingModel: string
  agentScope: string
}

export const knowledgeSourceDefinitions: MockKnowledgeSourceDefinition[] = [
  {
    type: "postgresql",
    name: "PostgreSQL",
    category: "关系数据库",
    description: "关系查询、参数化模板与可选向量能力",
    defaultAddress: "postgresql://localhost:5432/aestival",
    defaultCapabilities: ["关系", "向量"],
  },
  {
    type: "mysql",
    name: "MySQL",
    category: "关系数据库",
    description: "关系查询、只读表视图与能力探测",
    defaultAddress: "mysql://localhost:3306/aestival",
    defaultCapabilities: ["关系"],
  },
  {
    type: "milvus",
    name: "Milvus",
    category: "向量数据库",
    description: "Collection 向量查询与元数据过滤",
    defaultAddress: "http://localhost:19530",
    defaultCapabilities: ["向量"],
  },
  {
    type: "weaviate",
    name: "Weaviate",
    category: "向量数据库",
    description: "向量、关键词与混合查询",
    defaultAddress: "http://localhost:8080",
    defaultCapabilities: ["向量", "混合"],
  },
  {
    type: "chroma",
    name: "Chroma",
    category: "向量数据库",
    description: "本地或远程 Collection 向量查询",
    defaultAddress: "./data/chroma",
    defaultCapabilities: ["向量"],
  },
  {
    type: "elasticsearch",
    name: "Elasticsearch",
    category: "搜索引擎",
    description: "全文、向量与混合检索",
    defaultAddress: "http://localhost:9200/aestival",
    defaultCapabilities: ["全文", "向量", "混合"],
  },
  {
    type: "redis",
    name: "Redis",
    category: "搜索引擎",
    description: "Key、文档与可选向量索引",
    defaultAddress: "redis://localhost:6379/0",
    defaultCapabilities: ["全文", "向量"],
  },
  {
    type: "oracle",
    name: "Oracle",
    category: "关系数据库",
    description: "Service/SID、Schema 与可选向量查询",
    defaultAddress: "oracle://localhost:1521/XEPDB1",
    defaultCapabilities: ["关系"],
  },
  {
    type: "files",
    name: "文件",
    category: "本地文件",
    description: "目录规则、内容切片与元数据过滤",
    defaultAddress: "~/Documents/Aestival",
    defaultCapabilities: ["文件", "全文", "向量"],
  },
]

export const initialMockKnowledgeConnections: MockKnowledgeConnection[] = [
  {
    id: "connection-project-files",
    name: "Aestival 项目文件",
    type: "files",
    address: "~/Project/go/aestival",
    capabilities: ["文件", "全文", "向量"],
    linkedKnowledgeCount: 2,
    status: "online",
    lastTest: "8 分钟前",
    readOnly: true,
    diagnostic: "路径可读，规则匹配 146 个文件；未读取文件正文。",
  },
  {
    id: "connection-local-chroma",
    name: "本地 Chroma",
    type: "chroma",
    address: "./data/chroma",
    capabilities: ["向量"],
    linkedKnowledgeCount: 1,
    status: "online",
    lastTest: "1 小时前",
    readOnly: true,
    diagnostic: "Mock Collection 可访问，向量维度 1,024。",
  },
  {
    id: "connection-product-db",
    name: "产品只读库",
    type: "postgresql",
    address: "db.local:5432/product",
    capabilities: ["关系", "向量"],
    linkedKnowledgeCount: 1,
    status: "auth-error",
    lastTest: "昨天",
    readOnly: true,
    diagnostic: "认证失败；凭据字段已脱敏，未保存密码或 Token。",
  },
  {
    id: "connection-search",
    name: "本地搜索索引",
    type: "elasticsearch",
    address: "localhost:9200/aestival",
    capabilities: ["全文", "混合"],
    linkedKnowledgeCount: 0,
    status: "offline",
    lastTest: "2 天前",
    readOnly: true,
    diagnostic: "地址可解析，服务未响应。",
  },
  {
    id: "connection-notes",
    name: "个人笔记目录",
    type: "files",
    address: "~/Documents/Notes",
    capabilities: ["文件", "全文"],
    linkedKnowledgeCount: 0,
    status: "untested",
    lastTest: "尚未测试",
    readOnly: true,
    diagnostic: "尚未执行前端 Mock 测试。",
  },
]

export const initialMockKnowledgeBases: MockKnowledgeBase[] = [
  {
    id: "knowledge-product-docs",
    name: "Aestival 产品文档",
    description: "产品定位、交互方案与 UI 验收规范。",
    connectionId: "connection-project-files",
    sourceLabel: "docs/设计方案",
    sourceType: "files",
    embeddingModel: "Mock Embed 1024",
    documentCount: 18,
    recordCount: 684,
    vectorCount: 684,
    lastSync: "8 分钟前",
    status: "ready",
    retrievals24h: 42,
    pendingSources: 0,
    tags: ["产品", "UI", "规范"],
    indexSize: "18.6 MB",
    agentScope: "所有智能体",
  },
  {
    id: "knowledge-engineering",
    name: "工程协作规范",
    description: "项目约束、决策、任务看板与协作同步记录。",
    connectionId: "connection-project-files",
    sourceLabel: "AGENTS.md + docs/协作同步",
    sourceType: "files",
    embeddingModel: "Mock Embed 1024",
    documentCount: 9,
    recordCount: 312,
    vectorCount: 276,
    lastSync: "正在同步",
    status: "syncing",
    retrievals24h: 29,
    pendingSources: 2,
    tags: ["工程", "协作"],
    indexSize: "9.2 MB",
    agentScope: "通用智能体、代码审查",
  },
  {
    id: "knowledge-conversations",
    name: "本地会话索引",
    description: "可搜索的普通会话摘要；临时会话不进入索引。",
    connectionId: "connection-local-chroma",
    sourceLabel: "aestival_sessions",
    sourceType: "chroma",
    embeddingModel: "已有向量 · 1024",
    documentCount: 13,
    recordCount: 1_240,
    vectorCount: 1_240,
    lastSync: "3 小时前",
    status: "needs-update",
    retrievals24h: 18,
    pendingSources: 5,
    tags: ["会话", "本地"],
    indexSize: "31.4 MB",
    agentScope: "所有智能体",
  },
  {
    id: "knowledge-decisions",
    name: "产品决策查询",
    description: "从只读产品库查询决策与需求关联。",
    connectionId: "connection-product-db",
    sourceLabel: "public.product_decisions",
    sourceType: "postgresql",
    embeddingModel: "Mock Embed 1536",
    documentCount: 0,
    recordCount: 86,
    vectorCount: 80,
    lastSync: "昨天",
    status: "error",
    retrievals24h: 3,
    pendingSources: 1,
    tags: ["决策", "数据库"],
    indexSize: "4.8 MB",
    agentScope: "产品智能体",
  },
]

export const initialMockKnowledgeContents: MockKnowledgeContent[] = [
  {
    id: "content-layout",
    knowledgeBaseId: "knowledge-product-docs",
    title: "视觉系统与窗口布局",
    source: "docs/设计方案/01-视觉系统与窗口布局.md",
    chunkCount: 38,
    updatedAt: "12 分钟前",
    status: "indexed",
    excerpt: "全局标题栏独占一行，不受左、右侧栏收起展开影响。",
    metadata: { 类型: "Markdown", 标签: "窗口,布局", 语言: "zh-CN" },
  },
  {
    id: "content-knowledge",
    knowledgeBaseId: "knowledge-product-docs",
    title: "知识库与全局搜索",
    source: "docs/设计方案/05-知识库与全局搜索.md",
    chunkCount: 46,
    updatedAt: "18 分钟前",
    status: "indexed",
    excerpt: "连接描述数据从哪里来；知识库描述如何组织和检索内容。",
    metadata: { 类型: "Markdown", 标签: "知识库,搜索", 语言: "zh-CN" },
  },
  {
    id: "content-agents",
    knowledgeBaseId: "knowledge-engineering",
    title: "Aestival 项目协作与实现约束",
    source: "AGENTS.md",
    chunkCount: 52,
    updatedAt: "8 分钟前",
    status: "indexed",
    excerpt: "所有 AI 模型、编码工具和人工协作者进入项目后必须先阅读。",
    metadata: { 类型: "Markdown", 标签: "约束", 语言: "zh-CN" },
  },
  {
    id: "content-risks",
    knowledgeBaseId: "knowledge-engineering",
    title: "依赖与风险",
    source: "docs/协作同步/依赖与风险.md",
    chunkCount: 19,
    updatedAt: "1 小时前",
    status: "failed",
    excerpt: "记录依赖、缺失资源、阻塞和风险变化。",
    metadata: { 类型: "Markdown", 标签: "风险", 错误: "Mock 增量游标失效" },
  },
]

export const mockRetrievalResults: MockRetrievalResult[] = [
  {
    id: "result-titlebar",
    knowledgeBaseId: "knowledge-product-docs",
    knowledgeBaseName: "Aestival 产品文档",
    rank: 1,
    score: 0.93,
    vectorScore: 0.91,
    keywordScore: 0.88,
    rerankScore: 0.96,
    source: "01-视觉系统与窗口布局.md",
    location: "第 7 节 · 标题栏",
    excerpt:
      "全局标题栏独占一行，页面、会话或文件名称只在主内容标题段展示。",
    metadata: { 类型: "Markdown", 标签: "标题栏,窗口", 行: "142–158" },
  },
  {
    id: "result-sidebar",
    knowledgeBaseId: "knowledge-product-docs",
    knowledgeBaseName: "Aestival 产品文档",
    rank: 2,
    score: 0.87,
    vectorScore: 0.89,
    keywordScore: 0.74,
    rerankScore: 0.9,
    source: "02-信息架构与导航.md",
    location: "第 3.2 节 · 会话层",
    excerpt:
      "会话行的 hover/选中背景与项目行等宽，内容保持一级缩进。",
    metadata: { 类型: "Markdown", 标签: "侧栏,会话", 行: "88–99" },
  },
  {
    id: "result-constraint",
    knowledgeBaseId: "knowledge-engineering",
    knowledgeBaseName: "工程协作规范",
    rank: 3,
    score: 0.81,
    vectorScore: 0.85,
    keywordScore: 0.69,
    rerankScore: 0.84,
    source: "AGENTS.md",
    location: "第 7 节 · 页面与布局",
    excerpt:
      "标题栏固定提供左侧栏、搜索、右侧栏和底部面板入口。",
    metadata: { 类型: "Markdown", 标签: "约束", 行: "126–137" },
  },
]

export const initialMockSyncRecords: MockSyncRecord[] = [
  {
    id: "sync-engineering-running",
    knowledgeBaseId: "knowledge-engineering",
    knowledgeBaseName: "工程协作规范",
    trigger: "文件变更",
    startedAt: "今天 19:18",
    endedAt: "进行中",
    scanned: 146,
    created: 12,
    updated: 28,
    deleted: 0,
    failed: 1,
    embeddingTokens: 18_420,
    estimatedCost: "Mock ¥0.14",
    status: "running",
  },
  {
    id: "sync-product-completed",
    knowledgeBaseId: "knowledge-product-docs",
    knowledgeBaseName: "Aestival 产品文档",
    trigger: "手动",
    startedAt: "今天 18:42",
    endedAt: "今天 18:43",
    scanned: 18,
    created: 3,
    updated: 9,
    deleted: 0,
    failed: 0,
    embeddingTokens: 9_860,
    estimatedCost: "Mock ¥0.08",
    status: "completed",
  },
  {
    id: "sync-decisions-failed",
    knowledgeBaseId: "knowledge-decisions",
    knowledgeBaseName: "产品决策查询",
    trigger: "定时任务",
    startedAt: "昨天 09:00",
    endedAt: "昨天 09:01",
    scanned: 86,
    created: 0,
    updated: 0,
    deleted: 0,
    failed: 6,
    embeddingTokens: 0,
    estimatedCost: "未产生费用",
    status: "failed",
  },
  {
    id: "sync-conversations-partial",
    knowledgeBaseId: "knowledge-conversations",
    knowledgeBaseName: "本地会话索引",
    trigger: "启动时",
    startedAt: "今天 16:10",
    endedAt: "今天 16:12",
    scanned: 1_240,
    created: 24,
    updated: 51,
    deleted: 3,
    failed: 2,
    embeddingTokens: 32_600,
    estimatedCost: "Mock ¥0.25",
    status: "partial",
  },
]

export function getKnowledgeSourceDefinition(type: KnowledgeSourceType) {
  return knowledgeSourceDefinitions.find((source) => source.type === type)
}

export function createMockKnowledgeConnection(
  input: CreateMockConnectionInput
): MockKnowledgeConnection {
  return {
    id: `connection-${Date.now()}`,
    name: input.name,
    type: input.type,
    address: input.address,
    capabilities: input.capabilities,
    linkedKnowledgeCount: 0,
    status: "online",
    lastTest: "刚刚",
    readOnly: input.readOnly,
    diagnostic: "前端 Mock 测试完成；未建立网络连接或保存凭据。",
  }
}

export function createMockKnowledgeBase(
  input: CreateMockKnowledgeBaseInput,
  connection: MockKnowledgeConnection
): MockKnowledgeBase {
  return {
    id: `knowledge-${Date.now()}`,
    name: input.name,
    description: input.description,
    connectionId: input.connectionId,
    sourceLabel: input.sourceLabel,
    sourceType: connection.type,
    embeddingModel: input.embeddingModel,
    documentCount: connection.type === "files" ? 12 : 0,
    recordCount: connection.type === "files" ? 146 : 320,
    vectorCount: 0,
    lastSync: "等待初次同步",
    status: "syncing",
    retrievals24h: 0,
    pendingSources: 1,
    tags: ["新建", "Mock"],
    indexSize: "正在估算",
    agentScope: input.agentScope,
  }
}
