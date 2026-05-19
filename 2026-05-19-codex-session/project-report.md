# Project Report

Date: 2026-05-19

## Summary

本次工作继续推进 PARAM 下 Tool Offset 的交互收敛。重点从菜单分层转到
刀偏表本体：底部菜单先稳定为 Standard、Extend、Detail、Search、Refresh、
Return；表格编辑从弹窗改为直接单元格编辑；Web/QML 都补了键盘焦点和编辑态
行为；随后确认了真实 `tooling_management` 与 SQLite persistence 的后续接入
边界，并完成第一版 store-backed SQLite 接入。

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
- 接入真实 tooling_management SQLite store-backed runtime：
  - 新增 `StoreBackedToolingManagementBackend`，复用
    `tooling_management` 的 `PersistenceStore`、`SQLitePersistenceStore`、
    `StoreBackedToolingRuntime`。
  - `HMI_TOOLING_STORE_KIND=memory|sqlite` 在同一真实 tooling backend 下切换
    进程内核心或 SQLite 持久化，不改变 HMI contract。
  - `HMI_TOOLING_STORE_PATH` 默认落在 `runtime-data/tooling.sqlite`，并支持
    `HMI_TOOLING_SEED_MODE=preserve` 防止误创建空快照。
  - `run_server_tooling_management.sh` 自动带
    `-DTOOLING_MANAGEMENT_ENABLE_SQLITE=ON`，split Web/QML tooling launchers
    在 SQLite 模式下默认不 seed demo 数据。
- 清理启动说明和 generated 分发说明：
  - 新增 `docs/server/startup_modes.md` 作为 Web/QML/server/fixture/native/
    real tooling 的统一启动入口。
  - 更新 `generated/distribution/README.md` 模板，明确当前 12 个 launcher
    是有效集合，禁止手动添加临时 alias。
  - 修正文档里把未来 HMI `hmi_state.sqlite`、HMI-owned tool store 写成当前
    能力的旧说法，改为 HMI logs 已实现、settings/parameter state planned、
    real tooling durability 属于 tooling_management store。

## Validation Evidence

已执行的关键验证：

- `metanc_hmi_dsl/nrt/hmi`
  - `./tools/generate_targets.sh`
  - `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack`
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
DSL 同步验证。真实 `tooling_management` 后端现在支持 memory 和 SQLite
store-backed 两种运行模式，SQLite 模式可用于重启后保留刀偏表修改。

## Next Slice

建议下一轮聚焦真实接入测试和操作面收敛：

- 用 `run_split_web_tooling_management.sh` 和
  `run_split_qml_tooling_management.sh` 做真实 SQLite store-backed 人工验证。
- 继续观察刀偏表 inline editing、Standard/Extend/Detail 视图和真实后端
  projection 的字段覆盖是否足够。
- 后续如果需要 multi-process 或 ROS/service-backed 生命周期，再进入
  tooling_management/HMI 边界设计，不在当前 HMI adapter 内提前耦合。
