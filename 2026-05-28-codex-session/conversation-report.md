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

The second thread was Magazine. Instead of treating Magazine as a TODO-only
entry, the pass added a first useful read-only page: pocket occupancy, assigned
tool context, and Detail navigation for occupied pockets. Backend support was
added to both mock and real `tooling_management`, with strict Web/QML smoke
run from the MetaNC checkout where the real backend source is present.

## Decisions

- Keep `Tool Mgmt` landing directly on Tool List.
- Keep Tool List and Tool Wear as daily operator views.
- Treat Detail as the single create/edit/remove workspace.
- Route `Add Tool` to Detail `create_tool`.
- Keep `Add Edge` in Detail `create_edge`.
- Show `Revert` and `Save` only while a Detail draft is active.
- Introduce Magazine as a Tool Management module now, but only as read-only V1.
- Use `tooling.magazine.table` as the read model for Magazine.
- Let Magazine open the assigned tool in Detail when the pocket has a tool.
- Keep magazine mutation commands out of scope until load/unload/move semantics
  are designed.

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
- The docs portal generator now includes the Magazine page in downstream
  materialization so MetaNC does not lose the new navigation entry.

## Follow-Up

- Convert Magazine actions from read-only navigation to true magazine workflows
  after product semantics are agreed.
- Keep future Tool Monitoring, Sister Tools, and OEM Data as sibling Tool
  Management modules, not as extra Tool List columns.
- Continue publishing detailed HMI history in `metanc_hmi_dsl` while exporting
  the filtered integration package to MetaNC `feat/hmi`.
