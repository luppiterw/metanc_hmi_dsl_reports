# Maintenance

Use this root book as the maintained entrypoint for the full report history.

## When adding a new daily session

1. Create a new directory such as `2026-04-15-codex-session/`
2. Add or update the session-local report sources and its session `book.toml`
3. Add a new chapter file under `src/sessions/`
4. Add that chapter to `src/SUMMARY.md`
5. Refresh the aggregate book:

```bash
mdbook build .
```

6. Refresh the session-local book:

```bash
mdbook build <session-dir>
```

## Recommended chapter template

Each `src/sessions/<session-id>.md` page should include:

- session date and title
- one short focus summary
- the session directory path
- a link to the session-local HTML book
- the main source file names for quick navigation

## Why both layers exist

- The root book gives one stable index for the whole report history
- The per-session books preserve the richer Mermaid-enabled reading layout for each daily report
- Keeping both avoids forcing one giant book to inline every historical report file

