# Project Report

Date: 2026-06-09

## Scope

This pass closed the gap between the integrated MetaNC HMI branch and the
standalone HMI DSL repository. `MetaNC/feat/hmi` already contained the reviewed
Magazine fixture follow-up from PR #38, while `metanc_hmi_dsl` still lacked the
mock runtime command handlers, table-level magazine revision seed, and matching
tests/snapshots.

The goal was to make the standalone package current again, refresh report and
documentation outputs, then publish the reports submodule before the parent
repository.

## Delivered

- Imported the shared HMI package sources from `MetaNC/nrt/hmi` into
  `metanc_hmi_dsl/nrt/hmi` with `tools/import_from_metanc.sh`.
- Preserved standalone-only report surfaces during import:
  - `docs/index.md`
  - `docs/project/index.md`
  - `docs/project/reports.md`
  - `docs/acceptance_reference/story_pack/execution_links.md`
- Added the missing mock Magazine command handlers in the standalone fixture:
  - `tool.commands.find_empty_magazine_pocket`
  - `tool.commands.assign_tool_to_magazine_pocket`
  - `tool.commands.create_tool_at_magazine_pocket`
  - `tool.commands.clear_tool_magazine_location`
  - `tool.commands.move_tool_magazine_pocket`
- Aligned the mock `tooling.magazine.table` seed so every row starts with the
  same table-level `snapshot_revision`.
- Pulled the related unittest coverage and generated snapshot updates into the
  standalone package.
- Created the 2026-06-09 report package and complete Codex conversation export.
- Updated the aggregate report timeline so the new session is reachable from
  the reports book and the HMI docs portal.

## Validation

Focused validation after the MetaNC-to-standalone import:

```bash
python3 -m unittest -v tests.test_mock_runtime_server tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_generator_refactor
python3 -m tools.hmi_dsl validate definition/product.manifest.yaml
```

The final publication pass also rebuilds generated HMI targets, the aggregate
reports book, the dated session book, and the HMI docs portal before commit.

## Boundary Notes

`metanc_hmi_dsl` remains the source repository for report history,
`submodules/metanc_hmi_dsl_reports/`, report export tools, and source-local
report timeline pages. `MetaNC/nrt/hmi` remains the downstream integration copy.
The downstream sync must keep source-only report tooling and report submodule
content out of MetaNC.

## Remaining Work

- Keep future PR review fixes synchronized back into `metanc_hmi_dsl` after
  they land on `MetaNC/feat/hmi`.
- Continue checking export dry-runs before downstream sync whenever report or
  docs-source boundaries change.
