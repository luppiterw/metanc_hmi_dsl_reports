# 2026-04-26 Session

Focus:

- Docs portal link hygiene, zh-CN story-pack overlay cleanup, published report transcript path sanitization, codex-conversations turn-level export formatting, HMI server recommendation packaging, and final report refresh verification

Session assets:

- Session directory: `2026-04-26-codex-session/`
- Session HTML after local build: [Open](../../2026-04-26-codex-session/build_html/index.html)
- Main sources:
  - `2026-04-26-codex-session/README.md`
  - `2026-04-26-codex-session/project-report.md`
  - `2026-04-26-codex-session/conversation-report.md`
  - `2026-04-26-codex-session/user-history.md`
  - `2026-04-26-codex-session/codex-conversations/index.html`
  - `2026-04-26-codex-session/workflow-diagram.md`
  - `2026-04-26-codex-session/architecture-diagram.md`

Key outcomes:

- Final `docs_html` no longer ships unresolved local links
- zh-CN story-pack pages now fall back to generated content instead of stale overlay pages
- Published report transcripts now collapse obvious `/home/...` and `/tmp/...` paths into safer readable aliases
- The same docs portal publication logic is mirrored into `MetaNC/nrt/hmi`
- `codex-conversations` detailed pages now group by turn, and the index expands to turn-level rows instead of one first-user title per rollout file
- A standalone `HMI server` recommendation package with Markdown, PDF, and two diagrams is now archived inside the session report
- The day-end report export was refreshed again after the user noticed stale session data, so `user-history` and `codex-conversations` now include the latest final discussion
