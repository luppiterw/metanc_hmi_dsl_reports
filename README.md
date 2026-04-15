# MetaNC HMI DSL Reports

This repository stores the daily session reports that accompany the main `metanc_hmi_dsl` repository.

Contents:

- dated session-report source directories such as `2026-04-14-codex-session/`
- mdBook source files for each session report
- shared report-local assets that are intentionally tracked with the report sources

This repository does not treat generated `build_html/` output as source of truth.
Regenerate report HTML locally with:

```bash
mdbook build <session-dir>
```
