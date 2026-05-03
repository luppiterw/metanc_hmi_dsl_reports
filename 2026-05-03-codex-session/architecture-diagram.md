# Architecture Diagram

```mermaid
flowchart LR
    subgraph Server[Native HMI Server]
        App[Runtime Application]
        AlarmState[Future AlarmService\nactive alarm state]
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

    AlarmSources[CNC / PLC / drive / IO / safety adapters] --> AlarmState
    AlarmState --> App
    AlarmState -->|alarm.raised / alarm.cleared events| LogService
    AlarmState -->|sticky alarm priority input| SubService
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

The future alarm layer must own active/cleared alarm state from backend sources.
Logs record alarm lifecycle events, and notices present the selected operator
feedback; neither log text nor footer notices are the alarm-state authority.
