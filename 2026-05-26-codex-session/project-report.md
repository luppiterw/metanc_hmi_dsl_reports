# Project Report

Date: 2026-05-26

## Scope

This pass combines three 2026-05-26 HMI workstreams:

- the REF POINT / manual reference return V1 client/server simulator slice
- the PARAM Tool Offset Detail hierarchy, layout, and dirty-state refinement
- the split Web tooling-management startup fix for stale or failed backend
  processes on port `8010`

REF POINT remains simulator-backed: the HMI can enter REF POINT, issue a
reference-return command, and observe per-axis reference state updates, but it
does not implement real PLC, servo, limit-switch, or controller homing.

## Delivered

- Added `runtime_state.jog_submode` with `jog` and `ref_point` behavior.
- Added REF POINT soft-panel controls:
  - `ops_submode_ref_point`
  - `ops_reference_minus`
  - `ops_reference_cancel`
  - `ops_reference_plus`
- Added command contracts:
  - `jog.commands.set_submode`
  - `jog.commands.start_reference_return`
  - `jog.commands.cancel_reference_return`
- Added per-axis reference-state properties:
  - `axis.*.reference_state`
- Implemented matching behavior in:
  - Web local runtime handlers
  - QML local runtime handlers
  - Python mock runtime server
  - native C++ simulator adapter
- Added strict runtime subscription coverage so `axis.*.reference_state` is
  visible in Web strict parity mode.
- Added parity and UI automation coverage:
  - `tests/parity_scenarios/manual_reference_return.json`
  - `tests/qml_smoke/soft_panel_reference_return.js`
  - mock runtime reference-return tests
  - native server smoke assertions
- Updated requirement/status/story docs, Web/QML parity docs, agent handoff,
  `CHANGELOG.md`, and generated story-pack outputs.
- Reworked Tool Offset Detail interaction:
  - footer actions now keep Standard, Extend, Detail, Add Tool, Refresh,
    Enable, Disable, Remove, and Return as the function-level tool workflow
  - Detail-local actions expose Add Edge, Revert, and Save beside the Detail
    form
  - Add Edge stays enabled when a selected row gives the new edge a parent tool
    context
  - Revert and Save become enabled only after Detail draft edits are dirty and
    saveable
- Tightened Tool Offset Detail layout:
  - removed the horizontal-scroll pressure in the Detail body
  - constrained the Detail form/runtime context width
  - aligned the Add Edge/Revert/Save action area with the Runtime Context right
    edge
  - reduced oversized summary/action surfaces so the page reads as one Detail
    workspace instead of several unrelated panels
- Fixed Web Detail dirty-state propagation:
  - Detail input edits now write local state with UI notification instead of
    silent writes
  - the Web shell render signature includes Detail dirty, can-save, and error
    state so the action buttons refresh immediately
- Hardened split tooling launchers:
  - `run_split_web_tooling_management.sh` and
    `run_split_qml_tooling_management.sh` record a managed backend PID file
  - a previous managed backend on the same port is stopped before relaunch
  - a non-managed listener on the backend port produces a clear error and exits
    before any Web/QML client is started
  - this prevents a front-end process from connecting to a stale or failed
    `8010` runtime after an `Address already in use` backend bind failure

## Validation

Source HMI validation:

- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack`
- `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --lang zh-CN --output docs_i18n/zh-CN/acceptance_reference/story_pack`
- `./tools/generate_targets.sh`
- `python3 -m py_compile ...`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_tooling_split_launch_rejects_ambiguous_backend_port tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_pipeline.PipelineTests.test_tool_offset_phase4_detail_draft_state_generated_handlers tests.test_pipeline.PipelineTests.test_tool_offset_phase6_add_edge_to_tool_generated_handlers tests.test_pipeline.PipelineTests.test_web_shell_filters_conditional_footer_bars_before_flattening`

MetaNC-side implementation validation before publication:

- `python3 -m unittest -v tests.test_mock_runtime_server tests.test_parity_scenarios`
- `python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_soft_panel_reference_return`
- `ctest --test-dir generated/server-build -R server_smoke_test --output-on-failure`
- `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/manual_reference_return.json --debug`
- `python3 -m unittest -v tests.test_pipeline`
- `python3 -m unittest -v tests.test_story_docs tests.test_web_qml_parity_docs tests.test_docs_portal`
- `git diff --check -- nrt/hmi`
- `./nrt/hmi/generated/distribution/run_split_web_tooling_management.sh` normal-path smoke:
  - `GET /api/runtime/health` returned OK on `8010`
  - the Web client returned HTTP 200 on `8000`
  - server state contained seeded `tooling.tool.table` rows
- occupied-port smoke against `MetaNC/nrt/hmi/generated/distribution/run_split_web_tooling_management.sh`:
  - an occupied backend port returned non-zero
  - diagnostic text reported `not starting Web client against an ambiguous tooling_management server`
  - no front-end was launched against an ambiguous runtime

## Boundary Notes

The REF POINT V1 is intentionally HMI/simulator scoped. Real homing still needs
lower-level motion, PLC, signal, safety, and parameter authority design.

The Tool Offset Detail changes are UI/workflow and generated-client changes
only. They do not change the `tooling_management` ownership boundary or create
an HMI-owned tooling database.

The split Web tooling fix treats ambiguous backend port ownership as a startup
error. Operators should either stop the existing listener or launch a second
preview with distinct ports, such as `8011 8001`.

The source repo keeps `docs_i18n/`, report submodules, repo-sync scripts, and
report tooling. The downstream MetaNC package receives only the filtered HMI
package surface.

## Remaining Work

- Real machine homing through lower-level controller/PLC integration.
- Reference-return parameterization and machine-profile limits.
- Alarm and safety-state expansion beyond simulator checks.
- Explicit measurement workflows after parameter/variable storage and backend
  data-set ownership are designed.
- Broader work-offset/WCS contract tests beyond current UI binding smoke.
