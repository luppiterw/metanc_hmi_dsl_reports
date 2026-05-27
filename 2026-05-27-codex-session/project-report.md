# Project Report

Date: 2026-05-27

## Scope

This pass refines the PARAM Tool Management hierarchy and publication surface
after the first two-level footer-menu implementation. The user rejected the
intermediate Tool Management overview because it created an empty navigation
hop before the operator reached the daily `Tool List` work surface.

The final design treats `Tool Mgmt` as the Tool List entry point. Tool List,
Tool Wear, and Detail each own their own footer submenu. Planned modules remain
documented as later Tool Management scope, but they are not shown in the
default Tool List footer because the active workflow needs the available
softkey slots for row operations.

## Delivered

- Changed the default `runtime_state.tool_offset_view` from the previous
  intermediate view to `tool_list`.
- Updated PARAM `Tool Mgmt` entry actions so the first operator-visible Tool
  Management page is `Tool List`.
- Removed the Tool Management overview page and its overview footer group.
- Replaced the Tool List footer's `Overview` softkey with a selected `Tool
  List` key.
- Replaced the Tool Wear footer's `Overview` key with `Tool List` and a
  selected `Tool Wear` key.
- Preserved Detail footer behavior:
  - `Tool List`
  - `Tool Wear`
  - `Add Edge`
  - `Revert`
  - `Save`
  - `Return`
- Updated QML footer-model fallback logic so `page_parameters` defaults to the
  `tool_list` footer group.
- Updated Web/QML smoke scripts and Web UI scenario JSON so they no longer
  click through an overview before reaching Tool List.
- Updated generated snapshots and tests to assert that old overview nodes are
  absent:
  - `parameter_tool_management_overview`
  - `parameter_tool_offset_footer_bar`
  - `parameter_tool_list_footer_overview`
  - `parameter_tool_wear_footer_overview`
- Updated Tool Offset docs and data dictionary to describe Tool Management as
  `Tool Mgmt -> Tool List` by default.
- Regenerated source outputs and synchronized the filtered HMI package into
  MetaNC `feat/hmi`.
- Started a fresh split Web tooling preview on `8050/8051` and verified the
  runtime seed and front-end bundle.

## Validation

Source HMI validation:

- `./tools/generate_targets.sh`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_parameter_home_is_default_and_subviews_return_home tests.test_pipeline.PipelineTests.test_tool_management_footer_shows_current_and_planned_sections tests.test_pipeline.PipelineTests.test_tool_offset_footer_does_not_expose_structural_tool_edge_commands tests.test_pipeline.PipelineTests.test_tool_offset_standard_extend_detail_share_workspace_footer tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_generator_refactor.GeneratorRefactorTests.test_parameter_footer_groups_follow_visible_state`
- `python3 -m unittest -v tests.test_ui_automation tests.test_tooling_contract_docs tests.test_web_qml_parity_docs`
- `python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_ui_tool_offset_basic_workflow tests.test_qml_smoke.QmlSmokeTests.test_parameter_footer_navigation_round_trip`
- `git diff --check`

MetaNC-side validation:

- `./tools/generate_targets.sh`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_parameter_home_is_default_and_subviews_return_home tests.test_pipeline.PipelineTests.test_tool_management_footer_shows_current_and_planned_sections tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_generator_refactor.GeneratorRefactorTests.test_parameter_footer_groups_follow_visible_state tests.test_ui_automation tests.test_tooling_contract_docs tests.test_web_qml_parity_docs`
- `python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_ui_tool_offset_basic_workflow tests.test_qml_smoke.QmlSmokeTests.test_parameter_footer_navigation_round_trip`
- `git diff --check -- nrt/hmi`
- `GET /api/runtime/health` returned OK on `8051`
- `GET /api/runtime/state` showed `runtime_state.tool_offset_view` as
  `tool_list`
- the fetched Web bundle contained the new Tool List / Tool Wear footer node
  ids and did not contain the removed overview node ids

## Boundary Notes

This is a UI hierarchy and generated-client change. It does not alter
`tooling_management` data ownership, persistence, command contracts, or the
native tooling backend.

The planned Magazine, Monitoring, Sister Tools, and OEM Data modules are still
recognized as Tool Management scope. They should be surfaced through a later
modules/more submenu rather than competing with Tool List row operations in the
default footer.

The QML smoke logs still report the known Repeater binding-loop warning during
test startup. The smoke tests complete successfully and the warning is not new
to this hierarchy pass.

## Remaining Work

- Design the later Tool Management modules/more submenu for Magazine,
  Monitoring, Sister Tools, and OEM Data.
- Decide whether module placeholders should be visible only in docs, in a
  future disabled module selector, or behind a More softkey.
- Continue refining Tool Detail validation and command feedback as backend
  identity-edit semantics mature.
