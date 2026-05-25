# Conversation Report

Date: 2026-05-25

## Summary

本轮会话先暂停 tooling 的继续扩展，转向回零/回参考点功能规划。参考 SINUMERIK 操作模型后，结论是 `REF POINT` 应作为 `JOG` 下的子模式，而不是新增一个和 `JOG`、`MDA`、`AUTO` 并列的顶层模式。随后按 Story Slice Spec 方式落下 REF POINT 设计文档，并把前面 MetaNC 中积累的 tooling/tool offset 和 UI 自动化改动同步回 standalone `metanc_hmi_dsl`。

同步发布阶段重点确认了 source repo 与 MetaNC downstream package 的边界，避免 `metanc_hmi_dsl` 中才有的 `docs_i18n`、reports 子模块、repo sync/report 工具污染 MetaNC。

## Decisions

- `REF POINT` 是 JOG submode；契约命名优先使用 `reference_return`，避免和 `zero_offset`、`work_offset`、`wcs` 混用。
- 第一版回参考点只做 HMI client/server/simulator 交互设计，不实现真实 PLC/servo homing。
- 测量流程、参数/变量存放、G 代码联动、工件测量和真实机床边界暂不做；后续应作为后台数据模型和底层接口设计处理。
- 刀具表/刀偏表、零偏/工件偏置表这类相对独立的数据表可以先继续收口。
- `docs_i18n` 本轮只刷新状态，不批量机器翻译；stale/missing 应真实暴露。
- Raw Codex history/full conversation export 不在本轮自动刷新；报告只写结构化总结和验证证据。

## Implementation Notes

- `import_from_metanc.sh` 成功把 MetaNC `nrt/hmi` 当前共享包改动导入 `metanc_hmi_dsl/nrt/hmi`，并保留 source-only report/i18n/sync 面。
- `generate-story-docs` 重新生成了 story pack，`manual_reference_return_story_breakdown.md` 进入 requirements navigation。
- `docs_i18n/tools/i18n_status.py` 更新了 manifest/report，当前状态为 34 stale、15 missing、56 current、2 generated。
- import/export sync 脚本切换到 checksum 比较，避免 source/downstream 文档内容漂移被 rsync 快速检查漏掉。
- 2026-05-25 report book 继续保留 raw history 不刷新的说明；安全审查拒绝了完整 raw Codex history 导出，因此未尝试绕过。

## Follow-Up

- 下一步若继续 REF POINT，应从 Slice 1 `jog_submode` retained/runtime state 开始，并配套 Web/QML parity snapshot。
- 若继续 Tool Offset，应优先检查 backend contract、resource path、revision 语义和 UI automation 覆盖是否已经一致。
- 若开始 measurement，应先设计后台参数/变量系统、测量数据集边界和 tooling_management/offset table 写入策略。
