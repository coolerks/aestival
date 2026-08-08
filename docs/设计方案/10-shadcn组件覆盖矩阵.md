# shadcn/ui 组件覆盖矩阵

## 1. 使用原则

- 基础交互控件必须来自 shadcn/ui。
- 允许创建业务组合组件，例如“会话输入区”“连接向导”“工具调用卡”，但其按钮、菜单、表单、浮层、列表和状态组件必须由 shadcn/ui 组合。
- 不手写 Dialog、Popover、Dropdown、Tooltip、Toast、Context Menu、Tabs、Select、Resizable 或 Sidebar 的定位、焦点与开关逻辑。
- 名称带 `New` 的 AI 组件优先使用当前注册表实现；如果注册表只提供不带 `New` 的同名版本，则把它视为兼容命名，不同时渲染两套重复 UI。
- 表格型数据优先 `DataTable`，简单静态对照可用 `Table`。
- 页面级瞬时反馈优先 `Sonner`；`Toast` 仅作为当前 shadcn 注册表或隔离应用预览的兼容入口。
- `Card` 不是默认容器，禁止 Card 内嵌 Card，也禁止用边框、圆角和背景模拟卡片套卡片。
- 页面结构优先普通分区、排版层级、`Item`、`Separator`、列表、表格、Tabs、Accordion 和 Resizable 面板。

## 2. AI 与对话组件

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Attachment` | 对话附件兼容层 | 当当前 registry 尚未提供 `AttachmentNew` 时承载文件、图片、文档引用 |
| `AttachmentNew` | 输入框、用户消息、知识库来源 | 当前首选附件组件；展示名称、类型、大小、解析与上传/引用状态 |
| `Bubble` | 用户消息、简短系统回执 | 当前官方聊天组件基线；AI 长回复仍采用较平的 Message 布局 |
| `BubbleNew` | 对话气泡兼容层 | registry 只提供 `New` 变体时使用；与 `Bubble` 二选一 |
| `Marker` | 流式/引用、运行状态 | 当前官方聊天组件基线；活动状态使用 `role="status"` |
| `MarkerNew` | 流式/引用兼容层 | registry 只提供 `New` 变体时使用；不与 `Marker` 并行渲染 |
| `Message` | 用户/AI/系统/工具消息 | 当前官方聊天组件基线；消息本体不是 Card |
| `MessageNew` | 消息兼容层 | registry 只提供 `New` 变体时使用；与 `Message` 二选一 |
| `Message Scroller` | 聊天主滚动区域 | 当前官方聊天组件基线；Provider 统一承载滚动状态 |
| `Message ScrollerNew` | 会话滚动兼容层 | registry 只提供 `New` 变体时使用；不与 `Message Scroller` 并行渲染 |
| `MessageScrollerItem` | 消息/系统事件锚点 | 每个直接子项必须有稳定 `messageId`，支持历史加载与跳转 |
| `MessageScrollerButton` | 回到最新消息 | 用户离开底部后显示未读数量与键盘可操作的恢复入口 |

## 3. 布局与导航

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Sidebar` | 全局左侧栏 | Header/Content/Group/Menu/Footer 三段结构、收起图标轨 |
| `Resizable` | 主工作区、右侧栏、底部面板、设置、应用编辑器 | 横向/纵向分割、最小阈值、恢复默认；项目看板面板只允许进入右侧栏 |
| `Tabs` | 主内容页签、能力、设置详情、应用编辑器、消息内容 | 聊天固定 Tab、文件 Tab、管理页子页面 |
| `Navigation Menu` | 收起侧栏的页面总览与标题栏导航溢出 | 页面入口、最近目标和管理页相关导航，不替代 Sidebar |
| `Breadcrumb` | 管理页、文件编辑器、详情页 | 顶层页面路径、文件路径和详情层级 |
| `Menubar` | 应用代码编辑器的桌面菜单 | 文件、编辑、查看、运行；macOS 可与原生菜单语义对齐 |
| `Separator` | 侧栏、菜单、工具栏、详情区 | 只在语义分组变化处使用 |
| `Scroll Area` | 侧栏项目区、文件树、消息表格、长菜单 | 控制唯一滚动区域并保持滚动条样式一致 |
| `Direction` | 多语言消息、预览与用户内容 | 对 Arabic/Hebrew 等 RTL 内容设置方向；Aestival 中文 UI 默认 LTR |
| `Pagination` | 知识库内容、同步记录、日志、管理列表 | 明确页码；无限加载仅用于侧栏会话的 5 条增量 |

