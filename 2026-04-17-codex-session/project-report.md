# Project Report

## 1. 报告目标

本报告总结 2026-04-17 这轮工作的两个连续目标：

- 把 `metanc_hmi_dsl` 仓库与新的 `MetaNC/nrt/hmi/` 包结构建立稳定的双向同步与验证链路
- 在这一同步基础上，对 Web 和 QML 目标执行一轮统一的大布局重构，并更新可维护的文本 / 图像基线

最终目标不是只让某一侧“看起来没问题”，而是让以下四件事同时成立：

- 当前仓库可以稳定生成最终产物
- `MetaNC/nrt/hmi` 可以稳定接收同步结果并重新生成最终产物
- Web/QML 两个目标在壳层与重点页面布局上继续保持同源一致
- 快照和报告资产能够反映这轮真实的最终状态，而不是停留在旧基线

## 2. 证据范围

本报告对应 2026-04-17 当天在当前工作区完成的一组修改，核心范围包括:

- `tools/export_to_metanc.sh`
- `tools/import_from_metanc.sh`
- `tools/build_docs_html.sh`
- `tools/generate_targets.sh`
- `tools/hmi_dsl/docs_portal.py`
- `tools/hmi_dsl/story_docs.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/web_runtime_shell.py`
- `tools/hmi_dsl/generators/web_widget_emitters.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`
- `tools/hmi_dsl/validator.py`
- `tests/test_pipeline.py`
- `tests/snapshots/web/*`
- `tests/snapshots/qml/*`
- `docs/superpowers/specs/2026-04-17-qml-web-layout-overhaul.md`
- `docs/superpowers/plans/2026-04-17-qml-web-layout-overhaul.md`
- `docs/superpowers/diagrams/2026-04-17-qml-web-layout-overhaul-current-vs-target.*`

## 3. 本轮处理前的主要问题

### 3.1 同步链路仍然停留在旧的 MetaNC 根目录假设

原始导出流程仍然以 `MetaNC/` 根目录作为 HMI 内容根，而真实下游包已经迁到 `MetaNC/nrt/hmi/`。这使得导出、测试和构建在宿主仓库中的定位全部存在偏差。

### 3.2 当前仓库与下游包目录的权威来源不清晰

如果不先比对 `MetaNC/nrt/hmi` 已有改动，当前仓库导出就可能把下游已经修正过的生成器实现覆盖回旧版本。这个问题在布局相关生成器和运行时脚本中尤其危险。

### 3.3 Web 和 QML 需要一轮真正的“大布局调整”

在同步安全问题基本梳理完后，新的核心需求变成了统一重构 Web/QML 的布局，而不是继续做局部修补。

这轮布局重构的关键点是：

- 保留 `顶部栏 + 中间舞台 + 底部栏` 的基本框架
- 把 `ops panel` 收敛为一个明确的右侧 docked drawer
- 优先重做 `overview` 和 `program` 两个页面的空间分配
- 把“壳层规则”与“页面局部规则”分开，而不是继续在单页面上叠加特殊处理

### 3.4 现有基线不能再作为这轮布局改造的真值

一旦壳层和页面比例被系统性调整，旧的 text snapshots 和 QML 离屏图必然失效。如果不同步刷新基线，测试结果只会持续报告预期内的旧快照差异，失去回归价值。

## 4. 方案与实现

### 4.1 先稳住双向同步边界

同步策略继续限定在共享 HMI 包源码范围：

