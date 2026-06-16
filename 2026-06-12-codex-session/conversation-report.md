# Conversation Report

## Session Decisions

The first decision was to keep WorkOffset HMI integration as a HMI-owned slice.
The domain module owns zero-offset semantics, row identity, revision guards, and
single-command writes. HMI owns table projection, command wrapping, mock/runtime
adapter choice, resource aliasing, and Web/QML payload handling.

The second decision was to use a short-lived planning branch for the WorkOffset
design docs and keep it separate from long-lived `MetaNC/feat/hmi` maintenance.
When the publication request targeted `MetaNC-feat/hmi`, the active checkout was
not suitable because it was on `feat/hmi-work-offset-table`. The safe path was
to create an isolated `/tmp` worktree for `feat/hmi` and leave the planning
checkout untouched.

The third decision was to keep the existing standalone/downstream sync contract:
`metanc_hmi_dsl/nrt/hmi` remains the source package and owns reports, i18n
overlays, and sync tooling; `MetaNC/nrt/hmi` remains the filtered downstream
integration package.

## WorkOffset Plan Review

Multiple review passes converged the plan around these issues:

- active-row activation must use the active-state revision rather than row or
  table revisions.
- visible `X/Y/Z/A/C` labels are acceptable for V1, but write payloads must
  resolve to WorkOffset `axis_id` values.
- WorkOffset extension code belongs beside HMI server tooling extension code,
  not in `nrt/work_offset`.
- canonical resource publishing is `wcs.offset.table`; legacy alias sync is a
  global HMI app/resource concern.
- real backend integration must use `StoreBackedWorkOffsetRuntime`, not direct
  SQLite calls from HMI.
- client stale handling must be generalized beyond Tool Offset so Web and QML
  react consistently to WorkOffset command rejection.

## Publication Notes

The reports exporter created the 2026-06-12 session package and complete Codex
conversation export. The generated session was then promoted from bootstrap
content into a reader-facing report with explicit project, workflow, and
architecture pages.

The publication flow intentionally checks for branch anomalies before writing:
standalone `metanc_hmi_dsl` and the reports submodule were clean and aligned
with their remotes; local MetaNC `feat/hmi` was ahead of its remote but not
diverged.
