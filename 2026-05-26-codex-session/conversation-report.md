# Conversation Report

Date: 2026-05-26

## Summary

The session started from the REF POINT Story Slice Spec and implemented the
HMI-side manual reference return V1. The user then tested the generated
MetaNC split Web tooling workflow, found REF POINT behavior issues, confirmed
the startup path, and moved into PARAM Tool Offset Detail usability.

The Tool Offset discussion identified three operator-facing problems:

- Detail was too wide and produced horizontal scroll pressure.
- Add Edge/Revert/Save were visually grouped as if they were global softkeys
  rather than Detail-local actions.
- direct Detail field edits did not enable Revert and Save because the Web
  client updated local draft state silently and the shell render signature did
  not include dirty/can-save state.

The final startup issue was an intermittent `Address already in use` failure on
backend port `8010`. The root cause was the split script treating any healthy
process on `8010` as the newly started backend, then starting the Web client
even when the newly spawned backend had failed to bind.

The publication request then required report/docs regeneration, source repo
synchronization, downstream MetaNC export, commit, and push. The full Codex
conversation export was refreshed for the session.

## Decisions

- REF POINT remains a JOG submode rather than a new top-level machine mode.
- `reference_return` naming is used for the command surface to avoid confusing
  it with work offsets, zero offsets, or WCS naming.
- The V1 simulator behavior completes reference return deterministically and
  immediately; this is acceptable for HMI parity and UI automation, but it is
  not a real homing implementation.
- `axis.*.reference_state` must be part of runtime subscriptions, not only a
  server-side property, otherwise strict Web clients can miss updates.
- Tool Offset global footer softkeys should represent function-level workflow:
  Standard, Extend, Detail, Add Tool, Refresh, Enable, Disable, Remove, and
  Return.
- Tool Offset Detail-local actions should represent selected-row editing:
  Add Edge, Revert, and Save.
- Revert and Save are disabled in view mode and become enabled only when the
  Detail draft differs from the selected row and passes saveability checks.
- Split Web tooling launchers must fail closed on ambiguous backend port reuse
  instead of starting a Web client against a stale or failed runtime.

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
- Tool Offset Detail layout now uses bounded width rules so the Detail form,
  action row, and Runtime Context align without horizontal overflow.
- The Web Detail form writes field edits through non-silent local-state updates.
- The Web shell render signature includes `tool_offset_detail_dirty`,
  `tool_offset_detail_can_save`, and `tool_offset_detail_error`, so Add Edge,
  Revert, Save, and status text update immediately after field edits.
- `run_split_web_tooling_management.sh` and
  `run_split_qml_tooling_management.sh` now keep a managed backend PID file,
  stop the previous managed backend on relaunch, and reject unrelated backend
  port listeners with an explicit diagnostic.

## Follow-Up

- Continue publishing through `metanc_hmi_dsl` as the source history owner and
  MetaNC `feat/hmi` as the downstream integration surface.
- Keep measurement and true homing work paused until backend parameter,
  variable, and lower-level controller boundaries are designed.
- Keep Tool Offset hierarchy explanations in docs and UI aligned as future
  magazine/life/advanced-remove workflows are added.
