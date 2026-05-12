# Workflow Diagram

```mermaid
flowchart TD
    A[Accepted next plan] --> B[Inspect current repo state]
    B --> C[Add QML transport smoke helper]
    C --> D[Add WebSocket-only reconnect script]
    D --> E[Extend Python QML smoke runner]
    E --> F{QtWebSockets available?}
    F -->|yes| G[Run full WS open/disconnect/reconnect smoke]
    F -->|no| H[Skip WS-only smoke with explicit reason]
    G --> I[Run existing strict bootstrap/restart tests]
    H --> I
    I --> J[Regenerate Web/QML/server/distribution]
    J --> K[Refresh QML snapshot]
    K --> L[Run generator, QML, and parity docs tests]
    L --> M[Update parity/status/changelog docs]
    M --> N[Generate user history and full Codex conversation export]
    N --> O[Build session report book]
    O --> P[Build aggregate reports and docs_html portal]
    P --> Q[Commit/push reports submodule]
    Q --> R[Commit/push metanc_hmi_dsl]
    R --> S[Export source package to MetaNC nrt/hmi]
    S --> T[Validate MetaNC mirror]
    T --> U[Commit/push MetaNC feat/hmi]
```
