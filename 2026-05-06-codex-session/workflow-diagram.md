# Workflow Diagram

```mermaid
flowchart TD
    A[User asks to replace TIME with server status] --> B[Inspect generated Web/QML chrome]
    B --> C[Add serverStatusChip in Web app shell]
    B --> D[Add serverStatusChip in QML generator]

    E[Runtime bridge starts] --> F{Server URL and mode}
    F -->|strict + URL| G[status=connecting]
    F -->|strict + no URL| H[status=unconfigured]
    F -->|hybrid/local + no URL| I[status=local]
    G --> J{Bootstrap result}
    J -->|success| K[status=connected]
    J -->|failure| L[status=disconnected]

    C --> M[Top chip value and color]
    D --> M
    K --> M
    L --> M
    H --> M
    I --> M

    N[Declare state model fields] --> O[Regenerate runtime seed and contract]
    O --> P[Refresh Web/QML snapshots]
    O --> Q[Refresh data dictionary and i18n status]
    P --> R[Run tests and diff checks]
    Q --> R
    R --> S[Publish report and sync MetaNC]
```

The important path is that UI color and label are derived from
`runtime_state.server_connection_status`, while `runtime_state.server_connected`
remains the compatibility boolean for code that only needs yes/no connectivity.
