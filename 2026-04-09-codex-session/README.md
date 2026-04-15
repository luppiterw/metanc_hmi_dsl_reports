# 2026-04-09 Codex Session Report

这个目录整理了 2026-04-09 本次项目推进的结构化阅读材料。
内容聚焦于生成器 runtime contract 的引入、Web/QML 共享运行时模型、回归测试结果，以及当前工程边界。

说明:

- 这里不包含模型内部原始推理链。
- 这里提供的是可阅读、可审查、可复用的过程摘要和决策记录。
- 图形使用 Mermaid 结构化表示，便于后续导出或二次修改。

目录:

- `project-report.md`: 本次 runtime 层改造、问题、修复和验证总结
- `conversation-report.md`: 摘要化对话过程、任务推进时间线、关键决策
- `workflow-diagram.md`: retained DSL 到 runtime plan，再到 Web/QML 产物的工作流图
- `architecture-diagram.md`: runtime planning、generator payload、测试与产物结构图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

HTML 构建说明:

- 报告站点继续使用 `mdbook-mermaid`。
- Mermaid 图在 HTML 中会渲染为图形，并提供“图形 / 源码”切换。
- 重建命令:
  `mdbook build 2026-04-09-codex-session`

建议阅读顺序:

1. `project-report.md`
2. `conversation-report.md`
3. `workflow-diagram.md`
4. `architecture-diagram.md`
