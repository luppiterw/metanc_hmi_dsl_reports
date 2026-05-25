# 2026-05-25 Codex Session Report

这个目录整理了 2026-05-25 这轮 HMI 文档系统、报告系统和 MetaNC 下游同步的结构化阅读材料。
本轮重点是收紧 standalone `metanc_hmi_dsl` 与 `MetaNC/nrt/hmi` 的边界：
source-only 的 `docs_i18n`、reports 子模块和 repo sync/report 工具继续留在 source repo，
MetaNC 只接收过滤后的 HMI package 文档、测试和运行时代码。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要和决策记录
- `user-history.md`: 本轮未刷新 raw Codex history 的说明
- `codex-conversations.md`: 本轮未刷新完整会话导出的说明
- `workflow-diagram.md`: 同步和验证流程图
- `architecture-diagram.md`: source/downstream 文档边界图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

## Session Focus

- 审查并收敛 HMI docs 系统，避免过长文档和无效 stub 页面继续扩散。
- 硬化 `metanc_hmi_dsl` -> `MetaNC/nrt/hmi` 导出边界，确保 source-only 内容不会污染 MetaNC。
- 更新 export/import sync 脚本和测试，明确 source repo 与 downstream package 的入口文件职责。
- 清理 Tool Offset project 文档中已经失效的 `create_and_edit.md` 与 `workflows.md` stub。
- 修复 docs portal、code map、project index、story pack 和 downstream materialization 的一致性。
- 刷新 zh-CN i18n status，移除已删除英文源对应的 orphan manifest 项。
- 重新生成 docs/report 产物，导出到 MetaNC `feat/hmi`，并完成提交与推送。

Raw Codex history export was intentionally not refreshed in this publication pass.
The report records structured project results and validation evidence only.
