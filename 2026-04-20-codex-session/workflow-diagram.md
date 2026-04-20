# Workflow Diagram

```mermaid
flowchart TD
    A[用户指出 MetaNC report Markdown 被误覆盖] --> B[检查 MetaNC git status 和 4 个 diff 文件]
    B --> C[读取 export/import 脚本并定位先删后拷问题]
    C --> D[export: 改成 rsync --delete + preserve filters]
    D --> E[import: 加入对称保护路径]
    E --> F[脚本语法检查]
    F --> G[/tmp 临时 MetaNC 仓库哨兵值验证]
    G --> H[恢复真实 MetaNC 的 4 个误改文件]
    H --> I[重新导出到真实 MetaNC]
    I --> J[确认 MetaNC worktree clean]
    J --> K[新增 2026-04-20 session report]
    K --> L[更新 aggregate report index]
    L --> M[重建 reports HTML 与主仓库 docs portal]
```
