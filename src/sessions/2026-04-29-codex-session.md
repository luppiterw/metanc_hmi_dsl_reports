# 2026-04-29 Session

Focus:

- Session bootstrap and Codex user-history export tooling
- Generated runtime launch-doc audit, Web/QML/distribution README template fixes, regenerated artifacts, MetaNC sync, and 2026-04-29 report publication

Session assets:

- Session directory: `2026-04-29-codex-session/`
- Session HTML after local build: [Open](../../2026-04-29-codex-session/build_html/index.html)
- Main sources:
  - `2026-04-29-codex-session/README.md`
  - `2026-04-29-codex-session/project-report.md`
  - `2026-04-29-codex-session/conversation-report.md`
  - `2026-04-29-codex-session/user-history.md`
  - `2026-04-29-codex-session/codex-conversations/index.html`
  - `2026-04-29-codex-session/workflow-diagram.md`
  - `2026-04-29-codex-session/architecture-diagram.md`

Key outcomes:

- Audited generated Web, QML, and distribution scripts and README output for stale launch guidance.
- Clarified the difference between repo fixture mock-server helpers and the self-contained native Drogon server helpers.
- Corrected split Web native usage to document `http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime` and fixture Web usage to document `http://127.0.0.1:8010/`.
- Updated QML generated README file lists and the out-of-source build run command.
- Regenerated the generated Web/QML/distribution outputs with host vcpkg native-server build mode.
- Committed and pushed the source changes, exported the HMI package into `MetaNC/nrt/hmi`, and committed/pushed the downstream sync.
- Created the 2026-04-29 report tree, full Codex conversation export, aggregate report links, and rebuilt the report/doc outputs.
