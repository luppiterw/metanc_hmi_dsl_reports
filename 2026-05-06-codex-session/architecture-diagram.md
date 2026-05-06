# Architecture Diagram

```mermaid
flowchart LR
    subgraph Contract["Runtime Contract"]
        A[definition/ui.structure.yaml]
        B[contract/runtime_plan.py]
        C[runtime_seed.json]
    end

    subgraph Web["Generated Web Client"]
        D[app_shell.py serverStatusChip]
        E[runtime_shell.py server bridge]
        F[status chip CSS tones]
    end

    subgraph QML["Generated QML Client"]
        G[generator.py serverStatusChip]
        H[RuntimeStore.qml state updates]
        I[status chip value colors]
    end

    subgraph Server["Runtime Server"]
        J[Drogon REST/WebSocket]
        K[bootstrap and subscription]
    end

    A --> C
    B --> C
    C --> E
    C --> H
    J --> K
    K --> E
    K --> H
    E --> D
    H --> G
    D --> F
    G --> I
```

The top status chip is intentionally generated at the shell layer rather than
inside a page. That keeps Web and QML aligned, and leaves pages focused on
machine operation instead of transport diagnostics.
