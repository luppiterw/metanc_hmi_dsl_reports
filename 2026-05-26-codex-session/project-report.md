# Project Report

Date: 2026-05-26

## Scope

This pass turns the earlier REF POINT design into an HMI client/server V1.
It remains a simulator-backed implementation: the HMI can enter REF POINT,
issue a reference-return command, and observe per-axis reference state updates,
but it does not implement real PLC, servo, limit-switch, or controller homing.

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

## Validation

Source HMI validation:

- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack`
- `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --lang zh-CN --output docs_i18n/zh-CN/acceptance_reference/story_pack`
- `./tools/generate_targets.sh`
- `python3 -m py_compile ...`

MetaNC-side implementation validation before publication:

- `python3 -m unittest -v tests.test_mock_runtime_server tests.test_parity_scenarios`
- `python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_soft_panel_reference_return`
- `ctest --test-dir generated/server-build -R server_smoke_test --output-on-failure`
- `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/manual_reference_return.json --debug`
- `python3 -m unittest -v tests.test_pipeline`
- `python3 -m unittest -v tests.test_story_docs tests.test_web_qml_parity_docs tests.test_docs_portal`
- `git diff --check -- nrt/hmi`

## Boundary Notes

The REF POINT V1 is intentionally HMI/simulator scoped. Real homing still needs
lower-level motion, PLC, signal, safety, and parameter authority design.

The source repo keeps `docs_i18n/`, report submodules, repo-sync scripts, and
report tooling. The downstream MetaNC package receives only the filtered HMI
package surface.

## Remaining Work

- Real machine homing through lower-level controller/PLC integration.
- Reference-return parameterization and machine-profile limits.
- Alarm and safety-state expansion beyond simulator checks.
- Explicit measurement workflows after parameter/variable storage and backend
  data-set ownership are designed.
