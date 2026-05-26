# 2026-05-26 Codex Session Report

This directory records the structured project report for the 2026-05-26 HMI
REF POINT, Tool Offset, split Web tooling startup, documentation, and
publication pass.

The session includes structured project results, validation evidence,
synchronization notes, prompt history, and a full Codex conversation export.

## Session Focus

- Implement the HMI-side REF POINT / manual reference return V1.
- Wire Web, QML, mock runtime, and native simulator behavior behind one
  command contract.
- Refine PARAM Tool Offset hierarchy so global softkeys select Tool Offset
  views and lifecycle actions while Detail-local actions handle Add Edge,
  Revert, and Save.
- Fix Tool Offset Detail layout, dirty-state refresh, and Save/Revert enablement
  after direct field edits.
- Harden `run_split_web_tooling_management.sh` and the QML companion against
  ambiguous backend port reuse so the Web client does not start against a stale
  or failed `8010` server.
- Regenerate English and zh-CN story-pack outputs, generated targets, and
  snapshot baselines.
- Rebuild reports and docs portal with the refreshed full conversation export.
- Sync the filtered HMI package back into MetaNC `feat/hmi`.

## Assets

- `project-report.md`: implementation and validation summary
- `conversation-report.md`: decision and boundary summary
- `user-history.md`: raw-history export note
- `codex-conversations.md`: full-conversation export note
- `workflow-diagram.md`: publication flow
- `architecture-diagram.md`: REF POINT mock/runtime boundary
- `build_html/index.html`: mdBook output after local build
- `codex-conversations/`: complete Codex conversation export

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-26`
- Sessions: `8`
- Primary sessions: `6`
- Side sessions: `2`
- User prompts: `194`
- Synthetic events: `7`
- Messages: `1118`
- User messages: `201`
- Codex messages: `917`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
