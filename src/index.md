# Reports Overview

This book tracks the daily session reports stored in the `metanc_hmi_dsl_reports` repository.
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
| `2026-05-03` | Server-driven footer notices, explicit runtime log query boundary, operator-notice WebSocket subscription, bilingual docs/report update, final artifact refresh, and MetaNC sync |
| `2026-05-02` | DIAG/LOGS navigation consolidation, Runtime Logs moved under DIAG, top-level LOGS removal, Web/QML multi-action button execution fix, stale page fallback, final artifact refresh, MetaNC sync, static Web preview confirmation, native server launch-mode clarification, Web CodeMirror line-number bundle verification, fallback gutter repair, QML program-editor line-number alignment, native server program workspace restoration, program Open/Activate switching, and editor Execute preparation validation |
| `2026-05-01` | Web/QML dropdown contrast fix, native Web select replacement, Runtime Logs matched blue selected state, final artifact refresh, docs/report update, MetaNC sync, and publication |
| `2026-04-30` | Final docs verification, real runtime log ingest, Diagnostics runtime-log views/actions, client batch upload, JSONL export, policy clear, manual retention, SQLite log persistence, Docker vcpkg/zlib cache fix, final artifact refresh, MetaNC sync, and publication |
| `2026-04-29` | Generated launch-doc fixes, DESIGN.md/docs_i18n design guidance, Web/QML settings panels, top-right settings gear, legacy control removal, QML WSL window placement, logging persistence planning, final artifact refresh, MetaNC sync, and report publication |
| `2026-04-28` | Drogon native server audit, host vcpkg/Drogon tooling, runtime WebSocket subscription, split Web native command flow, AUTO state revision fix, Web client npm/esbuild split, CodeMirror Program editor fixes, MetaNC sync, and report publication |
| `2026-04-27` | `metanc_hmi_dsl` / `MetaNC` sync, client/server engineering docs, zh-CN i18n status tracking, Docker/Drogon server implementation, frontend deployment recommendation, and same-day report refresh |
| `2026-04-26` | Docs portal link hygiene, zh-CN story-pack overlay cleanup, published report transcript path sanitization, codex-conversations turn-level export formatting, HMI server recommendation packaging, and final report refresh verification |
| `2026-04-25` | Story structure tightening, bilingual docs portal output, and page-by-page zh-CN overlay rollout without polluting English source docs |
| `2026-04-24` | Session bootstrap and Codex user-history export tooling |
| `2026-04-23` | Session bootstrap and Codex user-history export tooling |
| `2026-04-22` | Rebuild the shared soft operations panel, then tighten it into a `40x40` hardware-like final layout across retained/QML/Web while restoring the working Web browser screenshot path for final visual verification |
| `2026-04-21` | Finish the header and ops-shell unification, rework the overview page into a tighter one-page layout, then close the QML-only stage/footer and final per-panel stretch/centering issues before the next MetaNC sync round |
| `2026-04-20` | Protect downstream-local MetaNC report entry Markdown, consolidate docs/story structure, and hard-migrate the retained package to `src/hmi_dsl` |
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
| `2026-04-07` | Session bootstrap and Codex user-history export tooling |
| `2026-04-03` | Session bootstrap and Codex user-history export tooling |
| `2026-04-02` | Session bootstrap and Codex user-history export tooling |

Use the session chapters in the sidebar for per-day details.
