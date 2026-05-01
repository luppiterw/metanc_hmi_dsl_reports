# 2026-05-01 Session

Focus:

- Web/QML dropdown contrast fix for blue theme
- Web Settings and Runtime Logs selectors moved away from native `<select>`
- QML ComboBox popup/delegate styling aligned to Runtime Logs selected-row color
- Final Web/QML/server artifact refresh
- Docs, i18n overlay, report, MetaNC sync, and publication

Session assets:

- Session directory: `2026-05-01-codex-session/`
- Session HTML after local build: [Open](../../2026-05-01-codex-session/build_html/index.html)
- Main sources:
  - `2026-05-01-codex-session/README.md`
  - `2026-05-01-codex-session/project-report.md`
  - `2026-05-01-codex-session/conversation-report.md`
  - `2026-05-01-codex-session/user-history.md`
  - `2026-05-01-codex-session/codex-conversations/index.html`
  - `2026-05-01-codex-session/workflow-diagram.md`
  - `2026-05-01-codex-session/architecture-diagram.md`

Key outcomes:

- Confirmed the remaining Web problem came from native browser `<select>` expanded-state rendering, not just the chosen color value.
- Added a shared generated Web `createHmiSelect` helper for Settings enum controls and Runtime Logs `Level` / `Time` filters.
- Styled Web selector menu, hover, focus, and selected states with a dark console surface plus the Runtime Logs blue selected-row highlight.
- Styled QML ComboBox popup/delegate states for the header theme selector and Settings selectors.
- Updated visual design guidance so future selector/dropdown fixes do not rely on native option/default delegate rendering.
- Refreshed snapshots and regenerated final distributions in both repositories.

Notes:

- The 2026-05-01 full Codex conversation export publishes `1` primary session, `10` user prompts, and `69` Codex messages.
