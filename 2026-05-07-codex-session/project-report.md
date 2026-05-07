# Project Report

## Scope

本轮工作围绕 2026-05-07 的 QML Logs 回归修复、最终产物刷新、文档同步和
MetaNC 下游同步展开。重点不是新增 server log 能力，而是让 QML target 与 Web
Logs 页面已经具备的交互行为保持一致。

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

## Validation

- `./tools/generate_targets.sh`
- `env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 python3 -m unittest tests/test_pipeline.py -v`
- `git diff --check`
- QML offscreen startup with Logs state forced open. The environment produced a
  `1x1` image, so it is useful for QML warning detection only, not visual proof.

## Follow-Up

- Add real interaction automation for generated QML controls. Current coverage still relies on
  generated text snapshots plus startup-level QML warning checks.
- Continue the generator decomposition plan so Logs widgets can be tested in smaller emitted units.
