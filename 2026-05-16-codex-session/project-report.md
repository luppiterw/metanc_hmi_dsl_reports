# Project Report

Date: 2026-05-16

## Summary

本次推进把 Web/QML parity 从前面已经覆盖的 runtime/bootstrap、PROG 文件生命周期、MDI 执行结果，继续补到 S3: Diagnostics Logs query/export minimum。目标不是只加一个 Web smoke，而是把同一份场景、断言、mock runtime、Web runner、QML smoke 和 CI 目标一起打通。

## Completed Work

- 新增共享场景 `logs_query_export_minimum.json`，覆盖带 `correlation_id` 的 seed command、日志查询、JSONL 导出和最小匹配断言。
- 扩展共享断言层，让 `tests/parity_scenarios/assertions.py` 能统一校验 command result、log query result 和 export result。
- 扩展 mock runtime server，补齐 `/api/runtime/logs` 与 `/api/runtime/logs/export`，并在 command 调用时写入可查询日志事件。
- 扩展 Web parity runner，支持 seed command、query logs、export logs 三类动作，S3 场景可以直接在浏览器 smoke 中执行。
- 新增 QML strict smoke `runtime_strict_logs_query_export_minimum.js`，通过 WebSocket-ready 后的 HTTP command/logs/export 流验证 QML 运行时入口。
- 更新 source CI，把 S3 Web smoke 和 QML targeted smoke 纳入 `.github/workflows/ci.yml`。
- 更新英文与 zh-CN parity/status/build tooling 文档，把 S3 从 planned 改为 implemented，并补齐覆盖清单。
- 运行 source final artifact 生成，确认 Web、QML、native server、distribution 输出可生成。
- 同步 HMI slice 到 MetaNC，并在 MetaNC 内完成相同的本地测试、server ctest、Web S3 smoke 和 final artifact 生成。

## Validation Evidence

- Source unit/docs tests:
  - `python3 -m unittest -v tests.test_parity_scenarios tests.test_web_qml_parity_docs`
  - `python3 -m unittest -v tests.test_pipeline tests.test_ui_automation tests.test_story_docs tests.test_docs_portal`
- Source generated artifact:
  - `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
  - `ctest --test-dir generated/server-build --output-on-failure`
- Source Web parity smokes:
  - `node tools/web_parity_scenario_smoke.js`
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/prog_file_lifecycle.json`
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/mdi_execution_result.json`
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/logs_query_export_minimum.json`
- Source QML targeted smoke:
  - `python3 -m unittest -v tests.test_qml_smoke.QmlSmokeTests.test_runtime_strict_logs_query_export_minimum`
  - Local result skipped because the local Qt install lacks `QtWebSockets`; CI still requires it through `HMI_REQUIRE_QTWEBSOCKETS=1`.
- MetaNC sync validation:
  - `python3 -m unittest -v tests.test_parity_scenarios tests.test_web_qml_parity_docs tests.test_ui_automation tests.test_docs_portal`
  - `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh`
  - `ctest --test-dir generated/server-build --output-on-failure`
  - `node tools/web_parity_scenario_smoke.js --scenario tests/parity_scenarios/logs_query_export_minimum.json`

## Current State

Web 侧的 shared parity coverage 已推进到 S3；QML 侧也已经开始，不再停留在计划阶段。当前 QML 本地唯一限制是机器缺少 `QtWebSockets` QML module，无法在本机实际跑完 targeted strict smoke；远程 CI 会以 required 模式执行这个目标。

MetaNC 同步只带入 HMI runtime/tests/docs 的允许切片，没有把 source reports submodule 或 source-local report tooling 同步进 MetaNC。

## Next Slice

- 观察远程 CI 对新增 QML targeted smoke 的实际结果，重点看 CI Qt image 是否具备 `QtWebSockets`。
- 如果 CI 通过，下一片可以继续推进更高阶的 QML UI parity 或日志筛选/导出边界。
- 如果 CI 缺模块失败，优先修 CI 依赖安装，而不是放松 QML smoke 断言。
