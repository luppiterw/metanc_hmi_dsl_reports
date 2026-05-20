# Project Report

Date: 2026-05-20

## Summary

本次工作聚焦 Tool Offset 后续功能的设计收敛。围绕“刀偏表如何从当前
integration proof 走向可用操作界面”，完成了 MetaNC/HMI 同步路径确认、
`tooling_management` 能力边界对照、UI 功能阶段划分、`row_key` 行选择模型、
内部 `tool_id`/`edge_id` 与用户可见 T/D/edge number 的职责拆分，以及 Phase 1
实施边界。

当前落地内容是设计文档和报告/文档更新，不包含 Tool Offset 功能代码实现。

## Completed Work

- 确认 HMI 源仓与下游同步路径：
  - 源仓路径为 `metanc_hmi_dsl/nrt/hmi`。
  - 当前导出脚本为 `nrt/hmi/tools/export_to_metanc.sh`。
  - 下游同步目标为 `MetaNC/nrt/hmi`。
- 创建并使用 MetaNC 工作分支：
  - 基于 `main` 创建 `feat/hmi-tmp-tooling`。
  - 该分支用于当前阶段 Tool Offset 设计和后续可删除/可替换的功能推进。
- 完成 Tool Offset 设计讨论和文档落地：
  - 新增 `docs/project/tool_offset_table_ui_design.md`。
  - 将设计页加入 `docs/SUMMARY.md` 和 `docs/project/index.md`。
  - 更新 `parameter_home_navigation_plan.md`，把旧的 footer 示例替换为新设计页引用。
- 明确关键术语：
  - `tool_id` 和 `edge_id` 是 `tooling_management` 领域层内部稳定 ID，不是数据库 rowid，也不由 T/D 派生。
  - `row_key` 是 HMI 表格行 key，由 server resource projection 生成，客户端只当 opaque string。
  - T number、D number、edge number、tool name、tool type 是操作员可见 selector/label。
- 收敛 Phase 1 边界：
  - Phase 1 只做 `row_key`、保留字符串 `tool_number`/`d_number`、`edge_number`、选择模型修正、Search 假入口清理、Detail 行上下文展示。
  - Phase 1 不新增 Add、Remove、Status、Refresh 命令。
  - Inline edit 继续调用现有 `tool.commands.set_offset`，运行时用选中的 `row_key` 查当前 row，再发送 `tool_id`/`edge_id`。
- 收敛后续阶段：
  - Phase 2: `create_offset_entry`、Add Tool With First Edge、Enable/Disable。
  - Phase 3: Remove Edge / Remove Tool With Edges、Detail 身份字段编辑。
  - Later: Add Edge To Selected Tool、location、monitoring/life、sister-tool 等扩展。

## Validation Evidence

已执行的文档验证：

- `MetaNC`
  - `book build`
  - `python3 .mdbook/lint_docs_policy.py`
  - `git diff --check`
- `metanc_hmi_dsl/nrt/hmi`
  - source docs copied back from the downstream design branch
  - report history export for `2026-05-20`
  - full Codex conversation export for `2026-05-20`

本次报告发布流程后续还会执行 report book build、docs portal build、filtered
MetaNC export、commit 和 push。

## Current State

Tool Offset 的下一步实现边界已经明确：

```text
Phase 1 = row_key + resource shape + selection + inline edit dispatch + cleanup
Phase 2 = Add Tool With First Edge + Enable/Disable
Phase 3 = Remove + Detail identity edits
Later   = Add Edge + location/life/sister tooling depth
```

设计文档明确禁止 Phase 1 显示假 Add/Remove/Refresh 动作。没有真实实现的 footer
slot 保持空白，避免 UI 看起来可用但实际只写 local notice。

## Next Slice

建议下一轮直接进入 Phase 1 实现：

- 扩展 `tooling.tool.table` row shape。
- 把 Tool Offset table selection 从 `selected_tool_id` 迁移到 row-key state。
- 清理 Search 假入口。
- 让 inline edit 通过选中 `row_key` 解析到 `tool_id`/`edge_id` 后继续调用
  `tool.commands.set_offset`。
- 为同一把刀多个 edge 的选择和编辑补测试。
