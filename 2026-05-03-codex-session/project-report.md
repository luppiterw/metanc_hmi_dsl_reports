# Project Report

## Scope

本次工作把 runtime logs 与底部通知的 client/server 边界固定下来，并把实现、文档、生成产物和回归测试同步到 `metanc_hmi_dsl`。
随后按“先从 living API docs 开始，而不是等功能完全冻结后再补文档”的原则，补齐 native server 当前 REST/WebSocket API 的第一轮人类可读接口文档。

核心结论：

- Diagnostics Logs 表格继续通过显式 REST API 查询：`GET /api/runtime/logs`。
- 普通 `/api/runtime/bootstrap`、`/api/runtime/state`、property/resource responses 和 command responses 默认不携带日志窗口。
- 底部 `runtime_state.last_notice` 改为 server-driven immediate feedback，由 WebSocket `runtime.command.completed` 和 `runtime.operator_notice` 更新。
- `runtime.operator_notice` 是从 server-side `LogEvent` 中筛出的轻量 operator notice，不是完整日志行流，也不替代日志查询、导出和 retention API。
- server API 文档开始作为 living contract 使用，覆盖 REST endpoints、WebSocket subscription、client flow、error model 和 payload schemas。
- LOGS 当前先保持最近日志视图：UI 只展示最近 `200` rows，recent stream 保留 `50` rows；历史积压问题主要由 server-side store/retention/query/export 策略处理。

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

## LOGS View Window Decision

针对“LOGS 里显示的日志数量是否有上限、当前是否有问题”的讨论，当前结论是先不改 UI。

现状分层如下：

| Boundary | Current value | Purpose |
| --- | --- | --- |
| Diagnostics Logs table | latest `200` rows | 防止 Web/QML table 过大导致渲染和本地 state 压力 |
| Diagnostics recent stream | latest `50` rows | 轻量 recent/event stream |
| REST query cap | default `1000` rows per request | 限制单次 `/api/runtime/logs` response |
| Server store hard cap | default `10000` rows | 限制 memory/SQLite log store 积压 |

因此当前 LOGS 页面是 recent log view，不是完整历史日志管理器。
真正的历史积压和保留策略主要在 server 端，需要继续确认：

- `HMI_LOG_MAX_ROWS` 是否符合目标现场的保留策略。
- SQLite retention 是否需要定时执行和分级策略。
- large query/export 是否需要分页、streaming 或更细的 server-side filter/search。
- audit/warn/error/client debug/info 是否需要不同保留周期。

在 server-side storage/retention/query/export 边界确认前，UI 暂时不加分页或加载更多。

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

## Alarm State Boundary

后续讨论进一步明确：报警状态不能靠日志文本判断。
正确边界是：

```text
AlarmState = 当前状态，来自 CNC / PLC / drive / IO / safety / adapter
LogEvent = 历史事件，记录 alarm.raised / alarm.acknowledged / alarm.cleared
OperatorNotice = 展示选择，决定底部当前提示哪一条反馈
```

因此底部 Notice 可以显示最近几条报警/错误，也可以做 sticky alarm feedback，
但 sticky 的 active/cleared 判断必须引用 backend active alarm state。
`acknowledged` 只表示 operator 已看到报警，不等同于 `cleared`。
当最高优先级报警 cleared 后，底部应切到下一个 active alarm、短暂的 cleared feedback，
或正常 idle/system-ready 状态。

这意味着当前 `runtime.operator_notice` 是即时反馈通道，不是 AlarmService。
后续如果要完整支持报警生命周期，需要补 server-side alarm state / active alarms
模型，并把它作为 footer notice priority 的输入。

## Server API Living Docs

本轮新增 `docs/server/api/`，把当前已实现的 transport API 拆成五个稳定入口：

- `rest_api.md`：列出 `/api/runtime/*` REST endpoints、请求/响应 shape、log query/export/client upload/retention/clear 行为。
- `websocket_api.md`：记录 `WS /api/runtime/ws`、`runtime.subscribe` / `runtime.snapshot` / `runtime.ping`、subscription domains、server events、replay 语义。
- `client_flow.md`：固定 strict server-mode client startup、global/page subscription、command execution、footer notice 和 logs 页面交互流程。
- `error_model.md`：明确当前 transitional error model，要求 client 同时检查 HTTP status 与 semantic body fields。
- `payload_schemas.md`：记录 `RuntimeStateSnapshot`、`CommandRequest` / `CommandResponse`、`LogEvent`、`SubscriptionFilter`、`OperatorNotice` 等共享 JSON shapes。

同时新增 zh-CN mirror under `docs_i18n/zh-CN/server/api/`，并更新这些关联入口：

- `docs/SUMMARY.md` 与 `docs_i18n/zh-CN/SUMMARY.md`
- `docs/server/index.md` 与 zh-CN mirror
- `docs/product/spec/server_contract.md` 与 zh-CN mirror
- `docs/server/websocket_subscription.md` 与 zh-CN mirror
- `docs/server/logging.md` 与 zh-CN mirror
- `docs/client/runtime_ownership.md` 与 zh-CN mirror
- `docs/project/server_doc_topology.md` 与 zh-CN mirror

`tools/hmi_dsl/docs_portal.py` 也同步加入 `server/api/*` navigation，避免 docs portal 生成时只复制文件但未发布到 mdBook sidebar。

新增 `tests/test_server_api_docs.py` 从 C++ server source 中抽取 REST routes、WebSocket path 和 runtime message names，再检查 API docs 是否覆盖。这样以后接口变更而文档未更新时会直接失败。

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
python3 -m unittest tests.test_server_api_docs tests.test_story_docs tests.test_docs_portal
python3 -m unittest tests.test_pipeline
python3 -m unittest tests.test_pipeline tests.test_story_docs
ctest --test-dir generated/server-build --output-on-failure
python3 -m tools.hmi_dsl generate-story-docs definition/story.catalog.yaml --output docs/acceptance_reference/story_pack
python3 -m tools.hmi_dsl generate-data-dictionary definition/product.manifest.yaml --output docs/product/spec/data_dictionary.md
python3 -m tools.hmi_dsl generate-data-dictionary definition/product.manifest.yaml --output docs_i18n/zh-CN/product/spec/data_dictionary.md --lang zh-CN
./tools/build_docs_html.sh
env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh
git diff --check
```

`pytest` 入口在本机缺少 `pytest` module 时不可用，使用 `python3 -m unittest` 作为可执行验证入口。
