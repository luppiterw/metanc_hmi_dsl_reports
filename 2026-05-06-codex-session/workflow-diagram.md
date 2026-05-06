# Workflow Diagram

```mermaid
flowchart TD
    A[User asks about C++ version floor] --> B[Audit server and QML CMake]
    B --> C[Set native C++ floor to C++17]
    C --> D[Update EN/ZH build docs and regression tests]

    E[Docs portal review] --> F[Adopt bookshelf.toml for final docs_html]
    F --> G[Rebuild docs portal and report books]

    H[Shell feedback] --> I[Replace TIME chip with server status]
    H --> J[Icon-only Return softkeys]

    K[Logs page review] --> L{Right detail panel consumes width?}
    L -->|yes| M[Make log table full width]
    M --> N[Open bottom detail only after row click]
    N --> O[Add runtime_state.log_detail_open]
    O --> P[Update Web and QML generators]
    K --> K1{Message column loses scan priority?}
    K1 -->|yes| K2[Add Web visible-column controls]
    K2 --> K3[Add message wrap and reset controls]
    K --> K4{Controls look static?}
    K4 -->|yes| K5[Add hover pressed focus states]
    K --> K6{Export JSONL only copies?}
    K6 -->|yes| K7[Web save picker and download fallback]
    K6 --> K8[QML QFileDialog save path]

    D --> Q[Regenerate Web/QML/distribution]
    G --> Q
    I --> Q
    J --> Q
    P --> Q
    K3 --> Q
    K5 --> Q
    K7 --> Q
    K8 --> Q
    Q --> R[Run pipeline tests and diff checks]
    R --> S[Refresh report and docs]
    S --> T[Commit reports submodule]
    T --> U[Commit metanc_hmi_dsl]
    U --> V[Export to MetaNC nrt/hmi]
    V --> W[Commit MetaNC feat/hmi]
    W --> X[Push all repos]
```

The key UI rule from this slice is list-first diagnostics: Logs should preserve
horizontal scan space by default, `Message` should remain the dominant scan
column, low-frequency fields should be opt-in, and every clickable Logs control
should visibly respond to hover, press, and focus. JSONL export is treated as a
file export command: Web uses the browser save/download path, while QML uses a
native save-file dialog with clipboard fallback only after write failure.
