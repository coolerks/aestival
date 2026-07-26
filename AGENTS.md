# Aestival 项目协作与实现约束

本文件适用于 Aestival 项目根目录及全部子目录，是所有 AI 模型、编码工具和人工协作者进入项目后必须先阅读的中文约束。若子目录以后存在更具体的 `AGENTS.md`，以离目标文件更近的约束为补充；用户在当前任务中的明确要求优先。

## 1. 开始工作前必须执行

任何会话开始修改文件前，按顺序阅读：

1. 本文件 `AGENTS.md`。
2. `docs/协作同步/README.md`。
3. `docs/协作同步/当前状态.md`。
4. `docs/协作同步/任务看板.md`。
5. 与当前任务相关的 `docs/设计方案/` 文档。
6. `docs/协作同步/决策记录.md` 与 `docs/协作同步/依赖与风险.md` 中的相关项。

然后必须：

- 确认当前项目阶段和本次任务是否允许改代码。
- 检查任务看板中是否已有其他工具或会话处理同一范围。
- 检查现有文件和未提交改动，保留不属于当前任务的内容。
- 在开始实质工作前，把领取的任务标为“进行中”并写明负责人/工具；如果任务已被领取，不得静默覆盖。
- 只修改本次任务必要的文件，不顺手重构无关区域。

当前是否允许进入 UI 实现，以 `docs/协作同步/当前状态.md` 为准。处于设计评审阶段时，除非用户明确要求，不得提前安装依赖或修改业务代码。

## 2. 产品定位

- 应用名称：Aestival。
- Aestival 是本地优先、无登录、无注册、无云账户入口的跨平台桌面 AI Agent 工作区。
- 技术基础：Wails 3 + React + TypeScript。
- UI 技术方向：Tailwind CSS + shadcn/ui。
- 前端业务状态：Zustand。
- 通用操作图标：`lucide-react`。
- 代码编辑器：Monaco Editor。
- 文件与文件夹图标：Material Icon Theme。
- 中文界面优先；用户可见文案短、明确、可操作。
- 软件默认不展示用户头像，不得用应用图标伪装成账户头像；左侧栏底部的图标和“Aestival”表示应用菜单。

## 3. 文档与事实来源

发生冲突时按以下层级核对：

1. 用户当前任务的明确要求。
2. 本文件中的项目强制约束。
3. `docs/协作同步/决策记录.md` 中仍有效的决策。
4. `docs/设计方案/` 中的 UI 与交互规格。
5. `docs/协作同步/当前状态.md`、任务看板和依赖风险。
6. 当前代码和测试所反映的实现事实。

文档职责：

- `AGENTS.md`：长期项目约束和协作流程。
- `docs/设计方案/`：产品 UI、交互、状态和验收规格。
- `docs/协作同步/当前状态.md`：现在做到哪里、当前阶段和下一步。
- `docs/协作同步/任务看板.md`：任务归属、状态、依赖和验收。
- `docs/协作同步/决策记录.md`：已经确认的跨模块决策。
- `docs/协作同步/变更日志.md`：每次实质变更的摘要和验证。
- `docs/协作同步/依赖与风险.md`：外部依赖、缺失资源、阻塞和风险。

项目约束、设计文档、同步文档和交接记录都使用中文；代码标识符、协议字段和第三方 API 名称保持其标准英文名称。

## 4. 视觉原则

- 视觉基准参考 Codex：克制、紧凑、低装饰、信息密度高。
- 使用 Geist 字体，中文回退为系统中文字体；代码使用 Geist Mono 或等宽回退。
- 以柔和灰阶、细边框、轻量层级和稳定留白为主。
- 强调色只用于主要动作、选中态、运行态和风险提示。
- 不使用大面积渐变、无意义插画、强烈彩色背景、玻璃拟态、拟物化或过大的标题。
- 桌面端优先，同时保证窄窗口下侧栏可收起、面板可折叠、主内容无横向溢出。

### 4.1 Card 强制约束

