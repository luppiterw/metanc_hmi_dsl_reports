# Conversation Report

Date: 2026-05-26

## Summary

The session continued from the REF POINT Story Slice Spec and implemented the
HMI-side manual reference return V1. The user asked whether the feature had a
mock implementation connected to the UI; the implementation was verified as a
full mock chain rather than a document-only contract.

The publication request then required report/docs regeneration, source repo
synchronization, downstream MetaNC export, commit, and push. The raw Codex
history export step was blocked by safety review, so this report records only
structured project content and validation evidence.

## Decisions

- REF POINT remains a JOG submode rather than a new top-level machine mode.
- `reference_return` naming is used for the command surface to avoid confusing
  it with work offsets, zero offsets, or WCS naming.
- The V1 simulator behavior completes reference return deterministically and
  immediately; this is acceptable for HMI parity and UI automation, but it is
  not a real homing implementation.
- `axis.*.reference_state` must be part of runtime subscriptions, not only a
  server-side property, otherwise strict Web clients can miss updates.
- Raw Codex history export is treated as a separate disclosure-sensitive step
  and was not performed in this pass.

## Implementation Notes

- The UI enters REF POINT by dispatching `cnc.commands.set_mode` to `JOG` and
  then `jog.commands.set_submode` to `ref_point`.
- REF controls replace normal JOG movement controls while the selected submode
  is `ref_point`.
- `jog.commands.start_reference_return` validates mode/submode, selected axis,
  direction, and emergency-stop state before applying simulator state updates.
- Normal JOG operations and non-JOG mode changes reset `runtime_state.jog_submode`
  back to `jog`.
- Web strict parity confirmed that `axis_x_reference_state` changes from
  `unreferenced` to `referenced` after the UI-driven reference-return command.

## Follow-Up

- Continue publishing through `metanc_hmi_dsl` as the source history owner and
  MetaNC `feat/hmi` as the downstream integration surface.
- Keep measurement and true homing work paused until backend parameter,
  variable, and lower-level controller boundaries are designed.
