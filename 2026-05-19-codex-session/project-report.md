# Project Report

Date: 2026-05-19

## Summary

本次工作围绕 PARAM 菜单的默认入口和刀偏表子功能导航展开。最终方向确认为
`PARAM` 先进入一个真实的 PARAM Home 页面，再从 Home 进入 Tool Offset、Zero
Offset、User Variables 等子功能页。这样 `Return` 的语义保持清晰：子功能页
返回 PARAM Home，PARAM Home 再返回 Overview。

当前实现已落到 `metanc_hmi_dsl`，并同步到 `MetaNC/feat/hmi`。Web/QML 生成物
也已刷新，MetaNC 的一键脚本使用的 distribution 中已经包含 PARAM Home。

## Completed Work

- 落地 PARAM Home 路由模型：
  - `runtime_state.parameter_view` 默认值改为 `home`
  - `PARAM` 顶层入口进入 `page_parameters` + `parameter_view = home`
  - 新增 `parameter_home_view`
  - 将原 `tool_management` 参数子页命名为 `tool_offset`
- 补齐 PARAM Home 内容：
  - Tool Offset 当前刀具、选中行和刀偏表状态摘要
  - Zero Offset 和 User Variables 的轻量摘要入口
  - Home footer 提供 Tool Offset、Zero Offset、User Vars、Return
- 拆分子功能页 footer：
  - Tool Offset、Zero Offset、User Variables 各自拥有 function footer
  - function footer 的 `Return` 返回 `parameter_view = home`
  - PARAM Home 的 `Return` 返回 `page_overview`
- 修复 Web footer 条件渲染：
  - footer flatten 前过滤隐藏的条件 footer bar
  - `page_parameters` 的渲染签名纳入 `parameter_view`，避免子页切换后主体
    或 footer 不刷新
- 补齐 Web/QML derived state：
  - Web runtime 增加 PARAM Home summary 同步
  - QML RuntimeStore/derived state 增加 PARAM Home summary 同步
- 更新测试和快照：
  - 新增 PARAM 默认进入 Home、子功能页 Return 回 Home 的 pipeline test
  - 新增 Web 条件 footer flatten regression test
  - 刷新 Web/QML snapshots
- 更新设计文档：
  - `docs/project/parameter_home_navigation_plan.md` 记录当前已实现范围
  - 明确刀偏表 CRUD 操作按钮当前仍留在页面主体，footer 化作为后续切片
- 同步 MetaNC：
  - `./tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
  - 在 MetaNC 下重新生成 Web/QML/distribution 产物

## Validation Evidence

已执行的关键验证：

- `metanc_hmi_dsl/nrt/hmi`
  - `python3 -m unittest tests.test_pipeline -v`
  - `./tools/generate_targets.sh`
  - Web CDP smoke：打开 PARAM，进入 Tool Offset，再 Return 回 PARAM Home
- `MetaNC/nrt/hmi`
  - `./tools/generate_targets.sh`
  - 检查 distribution 中存在 `parameter_home_view`、`parameter_view = home`、
    `Tool Offset Table` 和 `syncParameterHomeSummary`

Publication checks to run after this report refresh:

- `mdbook build submodules/metanc_hmi_dsl_reports`
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-05-19-codex-session`
- `./tools/build_docs_html.sh`
- `./tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
- `git diff --check` in `metanc_hmi_dsl`
- `git diff --check` in `MetaNC`

## Current State

PARAM 已经不再把刀偏表当作顶层入口的隐式默认页。当前交互模型为：

```text
PARAM -> PARAM Home -> Tool Offset / Zero Offset / User Variables
```

MetaNC 的 `nrt/hmi/generated/distribution/run_split_web_tooling_management.sh`
对应的 Web distribution 已包含这次生成结果。刀偏表仍可在 Tool Offset 子页中
查看和操作；单独的刀偏 CRUD footer 化还没有进入本轮实现。

## Next Slice

建议下一轮只处理一个较小切片：

- 将 Tool Offset 子页的 Add/Remove/Enable/Disable 操作从页面主体移动到
  function footer，并保持 Web/QML prompt 行为一致。
- 或者先补 Zero Offset/User Variables 的真实数据 projection，再决定对应的
  footer 操作集合。
- 不把垂直菜单、真实 CNC/PLC 状态联动和刀偏 CRUD footer 迁移混在同一轮。
