# Project Report

Date: 2026-05-19

## Summary

本次工作继续推进 PARAM 下 Tool Offset 的交互收敛。重点从菜单分层转到
刀偏表本体：底部菜单先稳定为 Standard、Extend、Detail、Search、Refresh、
Return；表格编辑从弹窗改为直接单元格编辑；Web/QML 都补了键盘焦点和编辑态
行为；随后确认了真实 `tooling_management` 与 SQLite persistence 的后续接入
边界。

当前实现已落在 `metanc_hmi_dsl`，并同步到 `MetaNC/feat/hmi`。Web/QML 生成物、
distribution 产物和测试快照均已刷新。

## Completed Work

- 调整 Tool Offset 子功能菜单：
  - 去掉 Add/Delete、Available/Disabled 这类结构性或状态命令入口。
  - 保留 Standard、Extend、Detail 作为同一刀偏工作区的视图切换。
  - 让 Detail 复用当前选中刀具上下文，而不是变成独立表格入口。
- 重整刀偏表编辑体验：
  - Web 表格从 prompt/dialog 编辑改为 inline input。
  - QML 表格从 prompt 编辑改为 inline `TextField`。
  - 空值和非法数值不会提交到 `tool.commands.set_offset`。
- 补齐表格键盘交互：
  - 单元格级焦点，而不是整行视觉选中。
  - Arrow keys、Home/End、Enter/F2、Tab/Shift+Tab、Esc 支持。
  - Web 上下键换行后会恢复重渲染前的单元格焦点。
- 修复编辑态视觉问题：
  - 去掉可编辑单元格悬浮时的 `EDIT` 提示。
  - 编辑状态只保留输入框边框，避免焦点框和编辑框双层叠加。
- 明确数据来源和持久化边界：
  - 当前看到的两条刀偏数据来自 HMI `MockToolingBackend` 默认种子。
  - 静态 fallback seed 里有更多演示数据，但连上 native server 后由服务端
    `tooling.tool.table` 覆盖。
  - `HMI_PERSISTENCE_BACKEND=sqlite` 仅控制 HMI runtime log store，不控制刀具表。
  - 后续真实持久化应使用 `tooling_management` 已有的 `PersistenceStore`、
    `SQLitePersistenceStore` 和 store-backed runtime API。
- 补充文档：
  - 新增 `docs/project/tooling_backend_persistence_plan.md`，记录 mock、
    in-memory tooling_management、store-backed sqlite 属于同一 HMI backend adapter 层。
  - 更新 server architecture/build docs，明确 HMI 不新增刀具 SQLite schema。

## Validation Evidence

已执行的关键验证：

- `metanc_hmi_dsl/nrt/hmi`
  - `./tools/generate_targets.sh`
  - `python3 -m unittest tests.test_pipeline -v`
  - `./tools/build_docs_html.sh`
- `MetaNC/nrt/hmi`
  - `./tools/generate_targets.sh`
  - `python3 -m unittest tests.test_pipeline -v`
- repository checks
  - `git diff --check` in `metanc_hmi_dsl`
  - `git diff --check` in `MetaNC`
  - `git diff -- nrt/tooling_management` in `MetaNC`

## Current State

Tool Offset 的 UI 分层已经基本稳定：

```text
PARAM -> PARAM Home -> Tool Offset -> Standard / Extend / Detail
```

表格现在是单元格焦点模型，数值字段可以直接编辑。Mock 后端仍用于独立运行和
DSL 同步验证，真实 `tooling_management` 后端保持为可选 MetaNC 集成路径。

## Next Slice

建议下一轮只做 tooling store-backed SQLite 接入设计和实现准备：

- 保持 `MockToolingBackend`、`ToolingManagementBackend(in-memory)`、
  `ToolingManagementBackend(store-backed sqlite)` 在同一 backend adapter 层。
- 不改 `nrt/tooling_management`，优先复用已有 public API。
- 在 HMI server 增加 tooling store 配置、load/save 生命周期和 restart survival 测试。
- 明确缺省 seed 策略：empty、demo、preserve 三者择一作为第一版默认。