## 4. 操作与选择

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Button` | 全应用 | 主/次/图标/破坏性动作 |
| `Button Group` | 输入框底栏、编辑器工具栏、预览缩放 | 视觉相连且语义相关的动作集合 |
| `Toggle` | 搜索大小写、固定面板、朗读状态 | 单个二态控制 |
| `Toggle Group` | 代理/聊天收起态、列表/网格、日历视图、项目看板/甘特、搜索选项 | 2–7 个互斥或多选选项 |
| `Dropdown Menu` | 点击式更多菜单、输入框加号、模型/布局动作 | 多级、分组、图标与快捷键 |
| `Context Menu` | 全局右键 | 按区域提供不同菜单，全面替代浏览器原生右键 |
| `Command` | 全局搜索、设置搜索、模型/智能体/Skill 选择 | 搜索、分组、键盘导航 |
| `Combobox` | 模型、智能体、知识库、Skill、多来源选择 | 可搜索的单选/多选 |
| `Select` | 状态、排序、类型、上下文档位 | 中等数量的结构化选项 |
| `Native Select` | 终端 Shell、表格每页数量、简单设备选择 | 需要系统原生键盘/平台行为的简短选项 |
| `Radio Group` | 审批策略、任务类型、冲突处理、失败策略 | 互斥选项并展示解释 |
| `Checkbox` | 批量选择、权限清单、导出内容 | 多个独立布尔选项 |
| `Switch` | 启用/停用、自动同步、自动压缩、通知 | 即时生效的开关 |
| `Kbd` | 菜单、Command、Tooltip、快捷键设置 | 平台化快捷键显示 |

## 5. 表单与输入

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Field` | 所有创建/编辑表单 | Label、说明、错误、禁用和必填语义 |
| `Label` | 单独控件与组合表单 | 可点击且与控件建立关联 |
| `Input` | 名称、地址、搜索、Cron、数字 | 单行内容 |
| `Input Group` | 会话输入、地址、Secret、单位输入 | 前后缀图标、按钮、单位 |
| `Textarea` | 会话输入、Prompt、说明、约束 | 多行文本；会话默认 2 行最多 8 行 |
| `Input OTP` | 供应商设备授权、外部消息渠道配对/一次性验证码 | 只在实际连接流程要求一次性验证码时呈现；它授权第三方连接，不引入 Aestival 登录页 |
| `Slider` | 字号、行高、Chunk、Overlap、音量 | 与数值 Input 联动，不能只靠拖动获得精确值 |
| `Date Picker` | 统计范围、任务单次日期、项目工作项计划范围 | 日期或范围选择 |
| `Calendar` | 任务日历、单次触发、项目看板自定义范围 | 月/周日期交互和计划点 |

