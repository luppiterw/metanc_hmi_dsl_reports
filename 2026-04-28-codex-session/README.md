# 2026-04-28 Codex Session Report

这个目录整理了 2026-04-28 围绕 `metanc_hmi_dsl` Drogon server 审计、迁移遗留清理、Docker 构建路径复验、生成器快照校准，以及当天 report 刷新的结构化阅读材料。
本次刷新已导出当天本地 Codex 会话，并补齐 project/conversation/diagram 页面，使最终 mdBook 和 `docs_html` 入口可以直接阅读。

目录：

- `project-report.md`: 本轮项目进展总结
- `conversation-report.md`: 本轮会话摘要和结论
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: Drogon server 检查与报告刷新工作流
- `architecture-diagram.md`: native server 与 fixture/report 关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-28`
- Sessions: `1`
- Primary sessions: `1`
- Side sessions: `0`
- User prompts: `2`
- Synthetic events: `0`
- Messages: `21`
- User messages: `2`
- Codex messages: `19`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->

## Session Notes

- 检查 `metanc_hmi_dsl/server` 的 CMake、vcpkg、Drogon REST/WebSocket transport、Dockerfile、Compose 和 generated 分发脚本，确认生产 server 入口已收敛到 Drogon。
- 识别并修复 Docker context 污染问题：嵌套 `server/build`、`cmake-build-*`、`vcpkg_installed` 现在不会再被带入 server 镜像构建。
- 清理 client strict-mode 中仍写着 `split mock server` 的连接成功文案，改为中性的 `HMI server`，并同步 Web/QML runtime 快照。
- 调整 generated distribution README 文案，明确 runtime contract bundle 同时服务 fixture 和 native server。
- 复验 Docker smoke、容器 one-shot 启动、生成器快照测试，记录 host 侧缺少 vcpkg/Drogon 时直接 CMake 配置的环境限制。
- 生成 2026-04-28 report、完整 Codex conversation 导出、聚合 session 入口，并准备最终 HTML 产物用于检查和提交。
