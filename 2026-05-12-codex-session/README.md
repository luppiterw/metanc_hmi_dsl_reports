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

下午继续收敛 shared parity 的 S2/S3 边界，并修复了一个 QML strict server
模式下的 PROG SELECT 回归：从 `PROG DIR` 选择程序文件后，server 已经返回新
程序内容，但 QML client 没有像 Web 一样回到 Program editor 页面。修复后，
QML 在激活文件条目后会保留 server 作为文件内容权威，同时执行本地导航副作用
进入 `page_program`；目录条目仍只在文件浏览器内部进入下一级。新增
`runtime_strict_prog_select_navigation` smoke 锁定该路径。

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
- Sessions: `10`
- Primary sessions: `6`
- Side sessions: `4`
- User prompts: `144`
- Synthetic events: `2`
- Messages: `1174`
- User messages: `146`
- Codex messages: `1028`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
