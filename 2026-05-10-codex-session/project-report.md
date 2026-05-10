# Project Report

## Scope

本轮工作继续推进 QML runtime source decomposition。目标不是改变 generated
QML 文件结构，而是把仍偏大的 `derived_state.py` 源码片段拆成更小的职责
block，降低后续维护 MAIN dashboard、Program browser derived view、axis
stream、motion output 和 execution pause/resume helper 时的耦合。
随后继续处理 `remote_state.py`，把 server bootstrap / WebSocket / HTTP
polling 共用的 request、payload、snapshot 和 cache helper 拆成更小 block，
同样保持 generated QML 输出不变。
本轮最后启动 QML generator entrypoint 的低风险拆分第一片，把 `Main.qml`
生成前的 context、masthead 和 ComboBox 样式准备逻辑移入
`client/qml_client/main_qml_parts/`，仍保持最终生成产物 byte-stable。
随后继续第二片拆分，把 dialog helpers 与 runtime log export helpers
移入同一 `main_qml_parts/` 包，继续保持 `Main.qml` 输出无 diff。
本轮最后继续第三片拆分，把 Program editor 的行号/offset、语法高亮、
runtime preview rows、active editor content 和 editor line helpers 移入
`client/qml_client/main_qml_parts/program_editor.py`，继续保持 `Main.qml`
输出无 diff。
随后继续第四片拆分，把 DEBUG natural-query 的 query parser、log query
plan、axis shorthand、row materialization、metadata 和 value formatting helper
移入 `client/qml_client/main_qml_parts/debug_query.py`，仍保持 `Main.qml`
输出无 diff。
随后继续第五片拆分，把 binding/reference/action argument helper 移入
`client/qml_client/main_qml_parts/bindings.py`，包括 binding value formatting、
display unit normalization、state/interface path resolving 和 recursive action
argument resolving，仍保持 `Main.qml` 输出无 diff。
随后继续第六片拆分，把 Program search/editor action helper 移入
`client/qml_client/main_qml_parts/program_search.py`，包括 Search/Replace、
Goto、editor history、clipboard action state、program execution preflight 和
local Program action handling，仍保持 `Main.qml` 输出无 diff。
随后继续第七片拆分，把 Settings panel helper 移入
`client/qml_client/main_qml_parts/settings.py`，包括 settings categories、
panel lifecycle、apply/reset/test、server URL/mode normalization、boolean
preference parsing 和 theme option guard，仍保持 `Main.qml` 输出无 diff。
随后继续第八片拆分，把 shell state helper 移入
`client/qml_client/main_qml_parts/shell_state.py`，包括 page existence、
active/content page state、page metadata、window screen constraint、footer
model selection 和 footer return icon glyph，仍保持 `Main.qml` 输出无 diff。
随后继续第九片拆分，把 command action/guard helper 移入
`client/qml_client/main_qml_parts/command_actions.py`，包括 local notice
writer、general action dispatch、local log action dispatch，以及 Program /
Program Dir / log command guard 逻辑，仍保持 `Main.qml` 输出无 diff。
随后继续第十片拆分，把 runtime value/name helpers 移入
`client/qml_client/main_qml_parts/runtime_values.py` 和
`client/qml_client/main_qml_parts/program_names.py`，包括 state/property/resource
access helper 与 Program/folder generated name helper，仍保持 `Main.qml`
输出无 diff。
随后继续第十一片拆分，把 top-shell visual model helpers 移入
`client/qml_client/main_qml_parts/visual_models.py`，包括 status chip model、
server status chip、notice text、status chip color/border/value color、alert
overlay、ESTOP 和 percent suffix helpers，仍保持 `Main.qml` 输出无 diff。
随后继续第十二片拆分，把 node state helpers 移入
`client/qml_client/main_qml_parts/node_state.py`，包括 node selected/enabled
判断、button status active 判断、enabled reference lookup 和 meaningful-value
判断，仍保持 `Main.qml` 输出无 diff。
随后继续第十三片拆分，把 data-row helpers 移入
`client/qml_client/main_qml_parts/data_rows.py`，包括 binding value/text/rows
解析和 Program browser row filter/sort/parent-row 注入，仍保持 `Main.qml`
输出无 diff。
随后继续第十四片拆分，把 table-edit helpers 移入
`client/qml_client/main_qml_parts/table_edit.py`，包括 numeric binding value、
table cell text、row selection/write routing、edit command config 和 prompt
execution，仍保持 `Main.qml` 输出无 diff。

## Completed Work

- 将 `client/qml_client/runtime_fragments/derived_state.py` 收敛为 29 行
  compatibility assembler。
- 新增 `client/qml_client/runtime_fragments/derived_state_blocks/`：
  - `sync_root.py`: `syncDerivedProperties()` 与 `syncClientDerivedState()`
  - `program_browser.py`: server-backed Program browser view derivation
  - `dashboard.py`: MAIN dashboard rows、coordinate label、main mode view 和
    JOG increment label helpers
  - `streams.py`: `stream.axis_positions` synthesis
  - `motion.py`: feed/spindle actual derivation，以及 execution pause/resume
    helpers
