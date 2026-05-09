# Conversation Report

## User Requests

- Discuss whether the JOG-mode content on the MAIN page is too mixed and too close to
  soft-panel behavior.
- Clarify that soft-panel controls should not be repeated inside the JOG-mode home page.
- Implement a first version directly, without committing yet.
- Generate and update reports/docs, sync to MetaNC, commit, and push.
- Investigate why FS Actual remains equal to Target after setting a target and completing
  a JOG move, then fix the simulator behavior.
- Investigate why pressing Enter in the DEBUG natural-query input does not run the query,
  and make Enter-triggered query execution available.
- Investigate why DEBUG queries sometimes appear to do nothing even after Enter is handled.
- Optimize DEBUG parser behavior so single-axis shorthand such as `x` works like `x axis`,
  and apply the same idea to the other axes.
- Fix MAIN page behavior where clicking soft-panel `AUTO` while the MDI editor has focus
  leaves the right-side MAIN content inside the MDI editor instead of switching to AUTO.
- Continue with the previously discussed plan by implementing the first low-risk Web
  generator decomposition slice before the next planning discussion.
- Continue the decomposition by splitting the remaining large Web widget and legacy
  shell files after the first slice was reviewed.
- Continue the decomposition by splitting the generated Web runtime shell into source
  fragments while keeping final `runtime.js` stable.
- Continue the decomposition by splitting the QML widget emitter source into focused
  fragments while keeping final `Main.qml` stable.
- Continue the decomposition by splitting the QML runtime store source into ordered
  fragments while keeping final `RuntimeStore.qml` stable.
- Continue the decomposition by splitting the QML runtime command dispatcher into
  ordered command-domain blocks while preserving the single generated `invokeCommand()`
  entrypoint.

## Technical Decisions

- Treat the soft panel as the actual operation surface for manual actions.
- Treat MAIN/JOG as a contextual display surface for manual setup and read-only status.
- Keep feed and spindle target controls in MAIN/JOG for now because they are setup values,
  not direct jog motion or cycle actions.
- Keep live feed/spindle/coolant/tool state visible so the operator can inspect manual
  context without leaving the main dashboard.
- Do not duplicate soft-panel command nodes in the MAIN/JOG tree; this keeps future
  adapter and test ownership focused on one command surface.
- Treat target/cmd values as configured intent and actual values as live motion output.
  For discrete JOG, actual feed should drop to zero after the move completes while the
  feed target remains configured.
- Treat DEBUG natural-query execution as a client-local generated UI behavior. The
  keyboard submit path should reuse the same parser/query execution path as the visible
  `Run` action rather than adding a separate backend command.
- Preserve IME composition behavior for Chinese text input; Enter should submit only
  after composition has ended.
- Treat focus preservation and visible result refresh as separate concerns. A protected
  input focus should not prevent the visible DEBUG result table from updating.
- Treat bare axis tokens as valid read-only inspection intent only when they are standalone
  axis tokens or compact axis groups, not when the letters appear inside ordinary words.
- Treat editor focus preservation as a local rendering optimization, not as permission to
  suppress structural page changes. A MAIN-page mode-view change must rebuild the visible
  mode panel even if a focused editor would otherwise be protected from rerender.
- Treat generator decomposition as a source-level refactor first. The first slice should
  keep generated Web/QML outputs byte-stable and avoid changing runtime contracts, server
  behavior, or final generated file layout.
- Keep QML widget recursion centralized through the public dispatch entrypoint. Fragment
  modules should own domain emitters, while recursive child rendering is injected as a
  callback to avoid circular imports.
- Keep QML runtime command decomposition block-based rather than function-based for now.
  The generated client should still expose one `invokeCommand(path, args)` function so
  existing command variables, strict forwarding, and local simulator state remain in the
  same QML scope.

## Result

The generated Web and QML targets now present a simpler JOG home area. The JOG main area
shows manual setup and live status, while all real machine-operation controls remain in
the soft panel. Story/catalog and report documentation were updated so later manual
operation work does not accidentally reintroduce duplicated command controls into the
display area.

The server simulator now keeps `feed.speed_actual` separate from `feed.speed_cmd` after
completed JOG moves. A server smoke assertion covers the regression so a future simulator
or adapter change does not make Actual stay equal to Target just because the current mode
is JOG.

The DEBUG natural-query input now supports keyboard execution in both generated targets.
Web uses a form-backed submit path with Enter handling and IME guards, while QML wires
`onAccepted`, Return, Enter, and the `Run` button to one submit helper. A headless Web
probe verified that pressing Enter for `show spindle status` runs the query and renders
the expected spindle runtime rows.

The follow-up stability fix makes Web DEBUG query submit state survive rerender timing and
directly refreshes the visible result panel after applying a query plan, so preserving the
input focus no longer makes the result table appear stale. QML now uses a Timer-backed
submit path for the same interaction surface.

Axis shorthand parsing was expanded across Web and QML. Single-axis entries `x`, `y`, `z`,
`a`, `c`, compact groups like `xy` and `xyz`, and mixed forms like `x actual` or `x轴`
now resolve to axis property rows. A guard prevents unrelated words such as `connection`
from being interpreted as C-axis requests.

The Web MAIN page now distinguishes ordinary focused-editor refresh from structural
mode-panel changes. When the MDI editor has focus and the operator clicks soft-panel
`AUTO`, the runtime mode state and the visible MAIN content both switch to AUTO instead
of leaving the stale MDI editor in place.

The Web generator now has a first source-level decomposition slice. CSS generation lives
outside the Web entrypoint, and Program, Runtime Logs, and DEBUG natural-query widget
JavaScript live under feature-specific Python modules before being assembled back into
the same generated `app.js`. Snapshot and direct equivalence checks confirmed that this
refactor did not change generated Web/QML output bytes.

The Web generator split was then extended one level deeper. Core generated-widget
JavaScript now lives under `client/web_client/widget_core/`, while legacy shell CSS
fragments live under `client/web_client/style_emitters/legacy/`. The original
`widget_emitters.py` and `legacy_shell.py` files now act as compatibility assembly
entrypoints, and generator-refactor tests lock the new assembly order.

The Web runtime shell was also split at the source-template layer. `runtime_shell.py`
now stays as a small public builder over ordered `runtime_fragments/`, while the emitted
`runtime.js` remains byte-stable. The split keeps strict/hybrid server behavior,
HTTP/WebSocket transport, logs, program workspace, and simulator behavior unchanged.

The QML widget emitter now follows the same compatibility-entrypoint approach. The public
dispatch file remains `client/qml_client/widget_emitters.py`, while concrete QML widget,
layout, and utility emitters live under `client/qml_client/widget_fragments/`. Generator
tests and a full target rebuild confirmed that this source split does not change the
generated `Main.qml` semantics.

The QML runtime store was then split using the same source-template pattern.
`client/qml_client/runtime_shell.py` now stays as a small public builder over ordered
`runtime_fragments/`, while generated `RuntimeStore.qml` remains byte-stable. The split
keeps strict/hybrid setup, command invocation, derived-state sync, execution simulation,
program workspace, logs, transports, and remote-state application in their original
generated order.

The QML runtime command dispatcher was further decomposed into command-domain blocks.
`commands.py` now owns the single `invokeCommand()` wrapper and strict forwarding
prelude, while `command_blocks/` owns UI, position, program, program-directory, CNC,
JOG, manual-operation, alarm, and diagnostics command branches. The command block order
is locked by tests so future command changes can stay domain-local without silently
reordering dispatch behavior.
