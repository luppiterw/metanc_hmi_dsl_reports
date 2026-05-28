# Conversation Report

Date: 2026-05-28

## Summary

The session started from a product-design concern: Tool Management was now much
clearer than the earlier version, but `Add Tool` still did not match the new
Detail draft model used by `Add Edge`. The user asked for a detailed plan and
then approved implementation.

The implementation unified creation around Detail. `Add Tool` now opens Detail
in `create_tool`, the operator edits the same detail fields used by other draft
states, and `Save` calls the existing create command. This removes the old
separate dialog mental model.

The second thread was Magazine. Instead of leaving it as a TODO-only entry or an
early limited projection, the pass promoted it to a V2 operator workflow: find an
empty pocket, create a tool at a pocket through Detail, assign an existing tool,
move an occupied pocket to an enabled empty target, and unload a pocket. Backend
support was added to both mock and real `tooling_management` HMI paths, with
contract parity for the new move command.

## Decisions

- Keep `Tool Mgmt` landing directly on Tool List.
- Keep Tool List and Tool Wear as daily operator views.
- Treat Detail as the single create/edit/remove workspace.
- Route `Add Tool` to Detail `create_tool`.
- Keep `Add Edge` in Detail `create_edge`.
- Show `Revert` and `Save` only while a Detail draft is active.
- Introduce Magazine as a Tool Management module now, with V2
  create/assign/move/unload workflows.
- Use `tooling.magazine.table` as the read model for Magazine.
- Let Magazine open the assigned tool in Detail when the pocket has a tool.
- Keep loading-station, measurement, oversize adjacency, and replacement policy
  out of scope until those product semantics are designed.

## Implementation Notes

- The retained UI definition now includes `tool_list`, `tool_wear`, `detail`,
  and `magazine` footer groups.
- `runtime_state.selected_magazine_row_key` tracks Magazine selection in the
  same style as `selected_tool_row_key`.
- `selected_magazine_detail_summary` gives the right-side context panel stable
  detail text.
- Web and QML command guards now share Detail `create_tool` behavior for
  `tool.commands.create_offset_entry`.
- The real backend maps Magazine pockets through the `tooling_management` core
  and enriches rows with tool identity and edge counts.
- `tool.commands.move_tool_magazine_pocket` validates the occupied source,
  enabled empty target, stale magazine revision, and real backend relocate
  intent before updating the tool location.
- QML footer model selection now matches generated conditional footer groups by
  evaluating all `page::state=value` segments, so the Magazine move footer is
  selected at runtime.
- The docs portal generator now includes the Magazine page in downstream
  materialization so MetaNC does not lose the new navigation entry.

## Follow-Up

- Add loading-station and measurement flows after product semantics are agreed.
- Keep future Tool Monitoring, Sister Tools, and OEM Data as sibling Tool
  Management modules, not as extra Tool List columns.
- Continue publishing detailed HMI history in `metanc_hmi_dsl` while exporting
  the filtered integration package to MetaNC `feat/hmi`.
