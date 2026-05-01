# Project Report

## Scope

2026-05-01 的工作围绕 generated HMI 最终产物和下拉框可读性收口展开。范围覆盖 `metanc_hmi_dsl` 与 downstream `MetaNC/nrt/hmi` 同步更新、Web/QML 最终产物生成、docs portal 生成确认、最终产物执行方式确认、blue theme 下拉框展开态对比问题定位、Web 原生 `<select>` 替换为自绘 HMI selector、QML ComboBox delegate 样式对齐、快照/测试刷新，以及本日 report/docs 更新和提交发布链路。

## Completed Work

- 更新并检查 `metanc_hmi_dsl` 与 `MetaNC/nrt/hmi` 当前工作区，确认本轮只处理 HMI 相关 generator、snapshot、docs 和 report 改动。
- 重新生成 Web/QML/server 最终产物，确认 packaged distribution 入口位于 `generated/distribution/`，并明确 split Web native 执行方式。
- 检查 docs 生成链路，确认 `docs_html` 作为派生产物由 `./tools/build_docs_html.sh` 或目标生成流程刷新，不作为 retained source 手工维护。
- 定位 blue theme 下拉框问题：Web 端原生 `<select>` 展开态仍由浏览器控制，CSS 对 `<option>` hover/selected 的控制不可靠，导致亮背景和亮文字组合在部分环境不可读。
- 为 Web generated shell 新增统一 `createHmiSelect` 自绘 selector，支持打开/关闭、外部点击关闭、键盘上下/首尾/回车/空格/Escape、焦点恢复和 selected state 同步。
- 将 Settings 中所有 enum 控件改为自绘 selector，包括 `Server Mode` 和 `Theme`。
- 将 Runtime Logs 页面中的 `Level` 与 `Time` 筛选下拉框改为同一个自绘 selector，并保持 server-backed log query 触发行为。
- 调整 Web selector CSS：菜单 surface 使用深色 console 背景，选中/悬浮/焦点状态使用与 Runtime Logs 选中行一致的蓝色高亮。
- 调整 QML ComboBox 样式：顶部 theme selector、Settings server mode selector、Settings theme selector 使用显式 popup/delegate/background/contentItem 样式，避免浅色展开态造成文字不可见。
- 更新 pipeline tests，断言 Web 产物不再生成 `document.createElement("select")`，并锁定 `settings-select`、`log-select` 和 `.hmi-select-option.is-selected`。
- 刷新 Web/QML snapshots，并重新生成两个仓库的 final distribution。
- 更新视觉设计指南，明确 selector/dropdown 展开态不能依赖原生绘制，并要求 blue theme hover/selected 默认匹配 Runtime Logs 选中行。
- 更新 Simplified Chinese docs overlay 和 i18n 状态记录，保持英文设计规则与中文 overlay 一致。
- 创建 2026-05-01 session report，导出 brief user history 与完整 Codex conversation export，并更新 aggregate report timeline。

## Verification

- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots` in `metanc_hmi_dsl`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots` in `MetaNC/nrt/hmi`
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh` in both repositories
- `./generated/server-build/server_smoke_test` in both repositories
- `rg` checks in `generated/web` and `generated/distribution/client/web` confirming `createHmiSelect`, `settings-select`, `log-select`, and `.hmi-select-option.is-selected` are present while native `document.createElement("select")` is absent
- `git diff --check` in both repositories

## Follow-up Notes

- The Web implementation intentionally leaves the old global `select option` CSS as a fallback for any future native select, but current generated Settings and Logs dropdowns no longer use native select elements.
- QML remains on Qt `ComboBox`, but the popup delegate is fully styled by the generator instead of relying on default toolkit contrast.
- `generated/` and `docs_html/` remain derived outputs. Rebuild them from source rather than hand-editing packaged files.
- The 2026-05-01 full Codex export published `1` primary session, `10` user prompts, and `69` Codex messages.
