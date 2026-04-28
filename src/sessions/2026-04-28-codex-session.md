# 2026-04-28 Session

Focus:

- Drogon native server audit, host vcpkg/Drogon tooling, runtime WebSocket subscription, split Web native command flow, AUTO state revision fix, Web client npm/esbuild split, CodeMirror Program editor fixes, MetaNC sync, and report publication

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
- Clarified the host vcpkg route for native builds and noted that `drogon_ctl` is installed under the vcpkg Drogon tools directory but still needs PATH exposure for direct shell use.
- Added and verified native server WebSocket subscription so the Web client can bootstrap over HTTP, post commands over HTTP, and receive server-published state over WS.
- Filled the server simulator command gaps that blocked soft-panel JOG/AUTO operation in split native mode.
- Fixed the Web client WS revision handling bug that caused AUTO running-line, executing block, elapsed time, and axis updates to be ignored after `CYCLE START`.
- Split the Web client into source modules plus an npm/esbuild bundle and generated JSON seed files, so third-party Web editor/runtime dependencies can be managed without embedding everything in generator strings.
- Reworked the Program editor around a CodeMirror provider, fixed its generated layout sizing, stopped execution-line updates from moving the edit cursor, and improved selected-text contrast with a dark high-opacity selection color.
- Synced the necessary HMI runtime changes into `MetaNC/feat/hmi` and verified downstream `nrt/hmi` tests.
- Generated the 2026-04-28 report tree, complete Codex conversation export, and aggregate report links.
