# 2026-05-09 Codex Session Report

这个目录整理了 2026-05-09 这轮项目推进的结构化阅读材料。本轮主线是
MAIN 页面 JOG 模式的职责收敛：主页不再重复软面板里的轴选、步进、JOG
运动、主轴启停、进给启停、冷却和 cycle 类操作，而是只保留手动准备值与
只读 live 状态。真实操作入口继续集中在软面板，避免同一页面出现两套相似
控制语义。随后补充修复 server simulator 的 FS Actual/Target 语义，确保
离散 JOG 运动停止后 actual feed 回到零，而 target/cmd 仍保留设定值。
最后补齐 DEBUG natural-query 输入框的键盘提交路径，使 Web/QML 中的
`Run`、`Enter` 和 `Return` 都走同一条 client-local 查询执行逻辑。

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
- User prompts: `54`
- Synthetic events: `1`
- Messages: `486`
- User messages: `55`
- Codex messages: `431`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
