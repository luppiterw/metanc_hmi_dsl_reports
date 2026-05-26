# 2026-05-26 Codex Session Report

This directory records the structured project report for the 2026-05-26 HMI
REF POINT / manual reference return implementation and publication pass.

This report intentionally does not include raw Codex conversation history.
The raw-history export step was not approved for this pass, so the session
contains project results, validation evidence, and synchronization notes only.

## Session Focus

- Implement the HMI-side REF POINT / manual reference return V1.
- Wire Web, QML, mock runtime, and native simulator behavior behind one
  command contract.
- Regenerate English and zh-CN story-pack outputs, generated targets, and
  snapshot baselines.
- Rebuild reports and docs portal without exporting raw conversation history.
- Sync the filtered HMI package back into MetaNC `feat/hmi`.

## Assets

- `project-report.md`: implementation and validation summary
- `conversation-report.md`: decision and boundary summary
- `user-history.md`: raw-history export note
- `codex-conversations.md`: full-conversation export note
- `workflow-diagram.md`: publication flow
- `architecture-diagram.md`: REF POINT mock/runtime boundary
- `build_html/index.html`: mdBook output after local build
