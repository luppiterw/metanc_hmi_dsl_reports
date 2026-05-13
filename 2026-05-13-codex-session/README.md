# 2026-05-13 Codex Session Report

这个目录整理了 2026-05-13 这轮项目推进的结构化阅读材料。
本轮主线是回到 generator/source decomposition 工作，而不是继续扩 Web/QML
parity 功能验收。先完成当前 Web/QML generator Python 源文件体量盘点和候选拆分
排序，随后按 P0 计划收口 Web app-shell 最小拆分。

本轮结论：Web `client/web_client/app_shell.py` 已从 1,375 行降到 783 行，
settings panel/persistence 和 custom select control 已移入
`client/web_client/app_shell_fragments/`。生成输出保持 snapshot-stable。当前
Web/QML generator source 已没有超过 1,000 行的 Python 文件；后续不建议为了
housekeeping 继续无目标拆分，应只在 Logs、commands、server bridge、DEBUG query
等真实功能改动触达时顺手拆对应 P1 文件。

后续补充：本轮还修复并提交了 docs portal 的 `mdbook-bookshelf 0.2.x`
兼容问题，根 `bookshelf.toml` 和 portal generator 已切换到 documentation
index、显式 book id 和 category 模型；同时清理了 `server/README.md` 中已经
过期的 split-runtime Next Steps，明确 Web/QML strict clients 已接入 native
runtime server，剩余重点是真实 CNC/PLC adapter、生产 command schema 和
persistence manager/state store。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 工作流图
- `architecture-diagram.md`: 架构图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-13`
- Sessions: `6`
- Primary sessions: `4`
- Side sessions: `2`
- User prompts: `71`
- Synthetic events: `1`
- Messages: `368`
- User messages: `72`
- Codex messages: `296`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
