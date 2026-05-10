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
  - `bindings.py`: binding value formatting, unit display, reference path
    resolving, command path resolving, and recursive action argument resolving
  - `dialogs.py`: prompt/confirm dialog helper functions
  - `log_export.py`: visible log JSONL export, save dialog, and clipboard
    fallback helpers
  - `program_editor.py`: Program editor line/offset helpers, syntax
    highlighting, runtime preview rows, and active editor state helpers
  - `program_search.py`: Program Search/Replace, Goto, editor history,
    clipboard action state, execution preflight, and local Program action
    helpers
  - `debug_query.py`: DEBUG natural-query parser, log-query plan, axis
    shorthand, row materialization, metadata, and value-format helpers
- 将 `client/qml_client/generator.py` 中对应的输入模型、masthead 和
  ComboBox 样式准备逻辑迁出；随后迁出 dialog 与 log export helper 函数组；
  迁出 binding/reference helper 函数组；再迁出 Program editor helper 函数组；
  最后迁出 DEBUG natural-query helper 函数组；同时保留 `generate_qml()` 和
  `_build_main_qml()` 作为兼容入口。
- `client/qml_client/generator.py` 从本日早前的 3376 行继续降到 2131 行；
  `bindings.py` 承接 95 行源码 helper，`program_editor.py` 承接 221 行源码
  helper，`debug_query.py` 承接 446 行源码 helper，`program_search.py` 承接
  522 行源码 helper。
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

## Follow-Up

- Continue `client/qml_client/generator.py` decomposition incrementally. The
  file is 2131 lines after the Program search/editor action helper split and has a clear
  `main_qml_parts/` destination for remaining low-level helpers.
- Split the next cohesive QML `Main.qml` groups around command guards, settings
  panel helpers, page shell helpers, and footer/template body assembly.
- Defer generated page/component file layout changes until source-level
  decomposition and interaction tests are stable.
