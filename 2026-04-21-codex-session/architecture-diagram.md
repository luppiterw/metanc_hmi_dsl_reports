# Architecture Diagram

```mermaid
flowchart LR
    Repo[metanc_hmi_dsl main repo] --> Gen[Generator sources<br/>web.py / qml.py]
    Repo --> Snap[Tracked snapshots<br/>web + qml]
    Repo --> Changelog[CHANGELOG.md]
    Repo --> Docs[docs/ and docs_html]
    Repo --> ReportsSubmodule[submodules/metanc_hmi_dsl_reports]

    Gen --> Targets[generated/web<br/>generated/qml<br/>generated/qml-final]
    Targets --> QmlShot[QML offscreen screenshot]
    QmlShot --> Snap

    ReportsSubmodule --> Session[2026-04-21 session report]
    ReportsSubmodule --> Aggregate[Aggregate mdBook index]

    Repo --> ExportScript[tools/export_to_metanc.sh]
    ExportScript --> MetaNC[MetaNC repo<br/>feat/hmi -> nrt/hmi]
```
