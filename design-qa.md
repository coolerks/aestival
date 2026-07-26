# Aestival UI 设计验收

> 验收时间：2026-07-26 09:16
> 时区：Asia/Shanghai  
> 任务：UI-001、BE-001  
> 最终结果：通过

final result: passed

## 验收输入

- 视觉参考：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-45d62bf3-8452-4f58-925b-e2308cb92425.png`
- 实现截图：`docs/协作同步/design-qa-implementation-1440x900.png`
- 并排对照：`docs/协作同步/design-qa-comparison.png`
- 用户标注参考：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-0911a3d8-a962-4d23-95da-84addbf699a7.png`
- 调整后实现：`docs/协作同步/design-qa-adjusted-1440x900.png`
- 完全收起态：`docs/协作同步/design-qa-sidebar-collapsed-1440x900.png`
- 调整对照：`docs/协作同步/design-qa-adjustment-comparison.png`
- 第二轮标注参考：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-857a421d-119d-4763-8692-c380e3d471fe.png`
- 毛玻璃调整后实现：`docs/协作同步/design-qa-glass-adjusted-1280x720.png`
- 第二轮并排对照：`docs/协作同步/design-qa-glass-adjustment-comparison.png`
- 第四轮标注参考：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-e1a7e80d-cbaa-495c-ab48-1668fb66ed58.png`
- 第四轮浏览器实现：`docs/协作同步/design-qa-sidebar-glass-states-1280x720.png`
- 第四轮原生窗口实现：`docs/协作同步/design-qa-sidebar-native-1327x768.jpg`
- 第四轮并排对照：`docs/协作同步/design-qa-sidebar-glass-states-comparison.png`
- 第十一轮标注参考：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-cab0a081-8f59-488c-900c-35054e85c52b.png`
- 第十一轮浏览器实现：`docs/协作同步/design-qa-titlebar-drag-1280x720.jpg`
- 第十一轮全屏/标题栏聚焦对照：`docs/协作同步/design-qa-titlebar-drag-comparison.png`
- 标准视口：1440 × 900
- 窄窗口视口：960 × 640

## 对照结论

实现保留了参考图最关键的视觉结构：克制的灰白桌面外壳、紧凑左侧栏、全宽标题栏、居中的欢迎区、四个轻边框建议项，以及靠近底部的复合任务输入区。图标、字体、间距和边界均使用项目设计系统与语义 token，没有复制参考产品的账户、项目或业务文案。

与参考图的有意差异：

- 按 Aestival 设计方案使用固定“任务”项目、代理/聊天模式与中文诗句欢迎语。
- 浏览器截图不包含 Wails 原生窗口圆角和 macOS 红黄绿窗口控件；对应安全区与隐藏式标题栏已在 Wails 主窗口配置中实现。
- 输入区明确标记为 `Mock`，避免伪造模型调用、文件写入或费用。
- 参考图左侧栏内容密度更高；本阶段只展示已确认的导航和收起态任务项目，避免虚构业务数据。

## 迭代记录

1. 首轮标准窗口实现后，发现窄窗口中建议项会挤压输入区；在高度不超过 720px 时隐藏建议项，保留核心任务路径。
2. 右侧工作区在 960px 窗口中改为 `Sheet`，避免第三列挤压主内容；标准宽度继续使用 `Resizable`。
3. 清理 Base UI 触发器的 ref 告警，为 `Button`、`InputGroupButton` 和 `SidebarMenuButton` 补齐引用转发。
4. 修正管理页切换后标题栏仍显示“新建任务”的问题，并完成搜索、导航、右侧栏和 Mock 输入反馈复测。
5. 根据用户标注移除前进/后退、默认聊天页签和输入区独立信息行；搜索入口改为纯图标。
6. Sidebar 从图标收起改为完全离屏收起，确认收起后占位宽度为 `0px`；展开会话列表移除左侧竖线。
7. 去除应用 SVG 的阴影滤镜和欢迎图标透明度，保留原始矢量路径并提高小尺寸清晰度。
8. 发现输入区因禁用的发送按钮触发 `has-disabled`，导致整个输入组降为 50% 不透明度和灰色背景；已覆盖为白色语义背景与 100% 不透明度。
9. Wails 隐藏式标题栏和前端标题栏统一为 50px；浏览器无法呈现 macOS 原生交通灯，因此此项通过配置一致性与完整 Wails 构建验证，未再次启动系统中的同名应用。
10. 根据第二轮标注将 Wails 隐形标题栏高度从 50px 微调为 48px，使 macOS 窗口控件视觉中心轻微上移；前端标题栏仍保持 50px。
11. 标题栏拆分为侧栏段与主内容段：侧栏段使用 `bg-sidebar/80`、24px 背景模糊且无底边，主内容段保持白色与底边；侧栏完全收起后标题栏恢复为连续白色底边。
12. 输入组覆盖聚焦态的 `border-ring` 与 3px ring；实测聚焦前后边框均为 1px `input` token，额外聚焦阴影宽度为 0px。
13. 第三轮标注指出侧栏材质被标题栏与内容区分成两层、整列右边框不连续，以及 CSS 模糊层在窗口移动时可能闪烁；这些属于 P1/P2 可见问题。
14. 修复后改为一个固定的 256px 全高半透明侧栏材质层，标题栏和下方 Sidebar 内容均透明叠加在其上；右边框由该全高层统一绘制。
15. 移除 WebView 内的 `backdrop-filter`，仅保留 `bg-sidebar/80` 半透明染色，模糊由 Wails `MacBackdropTranslucent` 的原生 `NSVisualEffectView` 提供，避免两套模糊合成。
16. macOS 隐形标题栏高度由 48px 继续调整为 46px，使原生窗口控件再上移约 1px。
17. 第四轮标注指出整列毛玻璃仍偏不透明，Sidebar tab、hover 和选中状态不够清晰，且边缘 hover 线只在标题栏下方变粗。
18. 将整列材质层调整为 60% 侧栏色，使用半透明语义色重新区分 tab 轨道、hover、选中与导航 active；`SidebarRail` 向上延伸至窗口顶端。
19. 左上方向缩放抖动与标题栏拖拽区域覆盖原生缩放边缘、WebView fixed/动态视口层在窗口原点变化时重复重排的组合风险一致；已增加 8px 原生缩放安全区，并改用稳定的根高度和工作区绝对定位。
20. 后续源码与用户实测确认，真正的角落抖动来自 `InvisibleTitleBarHeight` 强制拖拽与 AppKit 原生缩放竞争；已移除该配置，用户确认四角缩放不再抖动/跑位。
21. 接入 `@wailsio/runtime` 后，标题栏中央仍被左右两组大范围 `no-drag` 容器遮挡；第十一轮将 `drag` 语义放到完整标题栏，仅四个真实按钮保留 `no-drag`，用户确认整条标题栏均可移动窗口。

## 第十一轮设计 QA

### 对照证据

- 源视觉真值：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-cab0a081-8f59-488c-900c-35054e85c52b.png`。
- 源图像素：2144 × 1672；内容为 macOS 原生窗口和红色标题栏可拖动范围标注。
- 实现截图：`docs/协作同步/design-qa-titlebar-drag-1280x720.jpg`，像素/CSS 视口均为 1280 × 720，deviceScaleFactor 1。
- 合并对照：`docs/协作同步/design-qa-titlebar-drag-comparison.png`，2560 × 870；上半部为源图等比缩放/补边与实现全屏并排，下半部为标题栏聚焦区域并排。
- 状态：浅色、新建任务、Sidebar 展开，右侧栏与底部面板关闭。源图窗口更高，建议动作因实现视口高度为 720px 而按既有响应式规则隐藏；该差异不属于本轮标题栏范围。

