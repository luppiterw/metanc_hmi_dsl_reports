# Project Report

## Scope

本轮工作继续推进 QML runtime source decomposition。目标不是改变 generated
QML 文件结构，而是把仍偏大的 `derived_state.py` 源码片段拆成更小的职责
block，降低后续维护 MAIN dashboard、Program browser derived view、axis
stream、motion output 和 execution pause/resume helper 时的耦合。

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
- `./tools/generate_targets.sh`
  after the source split, confirming final Web/QML/server/distribution outputs
  regenerate successfully.
- `python3 -m unittest tests.test_pipeline`
  after the target regeneration.
- `python3 -m unittest tests.test_docs_portal`
  after the docs/report routing update.
- `git diff --check`.
- Key generated-output diff check confirmed `generated/qml/RuntimeStore.qml`,
  `generated/qml/Main.qml`, `generated/web/app.js`, `generated/web/runtime.js`,
  `generated/distribution/contract/runtime_contract_bundle.json`, and
  `tests/snapshots/qml/RuntimeStore.qml.snap` did not change after the source split.

## Follow-Up

- Split `client/qml_client/runtime_fragments/remote_state.py` into focused
  blocks while preserving generated `RuntimeStore.qml` order.
- Keep the next split source-only; do not change transport semantics, snapshot
  merge behavior, local-state merge behavior, or position-cache sync behavior.
- After `remote_state.py`, reassess whether `client/qml_client/generator.py`
  should be split by generation output area or by shared payload/build phases.
