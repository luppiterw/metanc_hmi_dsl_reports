# Workflow Diagram

```mermaid
flowchart TD
    A[User request] --> B[Check clean repo state]
    B --> C[Export brief user history]
    C --> D[Export full Codex conversations]
    D --> E[Update session report pages]
    E --> F[Build aggregate reports book]
    F --> G[Build dated session book]
    G --> H[Build main docs portal]
    H --> I[Sync HMI package into MetaNC]
    I --> J[Validate diffs and whitespace]
    J --> K[Commit and push reports submodule]
    K --> L[Commit and push metanc_hmi_dsl]
    L --> M[Commit and push MetaNC]
```

The important ordering rule is that the reports submodule is published before
the parent repository records its updated submodule pointer.
