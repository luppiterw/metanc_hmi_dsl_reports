# Conversation Report

Date: 2026-05-27

## Summary

The session focused on making PARAM Tool Management easier to understand at the
operator level. The user first rejected the intermediate Tool Management
overview as an empty layer, then pushed on the Tool List / Tool Wear / Detail
layout because the page still felt too wide and the grey `Revert` / `Save`
buttons made Detail look partially disabled.

The resulting design keeps Tool Management direct: `Tool Mgmt` opens Tool List.
Tool List and Tool Wear now have narrower, clearer tables, and Detail no longer
looks like an always-editable form. It opens read-only, enters mutation only
through `Edit` or `Add Edge`, and shows write actions only while a draft is
active.

## Decisions

- `Tool Mgmt` opens `Tool List` directly.
- Tool List shows identity and geometry context, not wear values.
- Tool Wear shows edge wear values, not full geometry.
- Detail opens in read-only `view`.
- `Edit` is the selected-row mutation entry point.
- `Revert` and `Save` appear only in `edit`, `create_tool`, or `create_edge`.
- `Add Edge` starts a Detail `create_edge` draft instead of opening the old
  edge form dialog.
- Saving a new edge selects the returned edge row and switches to Tool Wear so
  the operator can immediately see the updated wear table.
- Leaving Detail while an edit/create draft is active cancels or reverts the
  draft before navigating away.

## Implementation Notes

- The retained UI definition now gives Detail state-specific footer candidates
  for slots 3, 4, and 5.
- Web and QML command guards share the same state transitions for
  `view -> edit`, `view -> create_edge`, accepted Save, Revert, and Return.
- The generated Detail form treats parent tool fields as read-only in
  `create_edge`, while D number, edge number, length, radius, wear length, and
  wear radius stay editable.
- Strict Tool Offset smoke scripts now exercise Add Edge through Detail Save
  and expect the successful path to land on Tool Wear with the new row selected.
- Pipeline assertions now lock the absence of read-only-mode `Revert` / `Save`
  actions as visible controls.

## Follow-Up

- Re-run strict Web/QML Tool Offset smoke from MetaNC after export because the
  standalone source checkout intentionally lacks `../tooling_management`.
- Keep future Tool Management modules behind a dedicated module selector or
  More flow instead of loading the daily Tool List footer with TODO entries.
- Continue treating `metanc_hmi_dsl` as the source history owner and MetaNC
  `feat/hmi` as the downstream integration surface.
