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
- Continue with the DEBUG natural-query helper slice, then refresh reports/docs,
  sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the binding/reference helper slice, then refresh reports/docs,
  sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the Program search/editor action helper slice, then refresh
  reports/docs, sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the Settings panel helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the shell state helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the command action/guard helper slice, then refresh
  reports/docs, sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the runtime value/name helper slice, then refresh reports/docs,
  sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the top-shell visual model helper slice, then refresh
  reports/docs, sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the node state helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the data-row helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the table-edit helper slice, then refresh reports/docs, sync
  MetaNC, commit, push, and produce the next detailed plan.
- Continue with the runtime log view helper slice, then refresh reports/docs,
  sync MetaNC, commit, push, and produce the next detailed plan.
- Continue with the page/global auxiliary assembly slice, then refresh
  reports/docs, sync MetaNC, commit, push, and produce the next detailed plan.

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
- Keep the DEBUG natural-query slice source-only: parser, log-query plan, axis
  shorthand, row materialization, metadata, and formatting helpers can move out
  of `generator.py`, but the generated `Main.qml` byte layout must stay stable.
- Keep the binding/reference slice source-only: formatting, unit normalization,
  local-state path extraction, interface/state ref resolving, and recursive
  action argument resolving can move out of `generator.py`, but generated
  `Main.qml` must stay byte-stable.
- Keep the Program search/editor action slice source-only: Search/Replace, Goto,
  editor history, clipboard action state, execution preflight, and local Program
  action helpers can move out of `generator.py`, but generated `Main.qml` must
  stay byte-stable.
- Keep the Settings panel slice source-only: panel category, lifecycle,
  apply/reset/test, server URL/mode normalization, boolean preference parsing,
  and theme option guard helpers can move out of `generator.py`, but generated
  `Main.qml` must stay byte-stable.
- Keep the shell state slice source-only: page existence, active/content page
  state, page metadata, window screen constraint, footer model selection, and
  return icon helper can move out of `generator.py`, but generated `Main.qml`
  must stay byte-stable.
- Keep the command action/guard slice source-only: notice writing, action
  dispatch, local log action handling, and guarded command invocation can move
  out of `generator.py`, but generated `Main.qml` byte layout and behavior must
  stay stable.
- Keep the runtime value/name slice source-only: state/property/resource access
  helpers and generated Program/folder name helpers can move out of
  `generator.py`, but generated `Main.qml` byte layout and behavior must stay
  stable.
- Keep the visual model slice source-only: top-shell status chip model, notice,
  alert, ESTOP, and status color helpers can move out of `generator.py`, but
  generated `Main.qml` byte layout and behavior must stay stable.
- Keep the node state slice source-only: node selected/enabled/status helpers,
  enabled reference lookup, and meaningful-value checks can move out of
  `generator.py`, but generated `Main.qml` byte layout and behavior must stay
  stable.
- Keep the data-row slice source-only: binding value/text/rows and Program
  browser row preparation can move out of `generator.py`, but generated
  `Main.qml` byte layout and behavior must stay stable.
- Keep the table-edit slice source-only: numeric/text formatting, row selection,
  row write routing, edit command config, and prompt execution can move out of
  `generator.py`, but generated `Main.qml` byte layout and behavior must stay
  stable.
- Keep the runtime log view slice source-only: filter options, panel state,
  visible column model, row filtering/search, column formatting, and detail text
  can move out of `generator.py`, but generated `Main.qml` byte layout and
  behavior must stay stable.
- Keep the page/global auxiliary assembly slice source-only: page component,
  page loader, and global auxiliary component string assembly can move out of
  `context.py`, but generated `Main.qml` byte layout and behavior must stay
  stable.
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

The DEBUG natural-query helper slice is now in place. Runtime query parsing,
log-query planning, axis shorthand matching, display-row derivation, metadata
lookup, and value formatting moved into `main_qml_parts/debug_query.py`.
Generated `Main.qml` and the tracked final outputs remained byte-stable after
normalizing the helper insertion newline.

The binding/reference helper slice is now in place. Binding value formatting,
unit normalization, state/interface path resolving, command path resolving, and
recursive action argument resolving moved into `main_qml_parts/bindings.py`.
Generated `Main.qml` and the tracked final outputs remained byte-stable.

The Program search/editor action helper slice is now in place. Search/Replace,
Goto, editor history, clipboard action state, execution preflight, and local
Program actions moved into `main_qml_parts/program_search.py`. Generated
`Main.qml` and the tracked final outputs remained byte-stable.

The Settings panel helper slice is now in place. Settings category, panel
lifecycle, apply/reset/test, server URL/mode normalization, boolean preference
parsing, and theme option guard helpers moved into `main_qml_parts/settings.py`.
Generated `Main.qml` and the tracked final outputs remained byte-stable.

The shell state helper slice is now in place. Page existence, active/content
page state, page metadata, window screen constraint, footer model selection, and
return icon glyph helpers moved into `main_qml_parts/shell_state.py`. Generated
`Main.qml` and the tracked final outputs remained byte-stable.

The command action/guard helper slice is now in place. `writeLocalNotice()`,
action dispatch, local log action handling, and guarded Program/Program Dir/log
command invocation moved into `main_qml_parts/command_actions.py`. Generated
`Main.qml` and the tracked final outputs remained byte-stable after normalizing
the helper insertion newline boundaries.

The runtime value/name helper slice is now in place. `stateValue()`,
`propertyValue()`, and `resourceValue()` moved into
`main_qml_parts/runtime_values.py`; `nextProgramName()` and `nextFolderName()`
moved into `main_qml_parts/program_names.py`. Generated `Main.qml` and the
tracked final outputs remained byte-stable after normalizing insertion newline
boundaries.

The top-shell visual model helper slice is now in place. Status chip model,
server status chip, notice text, status chip color/border/value color, alert
overlay, ESTOP, and percent suffix helpers moved into
`main_qml_parts/visual_models.py`. Generated `Main.qml` and the tracked final
outputs remained byte-stable after normalizing the insertion newline boundary.

The node state helper slice is now in place. Node selection, enablement, status
active, enabled-ref lookup, and meaningful-value helpers moved into
`main_qml_parts/node_state.py`. Generated `Main.qml` and the tracked final
outputs remained byte-stable.

The data-row helper slice is now in place. Binding value/text/row conversion and
Program browser row filtering, sorting, and parent-row injection moved into
`main_qml_parts/data_rows.py`. Generated `Main.qml` and the tracked final
outputs remained byte-stable.

The table-edit helper slice is now in place. Numeric binding values, table cell
text, row selection/write routing, edit command config, and prompt-driven edit
execution moved into `main_qml_parts/table_edit.py`. Generated `Main.qml` and
the tracked final outputs remained byte-stable.

The runtime log view helper slice is now in place. Runtime Logs filter options,
option index/value helpers, panel state, visible-column model, message wrapping,
row filtering/search, column formatting, and detail text moved into
`main_qml_parts/log_view.py`. Generated `Main.qml` and the tracked final outputs
remained byte-stable after normalizing the helper insertion newline boundary.

The page/global auxiliary assembly slice is now in place. Page component, page
loader, and global auxiliary component assembly moved into
`main_qml_parts/page_assembly.py`, while `context.py` remains the context
aggregation entrypoint. Generated `Main.qml` and the tracked final outputs
remained byte-stable.
