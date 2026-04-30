# Project Report

## Scope

2026-04-30 的工作承接前一日 runtime logging / persistence 规划，重点从文档规划推进到第一版可运行实现，并继续把 client log 功能从可上传推进到可使用、可查看、可解释。范围覆盖 native server 真实日志、Web/QML client 日志上传与离线缓冲、独立 Runtime Logs 页面、client log event catalog、Diagnostics 页面数据源切换、server-side export/clear/retention 操作、SQLite 日志持久化、split Web native 启动健康检查、Docker 构建缓存修复、最终产物生成、report/docs 刷新，以及 downstream `MetaNC/nrt/hmi` 同步。

## Completed Work

- 复查 persistence/logging 新增页面的最终 HTML 输出，修复英文 `docs_html/en` 缺少新页面的问题，并重新生成 docs portal。
- 完成 runtime logging 第一版真实接入：native server 记录 lifecycle、command accepted/rejected/result、HTTP/WebSocket/client-log 相关事件；Web/QML generated runtimes 上传低频 lifecycle、transport、command 事件。
- 将 Diagnostics 日志视图切到 runtime log contract：页面数据来自 server 注入的 `diagnostics.logs.entries` 与 `/api/runtime/logs` 增量查询，不再使用旧的 mock/alarm history。
- 新增独立 `LOGS` 页面和底部入口；Web 版支持 runtime log 过滤、详情、复制、导出、clear-client-debug、retention 与刷新控制，QML 版提供基础 runtime log 查看入口。
- 新增 `docs/client/logging.md`，明确 client log upload shape、event naming、首批 event catalog、buffering 和 payload redaction rules。
- 标准化 Web/QML client log 事件：`client.app.started`、`client.transport.*`、`client.command.requested/forwarded/blocked`、`client.navigation.page_changed`，并统一 level/category 规范化与 payload 字段。
- 修复 QML early client logs 在未配置 `serverBaseUrl` 时被直接丢弃的问题：现在先进入 bounded queue，后续配置 server 后再 flush。
- 引入 `LogStore` 边界、`InMemoryLogStore`、`SqliteLogStore` 和 `LogService` 运行时上下文，SQLite backend 可通过 `HMI_PERSISTENCE_BACKEND=sqlite` 启用。
- 补齐 runtime log 操作 API：`POST /api/runtime/logs/client/batch`、`GET /api/runtime/logs/export`、`POST /api/runtime/logs/clear`、`POST /api/runtime/logs/retention/run`、time-range query 和 `after:<id>` cursor pagination。
- 将 Web/QML Diagnostics 的 `Export History`、`Clear History` 和 `Run Retention` 接入 server APIs；未配置 server 时保留 visible-table fallback。
- 为 Web client log queue 使用 localStorage ring buffer；为 QML client log queue 增加 generated UI state 持久化，避免 client 进程重启后直接丢失待上传日志。
- 为 WebSocket server 侧补充 connect/disconnect/subscribe/replay/fallback 日志事件，减少 strict split runtime 的通信排障盲区。
- 为 SQLite 日志持久化补充配置入口：`HMI_RUNTIME_DATA_DIR`、`HMI_LOG_DB`、`--persistence-backend`、`--runtime-data-dir`、`--log-db`。
- 为命令行可见性保留 lightweight `ConsoleDiagnosticSink`，本阶段不引入 `spdlog`，避免过早绑定日志库。
- 新增 `SettingsStore` / `ToolStore` / `ParameterStore` source-level boundary 作为后续扩展点；本日明确不实现 concrete settings/tool/parameter persistence，等待相关业务模块稳定后再落地。
- 修复 Docker native server 构建中 zlib 源码下载失败风险：构建前临时注入 host vcpkg binary cache，Dockerfile 通过 `VCPKG_BINARY_SOURCES` 优先读取缓存，构建后清理上下文。
- 修复 `run_split_web_native.sh` 启动顺序 race：native server 必须先通过 `/api/runtime/health`，Web client 才启动，避免 Web 已打开但 server 实际不可用的假启动状态。
- 更新 server logging、persistence、runtime logs、persistence layer、logging persistence plan、Docker deployment、build/run、status matrix 及 zh-CN i18n 对应文档。
- 更新 client logging 文档入口、runtime logs category 文档、server logging 交叉引用和 Web/QML generated snapshot baselines。
- 使用 `tools/export_codex_user_history.py` 刷新 2026-04-30 brief/full Codex history export，并更新 aggregate report timeline、session entry 和 report diagrams。

## Verification

- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m unittest -v tests.test_story_docs`
- `python3 -m unittest -v tests.test_pipeline`
- `python3 -m unittest -v tests.test_mock_runtime_server tests.test_program_execution_contract`
- `cmake --build server/build --target server_smoke_test`
- `./server/build/server_smoke_test`
- `./generated/server-build/server_smoke_test`
- `git diff --check`
- `./tools/build_docs_html.sh`
- real HTTP smoke on generated native server:
  - `GET /api/runtime/health`
  - `POST /api/runtime/logs/client/batch`
  - `GET /api/runtime/logs/export`
  - `POST /api/runtime/logs/clear`
  - `POST /api/runtime/logs/retention/run`
- `HMI_SERVER_NATIVE_BUILD_MODE=docker ./tools/generate_targets.sh`
- `./tools/docker_hmi_server.sh build`
- `HMI_SERVER_PORT=18150 ./tools/docker_hmi_server.sh smoke`
- `node --check generated/web/runtime.js`
- `node --check generated/distribution/client/web/runtime.js`
- `./generated/distribution/run_split_web_native.sh 8010 8000` with:
  - `GET /api/runtime/health`
  - headless DOM check for `Connected to HMI server`
  - `GET /api/runtime/logs?source=client.web&limit=20` returning uploaded client events
- HTML existence checks for:
  - `docs_html/en/project/logging_persistence_plan.html`
  - `docs_html/en/product/spec/runtime_logs.html`
  - `docs_html/en/product/spec/persistence_layer.html`
  - `docs_html/en/server/logging.html`
  - `docs_html/en/server/persistence.html`
  - matching `docs_html/zh-CN/**` pages

## Follow-up Notes

- 04-30 full Codex conversation export 已重新生成：`2` sessions、`42` user prompts、`289` Codex messages，并且 `codex-conversations/index.html` / `all.html` / session detail HTML 都已落盘。
- Runtime Logs UI 和 client log event catalog 已可作为下一阶段 QML parity、cursor pagination UI、server-side replay warning 展示策略的基础。
- Docker zlib failure was a dependency acquisition/cache issue after adding `sqlite3`, not a C++ compile failure. The current wrapper avoids the network path when host vcpkg binary cache is available.
- Generated Docker-mode `generated/server-build/` intentionally contains the runtime server binary, not the `server_smoke_test` test executable; use `server/build/server_smoke_test` for native test verification and Docker health smoke for the container path.
- Settings/tool/parameter persistence remains deliberately deferred: the current code only keeps interfaces and authority terminology, while concrete stores should land with their corresponding product modules.
