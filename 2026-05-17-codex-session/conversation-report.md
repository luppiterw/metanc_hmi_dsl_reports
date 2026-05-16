# Conversation Report

Date: 2026-05-17

## User Request

用户要求继续审视上一轮 `generate/update report & docs + sync MetaNC + commit + push` 的结果，并在发现问题后按详细计划实际处理。

## Review Finding

review 发现上一轮新增的 QML `logs_query_export_minimum` smoke 存在测试语义风险：

- CI 已经覆盖该 smoke。
- 但 smoke 脚本内部重新实现了 `XMLHttpRequest` query/export，直接调用 `/logs` 与 `/logs/export`。
- 因此它更像是在证明 QML 进程能访问 REST endpoint，而不是证明 generated QML runtime 的 log polling/export 逻辑可用。

这个问题不是远程 CI 失败，而是“CI 绿但覆盖点不够准确”的风险。

## Execution

本轮按以下顺序推进：

1. 读取 QML smoke helper、generated runtime log blocks、shared scenario assertion 和 QML test runner。
2. 在 QML smoke helper 中增加 runtime-level log query/export wrappers。
3. 改写 `runtime_strict_logs_query_export_minimum.js`，让 query/export 走 generated runtime helper。
4. 增加 shared scenario 与 QML smoke 常量一致性测试。
5. 修正 `requires_websocket: false` 的断言语义，避免 REST-backed logs scenario 被 WebSocket QML module 缺失误伤。
6. 刷新 QML snapshot。
7. 重新生成 Web/QML/native server/distribution 最终产物。
8. 跑 lightweight gate、Web S3 parity smoke 和 QML S3 targeted smoke。
9. 刷新 2026-05-17 report 和 Codex conversation export。
10. 构建源仓库 docs_html，并确认入口链接到 `reports/2026-05-17-codex-session/index.html`。
11. 同步 MetaNC，重新生成下游 docs_html、Web/QML/native server/distribution，并验证 downstream report-free HTML 边界。

## Validation Notes

本轮验证重点不是“是否能直接访问 `/logs`”，而是：

- `smokePollRuntimeLogs()` 调用了 generated runtime 的 `pollRuntimeLogs()`。
- `diagnostics.logs.entries` 中出现了匹配 seed command correlation id 的 log row。
- `smokeExportRuntimeLogs()` 调用了 generated runtime 的 `exportLogHistoryText()`。
- shared assertion 继续用 `logs_query_export_minimum.json` 校验 query/export result shape。

执行结果：

- `tests.test_parity_scenarios` 通过。
- lightweight gate 通过，heavy visual snapshot 按环境变量跳过。
- Web S3 parity smoke 通过。
- QML S3 targeted smoke 通过。
- final artifact generation 通过。
- MetaNC downstream docs/test/artifact validation 通过。
- MetaNC 生成后的 `docs_html` 没有 `Report Timeline`、`Latest Report`、`metanc_hmi_dsl_reports` 或 `docs_html/reports` 链接。

## Environment Notes

本机没有安装 `qml6-module-qtwebsockets`，因此 WebSocket-specific QML smokes仍依赖 CI 的 Qt install 覆盖。本轮 S3 logs query/export scenario 明确是 REST-backed，所以测试修正后不再错误要求 QtWebSockets。

默认沙箱不允许本地 socket/listen，Web parity 和 QML server-backed smoke 需要 escalated 执行；这属于环境权限限制，不是代码失败。

## Handoff

本轮本地 closure 已完成，剩余外部观察点是 push 后远程 CI。重点看：

- QML Runtime Smoke 是否仍跑过 WebSocket-specific smokes。
- S3 logs target 是否仍在 CI 中通过。
- MetaNC 中是否保持 report-free 边界。