- 允许使用 shadcn/ui `Card`，但 Card 不是默认布局容器。
- 禁止 Card 套 Card，无论是直接组件嵌套，还是用边框、圆角、背景和阴影模拟的视觉卡片嵌套。
- 如果父级已经是 Card，子级必须使用普通 Section、`Item`、`Separator`、列表、表格、字段分组、`Accordion` 或 `Collapsible`。
- 页面结构优先使用排版层级、留白、`Separator`、`Item`、`DataTable`/`Table`、`Tabs`、`Accordion`、`Collapsible`、`Resizable` 和普通内容区。
- Card 仅用于边界独立、可整体操作或需要独立预览的对象，例如应用、知识库网格项、单次工具调用、主题预览。
- 指标区默认使用指标带、Item 或排版分栏，不能默认生成一排统计卡。
- 同一页面不能把标题、筛选、表格、表单、详情和状态全部做成卡片，禁止形成“卡片墙”。
- 使用 Card 时应尽量采用 `CardHeader`、`CardTitle`、`CardDescription`、`CardContent`、`CardFooter` 的合理结构，但不为了凑结构添加无意义区域。
- UI 验收必须单独检查“是否卡片嵌套”和“是否过度使用卡片”。

## 5. shadcn/ui 是强制组件层

所有可交互和可复用 UI 必须优先使用 `frontend/src/components/ui` 中的 shadcn/ui 组件。缺少组件时，先用 shadcn CLI 查询文档和注册表并添加，再组合业务组件；不得手写功能等价的基础组件。

需要覆盖并合理使用的组件体系：

`Attachment`、`Bubble`、`Marker`、`Message`、`MessageScroller`、`Accordion`、`Alert`、`AlertDialog`、`AspectRatio`、`AttachmentNew`、`Avatar`、`Badge`、`Breadcrumb`、`BubbleNew`、`Button`、`ButtonGroup`、`Calendar`、`Card`、`Carousel`、`Chart`、`Checkbox`、`Collapsible`、`Combobox`、`Command`、`ContextMenu`、`DataTable`、`DatePicker`、`Dialog`、`Direction`、`Drawer`、`DropdownMenu`、`Empty`、`Field`、`HoverCard`、`Input`、`InputGroup`、`InputOTP`、`Item`、`Kbd`、`Label`、`MarkerNew`、`Menubar`、`MessageNew`、`MessageScrollerNew`、`NativeSelect`、`NavigationMenu`、`Pagination`、`Popover`、`Progress`、`RadioGroup`、`Resizable`、`ScrollArea`、`Select`、`Separator`、`Sheet`、`Sidebar`、`Skeleton`、`Slider`、`Sonner`、`Spinner`、`Switch`、`Table`、`Tabs`、`Textarea`、`Toast`、`Toggle`、`ToggleGroup`、`Tooltip`、`Typography`。

命名带 `New` 时优先采用当前注册表实现或等价的本地生成组件；不要为了覆盖名称而同时渲染新旧两套组件。

强制映射：

- 全局导航：`Sidebar`、`NavigationMenu`、`Tooltip`、`Separator`、`HoverCard`。
- 全局搜索、设置搜索和动作检索：`Command + Dialog`。
- 聊天消息：优先 `MessageNew`、`BubbleNew`、`MessageScrollerNew`、`MarkerNew`、`AttachmentNew`。
- 思考、流式和运行状态：`MarkerNew`/`Marker`、`Spinner`、`Skeleton`、`Progress`。
- 全局右键：`ContextMenu`；点击式更多菜单：`DropdownMenu`。
- 可调布局：`Resizable`。
- 复杂表单：`Field`/`FieldGroup` 与标准输入组件。
- 管理数据：默认 `DataTable`/`Table`/`Item`，Card 只用于独立网格对象。
- 短反馈：优先 `Sonner`；持续信息：`Alert`；危险确认：`AlertDialog`。
- 空内容：`Empty`；加载：`Skeleton`/`Spinner`。

## 6. 组件使用规范

- 新增业务组件前先检查现有 `frontend/src/components/ui` 和业务目录。
- 业务组件只能组合 shadcn/ui，不得复制其内部实现形成平行组件体系。
- 使用 shadcn 语义 token，如 `bg-background`、`text-muted-foreground`、`border-border`、`bg-primary`，禁止业务组件写死 `bg-blue-*`、`text-gray-*` 等颜色。
- 使用 `cn()` 合并条件 class。
- 布局使用 `flex/grid + gap`，不得使用 `space-x-*` 或 `space-y-*`。
- 等宽高优先 `size-*`。
- 禁止为 overlay 手写 z-index、定位、点击外部关闭和焦点圈逻辑。
- `Dialog`、`Sheet`、`Drawer`、`AlertDialog` 必须有可访问标题。
- `TabsTrigger` 必须位于 `TabsList`；菜单项和 SelectItem 必须位于对应 Group。
- `Avatar` 必须有 `AvatarFallback`；图片、SVG 和文档附件必须有可读说明。
- 表单校验同时使用 `data-invalid` 与 `aria-invalid`。
- 2–7 个选项优先 `ToggleGroup`，不使用 Button 数组手写选择状态。

