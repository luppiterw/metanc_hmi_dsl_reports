# Project Report

## Scope

本次工作把 runtime logs 与底部通知的 client/server 边界固定下来，并把实现、文档、生成产物和回归测试同步到 `metanc_hmi_dsl`。

核心结论：

- Diagnostics Logs 表格继续通过显式 REST API 查询：`GET /api/runtime/logs`。
- 普通 `/api/runtime/bootstrap`、`/api/runtime/state`、property/resource responses 和 command responses 默认不携带日志窗口。
- 底部 `runtime_state.last_notice` 改为 server-driven immediate feedback，由 WebSocket `runtime.command.completed` 和 `runtime.operator_notice` 更新。
- `runtime.operator_notice` 是从 server-side `LogEvent` 中筛出的轻量 operator notice，不是完整日志行流，也不替代日志查询、导出和 retention API。

## Runtime Log Design

当前日志体系分三层：

| Layer | Transport | Purpose | Authority |
| --- | --- | --- | --- |
| Server/runtime/audit logs | `LogService` + `LogStore` | command、runtime、adapter、audit timeline | authoritative |
| Client diagnostic logs | `POST /api/runtime/client-logs` / `POST /api/runtime/logs/client/batch` | Web/QML lifecycle、transport、command intent 诊断 | diagnostic only |
| Diagnostics Logs table | `GET /api/runtime/logs` | operator/developer 查询、筛选、导出、清理 | reads server store |

性能边界也在这次明确：

- memory 和 SQLite stores 都有 `HMI_LOG_MAX_ROWS` / `--log-max-rows` hard cap。
- REST 查询、导出、client batch upload 和 payload bytes 分别有独立上限。
- full log table 不进入默认 state/command response，也不进入普通 WebSocket state subscription，避免 state channel 被日志量拖慢。
- Web/QML 本地 client log queue bounded，server 恢复后再批量补传。

## Footer Notice Design

底部通知现在由 server 驱动，但不等同于“最新一条日志”。
`RuntimeSubscriptionService` 作为 `DiagnosticSink` 接收 server log events，并按 operator 可见性过滤：

- command accepted/rejected/result
- audit events
- alarm/safety/program/execution 类事件
- non-client warn/error/fatal
- logs clear/retention events

低价值 transport/ws 噪声默认不推到底部；transport 类信息只有 error/fatal 级别才会成为 notice。

被保留的事件会广播为：

```text
runtime.operator_notice
```

payload 只包含 `text`、`log_id`、`level`、`source`、`category`、`event_name`、`message`、`command_id` 和 `correlation_id` 等轻量字段。
Web/QML generated clients 全局订阅 `operator_notices` domain，并把 `runtime.operator_notice` 与 `runtime.command.completed` 写入 `runtime_state.last_notice`。

## Implementation

主要实现点：

- `subscription_protocol` 新增 `operator_notices` domain 和 lightweight `notice` payload。
- `RuntimeSubscriptionService` 同时负责 filtered subscription delivery 与 operator-visible notice broadcast。
- native HTTP server attach subscription service 到 app，并把它注册为 logging diagnostic sink。
- Web/QML runtime shells 全局订阅 operator notices，并在 strict server mode 下应用 `applyOperatorNotice()` / command notice。
- server smoke test 覆盖 operator notice 订阅、未订阅过滤、notice-only payload 不带 state。
- Web/QML snapshots 和 pipeline tests 已随 runtime shell 变化刷新。

## Documentation

本次同步更新：

- WebSocket subscription contract
- client/server logging docs
- runtime logs product spec
- logging persistence plan
- status matrix
- story catalog 与 generated story pack
- bilingual zh-CN docs
- data dictionary source 与中英文 generated data dictionary

## Verification

本轮已执行：

```bash
python3 -m unittest tests.test_pipeline
python3 -m unittest tests.test_pipeline tests.test_story_docs
ctest --test-dir generated/server-build --output-on-failure
python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack
python3 -m tools.hmi_dsl generate-data-dictionary definition/product.manifest.yaml --output docs/product/spec/data_dictionary.md
python3 -m tools.hmi_dsl generate-data-dictionary definition/product.manifest.yaml --output docs_i18n/zh-CN/product/spec/data_dictionary.md --lang zh-CN
./tools/build_docs_html.sh
env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh
```

`pytest` 入口在本机缺少 `pytest` module 时不可用，使用 `python3 -m unittest` 作为可执行验证入口。
