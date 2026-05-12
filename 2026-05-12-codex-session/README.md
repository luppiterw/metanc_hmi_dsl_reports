# 2026-05-12 Codex Session Report

这个目录整理了 2026-05-12 这轮项目推进的结构化阅读材料。
本轮主线是把 QML strict-server runtime smoke 从“HTTP bootstrap/command +
普通 server restart reconnect”继续推进到 WebSocket-only reconnect 覆盖。
新增 smoke 会在 QtWebSockets module 可用时观察 WebSocket open、server stop
后的 disconnect、server restart 后的 reconnect，并通过外部 REST
`cnc.commands.set_mode` 命令验证 `mode.current` 是由 WebSocket subscription
推送到 QML runtime，而不是依赖 HTTP polling fallback。

本机当前没有安装 `qml6-module-qtwebsockets` / `libqt6websockets6`，因此新增
WebSocket-only smoke 在本机按环境 skip；QML 构建、严格模式既有 reconnect
测试、生成器/快照测试、parity docs 测试和最终产物生成均已验证。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: QML WebSocket-only reconnect smoke 工作流图
- `architecture-diagram.md`: QML transport smoke 与 docs/report 同步关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-12`
- Sessions: `3`
- Primary sessions: `2`
- Side sessions: `1`
- User prompts: `19`
- Synthetic events: `1`
- Messages: `192`
- User messages: `20`
- Codex messages: `172`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