## 6. 浮层与反馈

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Dialog` | 全局 Command、创建向导、统计、导出、全屏输入 | 模态复杂任务 |
| `Alert Dialog` | 删除、断开、清空、绕过审批、替换文件、项目工作项验收与作废 | 明确不可逆、人工门控或高风险后果 |
| `Sheet` | 宽屏详情、右侧检查器、窄屏侧栏、主项目看板任务详情 | 从边缘进入的详情/工具区；右侧看板详情改用 Dialog，避免嵌套 Sheet |
| `Drawer` | 窄窗口表单和详情 | 垂直空间更友好的替代层 |
| `Popover` | 上下文圆环、通知、选择详情、状态信息 | 与触发点强关联的轻量内容 |
| `Hover Card` | 项目、文件页签、引用、图表点 | 补充信息，不承载必须操作 |
| `Tooltip` | 所有纯图标按钮、禁用项 | 名称、原因与快捷键 |
| `Alert` | 连接错误、权限风险、离线、上下文上限 | 持续信息与恢复动作 |
| `Sonner` | 保存、复制、Star、撤销 | 全局短反馈首选 |
| `Toast` | registry 兼容与隔离应用预览 | 不与 Sonner 在同一宿主重复展示 |
| `Progress` | 安装、同步、导出、解析、录音时长 | 可量化或分步骤过程 |
| `Spinner` | 流式、任务、连接、按钮内加载 | 不确定时长的局部状态 |
| `Skeleton` | 页面、列表、会话 5 条加载 | 保持结构稳定 |
| `Empty` | 无会话、无项目目录、无面板、无数据 | 原因 + 唯一推荐下一步 |

## 7. 内容、数据与媒体

聊天内容渲染由业务组合组件承载，基础交互仍必须由 shadcn/ui 组件组成：

| 业务组合 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `MarkdownRenderer` | AI 消息正文 | `react-markdown`、GFM、数学、受控 HTML、代码和附件节点的统一入口；只接收源文本 |
| `CodeBlock` | Markdown fenced code | Shiki token、语言标签、复制、保存 Mock、横向 ScrollArea；闭合前降级为纯文本 |
| `MermaidBlock` | `mermaid` fenced code | 源码/预览 Tabs、缩放、复制、SVG/PNG Mock 导出、最近成功预览和错误降级 |
| `MathBlock` | KaTeX 失败回退 | 公式源码、错误提示和复制入口；正常公式由 `rehype-katex` 生成 |

| 组件 | 使用位置 | 具体用途 |
| --- | --- | --- |
| `Card` | 独立应用、知识库网格项、单次工具调用、项目工作项、主题预览 | 仅用于可独立识别或整体操作的对象；项目看板列为普通 Section，任务卡保持单层；禁止嵌套 |
| `Item` | 设置项、Hook、路由顺序、紧凑结果 | 一致的标题、说明、图标和操作布局 |
| `Data Table` | 数据连接、外部消息连接、配对请求、内容、模型、任务、记录、工具调用 | 筛选、排序、分页、选择 |
| `Table` | 静态对照、CSV/Excel 预览、小型价格表 | 不需要复杂表格状态时使用 |
| `Chart` | Token、费用、模型分布、上下文圆环、贡献热力图 | 语义颜色、Tooltip、数据表回退 |
| `Aspect Ratio` | 图片/SVG/视频/应用预览/图标裁切 | 保持媒体比例 |
| `Carousel` | 欢迎诗句、切片预览、应用截图/幻灯片 | 可暂停、支持键盘、reduced motion |
| `Accordion` | 高级配置、权限、工具 Schema、FAQ 型说明 | 展开低频复杂内容 |
| `Collapsible` | 项目、文件夹、思考大纲、工具输入输出、日志字段 | 保持高密度并可逐项展开 |
| `Avatar` | 消息模型/智能体标识 | 始终有 AvatarFallback；不用于虚构用户账号 |
| `Badge` | 状态、能力、来源、风险、计数 | 文本短、颜色语义稳定 |
| `Typography` | AI Markdown、文档预览、说明页 | 统一标题、正文、列表、表格与代码排版 |

## 8. 组件组合边界

允许的业务组合示例：

| 业务组合 | 必须由以下 shadcn/ui 组件组成 |
| --- | --- |
| 会话输入区 | InputGroup、Textarea、AttachmentNew、Button、DropdownMenu、Combobox、Chart、Popover、Tooltip |
| 工具调用卡 | 单层 Card、Badge、Marker、Collapsible、Button、Alert；内部只用普通分区 |
| 项目会话侧栏 | Sidebar、Collapsible、HoverCard、ScrollArea、ContextMenu、Skeleton |
| 全局搜索 | Dialog、Command、Badge、Kbd、ScrollArea、Empty |
| 连接向导 | Dialog/Sheet/Drawer、Field、Input/InputGroup/InputOTP、Select、RadioGroup、Checkbox、Accordion、Progress、Badge、Alert |
| 管理列表 | Breadcrumb、DataTable/Table、Item、Pagination、Command、DropdownMenu、Empty；网格对象按需使用单层 Card |
| 文件预览 | Tabs、AspectRatio、Carousel、Table、ScrollArea、Alert |
| 设置页 | Resizable、Command、Item、Field、Tabs、Accordion、Switch、Slider；外部消息连接追加 DataTable、Badge、AlertDialog |
| 项目看板 | ToggleGroup、Popover、Calendar、Select、Switch、Button、Card、Badge、ContextMenu、Sheet/Dialog、AlertDialog、Sonner、Empty；拖放由 DnD Kit 提供语义层 |

禁止的替代实现：

- Card 中再次放 Card，或用相同视觉外框模拟嵌套卡片。
- 为了“统一”给每个 Section、表格、表单和消息都套 Card。
- 用 `div + absolute` 手写下拉、对话框、Tooltip 或右键菜单。
- 用普通 Button 数组手写 Tabs、ToggleGroup 或 RadioGroup。
- 用页面级 `window.confirm` 替代 AlertDialog。
- 用自制滚动监听替代 MessageScroller 的回到底部能力。
- 用 CSS 画圆环替代 Chart。
- 用 Emoji 或文本字符替代 Lucide/Material 图标。
