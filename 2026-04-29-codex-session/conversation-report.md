# Conversation Report

## Summary

本日会话围绕 generated 输出是否过期展开。先审计了 Web/QML/distribution 相关脚本和 README，确认文档层面存在多处 out-of-date 信息。随后修正生成模板、重新生成产物、验证脚本和测试，再按既有同步流程提交源仓库并合并到 MetaNC。

## Decisions

- generated README 必须描述真实启动路径，不再把 repo fixture helper 写成独立 packaged mock server。
- Web split native 场景继续采用严格 server URL：`?server=http://127.0.0.1:8010/api/runtime`。
- QML README 中的运行命令需要匹配 out-of-source build 结果，即使用 `./build/appCNC_HMI_DSL`。
- report 更新要落到 `submodules/metanc_hmi_dsl_reports`，同时更新 aggregate index 并重建 HTML 输出。

## Published Artifacts

- Brief user history: `user-history.md`
- Full Codex conversation export: `codex-conversations/index.html`
- Aggregate report entry: `src/sessions/2026-04-29-codex-session.md`
- Session book output: `build_html/index.html`
