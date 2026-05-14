# Architecture Diagram

```mermaid
flowchart LR
    Codex[Local Codex history] --> Exporter[tools/export_codex_user_history.py]
    Exporter --> Session[2026-05-14-codex-session]
    Session --> ReportRoot[reports aggregate book]
    ReportRoot --> DocsPortal[metanc_hmi_dsl docs_html]

    Source[metanc_hmi_dsl source repo] --> ExportSync[tools/export_to_metanc.sh]
    ExportSync --> MetaNC[MetaNC/nrt/hmi]

    ReportRoot --> ReportsCommit[reports submodule commit]
    ReportsCommit --> ParentPointer[metanc_hmi_dsl submodule pointer]
    ParentPointer --> ParentCommit[parent repo commit]
    MetaNC --> MetaNCCommit[MetaNC feat/hmi commit]
```

The reports repository remains the durable home for daily session assets. The
parent source repository owns the generated documentation portal and records the
reports submodule revision. The downstream MetaNC repository receives only the
filtered HMI package sync.