### Findings 与修复

- [P1] 标题栏只有上下窄缝可拖动：大范围 `flex-1` 标题容器和右侧动作容器整体标记为 `no-drag`，遮住了底层拖拽面。已移除大容器的 `no-drag`/指针命中，仅在四个真实按钮上保留。
- [P2] 拖拽语义依赖独立覆盖层，容易再次被更高层内容遮挡：已由完整 53px `header` 自身承载 `app-drag-region`，布局子节点继承拖动语义。

### 修复后证据

- 1280×720 命中矩阵中，x=4、40、145、300、640、1120 且 y=4/25/51 的标题栏空白均计算为 `--wails-draggable: drag`。
- 侧栏、搜索、右侧栏和底部面板按钮分别计算为 `no-drag`，原有点击能力保持；y=55 已离开标题栏且不继承拖动。
- 页面 `scrollWidth/scrollHeight` 为 1280×720，无布局溢出；全屏和聚焦对照未出现字体、间距、颜色、图标、品牌 SVG 或文案回归。
- 用户在原生应用中实测确认完整标题栏移动窗口正常；此前已确认的四角缩放无抖动/跑位修复保持有效。

### 必查视觉面

- 字体与文案：Geist、中文系统回退、字号、字重、标题截断和所有可见文案未改动。
- 间距与布局：标题栏仍为 53px，72px macOS 安全区、Sidebar 宽度和右侧按钮间距均未改变。
- 颜色与 token：背景、底边、Sidebar 材质和状态色未改动，继续使用语义 token。
- 图像与图标：应用品牌 SVG 与 Lucide 图标未替换、未栅格化或降质。
- 交互与可访问性：纯图标按钮仍有 `aria-label` 与 Tooltip；标题栏空白不再拦截拖动，按钮保持键盘和鼠标交互。
- 控制台：无新增 error；仅存在浏览器环境下 Wails 运行时的预期 UI 预览提示。

