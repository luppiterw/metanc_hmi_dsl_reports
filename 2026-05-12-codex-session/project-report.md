# Project Report

## Scope

本轮继续推进 Web/QML runtime parity 的可执行验证，重点补齐 QML strict
server 模式下 WebSocket-only reconnect 的 smoke coverage，并把这条覆盖接入
远端 CI 的强制 gate。此前 QML 已有 bootstrap/command forwarding、
late-server reconnect 和 true server-restart reconnect 覆盖，但这些测试无法
直接证明 Qt WebSocket subscription 路径本身在重连后仍能推送外部 server
state changes。

本轮新增一个 QtWebSockets-gated smoke：只有宿主机安装 QtWebSockets QML
module 时才执行完整断线/重连链路；模块不可用时明确 skip，避免把 fallback
环境误判为 WebSocket 功能失败。

后续在本机安装 QtWebSockets 后复跑强制 smoke，发现 QML 动态 WebSocket
source 仍会因为 `import QtWebSockets 1.15` 与当前 Qt6 包实际导出的
`WebSocket 1.0/1.1` 不匹配而创建失败，随后 fallback 到 HTTP polling。修复后
QML 使用无版本 `QtWebSockets` import，并由 runtime store 显式连接 socket
status/message signals，WebSocket-only reconnect smoke 已在 QtWebSockets-enabled
host 上通过。

随后检查远端 GitHub Actions，当前 main 最新 run 已通过，之前的红色记录是
旧提交保留的历史失败。本轮报告刷新还补齐了完整 Codex conversation export，
避免 report 页面只能看到 user history、看不到具体对话详情。

## Completed Work

- 已提交 shared parity S2：
  - 新增 `mdi_execution_result` shared scenario，覆盖 MDI input execution 和
    execution-source/runtime-state 结果。
  - 增加 browser-backed Web Runtime Smoke 与 QML strict smoke 对该 scenario 的
    消费路径。
  - 修复 server adapter 对 `mdi.content` 的 property write-through，避免 MDI
    Cycle Start 使用旧 buffer。
- 修复 QML strict server 模式下的 PROG SELECT 导航回归：
  - QML `progdir.commands.activate` 文件条目激活后，现在与 Web 一样切回
    `page_program` 并聚焦 active Program editor。
  - 目录条目仍保留在 PROG DIR 浏览器内进入下一级，不改变文件夹导航语义。
  - `prog.commands.load` 也补齐相同的 Program editor 导航副作用。
- 新增 QML strict smoke：
  - `tests/qml_smoke/runtime_strict_prog_select_navigation.js`
  - `tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_prog_select_navigation`
  - 覆盖从 `page_program_browser` 打开 `SHAFT_A.MPF` 后，client 回到
    `page_program`、当前程序路径/名称正确、`program.document.content` 含
    server-returned 程序内容。
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
- 补齐 QtWebSockets 实跑闭环：
  - `tests.test_qml_smoke` 新增 `HMI_REQUIRE_QTWEBSOCKETS=1` 开关；普通本地
    环境缺 QtWebSockets 时仍 skip，CI 声明必须支持时会 fail。
  - `.github/workflows/ci.yml` 新增 `QML Runtime Smoke` job，安装 Qt、QtWebSockets
    和 vcpkg/server build 依赖，运行 `./tools/generate_targets.sh` 后执行严格
    transport smoke。
  - `.github/workflows/visual-snapshots.yml` 的 QML visual job 也安装
    `qt6-websockets-dev` 和 `qml6-module-qtwebsockets`。
  - README、build/test、tooling、server docker deployment 和 agent handoff 文档
    记录 QtWebSockets 依赖、CI 强制 smoke 行为和本地 skip/require 语义。
- 修复安装 QtWebSockets 后暴露出的 QML WebSocket runtime 问题：
  - 动态 WebSocket source 从 `import QtWebSockets 1.15` 改为无版本
    `import QtWebSockets`，兼容当前 Qt6 package 导出的 `WebSocket 1.0/1.1`。
  - WebSocket status/text message signals 从 `RuntimeStore` 创建后显式连接，
    open 后会发送 `runtime.subscribe`，server ack/replay 能推动外部
    `cnc.commands.set_mode` 状态到达 QML。
  - smoke timeout 诊断现在会输出完整 `smokeTransportState()`，后续 CI 失败时
    可以直接区分 socket create、open、subscription、fallback 状态。
- 确认最新 GitHub Actions run 已通过，CI 问题当前收口在 main 最新提交上。
- 刷新 2026-05-12 report 的 user history 与完整 Codex conversation export，
  并补齐近期 append-only 历史会话索引。
- 明确下一步执行顺序：先完成 report/docs + MetaNC 同步提交，再进入
  Web/QML parity 的 server-backed AUTO/JOG scenario 自动化切片。

## Validation

- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_websocket_reconnect`
  - Result on this host: passed with `skipped=1` because QtWebSockets QML module is
    not installed.
- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_bootstrap_command tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_server_restart_reconnect`
- `./tools/generate_targets.sh`
- `python3 -m unittest tests.test_pipeline tests.test_generator_refactor`
- `python3 -m unittest tests.test_qml_smoke`
- `python3 -m unittest tests.test_web_qml_parity_docs`
- `HMI_REQUIRE_QTWEBSOCKETS=1 python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_websocket_reconnect`
  - Result on this host: expected failure, because QtWebSockets is intentionally
    absent in the local environment.
- `HMI_REQUIRE_QTWEBSOCKETS=1 python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_websocket_reconnect tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_server_restart_reconnect`
  - Result after installing QtWebSockets locally: passed, validating WebSocket
    open/disconnect/reconnect and external `cnc.commands.set_mode` delivery
    without HTTP polling fallback.
- `python3 -m unittest tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_prog_select_navigation`
- `python3 -m unittest tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_program_lifecycle`
- `python3 -m unittest tests.test_parity_scenarios tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
- workflow YAML parse check for `.github/workflows/ci.yml` and
  `.github/workflows/visual-snapshots.yml`
- `git diff --check`

Validation result: generated Web/QML/server/distribution artifacts were refreshed,
existing QML strict-server reconnect behavior still passes, and the WebSocket-only
reconnect smoke now passes on a QtWebSockets-enabled host. The new QML strict
PROG SELECT navigation smoke also passes on this host, proving that the server
updates the active program document while the QML client performs the matching
editor-page transition. CI installs QtWebSockets and sets
`HMI_REQUIRE_QTWEBSOCKETS=1`, so the WebSocket-only case will fail in CI if it
would skip or fall back to polling.

The latest remote GitHub Actions run for main also passed after the CI dependency
fixes, so the repository is ready for the next parity-automation slice.

## Notes

- 本机安装 `qt6-websockets-dev` 和 `qml6-module-qtwebsockets` 后，新增 smoke
  已执行完整 WebSocket open/disconnect/reconnect 和外部 command push 验证。
- `qmlimportscanner` 仍会打印 `QtQml` qmldir warning，但 QML build 和
  WebSocket smoke 均通过；该 warning 与本次 WebSocket 失败根因无关。
- 下一步优先落一个共享 parity scenario 层，覆盖 strict server 下 AUTO
  `cycle_start/feed_hold/reset` 和 JOG `move_axis` 的结果断言，减少 Web/QML
  手工检查漂移；S0/S1/S2 已经作为当前 shared acceptance ring 的收敛基线。
