# Project Report

Date: 2026-05-18

## Summary

本次工作从 HMI 当前计划复核开始，逐步收敛到
`tooling_management` 与 HMI runtime 的松耦合 adapter 设计，并完成了一版
TDD 验证实现。当前主线仍保持为真实 adapter 边界收口，但本轮没有直接接入
真实 CNC/PLC；实现范围限定在 HMI 统一 adapter surface、mock backend，以及
MetaNC 可选 `tooling_management` backend。

## Completed Work

- 复核当前 HMI 计划入口：
  - `docs/requirements/status_matrix.md`
  - `docs/requirements/program_execution_story_breakdown.md`
  - `docs/requirements/story_map.md`
  - `docs/client/web_qml_parity.md`
- 明确 HMI 与外部后端的松耦合原则：
  - program-resource 和 workspace-mutation northbound contract 保持稳定。
  - 后续真实 CNC/PLC/tooling 接入只在 adapter/backend 层映射差异。
  - 不把 filesystem/simulator 或 mock tooling 行为写成真实控制器硬规则。
- 交付 HMI runtime extension adapter 基础：
  - `RuntimeExtensionAdapter`
  - `CompositeMachineAdapter`
  - `ToolingRuntimeExtensionAdapter`
  - HMI-owned `ToolingBackend` interface
- 交付默认 mock tooling backend：
  - `tooling.tool.table` projection。
  - `tool.commands.set_offset` 单行更新。
  - `tool_id/edge_id` 与 `t_no/d_no` 两种定位方式。
- 交付 MetaNC 可选真实 backend：
  - `HMI_TOOLING_BACKEND=tooling_management` 编译真实实现。
  - 通过 `ToolOffsetTableView` 读取刀偏表。
  - 通过 `set_edge_geometry` / `set_edge_wear` 写回 `length`、`radius`、`wear_l`、`wear_r`。
  - 真实 backend 源码放在 HMI server 私有实现区，公共 HMI API 只暴露 HMI-owned interface。
- 同步 `MetaNC/feat/hmi`：
  - HMI 侧可选 backend 与测试已导出到 `nrt/hmi`。
  - 当前 `feat/hmi` 额外带入 `nrt/tooling_management/CMakeLists.txt` 的 `TOOLING_MANAGEMENT_WITH_AMENT` 开关，保持与已推送的 `feat/tooling_management` 分支一致。
- 刷新当天 Codex user-history 和完整会话导出：
  - brief user-history 页面。
  - `codex-conversations/` 完整会话索引和单页导出。
  - aggregate report book 的 `2026-05-18` session 索引。
- 更新 HMI server docs 与 status matrix，记录 mock/real backend 构建方式、边界和剩余限制。

## Validation Evidence

已执行的本轮关键验证：

- `metanc_hmi_dsl` 默认 mock backend：
  - `cmake --build nrt/hmi/generated/server-build --target tooling_runtime_extension_adapter_test runtime_extension_adapter_test`
  - `ctest --test-dir nrt/hmi/generated/server-build -R "runtime_extension_adapter_test|tooling_runtime_extension_adapter_test" --output-on-failure`
- `MetaNC/feat/hmi` 默认 mock backend：
  - `cmake --build nrt/hmi/generated/server-build --target tooling_runtime_extension_adapter_test runtime_extension_adapter_test`
  - `ctest --test-dir nrt/hmi/generated/server-build -R "runtime_extension_adapter_test|tooling_runtime_extension_adapter_test" --output-on-failure`
- `MetaNC/feat/hmi` 真实 tooling backend：
  - `cmake -S nrt/hmi/server -B nrt/hmi/generated/server-build-tooling-management ... -DHMI_TOOLING_BACKEND=tooling_management`
  - `cmake --build nrt/hmi/generated/server-build-tooling-management --target tooling_management_backend_test`
  - `ctest --test-dir nrt/hmi/generated/server-build-tooling-management -R "tooling_management_backend_test" --output-on-failure`
- 代码卫生：
  - `git diff --check` in `metanc_hmi_dsl`
  - `git diff --check` in `MetaNC`

Publication checks to run after this report refresh:

- `mdbook build submodules/metanc_hmi_dsl_reports`
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-05-18-codex-session`
- `./tools/build_docs_html.sh`
- `./tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`

## Current State

截至本报告，HMI 已有一个可同步的 tooling adapter surface：
`metanc_hmi_dsl` 默认可用 mock backend 单独测试，`MetaNC` 可在同一 surface
下切到真实 `nrt/tooling_management` backend。真实 backend 当前仍是
in-memory/core integration 级别；还没有处理服务生命周期、订阅增量、分页大表
优化、持久化 authority 或真实 CNC/PLC 状态联动。

## Next Slice

建议下一轮只选择一个最小实现切片：

- 将 tooling backend 的 bootstrap/fixture 构造从测试代码提升到明确的 MetaNC runtime 装配点。
- 或者继续 `ProgramWorkspaceAdapter` contract/policy tests，保持 Web/QML/server northbound response shape 不变。
- 不把真实 CNC/PLC 加工语义、PLC interlock、program transfer lifecycle 和 tooling persistence 混在同一轮。
