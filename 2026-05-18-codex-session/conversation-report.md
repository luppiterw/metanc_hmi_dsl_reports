# Conversation Report

Date: 2026-05-18

## User Request

用户先要求查看当前计划，然后要求给出详细计划，并追加明确约束：
做完后必须 `generate/update report & docs + sync MetaNC + commit + push`。

随后用户询问该计划是否会影响后续真实 CNC/PLC 接入。经过解释后，早期决定是
先暂停 program-workspace 实现，转入 report/docs 刷新。随后讨论回到 HMI
client/server 如何与 `tooling_management`、`program_engine`、CNC 实时层等组织
起来，并聚焦到是否需要 adapter 层。

新的核心判断是：adapter 层应保持一致，差别只在 backend 实现。
`metanc_hmi_dsl` 可以编译 mock backend，MetaNC 可以在同一 adapter surface 下
切换到真实 `tooling_management` backend。

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
- HMI 不直接依赖 `tooling_management` 公共类型作为 northbound contract。
- mock 和真实后端共享 HMI-owned `ToolingBackend` interface。
- 真实后端只在 MetaNC 可选 CMake 分支中编译，不污染默认 mock 构建。

## Execution Decision

本轮最终执行范围调整为一版 TDD adapter spike，并要求完成发布链路：

- 在 `metanc_hmi_dsl` 中保持默认 mock tooling backend。
- 新增可选 `HMI_TOOLING_BACKEND=tooling_management` 后端源码。
- 将相同 HMI 代码同步到 `MetaNC/feat/hmi` 做真实 backend 构建测试。
- 保留真实 backend 为条件编译，不改变默认 HMI server 构建路径。
- 更新 report/docs，重建 reports 和 docs portal。
- 同步 MetaNC，按 reports submodule、source repo、MetaNC 的顺序提交并 push。

## Implementation Summary

- `RuntimeExtensionAdapter` / `CompositeMachineAdapter` 作为 HMI runtime extension overlay。
- `ToolingRuntimeExtensionAdapter` 暴露：
  - `tooling.tool.table`
  - `tool.commands.set_offset`
- `MockToolingBackend` 提供 HMI DSL 独立测试数据。
- `ToolingManagementBackend` 在真实模式下桥接 `nrt/tooling_management`：
  - 读取 `ToolOffsetTableView`
  - 写回 `set_edge_geometry`
  - 写回 `set_edge_wear`
- 测试覆盖：
  - mock backend bootstrap/update/reject paths
  - real backend direct contract
  - real backend through `ServerApp`
  - `tool_id/edge_id` 与 `t_no/d_no` 定位

## Handoff

下一轮可以继续两条窄切片之一：要么把真实 tooling backend 的 runtime 装配点
从测试提升到 MetaNC server 配置，要么回到 `Program Workspace Adapter`
contract/policy tests。不要在同一轮同时接真实 CNC、PLC interlock、program
transfer lifecycle 和 tooling persistence。
