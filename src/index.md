# Session Reports

This book is the top-level report index for the `metanc_hmi_dsl_reports` repository.
It provides one maintained entrypoint for the full daily-session history while keeping each dated session report independently buildable.

## Structure

- Per-session source directories remain at `YYYY-MM-DD-codex-session/`
- Each session still owns its own `book.toml` and `build_html/`
- This root book provides the cross-session timeline and maintenance entrypoint

## Build Commands

Build the aggregate report book:

```bash
mdbook build .
```

Build one specific session book:

```bash
mdbook build 2026-04-20-codex-session
```

When this repository is mounted into the main project as a submodule, the equivalent commands are:

```bash
git submodule update --init --recursive
mdbook build submodules/metanc_hmi_dsl_reports
mdbook build submodules/metanc_hmi_dsl_reports/2026-04-20-codex-session
```

## Current Timeline

| Session | Primary focus |
| --- | --- |
| `2026-04-20` | Protect downstream-local MetaNC report entry Markdown during import/export sync and refresh report/docs indexes |
| `2026-04-17` | `MetaNC/nrt/hmi` sync hardening, superpowers-guided QML/Web shell overhaul, and snapshot refresh |
| `2026-04-16` | QML/Web runtime alignment, motion smoothing, and main-page web layout repair |
| `2026-04-15` | QML table overlap fix, report submodule adoption, docs mdBook cleanup, export helper |
| `2026-04-14` | Web/QML operations panel, table pages, render hardening, distribution refresh |
| `2026-04-13` | Program page usability, `AUTO / MDA / JOG` execution flow, main-page preview |
| `2026-04-12` | Program workspace introduction, browser/editor split, workspace-backed generation |
| `2026-04-11` | June demo package consolidation, global ops panel, real program management flows |
| `2026-04-10` | Layout stabilization, pressed feedback, story-doc and traceability pack rollout |
| `2026-04-09` | Shared runtime contract, runtime seed, report-book workflow introduction |
| `2026-04-08` | Initial repository, retained DSL, adapters, generators, and first report |

Use the session chapters in the sidebar for per-day details.
