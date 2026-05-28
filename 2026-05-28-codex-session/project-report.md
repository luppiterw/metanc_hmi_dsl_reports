# Project Report

Date: 2026-05-28

## Scope

This pass continues the PARAM Tool Management refinement after the previous
Detail-state cleanup. The main product concern was consistency: `Add Edge`
already used Detail draft editing, but `Add Tool` still felt like a separate
creation path. The second concern was Magazine: it needed an initial place in
the Tool Management hierarchy without pretending that full magazine operations
were complete.

The final model keeps `Tool Mgmt` landing on Tool List. Tool List and Tool Wear
remain the daily inspection pages, Detail owns create/edit/remove work, and
Magazine is a first read-only module for pocket occupancy plus assigned-tool
navigation.

## Delivered

- Changed `Add Tool` from a standalone dialog flow into Detail `create_tool`.
  The operator now uses the same draft/save mental model for new tools and new
  edges.
- Removed the obsolete Web/QML create-tool and create-edge dialog helper paths.
- Kept Detail state explicit:
  - `view`: read-only selected-row context
  - `edit`: selected-row draft with `Revert` / `Save`
  - `create_tool`: new tool draft with editable identity, geometry, and wear
  - `create_edge`: selected-tool edge draft with parent tool fields frozen
- Added a Magazine page under Tool Management with a table of magazine,
  pocket, occupancy, assigned tool, edge count, and status.
- Added `runtime_state.selected_magazine_row_key` and
  `selected_magazine_detail_summary` so the UI can keep a stable Magazine
  selection and show contextual pocket detail.
- Added `tooling.magazine.table` to the contract, runtime plan, mock seed, data
  dictionary, generated clients, and server resource adapter.
- Added real `tooling_management` backend support for querying magazine
  pockets by joining magazine pocket state, tool locations, tool rows, and edge
  counts.
- Added local Magazine commands:
  - `tool.commands.open_selected_magazine_tool`
  - `tool.commands.find_empty_magazine_pocket`
- Updated Web and QML command guards so Magazine can open the assigned tool in
  Detail and future empty-pocket work has a visible command stub.
- Updated Tool Management docs, status matrix, story docs, data dictionary,
  Web/QML parity docs, and this report.
- Fixed downstream docs materialization so the new Magazine page remains linked
  when exporting the source package into MetaNC.

## Validation

Source HMI validation before downstream publication:

- `./tools/generate_targets.sh`
- `python3 -m unittest nrt/hmi/tests/test_pipeline.py nrt/hmi/tests/test_tooling_contract_docs.py nrt/hmi/tests/test_story_docs.py nrt/hmi/tests/test_web_qml_parity_docs.py`
- `ctest --test-dir generated/server-build --output-on-failure`
- `python3 -m unittest nrt/hmi/tests/test_generator_refactor.py nrt/hmi/tests/test_qml_smoke.py`
- `./tools/build_docs_html.sh`

Downstream MetaNC validation after filtered export:

- `./tools/generate_targets.sh`
- `node tools/tool_offset_web_strict_smoke.js --distribution generated/distribution --timeout-ms 45000`
- `node tools/tool_offset_qml_strict_smoke.js --distribution generated/distribution --timeout-ms 60000`
- `python3 -m unittest nrt/hmi/tests/test_pipeline.py nrt/hmi/tests/test_tooling_contract_docs.py nrt/hmi/tests/test_story_docs.py nrt/hmi/tests/test_web_qml_parity_docs.py nrt/hmi/tests/test_generator_refactor.py nrt/hmi/tests/test_qml_smoke.py`
- `ctest --test-dir nrt/hmi/generated/server-build --output-on-failure`
- `./tools/build_docs_html.sh`

Follow-up verification after the docs portal generator fix:

- `python3 -m unittest nrt/hmi/tests/test_docs_portal.py nrt/hmi/tests/test_sync_scripts.py nrt/hmi/tests/test_story_docs.py nrt/hmi/tests/test_web_qml_parity_docs.py`
- `python3 -m unittest nrt/hmi/tests/test_pipeline.py nrt/hmi/tests/test_tooling_contract_docs.py nrt/hmi/tests/test_generator_refactor.py`
- `ctest --test-dir nrt/hmi/generated/server-build --output-on-failure`

## Boundary Notes

Magazine V1 is intentionally read-only. It exposes pocket occupancy and
assigned-tool navigation, not pocket assignment, tool loading, unloading, or
replacement policy. `Find Empty` is present as a local navigation/search command
stub, but no backend magazine mutation is claimed in this pass.

The real backend integration is query-only for Magazine. Existing tool create,
edge create, update, remove, enable, disable, refresh, and stale-revision
guards continue to flow through the established tooling command facade.

## Remaining Work

- Promote Magazine from read-only projection to mutation workflows when the
  product semantics for load/unload/move and empty-pocket assignment are fixed.
- Fold future Monitoring, Sister Tools, and OEM Data modules into the same Tool
  Management module model without overloading Tool List footer actions.
- Decide whether `Find Empty` should become a table filter, a selection jump, or
  a guided create-tool entry once magazine mutations exist.
