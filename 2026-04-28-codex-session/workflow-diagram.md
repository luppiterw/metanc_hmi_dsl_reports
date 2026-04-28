# Workflow Diagram

```mermaid
flowchart TD
    A[User request: inspect Drogon server state] --> B[Scan server, docker, tools, docs, tests]
    B --> C{Native server path}
    C -->|Drogon CMake/vcpkg found| D[Confirm REST and WebSocket transport]
    C -->|legacy/mock references found| E[Classify as fixture or stale wording]
    D --> F[Run host CMake probe]
    F -->|No host Drogon package| G[Record host environment limit]
    G --> H[Settle host vcpkg and drogon_ctl path]
    H --> I[Find Docker context cache leak]
    I --> J[Patch .dockerignore]
    E --> K[Patch Web/QML connected copy]
    K --> L[Refresh runtime snapshots]
    J --> M[Re-run Docker smoke and one-shot]
    L --> N[Run generator snapshot test]
    M --> O[Add native runtime WebSocket subscription]
    N --> O
    O --> P[Expose client subscription through server URL]
    P --> Q[Validate split web native launch]
    Q --> R{Soft panel commands}
    R -->|unsupported simulator command| S[Implement missing SimulatorAdapter commands]
    S --> T[Test JOG command flow]
    T --> U{AUTO CYCLE START}
    U -->|server publishes but UI stale| V[Fix client WS revision application]
    V --> W[Browser/CDP verify line, block, elapsed, axes]
    W --> X[Sync necessary changes to MetaNC]
    X --> Y[Run source and MetaNC tests]
    Y --> Z[Refresh 2026-04-28 report and full export]
    Z --> AA[Build session and aggregate report books]
    AA --> AB[Rebuild docs_html final artifact]
    AB --> AC[Commit reports submodule]
    AC --> AD[Commit parent repo and push]
```
