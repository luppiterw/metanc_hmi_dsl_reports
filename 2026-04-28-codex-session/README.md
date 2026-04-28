# 2026-04-28 Codex Session Report

这个目录整理了 2026-04-28 围绕 `metanc_hmi_dsl` Drogon server 审计、host vcpkg/Drogon 环境、WebSocket subscription、client/server split runtime、JOG/AUTO 命令闭环、Web client npm/esbuild 拆分、CodeMirror Program 编辑器接入、MetaNC 同步，以及当天 report 刷新的结构化阅读材料。
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
- User prompts: `36`
- Synthetic events: `1`
- Messages: `335`
- User messages: `37`
- Codex messages: `298`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->

## Session Notes

- 检查 `metanc_hmi_dsl/server` 的 CMake、vcpkg、Drogon REST/WebSocket transport、Dockerfile、Compose 和 generated 分发脚本，确认生产 server 入口已收敛到 Drogon。
- 识别并修复 Docker context 污染问题：嵌套 `server/build`、`cmake-build-*`、`vcpkg_installed` 现在不会再被带入 server 镜像构建。
- 清理 client strict-mode 中仍写着 `split mock server` 的连接成功文案，改为中性的 `HMI server`，并同步 Web/QML runtime 快照。
- 梳理非 Docker host 环境：vcpkg 是推荐路径，`drogon_ctl` 已位于 `/home/iaar/workspace/github/vcpkg/installed/x64-linux/tools/drogon/drogon_ctl`，但还需要把该 tools 目录加入 `PATH` 才能直接调用。
- 为 native server 引入 runtime WebSocket subscription，补齐 `/api/runtime/ws` 的订阅、replay、state changed 和 command completed 推送路径。
- 扩展 server `SimulatorAdapter` 命令覆盖，split 模式下 `cnc.commands.set_mode`、`jog.commands.move_axis`、`jog.commands.set_mode`、`cnc.commands.cycle_start` 等软面板命令可由 server 处理。
- 修复 Web client 处理 WS state revision 的顺序问题，避免 AUTO 运行中的后续 state payload 被误判为 no-op，恢复当前行、执行块、elapsed 和轴数据刷新。
- 通过浏览器/CDP 真实验证 split native 模式：AUTO `CYCLE START` 后界面进入 `Running`，当前块显示到 `N40...`，elapsed 和 X 轴位置继续变化。
- 明确当前 split 状态：client 数据来自 server 的 HTTP/WS state，server 端当前数据源仍是 `SimulatorAdapter`，真实 CNC 接入是下一阶段工作。
- 将 Web client 生成路径拆成 npm/esbuild 管理的 bundle、生成器 shell、运行时 JSON seed 和静态 app shell，便于后续引入第三方前端库。
- 引入 CodeMirror Program editor provider，修复 Program 编辑页布局高度、执行时编辑器光标跟随运行行、以及多行选中后白字落在浅色选区上不可读的问题。
- 生成并刷新 2026-04-28 report、完整 Codex conversation 导出、聚合 session 入口和最终 HTML 产物，并同步必要内容到 `MetaNC/feat/hmi`。
