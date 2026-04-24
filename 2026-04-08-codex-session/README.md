# 2026-04-08 Codex Session Report

这个目录整理了本次项目推进的结构化阅读材料。
内容是可复盘的摘要化过程记录、设计决策、工作流图和工程架构图。

说明:

- 这里不包含模型内部原始推理链。
- 这里提供的是可阅读、可审查、可复用的过程摘要和决策记录。
- 图形使用 Mermaid 结构化表示，便于后续导出或二次修改。

目录:

- `project-report.md`: 本次阶段性交付、问题、修复和结果总结
- `conversation-report.md`: 摘要化对话过程、任务推进时间线、关键决策
- `workflow-diagram.md`: 从新图片输入到 retained DSL 再到 Web/QML 产物的工作流图
- `architecture-diagram.md`: 仓库工程结构、模块关系、数据流和验证边界
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

HTML 构建说明:

- 报告站点已接入 `mdbook-mermaid`。
- Mermaid 图在 HTML 中会渲染为图形，并提供“图形 / 源码”切换。
- 重建命令:
  `mdbook build 2026-04-08-codex-session`

建议阅读顺序:

1. `project-report.md`
2. `conversation-report.md`
3. `workflow-diagram.md`
4. `architecture-diagram.md`
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-08`
- Sessions: `6`
- Messages: `669`
- User messages: `79`
- Codex messages: `590`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
