# 2026-04-20 Codex Session Report

这个目录整理了 2026-04-20 这轮项目推进的结构化阅读材料。
本轮工作覆盖两个连续主题：

- 修复 `metanc_hmi_dsl -> MetaNC/nrt/hmi` 双向同步时误覆盖下游本地 report 入口 Markdown 的问题
- 重构 docs / story 文档结构，并把 retained source package 从 `examples/june-demo` 正式迁移到 `src/hmi_dsl`

说明：

- 这份报告覆盖 2026-04-20 当天围绕同步边界收紧、docs/story 收口、source-package 硬迁移、测试验证、产物重建与报告更新的一组连续工作
- 这里不包含模型内部原始推理链
- 这里保留的是便于后续工程审查的过程摘要、关键决策、验证结果和可追溯资产入口
- 图形继续使用 Mermaid 结构化表示，便于后续导出或二次修改

目录：

- `project-report.md`: 双向同步保护、docs/story 主书收口、`src/hmi_dsl` 迁移与最终验证总结
- `conversation-report.md`: 摘要化过程记录、推进时间线、关键决策
- `workflow-diagram.md`: 从同步问题定位到 docs/source-package 收口与产物重建的工作流图
- `architecture-diagram.md`: 当前仓库、下游包目录、reports 子模块、主 docs 书与 source package 的关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

HTML 构建说明：

- 报告站点继续使用 `mdbook-mermaid`
- Mermaid 图在 HTML 中会渲染为图形，并提供“图形 / 源码”切换
- 重建命令：
  `mdbook build 2026-04-20-codex-session`

建议阅读顺序：

1. `project-report.md`
2. `conversation-report.md`
3. `workflow-diagram.md`
4. `architecture-diagram.md`
