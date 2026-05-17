# Project Report

Date: 2026-05-17

## Summary

本次推进是在 2026-05-16 的 S3 Diagnostics Logs query/export parity 基础上做 review-driven hardening。核心发现是：上一版 QML smoke 虽然进入 CI，但 log query/export 部分主要由 smoke 脚本自己用 `XMLHttpRequest` 直连 `/logs` 和 `/logs/export`，没有真正压到 generated QML runtime 的 `pollRuntimeLogs()` 和 `exportLogHistoryText()` 路径。

这轮修正后，S3 的 QML 验证语义从“QML 进程能访问 REST endpoint”提升为“generated QML runtime 能查询 logs resource 并通过 runtime export helper 产出 JSONL”。

## Completed Work

- 扩展 QML smoke helper：
  - `smokeSetLogsFilter()` 支持 command/correlation/session/page advanced filters。
  - 新增 `smokePollRuntimeLogs()`，直接调用 generated runtime 的 `pollRuntimeLogs(true, args)`。
  - 新增 `smokeExportRuntimeLogs()`，直接调用 generated runtime 的 `exportLogHistoryText()`。
- 重写 `runtime_strict_logs_query_export_minimum.js`：
  - seed command 仍通过 native server 创建可查询 command log。
  - query 阶段改为设置 runtime log filters 后调用 `smokePollRuntimeLogs()`，再断言 `diagnostics.logs.entries` 中出现匹配 `correlation_id` 的 command log。
  - export 阶段改为调用 `smokeExportRuntimeLogs("jsonl")`，断言 JSONL 输出包含 rows。
  - 删除不再使用的 direct `/logs` query/export helper，避免测试口径混淆。
- 修正 shared scenario transport 语义：
  - `logs_query_export_minimum` 已标记 `requires_websocket: false`，因此 shared assertion 对该类 scenario 不再硬要求 WebSocket open。
  - QML targeted logs test 也改为按 scenario 判断是否需要 QtWebSockets；S3 本身是 REST log query/export，不应被 WebSocket QML module 缺失阻断。
- 新增 drift guard：
  - `tests.test_parity_scenarios` 校验 QML smoke 中的 seed command、correlation id、query args 和 result state 名称与 shared scenario 保持一致。
- 更新 QML snapshot：
  - `tests/snapshots/qml/Main.qml.snap` 同步新增 smoke helper。
- 重新生成并验证最终产物：
  - Web、QML、native server 和 packaged distribution 已通过 `./tools/generate_targets.sh` 刷新。
- 同步 MetaNC：
  - 通过 `./tools/export_to_metanc.sh /home/i5/workspace/ccmix-wp/MetaNC` 导出过滤后的 HMI slice。
  - 下游重新构建 `docs_html`、Web、QML、native server 和 packaged distribution。
  - MetaNC 最终 HTML 保持 report-free，没有发布 `docs_html/reports/` 或 report timeline。

## Validation Evidence

- Scenario and drift guard:
  - `python3 -m unittest -v tests.test_parity_scenarios`
- Lightweight gate:
  - `HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 HMI_ENABLE_QML_VISUAL_SNAPSHOT=0 HMI_ENABLE_WEB_VISUAL_SNAPSHOT=0 python3 -m unittest -v tests.test_pipeline tests.test_parity_scenarios tests.test_ui_automation tests.test_web_qml_parity_docs`
- Final artifact generation:
  - `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
- Web S3 parity smoke:
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/logs_query_export_minimum.json`
- QML S3 targeted smoke:
  - `HMI_REQUIRE_QTWEBSOCKETS=1 python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_logs_query_export_minimum`
  - The test now passes locally even without `qml6-module-qtwebsockets`, because this scenario correctly exercises REST-backed log query/export rather than WebSocket subscription behavior.
- MetaNC downstream validation:
  - `./tools/build_docs_html.sh`
  - `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
  - `python3 -m unittest -v tests.test_docs_portal tests.test_web_qml_parity_docs`
  - `python3 -m unittest -v tests.test_parity_scenarios tests.test_ui_automation tests.test_web_qml_parity_docs`
  - `HMI_REQUIRE_QTWEBSOCKETS=1 python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_logs_query_export_minimum`
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/logs_query_export_minimum.json`

## Current State

S3 的 Web 和 QML 覆盖现在语义更一致：Web 通过 packaged browser client 触发 `window.RUNTIME.queryLogs/exportLogs`，QML 通过 generated runtime helper 查询 `diagnostics.logs.entries` 并执行 runtime export helper。CI 仍保留其他 WebSocket-specific QML smokes，用于覆盖 subscription/reconnect/command-domain delivery。

