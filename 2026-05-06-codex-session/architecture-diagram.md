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
        H1[visible columns and wrap state]
        H2[interactive toolbar feedback]
        H3[save picker / download JSONL]
    end

    subgraph QML["Generated QML Client"]
        I[ListView log rows]
        J[bottom detail panel]
        K[runtime_state.log_detail_open]
        K1[QFileDialog JSONL save]
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
    A --> H1
    A --> H2
    A --> H3
    A --> K1
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
    N --> H3
    N --> K1
    O --> P
    P --> Q
```

The runtime log store remains server-owned. Generated clients keep only a bounded
recent window and expose details, column visibility, message wrapping, and
toolbar interaction states as local view concerns, so the UI layout changes do
not alter the REST/WebSocket log contract. JSONL export still comes from the
same server-owned history when available; clients only decide how that payload is
saved locally.
