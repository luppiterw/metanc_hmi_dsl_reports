# Project Report

Date: 2026-05-04

## Scope

本轮工作补齐了 native HMI server 侧的接口测试覆盖，并同步更新了与测试入口、API 维护规则、程序执行契约相关的文档。

## Changes

- 新增 `server/tests/runtime_rest_api_test.cpp`，把 REST API 行为从单个 smoke test 中拆出独立契约测试。
- 新增 `server/tests/server_http_api_blackbox_test.py`，真实启动 native server 后通过 localhost HTTP 验证关键 `/api/runtime/*` 接口。
- 更新 `server/CMakeLists.txt`，将 `runtime_rest_api_test` 和 `server_http_api_blackbox_test` 纳入 CTest。
- 更新 server build/run、server API、program execution story、acceptance test plan、server execution checklist 等关联文档。
- 更新中文 i18n overlay，并刷新 i18n status metadata。

## API Test Coverage Added

- `GET /api/runtime/health`
- `GET /api/runtime/bootstrap`
- `GET /api/runtime/state`
- `POST /api/runtime/property`
- `POST /api/runtime/resource`
- `POST /api/runtime/commands`
- `GET /api/runtime/logs`
- `GET /api/runtime/logs/export`
- `POST /api/runtime/client-logs`
- `POST /api/runtime/logs/client/batch`

## Guarded Behaviors

- runtime state/bootstrap 默认不再携带 diagnostics logs。
- command response 保留 `correlation_id`、`command_id`、`request_id`。
- command lifecycle logs 可按 correlation id 查询。
- 程序 execute preparation 在系统非 idle、空程序、缺失程序时会拒绝。
- client log batch max、query limit、export limit、server log hard cap 有测试固定。

## Verification

- `cmake --build generated/server-build`
- `ctest --test-dir generated/server-build --output-on-failure`
- `python3 -m unittest tests.test_server_api_docs tests.test_mock_runtime_server tests.test_program_execution_contract`
- `python3 -m py_compile server/tests/server_http_api_blackbox_test.py`
