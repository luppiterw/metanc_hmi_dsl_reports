# Architecture Diagram

```mermaid
flowchart LR
    subgraph QML Client
        MAIN[generated/qml/Main.qml]
        SMOKE[smoke_testing.py helpers]
        SOURCE[dynamic QtWebSockets source]
        WS[RuntimeStore runtimeWebSocket]
        FALLBACK[serverPollTimer HTTP fallback]
        SCRIPT[runtime_strict_websocket_reconnect.js]
    end

    subgraph Native Server
        REST[/api/runtime/commands]
        WSE[/api/runtime/ws]
        ADAPTER[simulator adapter]
        STATE[runtime state store]
    end

    subgraph Test Runner
        PY[tests/test_qml_smoke.py]
        DETECT[QtWebSockets module probe]
        REQUIRE[HMI_REQUIRE_QTWEBSOCKETS]
        PROC[server stop/restart control]
    end

    PY --> DETECT
    PY --> REQUIRE
    DETECT -->|available| SCRIPT
    DETECT -->|missing| SKIP[environment skip]
    REQUIRE -->|enabled and missing| FAIL[CI failure]
    FAIL --> DETECT
    PY --> PROC
    PY --> REST
    REST --> ADAPTER
    ADAPTER --> STATE
    STATE --> WSE
    DETECT --> SOURCE
    SOURCE -->|versionless import| WS
    WSE --> WS
    WS --> MAIN
    WS -->|status/message callbacks| SMOKE
    MAIN --> SMOKE
    SMOKE --> SCRIPT
    SCRIPT -. asserts fallback inactive .-> FALLBACK

    subgraph Documentation
        PARITY[docs/client/web_qml_parity.md]
        ZHPARITY[docs_i18n/zh-CN/client/web_qml_parity.md]
        STATUS[docs/requirements/status_matrix.md]
        CI[.github/workflows/ci.yml]
        REPORT[2026-05-12 session report]
    end

    SCRIPT --> PARITY
    PARITY --> ZHPARITY
    SCRIPT --> STATUS
    REQUIRE --> CI
    STATUS --> REPORT
```
