# 2026-05-09 Codex Session Report

这个目录整理了 2026-05-09 这轮项目推进的结构化阅读材料。本轮主线是
MAIN 页面 JOG 模式的职责收敛：主页不再重复软面板里的轴选、步进、JOG
运动、主轴启停、进给启停、冷却和 cycle 类操作，而是只保留手动准备值与
只读 live 状态。真实操作入口继续集中在软面板，避免同一页面出现两套相似
控制语义。随后补充修复 server simulator 的 FS Actual/Target 语义，确保
离散 JOG 运动停止后 actual feed 回到零，而 target/cmd 仍保留设定值。
最后补齐 DEBUG natural-query 输入框的键盘提交路径，使 Web/QML 中的
`Run`、`Enter` 和 `Return` 都走同一条 client-local 查询执行逻辑，并继续
处理查询偶发看似无响应、单轴缩写如 `x` 不能直接查轴数据的问题。最后
修复 Web MAIN 页在 MDI 编辑器获得焦点时点击软面板 `AUTO` 后仍停留在
MDI 编辑器的问题：主页重绘保护现在会识别主模式面板切换，普通编辑刷新
继续保留焦点，但 `MDI` / `AUTO` / `JOG` 视图切换会立即重建主内容区。
随后按后续计划推进 Web generator 第一阶段拆分：先做源码级低风险分层，
把 CSS 构建迁到独立 `styles.py`，并把 Program、Runtime Logs 和 DEBUG
natural-query 的 JS 片段拆到 `client/web_client/features/`，同时保持最终
生成的 Web/QML 输出与既有快照完全等价。随后继续把 `widget_emitters.py`
细分为 `client/web_client/widget_core/`，并把 `legacy_shell.py` 细分到
`client/web_client/style_emitters/legacy/`，让 Web 生成器源文件进一步从
少数超大文件收敛为按职责维护的片段集合。最后把 Web `runtime_shell.py`
细分为 `client/web_client/runtime_fragments/`，继续保持最终 `runtime.js`
byte-stable，不改变 strict/hybrid、HTTP/WebSocket、logs、program workspace
或 simulator 行为。
随后继续推进 QML generator 源码拆分的第一步：`widget_emitters.py` 仅保留
兼容 dispatch，具体 Program、Logs、DEBUG、tables、gauges、buttons、
containers、layout 和 utils emitters 移入 `client/qml_client/widget_fragments/`，
同时确认最终 `Main.qml` 和 Web 产物没有生成语义变化。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: JOG 主页职责收敛、生成和验证工作流图
- `architecture-diagram.md`: MAIN/JOG display context 与 soft-panel command surface 分工图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-09`
- Sessions: `3`
- Primary sessions: `2`
- Side sessions: `1`
- User prompts: `125`
- Synthetic events: `3`
- Messages: `1119`
- User messages: `128`
- Codex messages: `991`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
