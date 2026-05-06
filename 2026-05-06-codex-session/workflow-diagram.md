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

    D --> Q[Regenerate Web/QML/distribution]
    G --> Q
    I --> Q
    J --> Q
    P --> Q
    Q --> R[Run pipeline tests and diff checks]
    R --> S[Refresh report and docs]
    S --> T[Commit reports submodule]
    T --> U[Commit metanc_hmi_dsl]
    U --> V[Export to MetaNC nrt/hmi]
    V --> W[Commit MetaNC feat/hmi]
    W --> X[Push all repos]
```

The key UI rule from this slice is list-first diagnostics: Logs should preserve
horizontal scan space by default, and detailed payload inspection should be an
explicit row action.
