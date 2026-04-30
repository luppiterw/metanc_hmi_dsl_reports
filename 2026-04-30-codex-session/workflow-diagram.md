# Workflow Diagram

```mermaid
flowchart TD
    A[Check final persistence docs in docs_html] --> B[Find English docs_html missing new pages]
    B --> C[Patch docs_portal static page lists]
    C --> D[Rebuild docs_html for en and zh-CN]
    D --> E[Design runtime log schema and store boundary]
    E --> F[Implement real server/client log ingest]
    F --> G[Wire Diagnostics views to runtime logs]
    G --> H[Add SQLite LogStore and config switches]
    H --> I[Fix Docker vcpkg binary cache for zlib/sqlite dependencies]
    I --> J[Regenerate Web/QML/server distribution]
    J --> K[Run tests, Docker build, and Docker smoke]
    K --> L[Refresh reports and docs portal]
    L --> M[Export HMI package into MetaNC nrt/hmi]
    M --> N[Commit and push reports submodule, parent repo, and MetaNC]
```
