# Architecture Diagram

## 1. 文字说明

这张图描述当前仓库在 runtime planning 改造后的模块关系。
重点是 IR、runtime plan、generator payload、target runtime 和测试回归之间的连接方式。

## 2. 顶层模块关系图

```mermaid
flowchart TB
    subgraph RetainedDocs[Retained DSL Documents]
        A[product.manifest.yaml]
        B[ui.structure.yaml]
        C[style.theme.yaml]
        D[interfaces.machine.yaml]
        E[design.import.yaml]
    end

    subgraph Core[Python Core]
        F[loader.py]
        G[validator.py]
        H[theme.py]
        I[ir.py]
        J[runtime_plan.py]
        K[generators/common.py]
    end

    subgraph Targets[Target Generators]
        L[generators/web.py]
        M[generators/qml.py]
    end

    subgraph Outputs[Generated Outputs]
        N[runtime.js]
        O[app.js]
        P[RuntimeStore.qml]
        Q[Main.qml]
    end

    subgraph Tests[Regression Coverage]
        R[tests/test_pipeline.py]
        S[tests/snapshots/web/*]
        T[tests/snapshots/qml/*]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F

    F --> G
    F --> H
    H --> I
    G --> I
    I --> J
    I --> K
    J --> K
    K --> L
    K --> M

    L --> N
    L --> O
    M --> P
    M --> Q

    L --> R
    M --> R
    J --> R
    R --> S
    R --> T
```

## 3. runtime contract 结构图

```mermaid
flowchart LR
    A[IR Page Tree] --> B[Binding Scan]
    A --> C[Action Scan]
    A --> D[State Model Scan]

    B --> E[properties]
    B --> F[streams]
    C --> G[commands]
    C --> H[action arg refs]
    D --> I[local_state]
    H --> E
    H --> I

    E --> J[runtime_plan]
    F --> J
    G --> J
    I --> J

    J --> K[build_mock_runtime_seed]
    K --> L[typed deterministic seed]
```

## 4. target-side runtime 对称关系图

```mermaid
flowchart LR
    A[runtime_plan + runtime_seed] --> B[Web runtime.js]
    A --> C[QML RuntimeStore.qml]

    B --> D[readProperty]
    B --> E[readStream]
    B --> F[readLocalState]
    B --> G[writeLocalState]
    B --> H[invokeCommand]

    C --> I[readProperty]
    C --> J[readStream]
    C --> K[readLocalState]
    C --> L[writeLocalState]
    C --> M[invokeCommand]

    H --> N[Derived property sync]
    M --> N
```

## 5. 当前验证边界图

```mermaid
flowchart TB
    A[Same Retained Package] --> B[Same IR]
    B --> C[Same Runtime Plan]
    C --> D[Same Runtime Seed]
    D --> E[Same Web Output]
    D --> F[Same QML Output]

    G[Real Backend Not Connected Yet] --> H[Current Runtime Is Mocked]
    H --> I[Behavior Coverage Limited To Implemented Commands And Streams]
```