## 7. 页面与布局

- 默认两栏：展开的左侧栏 + 主内容。
- 最多三列：按需增加右侧栏；底部面板属于垂直分割，不增加列数。
- 全局标题栏独占一行，不受左、右侧栏收起展开影响。
- macOS 红黄绿窗口控件与标题栏动作同一行，并保留安全区。
- 标题栏固定提供左侧栏、搜索、右侧栏和底部面板入口。
- 双击标题栏空白拖动区切换窗口最大化/恢复；Button、Tabs、输入控件和其他 `no-drag` 交互区不得触发窗口切换。
- 最大化、恢复以及从最大化状态直接拖角恢复后，窗口最小尺寸约束必须保持有效，不能因 Wails 状态切换而被清空。
- 左侧栏必须使用 shadcn `Sidebar` 的 Provider、Header、Content、Group、Menu、Footer。
- 左侧栏三段结构、固定“任务”项目、每次加载 5 个会话等规则以设计方案为准。
- 主内容的“聊天”页签始终位于第一项且不可关闭。
- 右侧栏和底部面板支持文件、终端、内容搜索、日志、会话调试。
- 底部面板首次展开默认打开终端。
- 所有 Resizable 面板必须有最小值、最大值、收起入口和恢复入口。
- 聊天消息区域只允许一个主要滚动容器。

## 8. 图标与资源

- 通用图标使用 `lucide-react`，图标必须与动作语义一致。
- 纯图标按钮必须有 `aria-label` 和 `Tooltip`。
- 按钮内图标使用 `data-icon="inline-start"` 或 `data-icon="inline-end"`。
- 禁止用 Emoji、字符、CSS 图形、手绘 SVG 或占位框冒充图标和资源。
- 应用图标：`frontend/src/assets/icons/application/logo.svg`。
- 状态栏/任务栏图标：`frontend/src/assets/icons/application/icon-template.svg`。
- 应用内图标：`frontend/src/assets/icons/application/icon.svg`。
- 文件图标来自 `frontend/src/assets/icons/material/`。
- 文件映射以 `docs/文件图标映射.md` 为唯一事实来源；不得根据名称猜测不存在的图标。

## 9. 交互、右键与无障碍

- 应用外壳、标题栏、侧栏、导航、工具栏、菜单和按钮默认禁止文字框选；标题栏可拖拽空白区使用普通箭头光标，不使用文本选择光标。
- 消息正文、文档/代码预览、输入与可编辑区域、Monaco、终端和日志等需要复制内容的表面必须显式恢复文本选择；不得用全局禁选破坏其原生或组件自有选区能力。
- 全局禁用浏览器原生右键菜单。
- 不同区域必须提供不同 `ContextMenu`，至少区分侧栏/项目、会话、消息、输入框、附件、页签、文件树、Monaco、终端、检查器、管理页。
- 每个菜单项必须带 Lucide 图标。
- 有快捷键的菜单项必须在右侧显示平台化快捷键。
- 菜单较长时必须分组；层级动作使用子菜单。
- 破坏性菜单项使用 destructive variant 并在必要时接 `AlertDialog`。
- 交互反馈使用 `Sonner`/`Toast`，禁止 `alert()`、`confirm()` 和浏览器原生 prompt。
- 删除、断开连接、清空、覆盖和绕过审批使用 `AlertDialog`。
- 所有图标按钮、菜单、Tabs、树、表单和面板必须支持键盘操作。
- 键盘焦点可见；浮层关闭后焦点返回触发元素。
- 所有页面必须有空、加载、错误/风险、禁用和成功状态。

## 10. 功能边界

