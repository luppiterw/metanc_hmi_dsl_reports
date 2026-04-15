# Workflow Diagram

## 1. 文字说明

这张图描述“新图片进入工程后”从证据采集到 retained DSL，再到 Web/QML 产物的完整工作流。

## 2. Mermaid 工作流图

```mermaid
flowchart TD
    A[New Screenshot / Design Evidence] --> B[Segmentation Payload]
    A --> C[OCR Payload]
    A --> D[Manual Review Notes]

    B --> E[adapt-screenshot]
    C --> E
    D --> E

    E --> F[design.input.generated.yaml]

    F --> G[Human Review / Edit Practice]
    G --> H[import-design]
    H --> I[design.import.yaml]

    I --> J[Update ui.structure.yaml]
    I --> K[Update style.theme.yaml]
    I --> L[Update interfaces.machine.yaml]

    J --> M[validate]
    K --> M
    L --> M
    I --> M
    M --> N[build-ir]

    N --> O[generate-web]
    N --> P[generate-qml]

    O --> Q[Web Prototype]
    P --> R[QML Prototype]

    Q --> S[Visual Review]
    R --> S
    S --> T{Need Iteration?}
    T -- Yes --> A
    T -- No --> U[Retained Package Accepted]
```

## 3. 一致性控制点

```mermaid
flowchart LR
    A[Source Image Bytes] --> B[Normalized Regions]
    A --> C[Normalized OCR]
    B --> D[semantic_fingerprint]
    C --> D
    D --> E[Practice Session]
    E --> F[Imported Review Metadata]
    F --> G[Stable Retained Evidence]
    G --> H[Stable IR]
    H --> I[Stable Web Output]
    H --> J[Stable QML Output]
```

## 4. 实际命令链

```bash
python3 -m tools.hmi_dsl adapt-screenshot <manifest> --source <png> --regions <regions.json> --ocr <ocr.json> --output <practice.yaml>
python3 -m tools.hmi_dsl import-design <manifest> --practice <practice.yaml>
python3 -m tools.hmi_dsl validate <manifest>
python3 -m tools.hmi_dsl build-ir <manifest>
python3 -m tools.hmi_dsl generate-web <manifest> --output <web_dir>
python3 -m tools.hmi_dsl generate-qml <manifest> --output <qml_dir>
```
