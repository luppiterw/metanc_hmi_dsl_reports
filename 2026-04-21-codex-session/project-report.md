# Project Report

## 1. 报告目标

本报告总结 2026-04-21 这轮工作的九个连续主题：

- 继续收紧 Web 顶部栏的横向节奏和控件尺寸
- 找出 QML 顶部栏仍然显示为两行的真实原因，并把它改回与 Web 一致的单行结构
- 把软面板改成 Web / QML 默认展开状态
- 压平主体区域多余的结构壳层，减少嵌套边框和边距对主显示区的侵占
- 重新分配共享软操作面板的宽度与 row / cluster 空间，让按钮完整显示
- 继续收 overview 主页冗余结构，移除 `Axis / Metric / Value` 这类重复标题
- 把 overview 左列重新整理为 `AXIS -> F/S -> RUNTIME` 的单列信息流，并让 `AXIS` / `F/S` 按内容高度收起，避免无意义空白与滚动条
- 再做一轮只针对 QML 的 stage / footer 收口，让主页主体左右边界和 footer 对齐、左右两列顶部对齐，并修复 `System ready` notice rail 的文字显示与垂直居中
- 刷新生成快照、离屏基线、pipeline 验证、当日 report 与 aggregate 索引，并准备把最新仓库状态导出同步到 `MetaNC/nrt/hmi`

这轮工作的重点不是单点样式微调，而是沿着用户当天连续反馈，把 header、ops shell、overview 页面和 QML 专项问题逐层收口到稳定可交付状态。

## 2. 证据范围

本报告对应 2026-04-21 当天在当前工作区完成的一组连续修改，核心范围包括：

- `src/hmi_dsl/ui.structure.yaml`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/generators/qml_page_fragments.py`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`
- `CHANGELOG.md`
- `tests/snapshots/web/app.js.snap`
- `tests/snapshots/web/index.html.snap`
- `tests/snapshots/web/styles.css.snap`
- `tests/snapshots/qml/Main.qml.snap`
- `tests/snapshots/qml/main_window.offscreen.png`
- `submodules/metanc_hmi_dsl_reports/2026-04-21-codex-session/*`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-21-codex-session.md`

## 3. 本轮处理前的主要问题

### 3.1 QML 顶部栏并不是“差一点对齐”，而是结构上仍然是两行

继续检查 QML 生成模板后，真实问题很快收敛出来：

- 第一行是标题组和右侧控件
- 第二行是状态条 `Item + Flickable`

因此用户看到的“两行”不是样式没调好，而是生成器本来就在输出两层头部结构。

### 3.2 软面板默认收起，而且默认展开后主体区域仍然被结构壳层吃掉空间

在 header 修正之前，主界面还同时存在两类问题：

- 软面板默认收起，进入页面后还要额外点一次 `Show Ops`
- 主舞台外面还有多层只是为了布局而存在的 card shell，导致可用区域被边框和 padding 层层吞掉

### 3.3 overview 主页左列仍然保留冗余表头和明显空白

当 header 和 ops shell 稳下来后，用户继续把问题收敛到 overview 主页本身：

- `AXIS` 区域还保留 `Axis` 这种重复表头
- `RUNTIME` 区域还保留 `Value` 这种重复表头
- `AXIS` 和 `F/S` 区域有“被最小高度撑出来”的大块空白
- 左列需要明确成为 `AXIS -> F/S -> RUNTIME` 的单列信息流

### 3.4 QML overview 还有 page fragment 和 footer shell 级别的问题

在 Web 版 overview 已经相对稳定之后，QML 继续暴露出三类更深层的问题：

- 主体内容左右边界没有和 footer 对齐
- 左右两部分没有像 Web 一样从顶部自然排布
- footer 的 `System ready` notice rail 文字几乎看不见，也没有垂直居中

这说明问题已经超出单个 panel 的 margin 或 fillHeight，而进入页面级结构。

## 4. 方案与实现

### 4.1 头部和共享 ops shell 先按结构统一收口

在 overview 主页之前，这轮先把 header 和 ops shell 这条主线收稳：

- Web 顶部栏继续拉开标题区、状态胶囊和右侧控件组的节奏
- QML 顶部栏直接重排成和 Web 一样的单行结构
- Web / QML 的软面板默认状态统一改成展开
- 主舞台外围只负责布局的结构节点回退成 plain shell，而不再继续画 card 外观

这样后续用户看到的差异，就能更明确地收敛到 overview 页面本身，而不是继续混着 header / ops panel 的旧问题。

### 4.2 共享软面板宽度和按钮区重新围绕真实按钮文案分配

这一步没有只改一个按钮高度，而是把 panel 宽度和 row / cluster 一起收：

- Web 端重新分配 `ops_command_row`、`ops_override_row`、`ops_selection_row` 等关键行的列宽
- QML 端重新收 `preferredWidth` 和 panel 宽度
- 默认展开状态下直接以可读、可点、文案完整显示为目标

结果是两端都围绕“默认展开的侧栏”重新做了一次空间分配，而不是继续沿用“默认收起时”的尺寸假设。

### 4.3 overview 主页继续去冗余并压缩到一页内

用户随后继续指出 overview 左列的真实冗余和空白来源：

- `AXIS` 区域不应该再显示 `Axis` 这种重复表头
- `RUNTIME` 区域的 `Value` 标题也是冗余的
- `AXIS` 和 `F/S` 区域不应该被固定最小高度撑出大块空白

这一步同时改 retained YAML 和生成器布局约束：

- retained `ui.structure.yaml`
  - 去掉 `main_axis_table` 的 `max_height: 300`
  - 清空 overview 里 `axis` / `value` 的表头 label
  - 保持 `main_process_row` 为纵向布局，使左列明确落成 `AXIS -> F/S -> RUNTIME`
- Web / QML 生成器
  - 取消 overview 左列这些块的强制高度占满
  - 把 `AXIS`、`F/S`、runtime summary stack 的高度改回内容驱动
  - 保持 intentionally blank 的表头在生成产物里继续为空，不回退成默认 key

结果是 overview 主体在 Web 端先回到一页内可见，也为后续专门收 QML 的 stage / footer 对齐提供了更干净的基础。

### 4.4 QML overview 再做一轮专门的 stage / footer 对齐修复

当 Web 版 overview 已经稳定后，用户继续指出 QML 还有三类明显问题：

- 主体内容左右边界没有和 footer 对齐
- 左右两部分并没有像 Web 一样从顶部自然排布
- footer 的 `System ready` notice rail 文字没显示出来，而且也没有在栏内垂直居中

这一步真正的问题不在数据表本身，而在 QML page fragment 和 footer shell：

- page fragment 仍然让 overview 内容“铺满整个 viewport”，没有复用 footer 的 stage 内边界
- 左列还是会在高 viewport 中漂移，而不是像 Web 一样贴着顶部开始排
- footer notice rail 使用 `anchors.fill` 叠加 `implicitHeight`，导致文字区域被压坏

对应处理分成三部分：

- `qml_page_fragments.py`
  - 针对 `machine_console_root` 这一页增加独立的 `stageEdgeInset`
  - 把 overview 内容改成顶部锚定和自然内容高度，而不是继续强行撑满 Flickable 高度
- `qml_widget_emitters.py`
  - 把 `main_left_column` 改成顶对齐
  - 保留 `main_runtime_panel` 填充高度，但显式顶对齐
  - 避免 overview 左列数据表再被通用 `fillHeight` 规则拉伸
- `qml.py`
  - 为 footer notice rail 补上稳定的最小高度
  - 改用左右锚定 + 垂直居中的 `RowLayout`
  - 让 `noticeTextItem` 本身也显式走 `Text.AlignVCenter`

### 4.5 当日 report、aggregate 索引和 user-history 一起补齐

这轮没有只更新代码和快照。
为了让当天后半段的 overview/QML 修复也能在报告体系里被追溯，本轮同步补了：

- `2026-04-21-codex-session/user-history.md`
- `2026-04-21-codex-session/README.md`
- `2026-04-21-codex-session/project-report.md`
- `2026-04-21-codex-session/conversation-report.md`
- `2026-04-21-codex-session/workflow-diagram.md`
- `2026-04-21-codex-session/architecture-diagram.md`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-21-codex-session.md`

