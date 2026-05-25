# Project Report

Date: 2026-05-25

## Scope

本轮工作从 HMI 文档系统和跨仓库同步一致性收口开始，目标是让
`metanc_hmi_dsl` 继续保留完整 source-repo 工作面，同时让 `MetaNC/nrt/hmi`
只暴露下游集成所需的 HMI package 内容。重点不是继续扩展刀偏功能，而是把
前面多轮命名、Tool Offset 文档拆分、docs_i18n 状态和同步脚本改动整理成可发布状态。

## Delivered

- 硬化 `tools/repo_sync/export_to_metanc.sh`：导出后会重写 MetaNC 下游
  `README.md` 和 `AGENTS.md`，并调用 docs portal post-processor 物化 downstream docs。
- 调整 `tools/repo_sync/import_from_metanc.sh`：不再把 MetaNC 下游入口文件反向导入
  standalone source repo，避免 source repo 的完整工作说明被 downstream 文案覆盖。
- 新增/更新 sync-script 测试，覆盖 downstream 入口重写和 source 入口保留。
- 在 `tools/hmi_dsl/docs_portal.py` 中新增 downstream materialization 路径：
  - 关闭 report 页面生成。
  - 移除 downstream raw docs 中的 reports/source-only 内容。
  - 从 downstream code map 中排除 `docs_i18n/`、report submodule、repo_sync 和 report 工具。
- 清理 Tool Offset 文档树：删除已经失效的 `create_and_edit.md` 和 `workflows.md` stub，
  更新 English/zh-CN SUMMARY 与 project index，保留真正承载内容的 focused child pages。
- 更新 PARAM Home Navigation Plan：将当前选择语义明确为 `selected_tool_row_key`，
  `selected_tool_id` 仅作为 legacy/debug 字段说明。
- 修复 docs_i18n status 工具：当英文源和 overlay 都已经删除时，manifest entry 会被移除，
  不再继续产生 orphan translation debt。
- 刷新 zh-CN i18n status 与 navigation；严格检查仍保留真实 stale/missing 翻译债务。
- 新增 2026-05-25 session report，并把它接入 aggregate reports book。

## Boundary Result

`metanc_hmi_dsl` 保留这些 source-only surface：

- `docs_i18n/`
- `submodules/metanc_hmi_dsl_reports/`
- `tools/repo_sync/`
- `tools/reports/`
- root sync/report wrappers
- Codex history/export tests

`MetaNC/nrt/hmi` 保留过滤后的集成 surface：

- HMI retained definitions, client/server/fixture/contract code
- HMI package docs under `docs/`
- package tests that are meaningful downstream
- downstream-specific `README.md` and `AGENTS.md`

## Validation

Source HMI validation before publication:

- `python3 -m unittest -v tests.test_docs_portal tests.test_web_qml_parity_docs tests.test_sync_scripts docs_i18n.tests.test_i18n_status` passed: 26 tests.
- `python3 -m unittest -v tests.test_docs_portal tests.test_story_docs tests.test_sync_scripts tests.test_tooling_contract_docs tests.test_web_qml_parity_docs` passed: 34 tests.
- `./tools/build_docs_html.sh` succeeded with reports enabled.
- `python3 docs_i18n/tools/i18n_status.py check --lang zh-CN --strict` failed as expected on known translation debt: 33 stale, 14 missing, 57 current, 2 generated.
- `git diff --check` passed.

MetaNC downstream validation before publication:

- `./tools/build_docs_html.sh` succeeded with reports disabled.
- `python3 -m unittest -v tests.test_docs_portal tests.test_story_docs tests.test_sync_scripts tests.test_tooling_contract_docs tests.test_web_qml_parity_docs` passed: 34 tests, 10 expected skips.
- `git diff --check` passed.
- Boundary probes confirmed `docs_i18n/`, `submodules/`, `tools/repo_sync/`, `tools/reports/`, and `docs/project/reports.md` are absent from `MetaNC/nrt/hmi`.

The report books and docs portal were rebuilt after adding this 2026-05-25 session entry.

## Remaining Work

- Chinese overlays still have real stale/missing debt; this round removed orphan drift but did not batch translate all stale pages.
- Tool Offset and Work Offset behavior remain bounded to the already agreed HMI scope; measurement flows still require a separate backend/data-model design before implementation.
- If future report publication needs raw Codex history, request it explicitly because that export is treated as a separate data disclosure step.
