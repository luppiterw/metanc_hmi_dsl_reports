# Conversation Report

Date: 2026-05-04

## Summary

用户先询问 server 端接口测试是否足够。检查后确认现有覆盖能支持内部迭代，但不足以作为对外稳定 API 的完整保障：当时主要依赖 `server_smoke_test`、mock runtime tests 和 API docs coverage，缺少拆分后的 REST API 契约测试和真实 HTTP black-box 测试。

随后用户要求“补一下”。本轮实现了两层补强：

- controller-level REST API contract test，锁定状态码、payload、错误路径、命令日志链路、日志容量限制和程序执行保护。
- real HTTP black-box test，启动实际 native server，通过 localhost 请求验证 health、bootstrap、commands、logs 和 client log ingest。

用户随后要求更新今天 report 和关联文档，并在检查无问题后同步 MetaNC、提交和推送。本报告记录本轮新增测试、文档更新和验证命令。

## Decisions

- server API 行为测试不再继续塞进一个大 smoke test；新增 `runtime_rest_api_test` 作为可定位的 REST 契约测试。
- 保留 `server_smoke_test` 的 application-level integration 定位。
- 需要真实监听器或 localhost transport path 的行为进入 `server_http_api_blackbox_test.py`。
- API 文档仍由 `tests/test_server_api_docs.py` 检查 endpoint/event 覆盖，但它只负责 docs coverage，不替代 behavioral tests。

## Follow-up Notes

- WebSocket 真实连接级测试仍可继续增强，尤其是页面变量和全局变量 subscription 切换、replay、断线重连和错误消息。
- 后续如果生成 OpenAPI/JSON Schema，应让文档、契约样例和接口测试从同一份 schema 对齐。
