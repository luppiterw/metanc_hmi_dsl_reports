# Project Report

## 1. 报告目标

本报告总结 2026-04-21 这轮工作的四个连续主题：

- 按用户反馈继续收紧 Web 顶部栏的节奏和控件尺寸
- 找出 QML 顶部栏仍然显示为两行的真实原因，并把它改回与 Web 一致的单行结构
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

### 5.3 核心回归

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
- 快照、离屏基线、`CHANGELOG.md` 与 session report 已同步更新
- 生成验证已重新通过
- 仓库状态已准备好导出同步到 `MetaNC/nrt/hmi`
