# Conversation Report

Date: 2026-05-18

## User Request

用户先要求查看当前计划，然后要求给出详细计划，并追加明确约束：
做完后必须 `generate/update report & docs + sync MetaNC + commit + push`。

随后用户询问该计划是否会影响后续真实 CNC/PLC 接入。经过解释后，用户决定：

- 先不动实现。
- 只做 report/docs 刷新。
- 同步 MetaNC。
- commit 并 push。

## Discussion Summary

计划复核确认当前 HMI 主线不是继续横向扩 UI，而是围绕
`story_product_program_execution_flow` 做 Program Execution adapter 边界收口。
当前计划源头是 `status_matrix.md` 和
`program_execution_story_breakdown.md`。

建议的实现方向被拆成：

1. baseline 校准。
2. northbound contract 锁定。
3. Program Workspace Adapter contract/policy slice。
4. active slot / cycle adapter 边界。
5. real-like fixture spike。
6. report/docs/MetaNC 发布闭环。

用户关注真实 CNC/PLC 接入风险后，结论是：这类切片会影响后续接入，但应作为
约束和降风险手段，而不是把真实设备接死。关键边界包括：

- 不把 filesystem 细节当成真实 CNC 程序库模型。
- PLC interlock、门锁、急停、模式允许等不塞进 program workspace。
- transfer 和 execute 保持分离。
- UI 不猜权限/锁状态，只消费 server/adapter 返回码。
- 不提前定义完整加工语义。

## Execution Decision

本轮最终执行范围被收窄为发布维护任务：

- 生成 2026-05-18 的 user-history。
- 导出 2026-05-18 的完整 Codex 会话。
- 更新 report 索引和 session 页面。
- 构建 reports mdBook 和 HMI docs portal。
- 同步 MetaNC。
- 按 reports submodule、source repo、MetaNC 的顺序提交并 push。

执行中发现主 docs portal 构建失败：当前 `book v0.2.1` 不接受生成器写出的
`entry-page` 字段。仓库根部 `bookshelf.toml` 已经使用当前工具接受的
`index-title`、显式 book `id` 和 category 模型，因此本轮增加了一个最小
docs tooling 兼容修复，并用 `tests.test_docs_portal` 验证。

## Handoff

下一轮若恢复实现，建议从最小 `Program Workspace Adapter contract + policy
tests` 开始，而不是直接接真实 CNC/PLC。