- 新增 `QML_DERIVED_STATE_BLOCK_NAMES`，并在 `tests/test_generator_refactor.py`
  增加 block 顺序和关键 marker 顺序测试。
- 将 `client/qml_client/runtime_fragments/remote_state.py` 收敛为 33 行
  compatibility assembler。
- 新增 `client/qml_client/runtime_fragments/remote_state_blocks/`：
  - `request_json.py`: JSON `XMLHttpRequest` request helper
  - `request_text.py`: text `XMLHttpRequest` request helper
  - `payload.py`: `applyServerPayload()` server payload application
  - `session.py`: `createClientSessionId()`
  - `snapshot.py`: `applyRemoteSnapshot()` 和 `mergeServerLocalState()`
  - `object_merge.py`: `replaceObjectContents()` 和 `mergeObjectContents()`
  - `position_cache.py`: `syncPositionCachesFromProperties()`
- 新增 `QML_REMOTE_STATE_BLOCK_NAMES`，并在 `tests/test_generator_refactor.py`
  增加 remote-state block 顺序和关键 marker 顺序测试。
- 新增 `client/qml_client/main_qml_parts/`：
  - `context.py`: `Main.qml` page/footer/theme/settings/loader/global-aux
    context preparation
  - `masthead.py`: masthead text/logo brand fragment preparation
  - `combo_box.py`: shared QML ComboBox styling snippets
  - `settings.py`: Settings panel category, lifecycle, apply/reset/test,
    server URL/mode normalization, boolean preference, and theme option helpers
  - `shell_state.py`: page existence, active/content page state, page metadata,
    window screen constraint, footer model selection, and return icon helpers
  - `command_actions.py`: local notice writer, action dispatch, local log action
    dispatch, and guarded Program / Program Dir / log command invocation helpers
  - `runtime_values.py`: local state, property, and resource value access helpers
  - `bindings.py`: binding value formatting, unit display, reference path
    resolving, command path resolving, and recursive action argument resolving
  - `dialogs.py`: prompt/confirm dialog helper functions
  - `log_export.py`: visible log JSONL export, save dialog, and clipboard
    fallback helpers
  - `program_editor.py`: Program editor line/offset helpers, syntax
    highlighting, runtime preview rows, and active editor state helpers
  - `program_names.py`: generated Program and Program folder name helpers
  - `program_search.py`: Program Search/Replace, Goto, editor history,
    clipboard action state, execution preflight, and local Program action
    helpers
  - `visual_models.py`: top-shell status chip, server connection, notice, alert,
    ESTOP, and status color helpers
  - `node_state.py`: node selection, enablement, status-active, enabled-ref,
    and meaningful-value helpers
  - `data_rows.py`: binding value/text/row conversion and Program browser row
    filtering, sorting, and parent-row injection
  - `table_edit.py`: data-table numeric/text formatting, row selection/write
    routing, edit command config, and prompt-driven edit execution
  - `debug_query.py`: DEBUG natural-query parser, log-query plan, axis
    shorthand, row materialization, metadata, and value-format helpers
- 将 `client/qml_client/generator.py` 中对应的输入模型、masthead 和
  ComboBox 样式准备逻辑迁出；随后迁出 dialog 与 log export helper 函数组；
  迁出 binding/reference helper 函数组；再迁出 Program editor helper 函数组；
  最后迁出 top-shell visual model、node state、data-row 和 table-edit helper 函数组；
  同时保留 `generate_qml()` 和 `_build_main_qml()` 作为兼容入口。
- `client/qml_client/generator.py` 从本日早前的 3376 行继续降到 1986 行；
  `bindings.py` 承接 95 行源码 helper，`program_editor.py` 承接 221 行源码
  helper，`debug_query.py` 承接 446 行源码 helper，`program_search.py` 承接
  522 行源码 helper，`settings.py` 承接 119 行源码 helper，`shell_state.py`
  承接 73 行源码 helper，`command_actions.py` 承接 231 行源码 helper，
  `runtime_values.py` 承接 24 行源码 helper，`program_names.py` 承接 34 行源码 helper，
  `visual_models.py` 承接 101 行源码 helper，`node_state.py` 承接 80 行源码 helper，
  `data_rows.py` 承接 80 行源码 helper，`table_edit.py` 承接 130 行源码 helper。
- `client/qml_client/generator.py` 从 shell state helper split 后的 1986 行
  继续降到 1767 行。
- `client/qml_client/generator.py` 从 command action/guard helper split 后的
  1767 行继续降到 1727 行。
- `client/qml_client/generator.py` 从 runtime value/name helper split 后的
  1727 行继续降到 1635 行。
- `client/qml_client/generator.py` 从 top-shell visual model helper split 后的
  1635 行继续降到 1564 行。
- `client/qml_client/generator.py` 从 node state helper split 后的 1564 行
  继续降到 1493 行。
