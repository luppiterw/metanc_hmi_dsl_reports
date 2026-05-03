# Workflow Diagram

```mermaid
flowchart TD
    A[Web or QML client starts strict server mode] --> B[Subscribe global paths and operator_notices]
    A --> C[Subscribe active page and subview paths]
    C --> D[Server publishes filtered state deltas]
    B --> E[Footer listens for command and operator notice events]

    F[Operator command] --> G[POST /api/runtime/commands]
    G --> H[Server validates and executes command]
    H --> I[LogService records command lifecycle]
    H --> J[WebSocket runtime.command.completed]
    J --> E

    I --> K[LogStore memory or SQLite]
    I --> L[RuntimeSubscriptionService DiagnosticSink]
    L --> M{Operator-visible?}
    M -->|yes| N[WebSocket runtime.operator_notice]
    M -->|no| O[Store only]
    N --> E
    E --> P[Update runtime_state.last_notice]

    Q[Diagnostics Logs page] --> R[GET /api/runtime/logs]
    R --> K
    K --> S[Filtered log rows, cursors, export, retention]

    T[CNC / PLC / drive alarm state] --> U[Server active alarm state]
    U --> V[alarm.raised / alarm.cleared LogEvents]
    U --> W[Sticky alarm priority input]
    V --> K
    W --> E
```

The key boundary is that the Diagnostics Logs table reads log rows explicitly,
while the footer receives only lightweight server-selected notices.
Alarm sticky behavior must use backend active alarm state; log rows only record
that alarm lifecycle events happened.
