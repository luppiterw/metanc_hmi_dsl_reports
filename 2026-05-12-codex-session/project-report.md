# Project Report

## Scope

本轮继续推进 Web/QML runtime parity 的可执行验证，重点补齐 QML strict
server 模式下 WebSocket-only reconnect 的 smoke coverage。此前 QML 已有
bootstrap/command forwarding、late-server reconnect 和 true server-restart
reconnect 覆盖，但这些测试无法直接证明 Qt WebSocket subscription 路径本身
在重连后仍能推送外部 server state changes。

本轮新增一个 QtWebSockets-gated smoke：只有宿主机安装 QtWebSockets QML
module 时才执行完整断线/重连链路；模块不可用时明确 skip，避免把 fallback
环境误判为 WebSocket 功能失败。

## Completed Work

- 扩展 QML smoke helper：
  - `smokeTransportState()` 导出 strict/server/base URL、连接状态、
    `runtimeWebSocket` 是否创建、WebSocket status、subscription key、
    `mode.current` 和 HTTP polling fallback 是否运行。
- 新增 `tests/qml_smoke/runtime_strict_websocket_reconnect.js`：
  - 等待 QML WebSocket subscription open。
  - 等待外部 server command 推送 `mode.current = MDA`。
  - 观察 server stop 后 WebSocket disconnect。
  - 等待 server restart 后 WebSocket reconnect。
  - 等待第二个外部 server command 推送 `mode.current = JOG`。
- 扩展 `tests/test_qml_smoke.py`：
  - 新增 QtWebSockets module 探测，缺 module 时跳过 WebSocket-only
    reconnect test。
  - 新增外部 REST command helper，通过 `/api/runtime/commands` 发
    `cnc.commands.set_mode`，避免测试路径依赖 QML 自己发起的 HTTP command
    response。
  - 新 smoke 断言连接态下 WebSocket 已创建、active、status=open、
    subscription connected，且 `serverPollTimer` fallback 未运行。
- 重新生成最终产物：
  - Web output: `generated/web`
  - QML project: `generated/qml`
  - native server: `generated/server-build/server`
  - QML executable: `generated/qml-final/appCNC_HMI_DSL`
  - distribution: `generated/distribution`
- 更新关联文档：
  - `CHANGELOG.md`
  - `docs/client/web_qml_parity.md`
  - `docs_i18n/zh-CN/client/web_qml_parity.md`
  - `docs/requirements/status_matrix.md`
  - `docs_i18n/zh-CN/requirements/status_matrix.md`
  - zh-CN i18n status manifest/report
  - 2026-05-12 session report and aggregate report timeline

## Validation

- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_websocket_reconnect`
  - Result on this host: passed with `skipped=1` because QtWebSockets QML module is
    not installed.
- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_bootstrap_command tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_server_restart_reconnect`
- `./tools/generate_targets.sh`
- `python3 -m unittest tests.test_pipeline tests.test_generator_refactor`
- `python3 -m unittest tests.test_qml_smoke`
- `python3 -m unittest tests.test_web_qml_parity_docs`

Validation result: generated Web/QML/server/distribution artifacts were refreshed,
existing QML strict-server reconnect behavior still passes, and the new
WebSocket-only reconnect smoke is present but intentionally skipped on this host
because QtWebSockets is absent.

## Notes

- 本机缺少 `qt6-websockets-dev`、`libqt6websockets6`、`qml6-module-qtwebsockets`
  相关包；新增测试不会把这种环境差异当作失败。
- 若在安装 QtWebSockets 的机器或 CI image 中运行，新增 smoke 会执行完整
  WebSocket open/disconnect/reconnect 和外部 command push 验证。
