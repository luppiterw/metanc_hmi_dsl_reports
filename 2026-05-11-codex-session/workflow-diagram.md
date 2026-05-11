# Workflow Diagram

```mermaid
flowchart TD
    A[Clean worktrees] --> B[Inspect generator.py header body]
    B --> C[Add main_qml_parts/header_body.py]
    C --> D[Wire build_header_body into generator.py]
    D --> E[Split Program navigation/state/search engine]
    E --> F[Update fragment order and marker tests]
    F --> G[Fix Logs refresh viewport preservation]
    G --> H[Run compileall, generator, and pipeline tests]
    H --> I[Run Logs viewport browser probe]
    I --> J[Regenerate final targets]
    J --> K{Generated artifact diff?}
    K -->|Expected snapshots only| L[Update README, CHANGELOG, docs, docs_i18n]
    K -->|Unexpected diff| R[Review and repair before commit]
    L --> M[Export 2026-05-11 user history and full conversations]
    M --> N[Update session reports and diagrams]
    N --> O[Build reports and docs_html]
    O --> P[Commit and push reports submodule]
    P --> Q[Commit and push metanc_hmi_dsl]
    Q --> S[Sync to MetaNC, validate, commit, push]
```
