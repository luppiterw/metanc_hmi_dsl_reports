# Project Report

## Scope

本轮工作解决 `LOGS` 同时出现在顶层导航和 `DIAG` 内部导航里的重复入口问题，并修复移动后的入口行为：

- 将 Runtime Logs 功能迁入 `DIAG > Logs`，移除外层独立 `LOGS` 页面和 footer 入口。
- 让外层 `DIAG` 入口默认进入 `Logs` 子页。
- 修复 Web/QML 普通按钮只执行第一条 action 导致 `DIAG` 点击后不进入目标页的问题。
- 为旧状态里的 `page_logs` 增加回退，避免删除页面后恢复过期 active page。
- 刷新快照、最终产物、报告与文档入口，并准备同步到 MetaNC。

## Completed Work

- 在 `definition/ui.structure.yaml` 中把原 `page_logs` 的 Runtime Logs 视图移动到 `page_diagnostics` 内部的 `diagnostics_logs_view`。
- 删除顶层 `LOGS` footer 入口，保留 `DIAG` 内的 `Logs / NC Vars / PLC Vars` 子导航。
- 按最终需求将 `runtime_state.diagnosis_view` 默认值设为 `logs`，并让外层 `DIAG` 入口先设置 `diagnosis_view=logs`，再切换到 `page_diagnostics`。
- 在 Web 生成器里增加普通按钮的 `triggerActions(actions)` 路径，保留 repeat-while-pressed 控件的单 action 重复语义。
- 在 QML 生成器里增加 `triggerActions(actions)`、footer `buttonActions` 和通用按钮多 action 执行能力。
- 在 Web/QML shell 中加入已知页面检查，遇到过期的 `page_logs` active page 时自动回退到默认页。
- 更新 Runtime Logs 页面的过滤器占位上下文，从旧 `page_logs` 改为 `page_diagnostics`。
- 刷新 Web/QML 快照，并更新 pipeline 断言以锁定多 action 点击路径。

## Verification

- `python3 -m unittest -v tests.test_pipeline` 通过，28 个用例通过，1 个 Web visual snapshot 用例按现有配置跳过。
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh` 通过，刷新 Web/QML/server/distribution 最终产物。
- `./generated/server-build/server_smoke_test` 通过。
- `git diff --check` 通过。
- 生成产物静态检查确认：
  - 默认 `runtime_state.diagnosis_view` 为 `logs`。
  - 外层 `DIAG` 入口包含设置 `logs` 子页和切换 diagnostics 页面两条 action。
  - 已无顶层 `page_logs` / `LOGS` 导航入口。

## Notes

- 这次变更让 Runtime Logs 只保留一个正式入口：`DIAG > Logs`。
- MetaNC 同步时仍按既有 export 规则过滤 source-only 报告仓、`docs_i18n` 和本地生成目录。
- Browser-level 点击验证未作为本轮最终门禁执行，因为当前环境缺少 Playwright；行为由生成器快照、pipeline、QML 编译和服务端 smoke 覆盖。
