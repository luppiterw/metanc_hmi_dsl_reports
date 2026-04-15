# Workflow Diagram

## 1. 文字说明

这张图描述当前 retained DSL 在引入 runtime plan 之后，如何生成可执行的 Web/QML 原型，以及测试如何锁定这条链路。

## 2. Mermaid 主工作流图

```mermaid
flowchart TD
    A[Retained Package] --> B[load_package]
    B --> C[validate_package]
    B --> D[build_ir]

    D --> E[build_runtime_plan]
    E --> F[build_mock_runtime_seed]

    D --> G[prepare_generation_payload]
    E --> G
    F --> G

    G --> H[generate-web]
    G --> I[generate-qml]

    H --> J[index.html]
    H --> K[styles.css]
    H --> L[runtime.js]
    H --> M[app.js]

    I --> N[Main.qml]
    I --> O[RuntimeStore.qml]
    I --> P[ThemeStore.js]
    I --> Q[CMakeLists.txt]

    L --> R[Web Runtime API]
    O --> S[QML Runtime API]

    R --> T[Property / Stream / Command / Local State]
    S --> T
```

## 3. 运行时交互图

```mermaid
flowchart LR
    A[UI Binding] --> B[readProperty / readStream / readLocalState]
    B --> C[Runtime Seed Data]

    D[Button Action] --> E[invokeCommand]
    E --> F[Command Logic]
    F --> G[Update Stream Values]
    F --> H[Update Local State]
    G --> I[Derived Property Sync]
    H --> I
    I --> J[Re-render]
```

## 4. 验证路径

```mermaid
flowchart TD
    A[Generator Source Changes] --> B[Snapshot Refresh]
    A --> C[Pipeline Assertions]

    B --> D[tests/test_pipeline.py]
    C --> D

    D --> E[python3 -m unittest -v tests.test_pipeline]
    D --> F[python3 -m unittest discover -s tests -v]

    E --> G[Text Output Stable]
    E --> H[QML Offscreen Snapshot]
    F --> I[Full Default Test Entry]
```

## 5. 实际命令链

```bash
python3 -m unittest -v tests.test_pipeline
python3 -m unittest discover -s tests -v
```
