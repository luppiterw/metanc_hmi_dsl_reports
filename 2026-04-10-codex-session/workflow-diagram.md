# Workflow Diagram

## 1. 文字说明

这张图描述当前这轮工作如何从用户提出的“HTML 布局异常、QML 顶部空白、按下无反馈”出发，进入 generator 修复、产物刷新和快照回归。

## 2. Mermaid 主工作流图

```mermaid
flowchart TD
    A[User Reports Layout Problems] --> B[Inspect Web/QML Generator Source]
    A --> C[Inspect Current Snapshot Images]

    B --> D[Identify Web Wrapper/Layout Issue]
    B --> E[Identify QML Chrome/Viewport Issue]
    C --> D
    C --> E

    D --> F[Patch generators/web.py]
    E --> G[Patch generators/qml.py]

    F --> H[Rebuild Web Output]
    G --> I[Rebuild QML Output]

    H --> J[Capture Chromium Snapshot]
    I --> K[Capture Offscreen QML Snapshot]

    J --> L[Refresh Web Snapshots]
    K --> M[Refresh QML Snapshots]

    L --> N[Run Web Snapshot Regression]
    M --> O[Run QML Snapshot Regression]

    N --> P[Stable Visual Baseline]
    O --> P
```

## 3. 布局修复路径图

```mermaid
flowchart LR
    A[Retained UI Tree] --> B[Generator Node Emission]
    B --> C[Target Layout Shell]
    C --> D[Rendered Geometry]

    E[Web child wrapper] -. broke .-> D
    F[QML centered stage + stacked chips] -. broke .-> D

    G[Remove wrapper interception] --> C
    H[Top-align viewport and compact chips] --> C
    I[Adjust hardware row pressure] --> C
```

## 4. 交互反馈路径

```mermaid
flowchart TD
    A[Button / Key / Event Row] --> B[Pressed State Detection]
    B --> C[Web :active / class-based feedback]
    B --> D[QML MouseArea.pressed feedback]

    C --> E[Immediate Color + Border Response]
    D --> E

    E --> F[Command Invocation Or State Update]
    F --> G[Persistent Selected / Notice State]
```

## 5. 实际命令链

```bash
./tools/generate_targets.sh
python3 -m tools.hmi_dsl validate examples/june-demo/product.manifest.yaml
python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots
HMI_ENABLE_QML_VISUAL_SNAPSHOT=1 python3 -m unittest tests.test_pipeline.PipelineTests.test_qml_offscreen_snapshot_matches_baseline
HMI_ENABLE_WEB_VISUAL_SNAPSHOT=1 HMI_WEB_PLAYWRIGHT_ROOT=/tmp/hmi_web_snapshot_tooling HMI_WEB_RUNTIME_LIB_DIR=/tmp/hmi_web_runtime/usr/lib/x86_64-linux-gnu python3 -m unittest tests.test_pipeline.PipelineTests.test_web_browser_snapshot_matches_baseline
```
