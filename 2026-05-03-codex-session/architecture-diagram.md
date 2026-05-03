# Architecture Diagram

```mermaid
flowchart LR
    subgraph Server[Native HMI Server]
        App[Runtime Application]
        LogService[LogService]
        LogStore[LogStore\nInMemory or SQLite]
        ConsoleSink[ConsoleDiagnosticSink]
        SubService[RuntimeSubscriptionService\nDiagnosticSink]
        Http[HTTP API\ncommands, logs, export, retention]
        Ws[WebSocket /api/runtime/ws]
    end

    subgraph Clients[Generated Clients]
        Web[Web Runtime Shell]
        Qml[QML Runtime Shell]
        Footer[Footer\nruntime_state.last_notice]
        LogsView[Diagnostics Logs View]
        ClientQueue[Bounded client log queues]
    end

    App --> LogService
    Http --> App
    LogService --> LogStore
    LogService --> ConsoleSink
    LogService --> SubService
    SubService --> Ws

    Web --> Ws
    Qml --> Ws
    Ws --> Footer

    LogsView -->|GET /api/runtime/logs| Http
    ClientQueue -->|POST /api/runtime/logs/client/batch| Http
    Web --> ClientQueue
    Qml --> ClientQueue
```

`RuntimeSubscriptionService` is the bridge between authoritative server logs and
server-driven footer feedback. It sends only notice payloads over WebSocket; log
history remains behind the REST query/export APIs.