- `client/qml_client/generator.py` 从 data-row helper split 后的 1493 行
  继续降到 1372 行。
- 新增 `QML_MAIN_PART_NAMES`，并在 `tests/test_generator_refactor.py`
  增加 main-shell helper contract 测试。
- 更新维护文档：
  - `README.md`
  - `CHANGELOG.md`
  - `docs/requirements/status_matrix.md`
  - `docs/development_guidelines/code_map.md`
  - `docs/development_guidelines/workflow/agent_handoff.md`
  - `docs_i18n/zh-CN/development_guidelines/code_map.md`
  - `docs_i18n/zh-CN/development_guidelines/workflow/agent_handoff.md`
- 生成 2026-05-10 user history 与完整 Codex conversation export。
- 重建 report mdBook 与 repo docs portal，使新 report 可从 `docs_html` 访问。

## Validation

- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the derived-state block split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding derived-state block order coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the remote-state block split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding remote-state block order coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the first QML main-shell helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding QML main-shell helper contract coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the dialog/log-export helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding dialog/log-export helper marker coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the Program editor helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding Program editor helper marker coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the DEBUG natural-query helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding DEBUG helper marker-order coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the binding/reference helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding binding helper marker-order coverage.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the Program search/editor action helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding Program search/editor action helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the Program search/editor action helper split.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the Settings panel helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding Settings panel helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the Settings panel helper split.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the shell state helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding shell state helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the shell state helper split.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the command action/guard helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding command action/guard helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the command action/guard helper split and newline-boundary normalization.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the runtime value/name helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding runtime value/name helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the runtime value/name helper split and newline-boundary normalization.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the top-shell visual model helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding visual model helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the visual model helper split and newline-boundary normalization.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the node state helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding node state helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the node state helper split and final target regeneration.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the data-row helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding data-row helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the data-row helper split and final target regeneration.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the table-edit helper split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding table-edit helper marker-order coverage.
- `python3 -m unittest tests.test_pipeline`
  after the table-edit helper split and final target regeneration.
- `./tools/generate_targets.sh`
  after the source splits, confirming final Web/QML/server/distribution outputs
  regenerate successfully.
- `python3 -m unittest tests.test_pipeline`
  after the target regeneration.
- `python3 -m unittest tests.test_docs_portal`
  after the docs/report routing update.
- `git diff --check`.
- Key generated-output diff check confirmed `generated/qml/RuntimeStore.qml`,
  `generated/qml/Main.qml`, `generated/web/app.js`, `generated/web/runtime.js`,
  `generated/distribution/contract/runtime_contract_bundle.json`, and
  `tests/snapshots/qml/RuntimeStore.qml.snap` did not change after the source splits.
- The QML main-shell split also left `generated/qml/Main.qml`,
  `generated/qml/RuntimeStore.qml`, `generated/web/app.js`,
  `generated/web/runtime.js`, and the distribution contract bundle unchanged.
- The dialog/log-export helper split kept the same tracked generated-output diff
  set empty, including `generated/qml/Main.qml`.
- The Program editor helper split also kept the tracked generated-output diff set
  empty, including `generated/qml/Main.qml`, `RuntimeStore.qml`, generated Web
  assets, the distribution contract bundle, and the QML runtime snapshot.
- The DEBUG natural-query helper split kept the same tracked generated-output
  diff set empty after fixing the helper insertion newline boundary.
- The binding/reference helper split kept the same tracked generated-output diff
  set empty after normalizing the helper insertion newline boundary.
- The Program search/editor action helper split kept the same tracked
  generated-output diff set empty, including `generated/qml/Main.qml`,
  generated Web assets, the distribution contract bundle, and the QML runtime
  snapshot.
- The Settings panel helper split kept the same tracked generated-output diff
  set empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The shell state helper split kept the same tracked generated-output diff set
  empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The command action/guard helper split kept the same tracked generated-output
  diff set empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The runtime value/name helper split kept the same tracked generated-output
  diff set empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The top-shell visual model helper split kept the same tracked generated-output
  diff set empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The node state helper split kept the same tracked generated-output diff set
  empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The data-row helper split kept the same tracked generated-output diff set
  empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.
- The table-edit helper split kept the same tracked generated-output diff set
  empty, including `generated/qml/Main.qml`, generated Web assets, the
  distribution contract bundle, and the QML runtime snapshot.

## Follow-Up

- Continue `client/qml_client/generator.py` decomposition incrementally. The
  file is 1372 lines after the table-edit helper split and has a clear
  `main_qml_parts/` destination for remaining low-level helpers.
- Split the next cohesive QML `Main.qml` log option/filter group around runtime
  log level/time options, option index lookup, selected values, and filter/dropdown
  helpers before tackling page/footer/template body assembly.
- Defer generated page/component file layout changes until source-level
  decomposition and interaction tests are stable.
