# Conversation Report

## User Requests

- Continue the previous decomposition work.
- Generate and update reports/docs.
- Sync the HMI package into MetaNC.
- Commit and push both repositories.
- Provide a detailed next-step plan.
- Continue from `derived_state.py` to `remote_state.py` with the same source-only
  decomposition rule.
- Start the first QML generator entrypoint split and keep generated outputs
  byte-stable.
- Continue the QML main-shell helper split, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the Program editor helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.

## Technical Decisions

- Treat `derived_state.py` as a source-template decomposition target only.
  Generated `RuntimeStore.qml` must remain byte-stable.
- Preserve the existing QML function order because derived-state functions are
  referenced by command handling, execution ticks, transport fallback, and
  server snapshot application.
- Keep `derived_state.py` as the public compatibility entrypoint so
  `runtime_shell.py` and existing imports do not change.
- Keep `remote_state.py` as the public compatibility entrypoint so
  `runtime_shell.py` and transport fragments keep the same import surface.
- Preserve request, payload, snapshot, object merge, and position-cache function
  order because server bootstrap, HTTP polling, WebSocket replay, and derived
  state sync all depend on these helpers being in the same generated QML scope.
- Lock block order with generator-refactor tests before moving to the next
  runtime fragment.
- Keep the first QML `Main.qml` entrypoint split focused on low-risk helpers:
  context preparation, masthead brand fragments, and shared ComboBox styling.
- Keep the second QML main-shell slice focused on isolated functions: dialog
  helpers and log export helpers.
- Keep the Program editor slice source-only: line/offset helpers, syntax
  highlighting, runtime preview rows, and editor state helpers can move out of
  `generator.py`, but generated `Main.qml` behavior must stay byte-stable.
- Do not split generated QML output files yet; only reshape source modules until
  the source decomposition has stronger tests.

## Result

`derived_state.py` now assembles focused blocks from `derived_state_blocks/`.
The split separates sync root behavior, Program browser view derivation, MAIN
dashboard derivation, axis stream synthesis, and motion/pause/resume helpers
without changing generated runtime output. The report/docs chain was refreshed,
and the next source-decomposition target was `remote_state.py`.

`remote_state.py` now assembles focused blocks from `remote_state_blocks/`.
The split separates JSON/text request helpers, server payload application,
client session id generation, remote snapshot/local-state merge, object merge
helpers, and position-cache synchronization without changing generated runtime
output. The next planning target is the larger QML generator entrypoint.

The first QML generator entrypoint slice is now in place. `generator.py` still
owns `generate_qml()` and the large `Main.qml` template, while
`main_qml_parts/` owns main-shell context preparation, masthead brand fragments,
and shared ComboBox styling. Generated Web/QML/server/distribution outputs were
regenerated and remained unchanged for the tracked generated files.

The second QML main-shell helper slice is also in place. Dialog prompt/confirm
helpers and runtime log export/save/clipboard fallback helpers moved into
`main_qml_parts/dialogs.py` and `main_qml_parts/log_export.py`; generated
`Main.qml` remained byte-stable.

The Program editor helper slice is now in place as well. Program editor
line/offset helpers, syntax highlighting, runtime preview rows, active editor
content, and editor-line derivation moved into
`main_qml_parts/program_editor.py`; generated `Main.qml` and the tracked final
outputs remained byte-stable.
