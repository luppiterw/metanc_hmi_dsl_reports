# 2026-05-22 Codex Session Report

这个目录整理了 2026-05-22 这轮项目推进的结构化阅读材料。
当天工作先收敛 HMI 刀偏/工件零偏命名与跨仓库产物同步，随后把
Tool Offset / Work Offset UI 自动化收口成可重复执行的 Web/QML 门禁。
同日还将过长的 Tool Offset project 设计文档拆成 `docs/project/tool_offset/`
下的短入口和 focused child pages，并修复 docs portal 对嵌套 project 页面
生成目录时的断链问题。

目录：

- `project-report.md`: 项目进展总结占位页
- `conversation-report.md`: 会话摘要占位页
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 工作流图占位页
- `architecture-diagram.md`: 架构图占位页
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

## Session Focus

- 将 work offset 表收敛到 canonical `wcs.offset.table`，并保留
  `tooling.wcs.table` 作为 legacy alias。
- 明确刀具测量/工件测量暂不作为 HMI-only 功能推进，后续需要后台
  测量数据、变量存放和写表策略一起设计。
- 新增 Tool Offset / Work Offset Web UI scenarios 和 QML strict smoke。
- 增加 `tools/run_ui_automation_smoke.sh` 作为显式重门禁，覆盖
  AUTO Cycle Start、Tool Offset basic workflow、Work Offset binding。
- 拆分 `tool_offset_table_ui_design.md`、`tool_offset_table_smoke_report.md`
  和 `tooling_backend_persistence_plan.md`，改为 `docs/project/tool_offset/`
  分类目录。
- 修正 docs portal project index 链接生成，避免嵌套页面在 `print.html`
  中被压平成无效的 `project/*.html` 链接。
- 将本轮共享 HMI package 从 MetaNC `feat/hmi` 回灌到
  `metanc_hmi_dsl` `metanc-layout`，并完成 docs/report/产物重建和
  MetaNC 导出复核。

下面的完整会话导出块是本日既有历史导出清单。本轮只更新结构化报告；
没有重新导出原始 Codex 会话内容。后续如需刷新 raw history，需要单独明确
批准该数据导出步骤。

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-22`
- Sessions: `4`
- Primary sessions: `3`
- Side sessions: `1`
- User prompts: `105`
- Synthetic events: `1`
- Messages: `386`
- User messages: `106`
- Codex messages: `280`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