MetaNC 同步边界仍保持 report-free：本轮同步只导出了 HMI slice，没有把 reports submodule、source-only report tooling 或 report timeline 发布到 downstream `docs_html`。

## Next Slice

- 观察本轮 push 后的远程 CI，确认 QML Runtime Smoke 中 S3 targeted smoke 和其他 WebSocket-specific smokes 同时通过。
- 继续把后续 P0 parity 场景分清 transport 要求：REST-backed scenario 不强绑 WebSocket，WebSocket replay/command delivery 类 scenario 继续强制 `requires_websocket: true`。
- 若继续扩展 logs 测试，优先覆盖 file-save/export UI 或 retention/clear policy，而不是重复 direct REST endpoint smoke。

## Follow-up Slice: S4 Rejected Command Notice Parity

本轮继续从 Web/QML parity 的验收环往前推进，新增 S4
`rejected_command_notice` shared scenario。场景选择 `prog.commands.new`
创建已有的 `INDEX_TABLE.MPF`，这是一个稳定 rejected command，且不会依赖
runtime state mutation 作为 fallback。验收重点是：HTTP command response
返回 `accepted: false` 后，generated Web/QML client 仍能通过 WebSocket
`runtime.command.completed` / `runtime.operator_notice` 更新 footer notice。

### Scope

- 新增 `tests/parity_scenarios/rejected_command_notice.json`。
- 扩展 shared assertion，允许 scenario 对 command result 明确声明
  `accepted: false`。
- 扩展 `tools/web_parity_scenario_smoke.js`：
  - browser snapshot 增加 `runtime_state.last_notice`。
  - browser predicate 支持 `contains` / `not_contains`。
  - command post helper 支持 expected rejected response。
- 新增 QML strict smoke
  `tests/qml_smoke/runtime_strict_rejected_command_notice.js`，并在
  `tests.test_qml_smoke` 与 CI QML Runtime Smoke 中挂入。
- Web Runtime Smoke CI 增加 S4 scenario。
- 更新 Web/QML parity matrix、status matrix、build/test docs、tooling docs 和
  changelog，shared acceptance ring 从 S0-S3 扩展到 S0-S4。

### Validation Evidence

Source repo:

- `python3 -m unittest -v tests.test_parity_scenarios tests.test_ci_workflows tests.test_web_qml_parity_docs`
- `HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 HMI_ENABLE_QML_VISUAL_SNAPSHOT=0 HMI_ENABLE_WEB_VISUAL_SNAPSHOT=0 python3 -m unittest -v tests.test_pipeline tests.test_parity_scenarios tests.test_sync_scripts tests.test_ui_automation tests.test_ci_workflows`
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
- `ctest --test-dir generated/server-build --output-on-failure`
- `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/rejected_command_notice.json --debug`
- `./tools/build_docs_html.sh`

QML S4 targeted smoke was compiled and invoked locally, but skipped because this
host does not have `qml6-module-qtwebsockets` installed. Attempting to install it
with `sudo apt-get install -y qml6-module-qtwebsockets` was blocked by sudo
password prompting in the non-interactive environment. This is an environment
limitation, not a source failure; the GitHub QML Runtime Smoke job installs the
QtWebSockets package and runs with `HMI_REQUIRE_QTWEBSOCKETS=1`, so remote CI is
the authoritative S4 QML WebSocket verification.

MetaNC downstream:

- `./tools/export_to_metanc.sh /home/i5/workspace/ccmix-wp/MetaNC`
- `python3 -m unittest -v tests.test_parity_scenarios tests.test_ci_workflows tests.test_web_qml_parity_docs`
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
- `ctest --test-dir generated/server-build --output-on-failure`
- `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/rejected_command_notice.json --debug`

The downstream export remained report-free. The sync excluded `.github`,
submodules, `docs_html`, `docs_i18n`, source-only report tooling, and reports
content; `find MetaNC/nrt/hmi -maxdepth 4 -type d -path '*reports*'` returned
no report directories.

### Current State After S4

The shared acceptance ring now covers:

- S0 AUTO/JOG command result delivery.
- S1 PROG file lifecycle.
- S2 MDI execution result.
- S3 REST-backed logs query/export.
- S4 WebSocket-only rejected-command notice delivery.

The next external checkpoint is source remote CI after push, especially the QML
Runtime Smoke job because it is the first environment in this workflow that can
actually run the new QtWebSockets-gated QML S4 scenario.
