# 2026-05-12 Codex Session Report

这个目录整理了 2026-05-12 这轮项目推进的结构化阅读材料。
本轮主线是把 QML strict-server runtime smoke 从“HTTP bootstrap/command +
普通 server restart reconnect”推进到 WebSocket-only reconnect 覆盖，并把该
覆盖接入 GitHub Actions 的强制 QML runtime smoke gate。

新增 smoke 会在 QtWebSockets module 可用时观察 WebSocket open、server stop
后的 disconnect、server restart 后的 reconnect，并通过外部 REST
`cnc.commands.set_mode` 命令验证 `mode.current` 是由 WebSocket subscription
推送到 QML runtime，而不是依赖 HTTP polling fallback。后续安装
QtWebSockets 后，本机已复跑强制 smoke 并修复动态 `QtWebSockets` import 与
callback binding 问题；远端最新 CI run 已在该提交上通过。

本轮收尾还刷新了完整 Codex conversation export，确保 report 页面既能看到
user history，也能进入 Codex 对话详情。下一步工作转入 Web/QML parity 的
server-backed scenario automation，把 AUTO/JOG 的关键命令结果做成更稳定的
共享回归切片。

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
- Sessions: `8`
- Primary sessions: `5`
- Side sessions: `3`
- User prompts: `77`
- Synthetic events: `1`
- Messages: `599`
- User messages: `78`
- Codex messages: `521`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