### 第十一轮结论

本轮早期 P1/P2 命中问题均已修复，修复后合并对照与计算样式检查未发现剩余 P0/P1/P2 视觉或交互回归，原生核心行为已由用户确认。

## 第四轮设计 QA

### 对照证据

- 源视觉真值：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-e1a7e80d-cbaa-495c-ab48-1668fb66ed58.png`
- 源图像素：2144 × 1572；包含原生窗口、实际 Sidebar 状态和红色问题标注。
- 浏览器实现截图：`docs/协作同步/design-qa-sidebar-glass-states-1280x720.png`
- 浏览器实现 CSS 视口/像素：1280 × 720，浅色、新建任务、Sidebar 展开、项目会话展开。
- 原生实现截图：`docs/协作同步/design-qa-sidebar-native-1327x768.jpg`，来自本项目精确打包的 `bin/aestival.app`。
- 并排对照：`docs/协作同步/design-qa-sidebar-glass-states-comparison.png`。

### Findings 与修复

- [P1] 整列毛玻璃染色偏重，底层透出感不足：全高 `sidebar` 染色由 80% 降至 60%，继续由 Wails 原生 backdrop 提供模糊。
- [P1] 代理/聊天 tab、导航 hover/active 和项目状态不易区分：tab 轨道、hover、选中和导航 active 改为不同透明度的语义表面，仍保持玻璃透出。
- [P2] 边界 hover 线只覆盖标题栏下方：`SidebarRail` 的顶部从工作区 y=50 延伸到窗口 y=0，边缘交互线与全高 1px 基础边框保持同一纵向范围。
- [P1] 左上方向缩放时页面抖动：标题栏拖拽面从原生窗口四周内缩 8px，角落和边缘明确为 `no-drag`；根高度改为稳定的 100%，Sidebar/材质层改为根容器内绝对定位，移除 fixed 与动态视口高度的重排竞争。

### 必查视觉面与交互

- 颜色与材质：浏览器计算样式为 `bg-sidebar/60`；tab 轨道约 7%、hover 35%、选中 65%，导航 active 约 7%，均使用语义 token。
- 边界：全高材质层 256 × 720，只绘制一条 1px 右边框；`SidebarRail` 的计算范围为 y=0–720。
- 标题栏：可拖拽面从 x/y=8px 开始，顶部与左右边缘保留原生缩放安全区；红黄绿控件和标题保持同一行。
- 布局：根文档无横向/纵向溢出；Sidebar 展开与完全收起、搜索弹窗、输入框编辑/清空均通过。
- 原生窗口：本项目 `bin/aestival.app` 的外观、左上/顶部与右下方向缩放后布局均稳定；自动化不记录拖动过程每一帧，因此保留人工微抖复核项。
- React 与可访问性：未新增 Hook/状态/列表 key 问题；图标按钮、Tabs 与 Sidebar 继续使用现有 shadcn 语义组件和可访问名称。

### 第四轮结论

并排对照和原生窗口截图未发现剩余 P0/P1/P2 静态视觉差异。整列毛玻璃与所有 Sidebar 状态均保持半透明且可辨识，边界在标题栏和内容区连续一致；左上缩放冲突已从结构上消除，缩放后的页面布局稳定。

## 第三轮设计 QA

### 对照证据

- 源视觉真值：`/var/folders/jz/v6ymlznd733_t1sqjwrc4zdm0000gn/T/codex-clipboard-28615fa6-115b-433d-99df-5e0620df7fcd.png`
- 源图像素：2726 × 1794；包含 macOS 原生窗口外壳和红色标注。
- 浏览器实现截图：`docs/协作同步/design-qa-sidebar-glass-1280x720.png`
- 实现 CSS 视口/像素：1280 × 720，浏览器截图按 1× CSS 像素检查。
- 全屏并排对照：`docs/协作同步/design-qa-sidebar-glass-comparison.png`
- 侧栏聚焦对照：`docs/协作同步/design-qa-sidebar-glass-focused-comparison.png`
- 状态：浅色、新建任务、Sidebar 展开、右侧栏和底部面板关闭。
- 归一化：全屏源图等比缩放并补黑至 1280 × 720；聚焦源图裁出窗口左列后缩放至 256 × 720，与实现的 256 × 720 侧栏并排。

### Findings 与修复

- [P1] 整列侧栏并非同一毛玻璃材质：旧实现只有顶部 50px 使用半透明 CSS 模糊，下方 Sidebar 为不透明背景。已由单个全高材质层替代。
- [P2] 侧栏右边框在标题栏处断开：旧实现的边框属于从 50px 开始的 Sidebar 容器。已改为从顶部到底部连续绘制的一条边框，并移除下方容器的重复边框。
- [P2] 移动窗口时存在重复模糊层合成风险：已移除 WebView CSS `backdrop-filter`，统一由 Wails 原生 backdrop 负责模糊。
- [P3] 红黄绿控件略低：原生隐形标题栏由 48px 调整为 46px。浏览器不呈现系统窗口控件，最终位置仍需在本项目生成的原生窗口中观察。

### 必查视觉面

- 字体与文案：未改动，Geist、中文回退、字号、字重和现有文案保持一致。
- 间距与布局：侧栏仍为 256px；全高背景、内容层和标题栏左段在 x=0–256 对齐，展开/收起均无页面溢出。
- 颜色与 token：使用 `sidebar`、`sidebar-border` 语义 token；背景透明度为 80%，未写死业务颜色。
- 图像与图标：品牌 SVG 与 Lucide 图标未替换、未降质。
- 交互状态：Sidebar 展开/完全收起、全局搜索、任务输入均复测；控制台无 error/warning。

### 第三轮结论

第三轮全屏与侧栏聚焦对照未发现剩余 P0/P1/P2 视觉差异。浏览器计算样式确认全高层为 256 × 720、80% 侧栏背景、单一 1px 右边框，标题栏与下方 Sidebar 内容背景均为透明；收起后材质层与 Sidebar 同时移出视口。

## 验收项

- [x] 1440 × 900 无横向或纵向页面溢出。
- [x] 960 × 640 无横向或纵向页面溢出，欢迎区与输入区不重叠。
- [x] Sidebar、Command、ContextMenu、Tabs、Resizable/Sheet、Tooltip、Sonner 已接入真实页面。
- [x] 全局搜索可筛选并导航到管理页。
- [x] 右侧栏、底部面板可打开与关闭，窄窗口右侧栏使用覆盖层。
- [x] 输入区可编辑并产生诚实的 Mock 反馈，不调用业务服务。
- [x] 默认主内容不显示聊天页签；仅保留后续文件/内容打开时的页签能力边界。
- [x] Sidebar 完全收起后占位宽度为 0px，无残留图标栏。
- [x] 输入区计算背景为 `oklch(1 0 0)`、不透明度为 `1`。
- [x] 输入区聚焦后仍为 1px `input` 边框，无额外可见聚焦描边。
- [x] 侧栏展开时标题栏左段和下方内容均透明叠加在同一全高原生毛玻璃材质层上。
- [x] 侧栏收起后标题栏恢复完整底边，页面无横向或纵向溢出。
- [x] 整列侧栏使用单个全高半透明材质层，不再分成标题栏和内容区两层。
- [x] 侧栏右边框从窗口顶部连续到底部，且不存在重复边框。
- [x] 整列材质层使用 60% 侧栏语义色；tab、hover、选中和 active 状态均为可辨识的半透明表面。
- [x] Sidebar 可拖拽边缘与 hover 线从标题栏顶部连续到底部。
- [x] 完整标题栏继承 Wails `drag`，仅四个真实交互按钮为 `no-drag`；四边和四角继续由 AppKit 原生缩放优先处理。
- [x] 根节点使用稳定的 100% 宽高，Sidebar 和材质层不再依赖 fixed 或动态视口高度。
- [x] WebView 侧栏不再使用 CSS `backdrop-filter`，Wails 原生 backdrop 继续启用。
- [x] 无 Card 嵌套，当前页面没有 Card 墙。
- [x] 图标按钮具有可访问名称，Dialog/Sheet 具有标题和说明。
- [x] TypeScript 与 Vite production build 通过。
- [x] Go 桌面外壳测试通过。
- [x] `wails3 build` 通过并生成 macOS 本地二进制。
- [x] `wails3 package` 通过并生成 `bin/aestival.app`；已检查原生窗口外观和缩放后的稳定状态。

## 保留项

- 管理页当前仅有页面骨架，知识库、应用、能力、任务的数据操作留待后续任务。
- 本轮不实现模型、工具、文件、终端、知识库或任务调度业务逻辑。
- production bundle 仍有大于 500 kB 的 chunk 警告，后续随路由和页面扩展实施按域拆包。
