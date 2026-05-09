# 2026-05-09 Session

Focus:

- MAIN/JOG display cleanup: operation controls stay in the soft panel while the dashboard keeps manual setup and read-only live status.
- Server simulator FS semantics: completed discrete JOG motion now drops `feed.speed_actual` to zero while preserving target/cmd feed values.
- DEBUG natural-query submit behavior: Web/QML now run the same query path from `Run`, `Enter`, and `Return`.
- DEBUG natural-query stability and parser coverage: focus-preserved Web queries refresh result rows directly, QML submit is timer-backed, and axis shorthand such as `x`, `xy`, `xyz`, and `x轴` resolves to axis values.
- Web generator source split into feature JS modules, `widget_core` JS fragments, ordered CSS emitters, legacy shell CSS fragments, and `runtime_fragments` JS templates, with generated Web/QML snapshots kept stable.
- QML widget emitter source split into focused `widget_fragments/` modules behind the existing dispatch entrypoint, with generated `Main.qml` semantics kept stable.
- QML runtime store source split into ordered `runtime_fragments/`, then QML command dispatch split into ordered `command_blocks/`, with generated `RuntimeStore.qml` semantics kept stable.
- Story catalog, data dictionary, status matrix, generated snapshots, report books, and docs portal refreshed.

Session assets:

- Session directory: `2026-05-09-codex-session/`
- Session HTML after local build: [Open](../../2026-05-09-codex-session/build_html/index.html)
- Main sources:
  - `2026-05-09-codex-session/README.md`
  - `2026-05-09-codex-session/project-report.md`
  - `2026-05-09-codex-session/conversation-report.md`
  - `2026-05-09-codex-session/user-history.md`
  - `2026-05-09-codex-session/codex-conversations/index.html`
  - `2026-05-09-codex-session/workflow-diagram.md`
  - `2026-05-09-codex-session/architecture-diagram.md`
