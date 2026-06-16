# Project Report

## Outcome

The publication work was routed through an isolated MetaNC worktree at
`/tmp/metanc_feat_hmi_publish` on `feat/hmi`. This kept the active
`feat/hmi-work-offset-table` planning checkout untouched and avoided mixing the
Work Offset design-doc branch into the long-lived HMI maintenance branch.

The standalone `metanc_hmi_dsl` repository remained the source package for HMI
reports, docs portal refreshes, and filtered sync tooling. The downstream
`MetaNC/nrt/hmi` package remained the integration copy and was handled only
through the checked-in import/export scripts.

## WorkOffset HMI Planning

The WorkOffset planning slice settled the first HMI integration boundary:

- V1 is scoped to the PARAM Work Offset table, not tool interaction, probing,
  workpiece measurement, G500 UI, or frame-detail editing.
- `wcs.offset.table` is the canonical HMI resource; `tooling.wcs.table` stays a
  compatibility alias owned by the HMI app/resource layer.
- The HMI server maps WorkOffset `settable_table` rows into HMI table rows while
  preserving `row_id`, selector, active/editable state, row revision,
  snapshot revision, and per-cell `axis_id`.
- `wcs.commands.activate` wraps `select_settable_zero_offset` and uses the
  active-state revision for stale protection.
- `wcs.commands.set_offset` wraps `set_frame_component` with
  `component_kind=coarse_translation`; client-supplied `axis_id` is an echo
  check, not the authority.
- The real backend plan uses `StoreBackedWorkOffsetRuntime` through WorkOffset
  APIs, with HMI-owned mock/runtime adapter code and no direct SQLite access.

## Branch And Sync Boundary

The branch check found that local `feat/hmi` was ahead of `origin/feat/hmi` by
the previously merged `origin/main` updates and had no remote divergence. The
current WorkOffset planning checkout remained on `feat/hmi-work-offset-table`
with only uncommitted planning docs and was not used for this publication flow.

The sync boundary stayed script-owned:

- `tools/import_from_metanc.sh /tmp/metanc_feat_hmi_publish` for downstream to
  standalone source back-sync.
- `tools/export_to_metanc.sh /tmp/metanc_feat_hmi_publish` for filtered
  standalone to downstream export.
- The reports submodule is published before the parent `metanc_hmi_dsl` pointer.

## Validation Gate

The intended final gate for this publication pass is:

- export/import sync scripts keep source-only and downstream-only surfaces out of
  each other.
- `mdbook build submodules/metanc_hmi_dsl_reports`
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-06-12-codex-session`
- `./tools/build_docs_html.sh`
- `./tools/generate_targets.sh`
- `ctest --test-dir generated/server-build --output-on-failure`
- matching HMI artifact generation and docs build in the MetaNC `feat/hmi`
  worktree after filtered export.

This report is updated in the same publication round as those commands.

## Residual Risks

- The WorkOffset implementation itself has not started in this report; the
  completed artifact is the HMI-side plan and publication sync state.
- The real WorkOffset backend will still need implementation-time validation of
  C++ standard compatibility and persistence seed behavior.
- The long-lived `feat/hmi` branch intentionally carries a main merge ahead of
  `origin/feat/hmi`; publication should push that branch only after the HMI
  package sync and final artifact gates are clean.
