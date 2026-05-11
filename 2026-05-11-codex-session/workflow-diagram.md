# Workflow Diagram

```mermaid
flowchart TD
    A[Clean worktrees] --> B[Inspect generator.py header body]
    B --> C[Add main_qml_parts/header_body.py]
    C --> D[Wire build_header_body into generator.py]
    D --> E[Split Program navigation/state/search engine]
    E --> F[Update fragment order and marker tests]
    F --> G[Fix Logs refresh viewport preservation]
    G --> H[Add Web/QML parity matrix and docs guard]
    H --> I[Run compileall, generator, pipeline, and docs tests]
    I --> J[Run Logs viewport browser probe]
    J --> K[Regenerate final targets]
    K --> L{Generated artifact diff?}
    L -->|Expected snapshots only| M[Update README, CHANGELOG, docs, docs_i18n]
    L -->|Unexpected diff| R[Review and repair before commit]
    M --> N[Export 2026-05-11 user history and full conversations]
    N --> O[Update session reports and diagrams]
    O --> P[Build reports and docs_html]
    P --> Q[Commit and push reports submodule]
    Q --> S[Commit and push metanc_hmi_dsl]
    S --> T[Sync to MetaNC, validate, commit, push]
```
