# Workflow Diagram

```mermaid
flowchart TD
    A[User identifies duplicated JOG home controls] --> B[Inspect retained UI structure and soft panel]
    B --> C[Define boundary: MAIN/JOG setup-status, soft panel commands]
    C --> D[Edit definition/ui.structure.yaml]
    D --> E[Regenerate Web/QML/distribution outputs]
    E --> F[Refresh generated snapshots]
    F --> G[Run pipeline snapshot tests]
    G --> H[Run split Web DOM probe]
    H --> I[Update story catalog and docs]
    I --> J[Fix MDI editor focus vs soft-panel AUTO mode switch]
    J --> K[Run split Web MDI to AUTO probe]
    K --> L[Split Web generator source: styles and feature JS snippets]
    L --> M[Split widget_core JS and legacy shell CSS fragments]
    M --> N[Verify byte-stable generated Web/QML snapshots]
    N --> O[Export 2026-05-09 user history and Codex conversations]
    O --> P[Build reports and docs portal]
    P --> Q[Commit reports submodule]
    Q --> R[Commit and push metanc_hmi_dsl]
    R --> S[Sync package to MetaNC/nrt/hmi]
    S --> T[Commit and push MetaNC feat/hmi]
```
