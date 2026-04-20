# Workflow Diagram

```mermaid
flowchart TD
    A[用户指出 MetaNC report 入口 Markdown 被误覆盖] --> B[检查 MetaNC git status 与同步脚本]
    B --> C[定位 export/import 的同步边界问题]
    C --> D[export: 改成 rsync --delete + preserve filters]
    D --> E[import: 加入对称保护路径]
    E --> F[/tmp 临时仓库与真实 MetaNC 复验]
    F --> G[对照 gcode_parser/docs 设计新的主书骨架]
    G --> H[把 story docs 并入 docs/ 主书]
    H --> I[将 retained package 从 examples/june-demo 硬迁移到 src/hmi_dsl]
    I --> J[同步修正 tests/docs/tools/snapshots/QML binary naming]
    J --> K[运行 unittest 与生成链验证]
    K --> L[重建 generated/web qml distribution story_pack docs_html]
    L --> M[更新 2026-04-20 session report 与 aggregate report index]
```
