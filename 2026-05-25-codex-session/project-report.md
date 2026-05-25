# Project Report

Date: 2026-05-25

## Scope

本轮发布先收口 MetaNC `feat/hmi` 与 standalone `metanc_hmi_dsl` 的同步链。MetaNC 侧已经有多轮 tooling/tool offset、UI 自动化、文档命名和 REF POINT 设计改动；本轮把这些改动导入源仓、重新生成文档/报告产物，再导出回 MetaNC 下游包并提交推送。

功能边界保持清楚：刀具表/刀偏表和零偏/工件偏置表继续作为相对独立的 HMI/后台 contract 工作推进；刀具测量、工件测量、参数/变量存放、G 代码联动和真实 homing 流程仍然暂停，等待完整后台数据模型和底层接口设计。

## Delivered

- 回填 MetaNC 中已完成的 tooling_management / Tool Offset 相关实现到 `metanc_hmi_dsl`：
  - store-backed tooling reload 与 revision 一致性；
  - Tool Offset add/edit/status/remove/refresh 文档拆分；
  - Web/QML parity、QML smoke、Web UI scenario 和 snapshot 更新；
  - server backend、runtime extension adapter、HTTP/contract parity 测试更新。
- 新增 `docs/requirements/manual_reference_return_story_breakdown.md`：
  - `REF POINT` 被定义为 `JOG` 下的子模式；
  - 计划状态为 `runtime_state.jog_submode = jog | ref_point | repos`；
  - 计划命令为 `jog.commands.set_submode`、`jog.commands.start_reference_return`、`jog.commands.cancel_reference_return`；
  - per-axis reference state 使用 `axis.*.reference_state`；
  - 第一版只做 HMI client/server simulator contract，不做真实 PLC/servo homing。
- 更新 `definition/story.catalog.yaml` 和生成的 story pack，使 manual jog reference flow 进入 traceability。
- 刷新 `docs_i18n/zh-CN/i18n.status.*`，让中文 overlay 真实显示 stale/missing 翻译债务。
- 保留 source/downstream 边界：`docs_i18n/`、reports 子模块、repo sync/report 工具继续只在 `metanc_hmi_dsl` 中存在，导出到 MetaNC 时过滤掉。
- 将 import/export sync 脚本改为 checksum 比较，修复同大小/时间戳快速比较可能漏掉文档内容漂移的问题；Tool Offset Refresh 描述保持为已实现语义。
- 重建 2026-05-25 session report 和 docs portal/report book 产物。

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

Source HMI validation for this publication:

- `python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack` passed.
- `python3 docs_i18n/tools/i18n_status.py init --lang zh-CN --write-report` passed.
- `python3 docs_i18n/tools/i18n_status.py check --lang zh-CN` reported real translation debt: 34 stale, 15 missing, 56 current, 2 generated.
- `./tools/build_docs_html.sh` passed and rebuilt 49 books/pagesets into `docs_html/`.
- `mdbook build submodules/metanc_hmi_dsl_reports` passed.
- `mdbook build submodules/metanc_hmi_dsl_reports/2026-05-25-codex-session` passed.
- `python3 -m unittest -v tests.test_sync_scripts tests.test_docs_portal tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status` passed: 26 tests.
- `python3 -m unittest -v tests.test_story_docs tests.test_tooling_contract_docs tests.test_ui_automation tests.test_pipeline.PipelineTests.test_source_package_validates` passed: 19 tests.
- `git diff --check -- nrt/hmi` passed.

MetaNC downstream validation after export:

- `python3 .mdbook/lint_docs_policy.py` passed.
- `book build` passed for the full MetaNC bookshelf.
- `python3 -m unittest -v tests.test_docs_portal tests.test_story_docs tests.test_sync_scripts tests.test_tooling_contract_docs tests.test_web_qml_parity_docs tests.test_ui_automation` passed: 40 tests, 10 source-only/i18n skips expected in downstream.
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_source_package_validates tests.test_generator_refactor` passed: 17 tests.
- `ctest --test-dir nrt/hmi/generated/server-build -R 'tooling_runtime_extension_adapter_test|server_http_api_blackbox_test' --output-on-failure` passed: 2 tests.
- `ctest --test-dir nrt/hmi/generated/server-build-tooling-management -R 'tooling_management_backend_test|tool_offset_contract_parity_test|tooling_runtime_extension_adapter_test|server_http_api_blackbox_test' --output-on-failure` passed after rebuilding the generated server target: 4 tests.
- `git diff --check -- nrt/hmi` passed.
- Boundary probes confirmed `docs_i18n/`, `submodules/`, `tools/repo_sync/`, `tools/reports/`, and `docs/project/reports.md` are absent from `MetaNC/nrt/hmi`.

## Remaining Work

- Chinese overlays still have real stale/missing debt; this round records the debt rather than silently stamping stale translations as current.
- REF POINT remains a Story Slice Spec until the next development slice starts.
- Tool measurement, workpiece measurement, parameter/variable storage, and real machine reference return should wait for backend data model and lower-level interface design.
- If future report publication needs raw Codex history, request it explicitly because that export is treated as a separate data disclosure step.
