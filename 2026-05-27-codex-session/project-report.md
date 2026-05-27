# Project Report

Date: 2026-05-27

## Scope

This pass refines PARAM Tool Management after operator review of the first
two-level footer implementation. The goals were to make the Tool List / Tool
Wear / Detail hierarchy easier to understand, remove the empty overview hop,
avoid wide tables, and make Detail editing state obvious.

The final model treats `Tool Mgmt` as the direct Tool List entry point. Tool
List owns daily identity plus geometry inspection, Tool Wear owns edge-wear
editing, and Detail owns less frequent selected-row edits plus Add Edge drafts.

## Delivered

- Kept `Tool Mgmt` landing directly on `Tool List` instead of an intermediate
  overview page.
- Split the active table columns:
  - Tool List: `T`, `D`, `Tool Name`, `Type`, `Edge`, `Status`, `Length`,
    `Radius`
  - Tool Wear: `T`, `D`, `Tool Name`, `Edge`, `Wear L`, `Wear R`, `Status`
- Changed Detail into an explicit state machine:
  - `view`: read-only selected-row context with `Add Edge` and `Edit`
  - `edit`: editable selected-row draft with `Revert` and `Save`
  - `create_edge`: frozen parent tool context plus editable new edge fields
- Hid `Revert` and `Save` in read-only Detail view so grey inactive write
  controls do not imply a missing backend function.
- Moved Add Edge from the old edge-dialog path into the Detail `create_edge`
  draft path. Accepted Save now refreshes the table, selects the returned edge
  row, and switches the operator to Tool Wear.
- Made Detail navigation cancel or revert active edit/create drafts before
  returning to Tool List or Tool Wear.
- Updated Web and QML command guards, generated snapshots, strict smoke scripts,
  and pipeline assertions for the new Detail-state behavior.
- Updated Tool Offset project docs, status matrix, changelog, and this report
  to match the implementation.

## Validation

Source HMI validation before downstream sync:

- `env HMI_SERVER_NATIVE_BUILD_MODE=host ./tools/generate_targets.sh`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_pipeline.PipelineTests.test_tool_management_footer_shows_current_and_planned_sections tests.test_pipeline.PipelineTests.test_tool_offset_standard_extend_detail_share_workspace_footer`
- `python3 -m unittest -v tests.test_tooling_contract_docs.ToolingContractDocsTests.test_phase6_smoke_scripts_are_repository_owned`
- `node --check tools/tool_offset_web_strict_smoke.js`
- `node --check tests/qml_smoke/tool_offset_strict_runtime.js`
- `env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 HMI_ENABLE_QML_VISUAL_SNAPSHOT=0 HMI_ENABLE_WEB_VISUAL_SNAPSHOT=0 python3 -m unittest -v tests.test_pipeline tests.test_parity_scenarios tests.test_sync_scripts tests.test_ui_automation tests.test_ci_workflows`
- `git diff --check`

The standalone strict Web smoke was intentionally deferred until MetaNC sync
because the standalone source checkout does not contain
`../tooling_management`.

## Boundary Notes

This is an HMI workflow and generated-client change. It does not alter the
`tooling_management` persistence model, internal `tool_id` / `edge_id`
authority, or the native backend command contracts.

Planned Magazine, Monitoring, Sister Tools, and OEM Data modules remain Tool
Management scope, but they are still future module entries rather than active
default Tool List footer actions.

## Remaining Work

- Run the MetaNC-side strict Tool Offset smoke after export, where the real
  `tooling_management` source is available.
- Decide how a later Tool Management module selector should expose Magazine,
  Monitoring, Sister Tools, and OEM Data without displacing daily Tool List
  operations.
- Continue refining Detail validation copy and backend conflict diagnostics as
  product semantics mature.
