# Workflow Diagram

```mermaid
flowchart TD
    A[User asks to return to decomposition work] --> B[Check repo and MetaNC cleanliness]
    B --> C[Count Web/QML generator Python files]
    C --> D[Rank files by line count and edit risk]
    D --> E[Identify remaining pressure points]
    E --> F[Create English inventory doc]
    F --> G[Create zh-CN overlay]
    G --> H[Wire docs SUMMARY and development guideline indexes]
    H --> I[Mark i18n status current]
    I --> J[Regenerate Web/QML/server/distribution]
    J --> K[Run generator/snapshot/docs tests]
    K --> L[Export 2026-05-13 user history and full conversations]
    L --> M[Build session report book]
    M --> N[Build aggregate reports and docs_html]
    N --> O[Commit and push reports submodule]
    O --> P[Commit and push metanc_hmi_dsl]
    P --> Q[Export filtered package to MetaNC]
    Q --> R[Validate, commit, and push MetaNC feat/hmi]
```
