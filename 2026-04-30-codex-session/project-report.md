# Project Report

## Scope

2026-04-30 的工作承接前一日 runtime logging / persistence 规划，重点从文档规划推进到第一版可运行实现。范围覆盖 native server 真实日志、Web/QML client 日志上传、Diagnostics 页面数据源切换、SQLite 日志持久化、Docker 构建缓存修复、最终产物生成、report/docs 刷新，以及 downstream `MetaNC/nrt/hmi` 同步。

## Completed Work

- 复查 persistence/logging 新增页面的最终 HTML 输出，修复英文 `docs_html/en` 缺少新页面的问题，并重新生成 docs portal。
- 完成 runtime logging 第一版真实接入：native server 记录 lifecycle、command accepted/rejected/result、HTTP/WebSocket/client-log 相关事件；Web/QML generated runtimes 上传低频 lifecycle、transport、command 事件。
- 将 Diagnostics 日志视图切到 runtime log contract：页面数据来自 server 注入的 `diagnostics.logs.entries` 与 `/api/runtime/logs` 增量查询，不再使用旧的 mock/alarm history。
- 引入 `LogStore` 边界、`InMemoryLogStore`、`SqliteLogStore` 和 `LogService` 运行时上下文，SQLite backend 可通过 `HMI_PERSISTENCE_BACKEND=sqlite` 启用。
- 为 SQLite 日志持久化补充配置入口：`HMI_RUNTIME_DATA_DIR`、`HMI_LOG_DB`、`--persistence-backend`、`--runtime-data-dir`、`--log-db`。
- 为命令行可见性保留 lightweight `ConsoleDiagnosticSink`，本阶段不引入 `spdlog`，避免过早绑定日志库。
- 修复 Docker native server 构建中 zlib 源码下载失败风险：构建前临时注入 host vcpkg binary cache，Dockerfile 通过 `VCPKG_BINARY_SOURCES` 优先读取缓存，构建后清理上下文。
- 更新 server logging、persistence、runtime logs、persistence layer、logging persistence plan、Docker deployment、build/run、status matrix 及 zh-CN i18n 对应文档。
- 使用 `tools/export_codex_user_history.py` 刷新 2026-04-30 brief/full Codex history export，并更新 aggregate report timeline、session entry 和 report diagrams。

## Verification

- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m unittest -v tests.test_story_docs`
- `python3 -m unittest -v tests.test_pipeline`
- `cmake --build server/build --target server_smoke_test`
- `./server/build/server_smoke_test`
- `git diff --check`
- `./tools/build_docs_html.sh`
- `HMI_SERVER_NATIVE_BUILD_MODE=docker ./tools/generate_targets.sh`
- `./tools/docker_hmi_server.sh build`
- `HMI_SERVER_PORT=18150 ./tools/docker_hmi_server.sh smoke`
- HTML existence checks for:
  - `docs_html/en/project/logging_persistence_plan.html`
  - `docs_html/en/product/spec/runtime_logs.html`
  - `docs_html/en/product/spec/persistence_layer.html`
  - `docs_html/en/server/logging.html`
  - `docs_html/en/server/persistence.html`
  - matching `docs_html/zh-CN/**` pages

## Follow-up Notes

- 04-30 full Codex conversation export 已重新生成：`1` session、`23` user prompts、`154` Codex messages，并且 `codex-conversations/index.html` / `all.html` / session detail HTML 都已落盘。
- Docker zlib failure was a dependency acquisition/cache issue after adding `sqlite3`, not a C++ compile failure. The current wrapper avoids the network path when host vcpkg binary cache is available.
- Generated Docker-mode `generated/server-build/` intentionally contains the runtime server binary, not the `server_smoke_test` test executable; use `server/build/server_smoke_test` for native test verification and Docker health smoke for the container path.
