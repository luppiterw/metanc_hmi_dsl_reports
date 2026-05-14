# Architecture Diagram

```mermaid
flowchart LR
    UI[Web/QML Check action] --> Command[prog.commands.check]
    Command --> Gate[HMI local gate]
    Gate --> Backend[backend/controller adapter diagnostics]
    Backend --> State[program.check.state]
    State --> Prepare[prog.commands.prepare_execute]
    Prepare --> Active[program.active.meta]

    State --> Docs[contract and runtime docs]
    Docs --> Reports[2026-05-14 report]
    Reports --> Portal[docs_html portal]

    Source[metanc_hmi_dsl source repo] --> ExportSync[tools/export_to_metanc.sh]
    ExportSync --> MetaNC[MetaNC/nrt/hmi]
    Reports --> ReportsCommit[reports submodule commit]
    ReportsCommit --> ParentPointer[parent repo submodule pointer]
```

The command/resource boundary is the important product architecture change:
HMI coordinates check state and prepare gating, while real NC decode diagnostics
remain backend/controller-owned. The reports repository records this decision,
and MetaNC receives the filtered HMI package through the existing export script.
