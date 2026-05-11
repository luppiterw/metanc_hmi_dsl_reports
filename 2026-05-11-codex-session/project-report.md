# Project Report

## Scope

本轮继续执行 QML generator source decomposition。目标仍然不是拆最终
generated QML 文件，而是先把 `client/qml_client/generator.py` 中可独立维护
的 body assembly 移入 `client/qml_client/main_qml_parts/`，让入口文件逐步
收敛成模板插入点和生成入口。

本轮具体处理顶部 header body：包括 top status shell、masthead title、
status chip flickable row、隐藏的 operations quick toggle、theme selector
和 settings icon button。拆分后 `Main.qml` 输出保持 byte-stable。

随后继续处理当前最大且仍混合职责的 `main_qml_parts/program_search.py`。
本轮只做第一阶段低风险拆分：抽出 Program navigation/Goto、Search/Replace
local state、search matching engine 三块；动作层仍留在兼容 assembler，避免
一次性移动 replace、clipboard、execution preflight 和 local Program action
行为。

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
- 新增 Program search 二级 fragments：
  - `program_navigation.py`: editor page navigation、cursor line、document
    line count、Goto parse、cursor move、program content write helpers。
  - `program_search_state.py`: Search/Replace panel open、query、replace、
    match-case、whole-word、current index、match count、local state setter。
  - `program_search_engine.py`: match finding、whole-word check、search
    snapshot、status text。
- 将 `program_search.py` 收敛为兼容 assembler，并新增
  `QML_PROGRAM_SEARCH_PART_NAMES` 锁定 fragment 顺序。
- `program_search.py` 从 522 行降到 391 行；新增 fragment 文件分别为
  65、41、71 行。
- 更新 generator refactor 测试，锁定 Program navigation、Search state、
  Search engine 和 Search action marker 顺序。
- 更新 README、CHANGELOG、status matrix、code map 和 agent handoff
  文档，英文与中文 docs_i18n 均记录 header body 与 Program search
  低风险 fragments 已拆出。
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
- `client/qml_client/main_qml_parts/program_search.py`: 391 lines
- `client/qml_client/main_qml_parts/program_navigation.py`: 65 lines
- `client/qml_client/main_qml_parts/program_search_state.py`: 41 lines
- `client/qml_client/main_qml_parts/program_search_engine.py`: 71 lines

## Follow-Up Plan

The next QML source-level split should stay away from `Main.qml` top-level
template body unless there is a direct maintenance need. Better next candidates:

1. Split the remaining Program search/editor action assembler into
   search-actions and editor-actions once there is time to verify replace,
   clipboard, preflight, and local Program actions carefully.
2. Split `main_qml_parts/debug_query.py` if DEBUG natural-query work continues.
3. Split `main_qml_parts/log_view.py` or `widget_fragments/logs.py` before the
   next Logs UI expansion.
