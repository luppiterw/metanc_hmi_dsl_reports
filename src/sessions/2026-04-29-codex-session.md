# 2026-04-29 Session

Focus:

- Session bootstrap and Codex user-history export tooling
- Generated runtime launch-doc audit, Web/QML/distribution README template fixes, regenerated artifacts, MetaNC sync, and 2026-04-29 report publication
- Design guidance docs, Web/QML settings panels, top-right settings gear, legacy shell-control removal, QML WSL window placement, and Alt-drag window movement

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
- Added the design guideline docs path used by root `DESIGN.md`, including zh-CN i18n and development guide navigation.
- Implemented Web/QML settings panels for runtime connection, server mode, theme, and soft-panel visibility.
- Moved the settings entry to a top-right gear and removed Web legacy top controls from generated HTML/JS.
- Added QML screen-safe startup geometry for WSL and `Alt + left mouse` system window move support.
- Rebuilt final artifacts and validated the updated Web/QML shell behavior with tests and live Web screenshot checks.
- Planned the persistent logging and server-side persistence layer, including SQLite-first storage, replaceable Store interfaces, log/query/export/retention slices, and zh-CN/docs_html coverage.
