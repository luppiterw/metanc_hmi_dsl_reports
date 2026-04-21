# Project Report

## 1. 报告目标

本报告总结 2026-04-21 这轮工作的六个连续主题：

- 按用户反馈继续收紧 Web 顶部栏的节奏和控件尺寸
- 找出 QML 顶部栏仍然显示为两行的真实原因，并把它改回与 Web 一致的单行结构
- 把软面板改成 Web / QML 默认展开状态
- 压平主体区域多余的结构壳层，减少嵌套边框和边距对主显示区的侵占
- 重新分配共享软操作面板的宽度与 row/cluster 空间，让按钮完整显示
- 刷新生成快照、QML 离屏基线、pipeline 验证与变更日志
- 补齐当前 session report，并把最新仓库状态导出同步到 `MetaNC/nrt/hmi`

这轮工作的重点不是继续微调“垂直对齐”，而是确认 QML 为什么在视觉上始终和 Web 不一致，然后直接改掉对应的生成结构。

## 2. 证据范围

本报告对应 2026-04-21 当天在当前工作区完成的一组连续修改，核心范围包括：

- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `CHANGELOG.md`
- `tests/snapshots/web/index.html.snap`
- `tests/snapshots/web/styles.css.snap`
- `tests/snapshots/qml/Main.qml.snap`
- `tests/snapshots/qml/main_window.offscreen.png`
- `submodules/metanc_hmi_dsl_reports/2026-04-21-codex-session/*`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-21-codex-session.md`

## 3. 本轮处理前的主要问题

### 3.1 Web 顶部栏虽然已基本对齐，但节奏仍然偏挤

在上一轮快速修正后，Web 版本已经回到同一排，但仍有两处明显需要再收：

- 标题区和状态胶囊之间的横向间距偏紧
- `Show Ops` 按钮和 theme selector 的视觉尺寸没有完全统一

### 3.2 QML 的核心问题不是“还差一点垂直对齐”，而是结构本身仍然是两行

继续检查 QML 生成模板后，真实问题很快收敛出来：

- 第一行是标题组和右侧控件
- 第二行是状态条 `Item + Flickable`

因此用户看到的“两行”不是样式没调好，而是生成器本来就在输出两层头部结构。

只继续给 `Layout.alignment: Qt.AlignVCenter` 或控件高度补丁，不能解决这个问题。

### 3.3 软面板默认收起，实际交互入口不够直接

在上一轮完成顶部栏修正之后，软操作面板仍然默认处于收起状态。
这会带来两个直接问题：

- 用户进页面后先要额外点一次 `Show Ops`
- 每次检查软面板排版都得靠额外交互才能看到真正目标状态

如果软面板已经是主界面的一等交互区，这个默认值就不合理。

### 3.4 主体区域仍然存在明显的“壳套壳”结构

继续看生成后的主画面后，问题不只在 header。
Web/QML 主体区域都还叠着几层结构性外壳：

- stage 外层 frame
- `display_shell`
- `screen_workspace`
- `main_left_column`
- `main_process_row`

这些容器本质上只是布局结构，但仍然在生成结果里继续画背景、边框和 padding，导致主内容区域被多圈外壳和空白层层吞掉。

### 3.5 软操作面板在 Web 端最容易出现按钮挤压

继续检查软面板布局后，真实问题集中在两类：

- 侧栏宽度偏窄
- row / cluster 的列宽分配更像“理论布局”，不是围绕真实按钮文案收出来的

其中 Web 端最明显，因为：

- `ops_increment_cluster` 需要四个按钮
- `ops_command_row` 有 `Restart Line` / `Open Diag`
- `ops_override_row` 同时容纳 gauge 和两列控制按钮

当侧栏宽度太紧时，这些按钮最容易先被压得不完整。

## 4. 方案与实现

### 4.1 Web 继续按同一套壳层逻辑收口

在不改 retained contract 的前提下，这一轮 Web 顶部栏主要收了两类细节：

- 拉开标题组和状态胶囊之间的横向节奏
- 把 `Show Ops` 和 theme selector 的宽高观感进一步统一

具体调整包括：

- 顶部主行间距从 `14` 收到 `16`
- 标题区、状态条、右侧工具组的内部 gap 做了小幅增量调整
- `Show Ops` 最小宽度收口到 `116`
- theme selector 最小宽度收口到 `168`
- theme selector 和按钮的最小高度都保持在 `36`

结果是 Web 顶部栏在同一行内的留白节奏更接近真正的操作面板，而不是几个临时塞进去的控件。

### 4.2 QML 头部从“对齐修补”转成“结构修复”

QML 这轮的关键动作不是再调 padding，而是直接重排头部模板：

- 保留左侧 `MetaNC + 页面名`
- 把原来单独占一行的状态条 `Flickable` 提升到主 `RowLayout` 中间列
- 保留右侧 `Show Ops + theme` 控件组
- 移除左侧标题组之前错误的 `Layout.fillWidth` 占位，让中间状态条承担真正的弹性宽度

这样生成出来的 QML 结构就和 Web 的头部关系一致：

- 左侧：标题
- 中间：状态胶囊滚动条
- 右侧：toolbar actions

头部因此回到单行，而不是继续维持“视觉上想一行、结构上却是两行”的半修复状态。

### 4.3 快照、离屏基线和变更日志同步刷新

因为这轮改的是 generator 行为，所以不能只改模板而不补证据。

本轮同步更新了：

- Web 文本快照
  - `tests/snapshots/web/index.html.snap`
  - `tests/snapshots/web/styles.css.snap`
- QML 文本快照
  - `tests/snapshots/qml/Main.qml.snap`
- QML 视觉基线
  - `tests/snapshots/qml/main_window.offscreen.png`
- 仓库变更日志
  - `CHANGELOG.md`

其中 `CHANGELOG.md` 明确记录了一个关键事实：

- QML 头部不再只是“共用垂直中心线”
- 它现在也和 Web 一样使用单行头部布局

### 4.4 当日 session report 与 aggregate 报告入口一起补齐

为了避免这天的提交只有代码和快照，没有可追溯的过程记录，这一轮同时补了：

- 当前 session 的 `README.md`
- `project-report.md`
- `conversation-report.md`
- `workflow-diagram.md`
- `architecture-diagram.md`
- aggregate report 的 `src/index.md`
- aggregate report 的 `src/sessions/2026-04-21-codex-session.md`

这样当天的交付、验证、导出动作和最终资产位置都能在报告入口直接追到。

### 4.5 软面板默认改成展开状态

这轮把 Web 和 QML 的软面板默认状态统一改成“打开”：

- Web: `operationsPanelOpen = true`
- QML: `property bool operationsPanelVisible: true`

这样进入主界面时就直接能看到完整的硬件操作区，不需要先额外点击一次 `Show Ops`。

### 4.6 主体区域的结构外壳改成“只负责布局，不再继续画卡片”

这轮没有把所有 panel 都去掉，而是把真正只是结构分组的那几层单独挑出来，改成 plain shell：

- `display_shell`
- `screen_workspace`
- `main_left_column`
- `main_process_row`

处理方式在两端是同一方向：

- Web: 这些节点不再继续套 `widget-container` 的角色外观
- QML: 这些节点不再走带 role card 的 `Rectangle` 包裹，而是退回纯布局容器

与此同时，主 stage 的最外层装饰也一起压平：

- Web 去掉 `page-stage` / `stage-main-column` 的额外背景、边框、阴影和 padding
- QML 去掉 `stageFrame` 的装饰边框，并把内部 margin 收到最小

这样保留下来的边框主要来自真正有内容语义的 panel，而不是结构节点本身。

### 4.7 软操作面板宽度和行内分配一起收口

为了让按钮完整显示，这轮没有只改某一个按钮高度，而是同时调整侧栏宽度和行模板：

- Web:
  - 软面板宽度改成 `clamp(400px, 32vw, 460px)`
  - `ops_command_row` 从 `4` 列改成 `2` 列
  - `ops_override_row` / `ops_selection_row` / `ops_motion_row` 重新分配了列宽比例
  - 按钮统一增加了可用内边距和文字换行空间
- QML:
  - 软面板宽度改成 `Math.min(460, Math.max(400, Math.round(window.width * 0.32)))`
  - 各个 cluster 的 `preferredWidth` 改成更贴近侧栏宽度的值
  - 主舞台开放状态下的 `preferredStageWidth` 同步收窄，避免 panel 打开后整体继续挤压

结果是两端都围绕“默认展开的侧栏”重新做了一次空间分配，而不是继续沿用“侧栏默认收起时”的尺寸假设。

## 5. 验证结果

### 5.1 生成与构建

已执行：

- `./tools/generate_targets.sh`

结果：

- Web 产物已刷新
- QML 工程与 `generated/qml-final/appCNC_HMI_DSL` 已重建
- docs portal 已重建
- report aggregate HTML 与当日 session HTML 已重建

### 5.2 QML 单行头部离屏确认

已执行：

- `env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/metanc_qml_header_single_row.png HMI_QML_SNAPSHOT_DELAY_MS=800 ./generated/qml-final/appCNC_HMI_DSL`

结果：

- 离屏截图显示 `MetaNC / 页面名 / 状态胶囊 / Show Ops / theme` 已稳定处于同一条头部行内
- 视觉结果与 Web 当前结构一致

### 5.3 QML 默认展开软面板与主舞台压平确认

继续执行：

- `env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/metanc_ops_default_open.png HMI_QML_SNAPSHOT_DELAY_MS=800 ./generated/qml-final/appCNC_HMI_DSL`

结果：

- 软面板默认就是展开状态
- 主体区域外围的双层壳体已经明显减弱
- 软面板内的按钮都能完整显示，没有再出现被窄列硬压的情况

### 5.4 核心回归

已执行：

- `python3 -m unittest -v tests.test_pipeline`

结果：

- `27` 个测试通过
- `1` 个测试跳过

跳过项是按配置启用的 Web 浏览器视觉快照，需要显式设置：

- `HMI_ENABLE_WEB_VISUAL_SNAPSHOT=1`

## 6. 产出与交付状态

本轮结束时，当前仓库已具备以下状态：

- Web 顶部栏继续完成一轮节奏收口
- QML 顶部栏从两行结构回到与 Web 一致的单行结构
- Web/QML 软面板已改成默认展开
- 主体结构容器已经从“继续画卡片”收回到“只负责布局”
- 共享软面板宽度和按钮区布局已经围绕完整显示重新分配
- 快照、离屏基线、`CHANGELOG.md` 与 session report 已同步更新
- 生成验证已重新通过
- 仓库状态已准备好导出同步到 `MetaNC/nrt/hmi`
