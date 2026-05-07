# Project Report

## Scope

本轮工作围绕 2026-05-07 的 QML Logs 回归修复、PROG 编辑器工具状态收敛、
最终产物刷新、文档同步和 MetaNC 下游同步展开。重点不是新增 server log 能力，
而是让 QML target 与 Web Logs 页面已经具备的交互行为保持一致，同时把 PROG
编辑页面从执行态跟随中剥离，回到纯编辑器职责。

## Completed Work

- 拉取并检查 `metanc_hmi_dsl` 与 `MetaNC` 当前分支状态，为后续同步做准备。
- 重新生成 Web、QML、native server、distribution 和文档产物，确认本地最终产物可构建。
- 修复 QML Logs 表格中的 `font_family_ui` 主题字段引用。该字段不存在，会导致
  `Unable to assign [undefined] to QString`。
- 为 QML Logs 下拉框增加显式 option value 读取，避免依赖不同 Qt 版本上不稳定的
  `currentValue` 行为。
- 修复 QML Logs 的 `Filter` 和 `More` 面板点击后不显示的问题。根因是相关
  `visible`、`checked` 和高度绑定直接读取 `runtime.readLocalState()`，缺少
  `runtime.revision` 依赖，状态写入后 QML 不会重新计算绑定。
- 为 Logs toolbar 增加稳定宽度，压缩 Level、Time、Search 的默认宽度，并固定
  More 按钮宽度，避免窗口较窄时被挤压。
- 为 Clear Client Debug 和 Run Retention 的 QML 本地命令补齐服务端操作完成后的
  log refresh 闭环。
- 更新 QML 快照和 pipeline 测试，锁住 `font_family_ui` 不再回归、Logs 面板使用
  revision-aware helper 的生成结果。
- 更新客户端日志、视觉设计和状态矩阵文档，记录 QML Logs 面板状态绑定和溢出按钮
  布局约束。
- 清理 PROG 概念边界：`prog.cursor_line` 标记为 deprecated compatibility path，
  并在 interface 文档中继续明确编辑器光标不是后端属性写入。
- 调整 PROG/PROG EDIT/PROG DIR softkey 职责：`PROG` 保留 Select、Save、Save As、
  Edit、Check、Execute；`PROG EDIT` 聚焦 Undo、Redo、Cut、Copy、Paste、Search、
  Goto；`Block No.` 和 `Format` 入口隐藏但保留内部占位注释。
- Web/QML 的 Undo、Redo、Cut、Copy、Paste 使能状态改为读取编辑器真实状态，
  去掉 `programLoaded` 这类额外 gating，避免编辑后按钮不亮显。
- Web PROG EDIT 改为复用同一个 PROG 主内容编辑器，而不是切换到第二个编辑器实例；
  运行时刷新时不再销毁 CodeMirror 实例和 undo history。
- Runtime plan 现在会收集 `enabled_ref` 等 node props 中的运行时引用，使编辑器能力
  local state 可以出现在数据字典和 runtime usage 索引中。
- 重新生成 Web、QML、distribution、server build、数据字典和测试快照。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests`
- `python3 -m unittest -v tests.test_mock_runtime_server`
- `env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 python3 -m unittest tests/test_pipeline.py -v`
- `git diff --check`
- Headless Web probe verified CodeMirror editing: typing enables Undo, clicking Undo clears the
  inserted text and enables Redo.
- QML offscreen startup with Logs state forced open. The environment produced a
  `1x1` image, so it is useful for QML warning detection only, not visual proof.

## Follow-Up

- Add real interaction automation for generated QML controls. Current coverage still relies on
  generated text snapshots plus startup-level QML warning checks.
- Continue the generator decomposition plan so Logs widgets can be tested in smaller emitted units.
- Define the next PROG workspace mutation slice before enabling disabled file-management actions
  such as New Folder, Save As persistence, and full search/check tooling.
