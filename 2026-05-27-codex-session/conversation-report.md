# Conversation Report

Date: 2026-05-27

## Summary

The session focused on the operator logic of the PARAM Tool Management area.
After the previous pass introduced true footer submenus for Tool List, Tool
Wear, and Detail, the user questioned whether Tool Management should open into
an overview page at all. The conclusion was that the overview created an empty
extra layer: operators entering Tool Management expect to see the daily Tool
List immediately.

The implementation removed that empty layer and made `Tool List` the Tool
Management default. The resulting hierarchy keeps the frequently used Tool
List operations on the visible footer while preserving clear navigation to Tool
Wear and Detail.

The publication request then required report/docs regeneration, source repo
synchronization, downstream MetaNC export, commit, and push. The full Codex
conversation export was refreshed for the session.

After publication, remote CI failed because one QML generator test still
looked for the old one-level `parameter_view=tool_offset` footer model key.
The generated UI now intentionally keys Tool List, Tool Wear, and Detail by
both `parameter_view` and `tool_offset_view`, so the test was updated to assert
the new composite keys and the CI-equivalent unittest suite was rerun locally.

## Decisions

- `Tool Mgmt` opens `Tool List` directly.
- The intermediate Tool Management overview page is removed for now.
- Tool List's first footer key is a selected `Tool List` context key, not
  `Overview`.
- Tool Wear's first two footer keys are `Tool List` and selected `Tool Wear`.
- Detail remains a selected-row work page reached from Tool List or Tool Wear.
- `Add Edge`, `Revert`, and `Save` stay in the Detail footer and are enabled
  by selected-row and dirty/saveable state.
- Later module placeholders are not forced into the default Tool List footer;
  a future module selector or More key should carry Magazine, Monitoring,
  Sister Tools, and OEM Data.

## Implementation Notes

- The UI definition change removed the overview visible-state branch and the
  footer group keyed by `tool_offset_view=overview`.
- Generator tests were updated to assert that the overview group is absent
  from the footer model map.
- Web UI scenario setup now expects `runtime_state.tool_offset_view=tool_list`
  immediately after pressing `Tool Mgmt`.
- QML smoke scripts no longer perform an extra footer click before interacting
  with Tool List actions.
- The generated runtime seed and data dictionary now use `tool_list` as the
  default Tool Management subview.
- The live split Web preview was started on separate ports to avoid older
  preview instances and to verify the updated generated package.
- The remote CI fix is test-only: it aligns
  `test_qml_footer_model_keeps_parameter_submenus_separate` with the already
  generated composite footer-model lookup used by the QML shell.

## Follow-Up

- Keep Tool Management docs and UI wording aligned as the module selector is
  designed.
- Avoid grey disabled placeholders for functions that have no page yet unless
  they are grouped in a clearly labeled future-module area.
- Continue treating `metanc_hmi_dsl` as the source history owner and MetaNC
  `feat/hmi` as the downstream integration surface.
