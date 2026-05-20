# Conversation Report

## Focus

本次会话围绕 Tool Offset 后续功能设计展开，重点把当前 HMI 刀偏表从
integration proof 的状态拆解为清晰的 Phase 1/2/3 实施计划。

## Discussion Highlights

- 确认 `tool_id` / `edge_id` 是内部稳定 ID，不是数据库索引，也不应该由用户输入。
- 将“行身份”澄清为 `row_key`，即 HMI 表格行 key，不涉及权限或用户身份。
- 明确 Phase 1 不做 Add/Remove，而是先修正已有行的选择、显示和 inline edit 派发。
- 讨论了没有新增/删除时 UI 是否可用，并确认完整可用性需要继续进入 Phase 2/3。
- 多轮审查 Tool Offset UI design 文档，修正了 command 分层、`row_key` opaque 规则、旧 `selected_tool_id` 过渡说明、Refresh 假入口等容易误导实现的点。

## Outcome

设计文档已经落到 HMI docs，并作为后续 Phase 1 实现的口径来源。当天 user
history 和完整 Codex conversations 已导出到本报告目录。
