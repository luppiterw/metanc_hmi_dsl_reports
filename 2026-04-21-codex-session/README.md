# 2026-04-21 Codex Session Report

这个目录整理了 2026-04-21 这轮项目推进的结构化阅读材料。
本轮工作围绕一组连续的交付收口动作展开：

- 收紧 Web 顶部栏的横向节奏和控件尺寸，让 `MetaNC / 页面名 / 状态胶囊 / Show Ops / theme` 更稳定地落在同一条视觉基线上
- 修复 QML 顶部栏仍然分成两行的问题，把状态条从第二行结构重新并入主头部 `RowLayout`，让 QML 头部与 Web 一样回到单行
- 把 Web/QML 软面板改成默认展开，并同时压平主体区域多余的外层边框和边距，减少“壳套壳”的显示损耗
- 重新分配共享软操作面板的宽度和按钮区布局，让 Web/QML 两端的按钮都能完整显示
- 刷新 QML / Web 生成快照、离屏基线、pipeline 验证结果，以及对应的 `CHANGELOG.md`
- 补齐当日 session report，并准备把当前仓库的最新状态导出同步到 `MetaNC/nrt/hmi`

说明：

- 这份报告覆盖 2026-04-21 当天围绕头部布局修复、主舞台与软面板重排、生成验证、报告补全与下游同步的一组连续工作
- 这里不包含模型内部原始推理链
- 这里保留的是便于后续工程审查的过程摘要、关键决策、验证结果和可追溯资产入口
- 图形继续使用 Mermaid 结构化表示，便于后续导出或二次修改

目录：

- `project-report.md`: Web/QML 顶部栏、主体区域和软面板统一修复，以及快照刷新、验证与同步准备总结
- `conversation-report.md`: 摘要化过程记录、定位路径和关键决策
- `user-history.md`: 当天用户发言原始导出
- `workflow-diagram.md`: 从用户反馈到生成器修正、快照更新、验证与 MetaNC 导出的工作流图
- `architecture-diagram.md`: 当前仓库、报告子模块、生成产物和 `MetaNC/nrt/hmi` 导出目标之间的关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口
