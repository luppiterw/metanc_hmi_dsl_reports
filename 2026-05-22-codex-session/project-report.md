# Project Report

Date: 2026-05-22

## Scope

本轮工作收敛 HMI PARAM 下的刀偏/工件零偏命名、接口契约、生成物和跨仓库同步状态。重点不是扩展刀具测量流程，而是把当前刀偏表和 work offset 表的边界整理清楚，避免 `tooling.wcs.table`、`zero_offset` 等历史命名继续误导后续实现。

## Delivered

- 将工件零偏表的 canonical resource 收敛为 `res://wcs.offset.table`。
- 保留 `res://tooling.wcs.table` 作为 legacy compatibility alias，只在 runtime resources、data dictionary、兼容测试和生成快照中出现。
- 将 UI 文案和本地状态从 `Zero Offset` / `zero_offset` 收敛到 `Work Offset` / `work_offset`。
- 移除 story catalog 和 story pack active interface refs 里的 `tooling.wcs.table` 普通接口引用。
- 修正 runtime plan alias 方向，避免 legacy path 被当成新的 canonical path。
- 修正 native server adapter resource overlay 合并顺序，覆盖 legacy-only adapter 只上报 `tooling.wcs.table` 时 canonical `wcs.offset.table` 不更新的问题。
- 增加/更新 tooling contract docs、runtime plan、mock runtime、native REST 和 contract parity 测试。
- 同步 MetaNC `feat/hmi` 与 `metanc_hmi_dsl` `metanc-layout` 的共享 HMI package 源码。
- 重新生成两边的 Web/QML/native server distribution 和 docs_html。
- 清理已无效的临时生成目录和 `metanc_hmi_dsl` 根级 pre-layout `generated/`、`docs_html/` 残留。
- 新增 Web UI automation 场景：
  - `auto_cycle_start_prepares_selected_program`
  - `tool_offset_basic_workflow`
  - `work_offset_table_binding`
- 新增 QML strict UI smoke：
  - `ui_auto_cycle_start_prepares_selected_program`
  - `ui_tool_offset_basic_workflow`
  - `ui_work_offset_binding`
- 增强 Web UI scenario runner，支持 DOM expectation、命令 payload
  expectation、resource alias equality，以及 PARAM/tooling/WCS runtime
  snapshot 字段。
- 新增 `tools/run_ui_automation_smoke.sh`，作为不重建产物的显式重门禁。
  它要求 packaged Web client、native server 和 runtime contract bundle 已存在，
  然后连续运行 scenario shape check、三条 Web UI scenario 和三条 QML UI smoke。

## Sync Notes

`metanc_hmi_dsl` 的同步脚本本轮已复核。它仍适合作为共享源码同步入口，但它有意排除 `generated/`、`docs_html/`，并保留当前仓库本地报告面和 repo_sync 工具。因此同步后必须在 package root `nrt/hmi/` 下重新生成 story docs、data dictionary、targets 和 docs_html，不能把 import 脚本输出当成最终产物状态。

## Validation

- MetaNC HMI Python suite: 81 passed, 2 skipped.
- MetaNC native tests: `runtime_rest_api_test`, `tool_offset_contract_parity_test`, `tooling_management_backend_test` passed.
- `metanc_hmi_dsl` post-sync targeted tests: 14 passed.
- `./tools/generate_targets.sh` succeeded in both MetaNC and `metanc_hmi_dsl`.
- `./tools/build_docs_html.sh` succeeded in both MetaNC and `metanc_hmi_dsl`.
- `./tools/run_ui_automation_smoke.sh` succeeded in MetaNC before source-repo
  import and in `metanc_hmi_dsl` after import/regeneration, covering Web/QML
  AUTO Cycle Start, Tool Offset, and Work Offset UI flows against the
  packaged/native-server path.
- `git diff --check` passed.
- Cross-repo source diff only showed expected local-only differences: MetaNC `docs/src`, `metanc_hmi_dsl` `.codex` and `docs/superpowers`.

## Remaining Boundary

刀具测量、工件测量、零偏测量流程仍未进入本轮实现。它们涉及后台数据集、变量/参数存放、测量流程边界、tooling_management 支持，以及后续零偏表/工件测量的一致模型，暂不应作为 HMI-only 功能推进。

Work Offset 目前只有 UI binding smoke：它验证 generated clients、
native server、`wcs.offset.table`、legacy `tooling.wcs.table` 和
`wcs.commands.activate` 的轻量闭环。完整 work-offset command/resource
contract 仍需要后续单独设计。
