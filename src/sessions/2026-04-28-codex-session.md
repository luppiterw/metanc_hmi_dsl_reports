# 2026-04-28 Session

Focus:

- Drogon native server audit, legacy cleanup, Docker context hardening, generated runtime copy correction, verification, and report publication

Session assets:

- Session directory: `2026-04-28-codex-session/`
- Session HTML after local build: [Open](../../2026-04-28-codex-session/build_html/index.html)
- Main sources:
  - `2026-04-28-codex-session/README.md`
  - `2026-04-28-codex-session/project-report.md`
  - `2026-04-28-codex-session/conversation-report.md`
  - `2026-04-28-codex-session/user-history.md`
  - `2026-04-28-codex-session/codex-conversations/index.html`
  - `2026-04-28-codex-session/workflow-diagram.md`
  - `2026-04-28-codex-session/architecture-diagram.md`

Key outcomes:

- Confirmed the production native server path is Drogon-based: CMake links `Drogon::Drogon`, REST routes use `drogon::app()`, and WebSocket subscriptions use Drogon controller wiring.
- Fixed Docker context leakage so host-side `server/build`, `cmake-build-*`, and `vcpkg_installed` artifacts cannot poison container builds.
- Replaced stale Web/QML strict-client connection copy that still referenced the old split mock server role.
- Updated generated runtime snapshots and distribution README wording to match the native HMI server path.
- Verified Docker smoke, container one-shot startup, and generator snapshot output.
- Generated the 2026-04-28 report tree, complete Codex conversation export, and aggregate report links.
