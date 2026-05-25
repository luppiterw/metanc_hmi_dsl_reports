# Conversation Report

Date: 2026-05-25

## Summary

本轮会话从“不能让 `metanc_hmi_dsl` 中仅有的内容污染 MetaNC”这一约束出发，
先确认 source repo 和 downstream package 的边界，再把前面多轮积累的文档系统改动收束成
可验证、可同步、可提交的状态。核心产物不是新的 HMI 页面功能，而是更可靠的文档/报告/同步链。

## Decisions

- MetaNC 下游包只保留 HMI package 的集成面，不接收 source-only 的 reports、i18n overlay、repo sync/report 工具。
- standalone `metanc_hmi_dsl` 的 README/AGENTS 继续描述完整 source repo 工作面；MetaNC 下游 README/AGENTS 由 export 后处理生成。
- `docs/project/reports.md` 是 source repo report portal 页面，downstream MetaNC 不生成也不保留该页面。
- 已删除英文源和 overlay 的 i18n manifest 项应自动移除，不应继续占用 stale/orphan 状态。
- Tool Offset 文档目录保留 focused pages；无内容的 workflow/create-edit stub 直接删除。
- 原始 Codex history/full conversation export 本轮不刷新；报告只写结构化总结和验证证据。

## Implementation Notes

- `materialize_downstream_docs()` 作为 export 后处理入口，集中执行 downstream docs 重写与 source-only 内容剥离。
- `DOWNSTREAM_SOURCE_ONLY_TEXT_MARKERS` 和 `SOURCE_ONLY_CODEBASE_PATHS` 显式列出不能进入下游文档面的词和路径。
- docs portal 的 development guide/project index 列表随文档拆分同步更新，避免生成页面继续指向已删除文件。
- sync-script 测试现在同时覆盖 export 与 import，防止后续迭代把入口文件方向改回混合状态。
- zh-CN status 工具增加 regression，锁住“英文源和 overlay 都消失时移除 manifest entry”的行为。

## Follow-Up

- 后续可以单独处理 zh-CN stale/missing 翻译，但不应在 MetaNC 下游创建 `docs_i18n/`。
- 若要继续收口 Tool Offset/Work Offset，优先做 backend contract、resource 命名和 UI automation 之间的一致性检查。
- 测量流程、变量/参数存放、写表策略仍应作为后台数据模型问题单独规划。
