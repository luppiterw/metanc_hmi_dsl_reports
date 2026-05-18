# Project Report

Date: 2026-05-18

## Summary

本次工作是一次发布前的计划复核和报告/文档刷新，没有进入
`Program Execution Adapter Closure` 的代码实现。当前主线仍保持为
`story_product_program_execution_flow` 的真实 adapter 边界收口，但用户确认
真实 CNC/PLC 接入风险后，决定先暂停实现改动，仅刷新报告、文档并同步
MetaNC。

## Completed Work

- 复核当前 HMI 计划入口：
  - `docs/requirements/status_matrix.md`
  - `docs/requirements/program_execution_story_breakdown.md`
  - `docs/requirements/story_map.md`
  - `docs/client/web_qml_parity.md`
- 明确下一轮建议范围仍是窄切片：
  - program-resource 和 workspace-mutation northbound contract 保持稳定。
  - 后续真实 CNC/PLC 接入只在 adapter 层映射差异。
  - 不把 filesystem/simulator 偶然行为写成真实控制器硬规则。
- 明确本轮暂停内容：
  - 不修改 server adapter 实现。
  - 不扩 Web/QML UI。
  - 不新增 transfer、recursive delete、single-block、restart-from-line 或真实加工语义。
- 刷新当天 Codex user-history 和完整会话导出：
  - brief user-history 页面。
  - `codex-conversations/` 完整会话索引和单页导出。
  - aggregate report book 的 `2026-05-18` session 索引。
- 修复 docs portal 发布链路中的 `mdbook-bookshelf` 配置兼容问题：
  - 当前本机 `book v0.2.1` 不接受旧的 `entry-page` 字段。
  - 生成器改为输出 `index-title`、显式 book `id` 和 category 列表。
  - `tests.test_docs_portal` 已覆盖该配置模型。

## Validation Evidence

本轮验证重点是 report/docs 发布链路，而不是 adapter 功能验证。

Planned local checks for this publication round:

- `mdbook build submodules/metanc_hmi_dsl_reports`
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-05-18-codex-session`
- `./tools/build_docs_html.sh`
- `./tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
- `git diff --check`

## Current State

截至本报告，HMI runtime/adapter 实现范围保持不变。本轮唯一源代码变更是
docs portal 生成器对当前 `mdbook-bookshelf` 配置模型的兼容修复。当前可继续
推进的工程主线仍是 Program Execution adapter contract，但下一轮开始前应先
重新确认具体 slice 边界，避免把真实 CNC/PLC 接入和现有 filesystem policy
混在一轮里。

## Next Slice

建议下一轮只选择一个最小实现切片：

- `ProgramWorkspaceAdapter` contract/policy tests。
- 保持 Web/QML/server northbound response shape 不变。
- 真实 CNC/PLC adapter 仍作为后续接入目标，不在第一轮直接落地。
