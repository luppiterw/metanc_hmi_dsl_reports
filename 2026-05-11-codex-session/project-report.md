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
- 后续按检查请求再次刷新 Web、Qt/QML、server/distribution 和 docs_html：
  - Web entry: `generated/web/index.html`
  - Web bundle: `generated/web/assets/web-client.bundle.js`
  - QML entry: `generated/qml/Main.qml`
  - QML executable: `generated/qml-final/appCNC_HMI_DSL`
  - server binary: `generated/server-build/server`
  - docs portal: `docs_html/index.html`
  - latest session report: `docs_html/reports/2026-05-11-codex-session/index.html`
- 修复 Diagnostics Logs 刷新时滚动位置跳回顶部：
  - Web Logs 记录 `data-log-id` 行锚点，并同时处理 `.log-table-panel`
    内部滚动和外层 `pageShell` 滚动。
  - `renderPage()` 在同页数据刷新并替换内容时保留外层 page scroll；
    真正切换页面或切换 Program document 时仍按既有逻辑回到顶部。
  - QML Logs `ListView` 记录 row id、anchor offset 和 `contentY`，普通
    refresh 后恢复当前 viewport，显式 reset refresh 返回顶部。
  - 分发版 Web 启动脚本修正 `--restart PORT` 参数解析，并保留 generated
    Web `config.js` 的 hybrid 默认配置，不再在 packaging 阶段覆盖成 strict 空
    server URL。
- 落地 Web/QML parity tracking 第一版：
  - 新增 `docs/client/web_qml_parity.md` 和
    `docs_i18n/zh-CN/client/web_qml_parity.md`。
  - 覆盖 Shell、MAIN、软面板、PROG DIR、PROG EDIT、Diagnostics Logs、
    DEBUG Query、Runtime Transport/Reconnect 八个模块。
  - 矩阵记录 `Contract / State`、Web 状态、QML 状态、差异类型、验证方式、
    优先级和 follow-up。
  - 接入英文/中文 SUMMARY、client index、status matrix 和 i18n 状态。
  - 新增 `tests/test_web_qml_parity_docs.py`，检查状态枚举、差异枚举、
    P0 verification/follow-up、英文/中文矩阵行一致性和导航入口。
- 落地 QML parity smoke harness 第一版：
  - 新增 `client/qml_client/main_qml_parts/smoke_testing.py`，向 generated
    `Main.qml` 暴露 `smokeReadProperty()`、`smokeReadLocalState()`、
    `smokeInvokeCommand()`、`smokeRunDebugQuery()` 和 `smokeExportState()`。
  - 更新 generated `main.cpp` 支持 `HMI_QML_SMOKE_SCRIPT`、
    `HMI_QML_SMOKE_RESULT_PATH`、`HMI_QML_SMOKE_DELAY_MS` 和
    `HMI_QML_SMOKE_TIMEOUT_MS`。正常运行不设置这些环境变量时不触发 smoke。
  - 新增 `tests/qml_smoke/main_mode_switch.js` 和
    `tests/qml_smoke/debug_query_axis.js`。
  - 新增 `tests/test_qml_smoke.py`，在 `QT_QPA_PLATFORM=offscreen` 下临时生成、
    构建并运行 QML executable，读取 JSON result 断言 MAIN mode switching 和
    DEBUG `x` / `x axis` 查询。
  - 更新 Web/QML parity matrix、中文 overlay、status matrix、CHANGELOG 和
    QML snapshot，把第一批 QML runtime smoke 作为明确 verification evidence。

## Validation

- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
- `python3 -m unittest tests.test_generator_refactor`
- `python3 -m unittest tests.test_pipeline`
- `./tools/generate_targets.sh`
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-05-11-codex-session`
- `mdbook build submodules/metanc_hmi_dsl_reports`
- `./tools/build_docs_html.sh`
- `git diff -- generated/qml/Main.qml generated/qml/RuntimeStore.qml generated/web/app.js generated/web/runtime.js generated/distribution/contract/runtime_contract_bundle.json tests/snapshots/qml/RuntimeStore.qml.snap`
- headless Chromium CDP probe for Diagnostics Logs viewport preservation:
  `120` rows -> scroll to visible `probe-0075` -> refresh to `123` rows ->
  visible row remains `probe-0075`.
- `python3 -m unittest tests.test_web_qml_parity_docs`
- `python3 -m unittest tests.test_web_qml_parity_docs tests.test_docs_portal`
- `python3 -m unittest tests.test_qml_smoke`
- `python3 -m unittest tests.test_qml_smoke tests.test_generator_refactor tests.test_web_qml_parity_docs`
- `git diff --check`

Validation result: tests passed, final artifacts regenerated, tracked generated
outputs remained unchanged for the structural split, and the Logs refresh probe
kept the visible row stable after new rows arrived. The parity matrix docs test
and docs portal test passed. The QML smoke harness built and ran offscreen,
covering MAIN mode switching and DEBUG axis queries. The final artifact refresh
also completed without creating unrelated source changes.

## Current File Sizes

- `client/qml_client/generator.py`: 375 lines
- `client/qml_client/main_qml_parts/header_body.py`: 210 lines
- `client/qml_client/main_qml_parts/stage_body.py`: 117 lines
- `client/qml_client/main_qml_parts/program_search.py`: 391 lines
- `client/qml_client/main_qml_parts/program_navigation.py`: 65 lines
- `client/qml_client/main_qml_parts/program_search_state.py`: 41 lines
- `client/qml_client/main_qml_parts/program_search_engine.py`: 71 lines
- `client/qml_client/main_qml_parts/smoke_testing.py`: 50 lines
- `tests/test_qml_smoke.py`: 109 lines

## Follow-Up Plan

The next QML source-level split should stay away from `Main.qml` top-level
template body unless there is a direct maintenance need. Better next candidates:

1. Extend QML smoke coverage to PROG editor actions first: Goto natural line,
   Search/Replace, and Save persistence.
2. Add QML Logs viewport smoke after the harness can address visual list anchors
   reliably.
3. Add strict-server QML reconnect smoke by controlling the native server
   lifecycle from the Python harness.
4. Only then split the remaining Program search/editor action assembler into
   search-actions and editor-actions, using the new smoke tests to reduce
   regression risk.
