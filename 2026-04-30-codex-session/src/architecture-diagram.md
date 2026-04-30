# Architecture Diagram

```mermaid
flowchart LR
    WEB[Generated Web runtime] --> CLIENTLOG[POST client logs]
    QML[Generated QML runtime] --> CLIENTLOG
    HTTP[Drogon REST/WebSocket server] --> SERVICE[LogService]
    CLIENTLOG --> SERVICE
    COMMANDS[Runtime commands] --> SERVICE
    SERVICE --> MEMORY[InMemoryLogStore]
    SERVICE --> SQLITE[SqliteLogStore]
    SQLITE --> DB[(runtime-data/hmi_logs.sqlite)]
    SERVICE --> CONSOLE[ConsoleDiagnosticSink]
    SERVICE --> QUERY[GET /api/runtime/logs]
    SERVICE --> OPS[Export / clear / retention APIs]
    QUERY --> DIAG[Diagnostics views]
    OPS --> DIAG
    WEB --> WEBBUF[localStorage client-log queue]
    QML --> QMLBUF[QML UI-state client-log queue]
    WEBBUF --> CLIENTLOG
    QMLBUF --> CLIENTLOG
    STATEBOUNDARY[Settings / Tool / Parameter Store interfaces] -. deferred concrete stores .-> FUTURE[(future hmi_state backend)]
    HOSTCACHE[Host vcpkg binary cache] --> DOCKERCTX[docker/vcpkg-binary-cache]
    DOCKERCTX --> DOCKER[Docker server build]
    DOCS[docs + docs_i18n] --> PORTAL[docs_html]
    REPORTS[submodules/metanc_hmi_dsl_reports] --> PORTAL
    PORTAL --> EXPORT[tools/export_to_metanc.sh]
    EXPORT --> METANC[MetaNC nrt/hmi]
```
