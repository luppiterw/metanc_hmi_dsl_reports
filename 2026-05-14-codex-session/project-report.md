# Project Report

## Scope

本日工作从 HMI 内部功能收敛和 review 开始，重点落在程序工作区的执行准备链路：
active program slot、workspace/controller transfer、`prog.commands.check` 编排、
`program.check.state` 状态资源，以及 Web/QML/native/mock runtime 的一致行为。
随后按用户要求刷新 reports/docs、同步到 `MetaNC/nrt/hmi`、提交并推送。

## Completed Work

- 扩展程序执行合同：
  - `program.active.meta`
  - `program.transfer.jobs`
  - `prog.commands.check`
  - `program.check.state`
- Web/QML/native/mock runtime 均接入 program check 编排。
- 明确边界：HMI 只做本地 gate；NC 译码、语法和机床语义 diagnostics 由
  backend/controller adapter 提供，HMI 不重做解析器。
- `prepare_execute` 复用同一程序 path/version/content 的 passed/warning check；
  check 失效或被阻断时不会 arm active slot。
- Review 期间修复安全门禁隐患：
  - 已通过的旧 check 不能在 runtime 非 idle 时被复用。
  - 非 idle 时会回落到现有 `check(require_idle=true)` 路径并返回 `runtime.not_idle`。
- 更新英文和中文文档：
  - server contract
  - runtime resources
  - REST API
  - interface integration
  - server architecture
  - program execution story breakdown
  - data dictionary
  - zh-CN i18n status
- 重新生成 Web/QML/distribution/native server 产物并同步快照。
- 刷新本报告目录和完整 Codex conversation archive。

## Validation

已执行并通过：

- `./tools/generate_targets.sh`
- `ctest --test-dir generated/server-build --output-on-failure -R "program_check_orchestration_test|program_active_transfer_test|program_workspace_policy_test|program_workspace_adapter_test|filesystem_program_workspace_adapter_test|runtime_rest_api_test|server_smoke_test"`
- `python3 -m unittest tests.test_program_execution_contract tests.test_filesystem_program_workspace_distribution tests.test_mock_runtime_server tests.test_server_api_docs tests.test_web_qml_parity_docs`
- `python3 -m unittest tests.test_pipeline tests.test_generator_refactor`
- `python3 docs_i18n/tools/i18n_status.py check --lang zh-CN`
- `./tools/build_docs_html.sh`
- `git diff --check`

Notes:

- `tests.test_pipeline tests.test_generator_refactor` 中 1 个 heavy snapshot 用例按当前环境跳过。
- i18n status check 仍报告既有 stale/untracked 文档项；本轮 check/REST/spec 相关文档已标为 current。
- QML 临时构建阶段出现短暂 clock skew warning，但最终构建和测试通过。

## Review Findings

已处理：

- `prepare_execute` 复用旧 check 时缺少 idle 复核。修复后 native/mock/Web/QML
  的 `programCheckAllowsPrepare` 都要求当前 execution state 仍为 `Stopped`。

保留为后续 review 项：

- Web/QML 本地 runtime 仍在 public `program.check.state` 中携带私有
  `blocking_code` 字段，而 server/mock 公开资源会剥离该字段。建议后续收紧合同一致性，
  改为从 `gate.items` 或 blocking diagnostics 派生 reject code。

## Publication Plan

本轮发布顺序保持为：

1. commit/push `submodules/metanc_hmi_dsl_reports`
2. commit/push parent `metanc_hmi_dsl`
3. `tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
4. commit/push downstream `MetaNC` `feat/hmi`

## Next Recommendation

发布后继续 review，优先确认 `program.check.state` public shape 是否需要去掉 Web/QML
本地 runtime 的 `blocking_code`，然后再进入 program workspace policy 的递归删除、
权限、外部变更、保存冲突和多客户端行为收敛。
