# Project Report

## Scope

本轮继续执行 QML generator source decomposition。目标仍然不是拆最终
generated QML 文件，而是先把 `client/qml_client/generator.py` 中可独立维护
的 body assembly 移入 `client/qml_client/main_qml_parts/`，让入口文件逐步
收敛成模板插入点和生成入口。

本轮具体处理顶部 header body：包括 top status shell、masthead title、
status chip flickable row、隐藏的 operations quick toggle、theme selector
和 settings icon button。拆分后 `Main.qml` 输出保持 byte-stable。

## Completed Work

- 新增 `client/qml_client/main_qml_parts/header_body.py`：
  - `build_header_body()` 负责 header `Rectangle` body assembly。
  - 输入仍来自既有 masthead brand context 和 shared ComboBox style。
  - 保留 `statusColumn`、`statusChipRow`、`operationsToggleButton`、
    `themeSelector`、`settingsHeaderButton` 与 `openSettingsPanel()` 行为。
- 更新 `client/qml_client/generator.py`：
  - 引入 `build_header_body()`。
  - `_build_main_qml()` 只保留 header body 插入点。
  - 文件行数从 560 行降到 375 行。
- 更新 `client/qml_client/main_qml_parts/__init__.py`：
  - 在 `QML_MAIN_PART_NAMES` 中登记 `header_body`。
- 更新 `tests/test_generator_refactor.py`：
  - 增加 header body builder contract 检查。
  - 锁定 header 关键 marker 的顺序，避免后续拆分误删 header 行为。
- 更新 README、CHANGELOG、status matrix、code map 和 agent handoff
  文档，英文与中文 docs_i18n 均记录 header body 已拆出。
- 重新生成最终产物：
  - Web output: `generated/web`
  - QML project: `generated/qml`
  - native server: `generated/server-build/server`
  - QML executable: `generated/qml-final/appCNC_HMI_DSL`
  - distribution: `generated/distribution`

## Validation

- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
- `python3 -m unittest tests.test_generator_refactor`
- `python3 -m unittest tests.test_pipeline`
- `./tools/generate_targets.sh`
- `git diff -- generated/qml/Main.qml generated/qml/RuntimeStore.qml generated/web/app.js generated/web/runtime.js generated/distribution/contract/runtime_contract_bundle.json tests/snapshots/qml/RuntimeStore.qml.snap`

Validation result: tests passed, final artifacts regenerated, and tracked
generated outputs remained unchanged for the structural split.

## Current File Sizes

- `client/qml_client/generator.py`: 375 lines
- `client/qml_client/main_qml_parts/header_body.py`: 210 lines
- `client/qml_client/main_qml_parts/stage_body.py`: 117 lines

## Follow-Up Plan

The remaining QML source-level target is the `Main.qml` top-level template body.
That split should be handled carefully because it owns the outer
`ApplicationWindow` properties, shortcuts, lifecycle hooks, `ColumnLayout`
assembly, Alt-drag mouse area, and helper insertion order.

Suggested next slice:

1. Create a `main_qml_parts/window_template.py` or similarly named module only
   after defining the exact boundary.
2. Keep `generator.py` as the public `generate_qml()` entrypoint.
3. Move only low-risk top-level template assembly into a builder.
4. Preserve the helper insertion order and generated `Main.qml` byte stability.
5. Add marker-order tests before changing the template body.
