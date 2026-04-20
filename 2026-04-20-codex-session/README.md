# 2026-04-20 Codex Session Report

这个目录整理了 2026-04-20 这轮项目推进的结构化阅读材料。
本轮工作聚焦在一个明确的同步问题上：

- 修复 `metanc_hmi_dsl -> MetaNC/nrt/hmi` 导出时误覆盖下游 report 入口 Markdown 的问题
- 把同一组保护规则补进 import/export 两个方向，并更新 report / docs 入口

说明:

- 这份报告覆盖 2026-04-20 当天围绕 `MetaNC` 下游本地 report 入口保护、同步脚本修复、真实仓库回滚验证、以及报告更新的一组连续工作。
- 这里不包含模型内部原始推理链。
- 这里保留的是便于后续工程审查的过程摘要、关键决策、验证结果和可追溯资产入口。
- 图形继续使用 Mermaid 结构化表示，便于后续导出或二次修改。
- 重点关注的是：双向同步不能覆盖下游本地维护内容，尤其是 `MetaNC` 侧不存在 report submodule 的那几处 Markdown。

目录:

- `project-report.md`: report 入口保护修复、同步边界收紧、验证结果总结
- `conversation-report.md`: 摘要化过程记录、推进时间线、关键决策
- `workflow-diagram.md`: 从误覆盖定位到保护性导出与报告更新的工作流图
- `architecture-diagram.md`: 当前仓库、下游包目录、reports 子模块与本地保留面之间的关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

HTML 构建说明:

- 报告站点继续使用 `mdbook-mermaid`
- Mermaid 图在 HTML 中会渲染为图形，并提供“图形 / 源码”切换
- 重建命令:
  `mdbook build 2026-04-20-codex-session`

建议阅读顺序:

1. `project-report.md`
2. `conversation-report.md`
3. `workflow-diagram.md`
4. `architecture-diagram.md`
