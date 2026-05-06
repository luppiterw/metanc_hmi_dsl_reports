# Architecture Diagram

```mermaid
flowchart LR
    subgraph Source["Retained Source Package"]
        A[definition/ui.structure.yaml]
        B[docs/product/spec/runtime_logs.md]
        C[docs/requirements/status_matrix.md]
    end

    subgraph Build["Native Build Targets"]
        D[server/CMakeLists.txt C++17]
        E[generated/qml/CMakeLists.txt C++17]
    end

    subgraph Web["Generated Web Client"]
        F[full-width log table]
        G[bottom detail panel]
        H[runtime_state.log_detail_open]
    end

    subgraph QML["Generated QML Client"]
        I[ListView log rows]
        J[bottom detail panel]
        K[runtime_state.log_detail_open]
    end

    subgraph Runtime["Runtime Server"]
        L[Drogon REST/WebSocket]
        M[GET /api/runtime/logs]
        N[JSONL export / clear / retention]
    end

    subgraph Docs["Publishing"]
        O[submodules/metanc_hmi_dsl_reports]
        P[bookshelf docs_html]
        Q[MetaNC nrt/hmi export]
    end

    A --> F
    A --> I
    A --> H
    A --> K
    B --> F
    B --> I
    C --> O
    D --> L
    E --> I
    L --> M
    M --> F
    M --> I
    N --> F
    N --> I
    O --> P
    P --> Q
```

The runtime log store remains server-owned. Generated clients keep only a bounded
recent window and expose details as a local view concern, so the UI layout change
does not alter the REST/WebSocket log contract.
