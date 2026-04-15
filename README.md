# MetaNC HMI DSL Reports

This repository stores the daily session reports that accompany the main `metanc_hmi_dsl` repository.

Contents:

- dated session-report source directories such as `2026-04-14-codex-session/`
- a root-level `book.toml` plus `src/` index for the full session timeline
- mdBook source files for each session report
- shared report-local assets that are intentionally tracked with the report sources

This repository does not treat generated `build_html/` output as source of truth.
Regenerate the aggregate report book locally with:

```bash
mdbook build .
```

Regenerate one session-local report book with:

```bash
mdbook build <session-dir>
```

When used from the main `metanc_hmi_dsl` repository, this repo is mounted at:

- `submodules/metanc_hmi_dsl_reports/`

Typical main-repo workflow:

```bash
git submodule update --init --recursive
mdbook build submodules/metanc_hmi_dsl_reports
mdbook build submodules/metanc_hmi_dsl_reports/<session-dir>
```