- 顶层功能：代理/聊天、知识库、全局搜索、应用、能力、任务、设置。
- 聊天模式禁止任何工具、MCP、Skill、工作流、网络检索和具有副作用的能力。
- 代理模式的工具、文件写入、命令、网络与记忆写入受审批策略约束。
- 全局搜索使用 `Command + Dialog`，不是常驻搜索页面。
- 文件内容搜索位于工作区面板，与全局搜索分开。
- 设置中的“连接”用于 Telegram、飞书、Discord、钉钉、微信和 QQ 外部消息交互，与知识库“数据连接”分开，也不构成 Aestival 登录或云账户。
- 外部消息请求必须经过配对/允许列表、会话隔离和现有审批策略；外部发送者不得绕过聊天/代理模式边界或在远程扩大高风险权限。
- 代码和常见二进制预览规则以 `docs/设计方案/09-工作区面板与文件预览.md` 为准。
- UI 不得出现登录、注册、云同步账户或虚构用户 Profile。

## 11. 状态与数据边界

- 业务状态使用 Zustand，页面级状态集中管理，不使用隐式全局变量。
- 组件通过明确 props 和动作接口工作，不直接修改不属于自己的状态。
- Mock 数据、UI 状态和未来 Wails/后端接口必须分离。
- 不得把 API Key、密码、Token、完整环境变量、Authorization、终端进程对象写入普通 Zustand 持久化。
- 当前只实现 UI 时，可以提供明确标记的 mock 反馈，但不得伪造真实网络连接、计费、文件写入、终端执行、MCP/Skill 安装或数据库同步成功。
- 会话、工具、任务、文件保存等异步流程使用明确状态机，不能靠多个互相冲突的 boolean。

## 12. 代码组织与质量

- UI 基础组件放在 `frontend/src/components/ui`。
- 业务组合组件按领域放置，不把页面全部堆在一个文件中。
- 页面、状态、服务适配、类型和纯工具函数分离。
- Wails 调用集中在服务/适配层，展示组件不直接散落调用运行时 API。
- TypeScript 新代码避免 `any`；外部输入先用 `unknown` 并收窄。
- 公共类型和状态字段要有明确命名，禁止同义字段重复表达同一状态。
- 不为未来假设提前构建无用抽象；先满足已确认设计。
- 不修改与任务无关的生成文件、构建产物和依赖锁。
- 不使用破坏性 Git/文件命令覆盖他人工作。

## 13. 跨会话同步要求

每次有实质变更时，结束前必须同步：

1. `docs/协作同步/当前状态.md`：更新阶段、已完成、进行中、阻塞和下一步。
2. `docs/协作同步/任务看板.md`：更新任务状态、负责人、时间和验收结果。
3. `docs/协作同步/变更日志.md`：追加本次变更文件、主要内容和验证。
4. `docs/协作同步/决策记录.md`：只有产生新决策或替代旧决策时追加。
5. `docs/协作同步/依赖与风险.md`：依赖、阻塞或风险变化时更新。

规则：

- 使用任务 ID 引用工作，不使用“上次那个功能”等模糊说法。
- 时间使用 `YYYY-MM-DD HH:mm`，时区写 `Asia/Shanghai`。
- 不删除历史决策；被替代的决策标记“已被 DEC-xxx 替代”。
- 不把聊天隐藏推理、凭据、私密数据或长篇调试输出写入同步文档。
- 如果工作未完成，也必须记录准确进度、已验证内容和明确下一步。
- 如果未做任何实质变更，不得为了显得有进度而伪造日志。

## 14. 验证与完成标准

设计文档变更至少检查：

- Markdown 标题和代码围栏完整。
- 相对链接有效。
- 约束在总览、细则和验收中没有冲突。
- 卡片使用规则已同步到设计与项目约束。

前端实现变更至少检查：

1. TypeScript 检查通过。
2. Vite production build 通过。
3. 主要页面在窄、标准、宽屏无溢出。
4. Resizable 面板可拖拽、收起和恢复。
5. Command、ContextMenu、Sidebar、Tabs、消息与状态组件接入真实页面。
6. 无浏览器原生右键；菜单图标、分组、快捷键和子菜单正确。
7. 无 Card 套 Card，且页面没有过度卡片化。
8. 键盘焦点、aria-label、空/加载/错误状态和危险确认可检查。
9. 本次相关同步文档已更新。

完成交接必须说明：

- 完成了什么。
- 修改了哪些文件。
- 做了什么验证。
- 仍有哪些限制、依赖或风险。
- 下一项可以直接执行的任务 ID。
