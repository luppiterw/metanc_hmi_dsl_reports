# Project Report

Date: 2026-05-28

## Scope

This pass continues the PARAM Tool Management refinement after the previous
Detail-state cleanup. The main product concern was consistency: `Add Edge`
already used Detail draft editing, but `Add Tool` still felt like a separate
creation path. The second concern was Magazine: it needed a coherent V2 slice
after the first pocket projection, including create-at-pocket, assignment,
move, and unload behavior without pushing loading-station or measurement
semantics into this pass.

The final model keeps `Tool Mgmt` landing on Tool List. Tool List and Tool Wear
remain the daily inspection pages, Detail owns create/edit/remove work, and
Magazine owns pocket occupancy plus explicit create/assign/move/unload actions.

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
- Added real `tooling_management` backend support for querying and mutating
  magazine pockets through the HMI facade while keeping `tooling_management` as
  the truth model.
- Added Magazine commands:
  - `tool.commands.open_selected_magazine_tool`
  - `tool.commands.find_empty_magazine_pocket`
  - `tool.commands.create_tool_at_magazine_pocket`
  - `tool.commands.assign_tool_to_magazine_pocket`
  - `tool.commands.move_tool_magazine_pocket`
  - `tool.commands.clear_tool_magazine_location`
- Updated Web and QML command guards so Magazine can open assigned tools, enter
  Detail `create_tool_at_pocket`, assign selected tools, start/cancel a local
  move-source state, confirm a target pocket, and unload occupied pockets.
- Fixed the QML footer-model selection path so conditional footer groups with
  tertiary state such as `magazine_operation_mode` are selected at runtime, not
  only present in generated snapshots.
- Updated Tool Management docs, status matrix, story docs, data dictionary,
  Web/QML parity docs, and this report.
- Fixed downstream docs materialization so the new Magazine page remains linked
  when exporting the source package into MetaNC.

## Validation

Source HMI validation before downstream publication:

- `./tools/generate_targets.sh`
- `python3 -m unittest -v tests.test_pipeline tests.test_tooling_contract_docs tests.test_story_docs tests.test_web_qml_parity_docs`
- `ctest --test-dir generated/server-build --output-on-failure`
- `cmake --build generated/server-build-tooling-management-check --target tool_offset_contract_parity_test tooling_management_backend_test`
- `ctest --test-dir generated/server-build-tooling-management-check -R "tool_offset_contract_parity_test|tooling_management_backend_test" --output-on-failure`
- `./tools/build_docs_html.sh`
- `git diff --check`

Downstream MetaNC validation is run after the filtered export lands in
`MetaNC/feat/hmi`; it uses the same generated package surfaces and CTest/Python
gates from the downstream checkout.

## Boundary Notes

Magazine V2 covers direct HMI-facing pocket assignment workflows: find empty,
create at pocket through Detail, assign selected tool, move occupied source to
enabled empty target, and unload. It still does not claim loading-station,
measurement-cycle, oversize adjacency, sister-tool replacement, or magazine
group policy.

The real backend integration stays above `tooling_management`: HMI owns the
operator flow and command facade, while `tooling_management` owns the truth
model, location intent validation, snapshots, and persistence.

## Remaining Work

- Add loading-station flows when the product semantics are fixed.
- Add oversize/adjacency and replacement policy only when the magazine model
  needs those constraints in the HMI.
- Fold future Monitoring, Sister Tools, and OEM Data modules into the same Tool
  Management module model without overloading Tool List footer actions.
- Decide whether `Find Empty` should remain a selection jump or grow into a
  guided create/load flow once loading-station semantics exist.
