# 2026-04-27 Codex Session Report

这个目录整理了 2026-04-27 这轮围绕 `docs_html` 最终发布校验、前端 Web 部署选型和 report 协作边界的结构化阅读材料。
这次 session 的原始 Codex 会话存档还没有进入本地导出器可扫描的数据集，因此 `user-history` 与 `codex-conversations` 仍是零会话快照；本目录补充了手工整理的项目报告、会话摘要和一份独立的前端部署建议文档。

目录：

- `project-report.md`: 本轮项目进展总结
- `conversation-report.md`: 本轮会话摘要和结论
- `frontend-web-deployment-recommendation.md`: 前端 Web 部署选型建议
- `user-history.md`: 当天用户发言原始导出占位
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 今天这轮排查和整理的工作流图
- `architecture-diagram.md`: 推荐前端部署形态图
- `assets/frontend-web-deployment/`: 前端部署建议 PDF 导出版
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-27`
- Sessions: `0`
- Primary sessions: `0`
- Side sessions: `0`
- User prompts: `0`
- Synthetic events: `0`
- Messages: `0`
- User messages: `0`
- Codex messages: `0`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->

## Session Notes

- `docs_html/reports/2026-04-26-codex-session/` 一度停在旧发布时间，问题根因是只重建了 session 本地 `build_html`，没有重跑最终 portal 发布。
- 这轮已确认并重新执行 `./tools/build_docs_html.sh`，最终 `docs_html` 里的 `2026-04-26` report 已同步到最新内容。
- 围绕前端正式部署补充了一份独立整理，核心结论是：开发预览可用轻量 server，但正式环境仍建议有一层专门的 Web 入口；当前阶段优先推荐 `Nginx + Docker Compose`。
- 还补充了跨机器协作边界说明：同一天 report 目录是按日期固定命名的，不会“静默覆盖已提交内容”，但两台机器同时更新同一天目录时会修改同一批文件，仍可能在 `git pull/merge` 时产生冲突。