- `.gitignore`
- `AGENT.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `docs/`
- `examples/`
- `tests/`
- `tools/`

并明确排除：

- `generated/`
- `docs_html/`
- `build_html/`
- `tools/export_to_metanc.sh`
- `tools/import_from_metanc.sh`

这样宿主仓库级信息不会反向污染 DSL 源仓库，而 DSL 源仓库自己的同步工具也不会被导出到 `MetaNC/nrt/hmi/`。

### 4.2 用 superpowers 资产固定布局改造方向

为了避免这次大布局调整再次退化成零散修补，本轮先建立了显式的布局改造资产：

- `docs/superpowers/specs/2026-04-17-qml-web-layout-overhaul.md`
- `docs/superpowers/plans/2026-04-17-qml-web-layout-overhaul.md`
- `docs/superpowers/diagrams/2026-04-17-qml-web-layout-overhaul-current-vs-target.json`
- `docs/superpowers/diagrams/2026-04-17-qml-web-layout-overhaul-current-vs-target.svg`

这套资产把本轮方向冻结为：

- 保留现有壳层范式
- 改成右侧可折叠 docked ops drawer
- 优先 `overview` / `program`
- 桌面固定舞台优先，小窗口退化
- 工业高密、操作区分明确、机床控制台感更强

### 4.3 Web 壳层重构

Web 端主要修改集中在 `web.py` 和少量 `web_runtime_shell.py`：

- 顶栏改成更清晰的 frame 化结构
- `runtime-notice` 改成 `dot + label + message`
- `page-stage` 内部重构为 `stage-main-column + stage-ops-column`
- `ops panel` 从“页面内容旁边的附属块”改成明确的右侧抽屉列
- footer 改成更明确的 action rail

同时保留现有 runtime 绑定的 DOM id，避免纯布局修改意外破坏 runtime 行为。

### 4.4 QML 壳层重构

QML 端在 `qml.py` 中镜像了同一组结构决策：

- masthead 宽度钳制到统一 shell 宽度
- 维持顶部 / 中部 / 底部三段式壳层
- 中间舞台改成固定主舞台 + 右侧 ops drawer
- footer rail 与 Web 的 action rail 模型保持一致

同时在 `qml_widget_emitters.py` 中加入新的 layout hints，让 `overview` 与 `program` 页的容器比例可以通过节点级 hint 而不是侵入式改 retained YAML。

### 4.5 overview / program 第一轮 page-level 比例调整

在壳层稳定之后，本轮继续做了第一层页面比例调整：

**overview**

- 主舞台左右列比例重新分配
- 左列从“上重下轻”改成更明确的上下分区
- 过程区改为非均分，给运动/统计区更清晰的视觉层级

**program**

- program root / browser root 改成统一的 `auto + minmax(0,1fr) + footer` 结构
- editor 与 directory panel 的高度链收齐
- browser list 支持在 panel 内持续伸展，而不是只依赖固定高度

这些调整的目的不是最终美术定稿，而是先把“结构正确、比例可控、壳层统一”的骨架建立起来。

### 4.6 基线更新

本轮完成了两类基线更新：

**已更新**

- Web text snapshots
  - `tests/snapshots/web/index.html.snap`
  - `tests/snapshots/web/styles.css.snap`
  - `tests/snapshots/web/app.js.snap`
- QML text snapshots
  - `tests/snapshots/qml/Main.qml.snap`
- QML 离屏图基线
  - `tests/snapshots/qml/main_window.offscreen.png`

**未更新**

- Web 浏览器截图基线

原因不是实现错误，而是本机缺少：

- Playwright 安装目录
- Web 浏览器运行时库目录

因此 `test_web_browser_snapshot_matches_baseline` 继续按现有测试策略被跳过。

## 5. 验证结果

### 5.1 当前仓库

已完成：

- `python3 -m unittest -v tests.test_story_docs tests.test_docs_portal tests.test_pipeline`
- `HMI_ENABLE_QML_VISUAL_SNAPSHOT=1 python3 -m unittest -v tests.test_pipeline`
- `./tools/generate_targets.sh`

结果：

- 文本快照已与新布局对齐
- QML 离屏图基线已与新布局对齐
- Web/QML 生成正常
- QML 编译正常
- distribution 打包正常
- Web 浏览器截图基线因环境依赖缺失而跳过

### 5.2 下游 `MetaNC/nrt/hmi`

在本轮更新后，计划同步到 `MetaNC/nrt/hmi` 的共享范围仍保持清晰：

- 共享模块源码可通过 `export_to_metanc.sh` 同步
- reports 子模块、当前仓库专用同步脚本和生成产物仍然不会被导出

本轮在下游验证时关注的重点是：

- 导出后共享代码是否完整到达 `MetaNC/nrt/hmi`
- 下游包目录是否仍能独立执行测试与一键生成

## 6. 相关文档更新

本轮“相关文档”不仅指 session report 自身，还包括：

- superpowers 规格、计划和当前/目标结构图
- report aggregate index 中的 2026-04-17 入口
- 当前仓库 docs portal 中的 report timeline 与 latest report

这样布局重构不只是代码事实，也成为可回顾、可继续推进、可同步到下游的显式工程资产。

## 7. 结论

2026-04-17 这轮工作最终形成了两个稳定结果：

1. `metanc_hmi_dsl` 与 `MetaNC/nrt/hmi` 之间的同步边界、导出方向和验证方式被明确下来
2. Web/QML 的壳层和重点页面完成了一轮真正的统一布局重构，并配套更新了可维护基线

这意味着后续再继续收 `overview` / `program` 的细节时，已经不需要再从“如何搭壳层”开始，而是可以直接基于这轮新的统一骨架继续精调。
