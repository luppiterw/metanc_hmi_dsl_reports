# Architecture Diagram

```mermaid
flowchart LR
    Repo[metanc_hmi_dsl main repo] --> Retained[Retained package<br/>ui.structure.yaml + design.import.yaml]
    Repo --> Emitters[Generator sources<br/>qml_widget_emitters.py + web.py + qml.py + web_shell.py]
    Repo --> ToolingDoc[Developer guidance<br/>docs/development_guidelines/tooling.md]
    Repo --> Tests[Pipeline assertions<br/>tests/test_pipeline.py]
    Repo --> Changelog[CHANGELOG.md]
    Repo --> ReportsSubmodule[submodules/metanc_hmi_dsl_reports]

    Retained --> Emitters
    Emitters --> BrandSwitch[Internal masthead switch<br/>MASTHEAD_BRAND_MODE: text | logo]
    BrandSwitch --> BrandAsset[Brand asset<br/>assets/metanc_brand_gold.png]
    Emitters --> WebOut[generated/web]
    Emitters --> QmlOut[generated/qml + generated/qml-final]
    Tests --> WebOut
    Tests --> QmlOut
    ToolingDoc --> BrandSwitch

    QmlOut --> QmlShot[QML preview<br/>/tmp/hmi_soft_panel_preview_v3.png]
    WebOut --> WebShot[Web preview<br/>/tmp/hmi_soft_panel_web_preview_v3.png]

    ReportsSubmodule --> Session[2026-04-22 session report<br/>README / project / conversation / diagrams / user-history]
    ReportsSubmodule --> Aggregate[Aggregate mdBook index<br/>src/index.md + src/sessions/...]
    Session --> Aggregate

    Retained --> FinalDeck[Final ops deck contract<br/>40x40 buttons + right-side JOG/WCS + moved-up F/S + merged command/blank row]
    Emitters --> FinalDeck

    Repo --> ExportScript[tools/export_to_metanc.sh]
    Repo --> PackageScript[tools/generate_targets.sh<br/>copies web/assets into distribution]
    PackageScript --> WebOut
    ExportScript --> MetaNC[MetaNC repo<br/>feat/hmi -> nrt/hmi]
```