这样今天后半段的工作不会只存在于代码 diff，也会同步出现在 aggregate report 的时间线和 session 入口里。

## 5. 验证结果

### 5.1 生成与构建

已执行：

- `./tools/generate_targets.sh`

结果：

- Web 产物已刷新
- QML 工程与 `generated/qml-final/appCNC_HMI_DSL` 已重建
- docs portal 已重建
- report aggregate HTML 与当日 session HTML 已重建

### 5.2 QML 正常场景离屏确认

已执行：

- `env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/hmi_qml_fix2.png HMI_QML_SNAPSHOT_DELAY_MS=800 ./generated/qml-final/appCNC_HMI_DSL`

结果：

- overview 主舞台左右边界已经和 footer 对齐
- 左列 `AXIS -> F/S -> RUNTIME` 重新回到顶部排布
- footer notice rail 已恢复显示 `System ready`

### 5.3 QML `Hide Ops` 场景离屏确认

为确认“隐藏侧栏后右边界也仍然正确”，这轮还临时构建了一个 `operationsPanelVisible=false` 的验证版本并截图。

结果：

- `Hide Ops` 场景下 overview 主体右边界依然和 footer 对齐
- 右侧不再出现用户指出的那种“主体部分右侧没有与底部右侧对齐”的偏移

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

- Web 顶部栏完成一轮节奏收口
- QML 顶部栏从两行结构回到与 Web 一致的单行结构
- Web/QML 软面板已改成默认展开
- 主体结构容器已经从“继续画卡片”收回到“只负责布局”
- 共享软面板宽度和按钮区布局已经围绕完整显示重新分配
- overview 主页已经去掉多余的 `Axis / Metric / Value` 重复标题，并重新回到一页内优先显示的紧凑布局
- QML overview 主舞台已和 footer 共享同一组左右边界，左右两列回到顶部对齐，`System ready` notice rail 也恢复显示
- 快照、离屏基线、`CHANGELOG.md` 与 session report 已同步更新
- 生成验证已重新通过
- 仓库状态已准备好导出同步到 `MetaNC/nrt/hmi`
