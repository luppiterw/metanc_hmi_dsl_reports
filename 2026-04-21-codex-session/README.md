# 2026-04-21 Codex Session Report

这个目录整理了 2026-04-21 这轮项目推进的结构化阅读材料。
本轮工作覆盖了一整组连续收口动作，不再只停留在最早的 header 微调，而是一路推进到 overview 主页面和 QML 专项修复：

- 收紧 Web 顶部栏的横向节奏和控件尺寸，让 `MetaNC / 页面名 / 状态胶囊 / Show Ops / theme` 更稳定地落在同一条视觉基线上
- 修复 QML 顶部栏仍然分成两行的问题，把状态条从第二行结构重新并入主头部 `RowLayout`，让 QML 头部与 Web 一样回到单行
- 把 Web/QML 软面板改成默认展开，并同时压平主体区域多余的外层边框和边距，减少“壳套壳”的显示损耗
- 重新分配共享软操作面板的宽度和按钮区布局，让 Web/QML 两端的按钮都能完整显示
- 继续清理 overview 主页的冗余标题，移除 `Axis / Metric / Value` 这类重复表头，并把左列收口为 `AXIS -> F/S -> RUNTIME` 的单列信息流
- 让 `AXIS` 与 `F/S` 区域按内容高度收起，避免 overview 主体因为最小高度和拉伸策略产生大块空白与滚动条
- 对 QML 主页再做一轮专门收口：让主舞台左右边界与 footer 对齐、左右两列重新回到顶部对齐，并修复 footer `System ready` notice rail 的文字显示与垂直居中
- 再补一轮只针对 QML 主体区的拉伸与居中修正：让左侧 `AXIS / F/S / RUNTIME` 和右侧 `JOG` 区保持同一可用高度链，并在各自区域内部做垂直居中
- 刷新 QML / Web 生成快照、离屏基线、pipeline 验证结果，以及对应的 `CHANGELOG.md`
- 补齐当日 session report、aggregate 索引和 user-history，并准备把当前仓库的最新状态导出同步到 `MetaNC/nrt/hmi`

说明：

- 这份报告覆盖 2026-04-21 当天围绕头部布局修复、主舞台与软面板重排、overview 页面二次收口、生成验证、报告补全与下游同步的一组连续工作
- 这里不包含模型内部原始推理链
- 这里保留的是便于后续工程审查的过程摘要、关键决策、验证结果和可追溯资产入口
- 图形继续使用 Mermaid 结构化表示，便于后续导出或二次修改

目录：

- `project-report.md`: Web/QML 顶部栏、overview 主页、QML footer notice rail、主体拉伸/居中收口，以及快照刷新、验证与同步准备总结
- `conversation-report.md`: 从 header/ops shell 收口继续演进到 overview/QML 主页二次修正，再到主体区拉伸/居中收口的摘要化过程记录、定位路径和关键决策
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 从用户反馈到 retained/generator 修正、快照更新、报告补齐、验证与 MetaNC 导出的工作流图
- `architecture-diagram.md`: 当前仓库、retained package、生成器、报告子模块、快照和 `MetaNC/nrt/hmi` 导出目标之间的关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-21`
- Sessions: `7`
- Messages: `664`
- User messages: `86`
- Codex messages: `578`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
