# 2026-04-26 Codex Session Report

这个目录整理了 2026-04-26 这轮围绕文档最终产物收口与 report 发布质量修复的结构化阅读材料。
本轮工作的主线有三条：

- 审计并修复 `docs_html` 最终页中残留的坏链、错误内部路径和中英文输出分叉
- 把 `zh-CN` story-pack 过期 overlay 收回到“生成结果优先”的模式，避免中文页持续覆盖旧内容
- 对已发布 report 的 transcript 做一轮最小化路径脱敏，同时把同样的发布逻辑同步到 `MetaNC/nrt/hmi`

收尾阶段又补了一轮会话导出可读性修复：

- `codex-conversations` 详细页改成按 `Turn -> User -> Codex Responses` 分组
- `codex-conversations/index.html` 不再只显示第一条 user，而是按 turn 展开索引
- 同一 `session_id` 的重复 rollout snapshot 会先去重，只保留最完整的一份

目录：

- `project-report.md`: 本轮 docs portal、report transcript 和发布验证的结果总结
- `hmi-server-recommendation.md`: HMI server 推荐方案、技术选型和实施清单
- `conversation-report.md`: 从“文档还有什么问题”到“生成今天的 report”的摘要过程记录
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 从问题审计、源文档修复到最终 report 发布的工作流图
- `architecture-diagram.md`: `docs/`、`docs_i18n/`、report submodule、`docs_html/` 与 `MetaNC/nrt/hmi` 的关系图
- `assets/hmi-server-recommendation/`: HMI server 架构图、通信模式图和 PDF 导出版
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-26`
- Sessions: `2`
- Primary sessions: `2`
- Side sessions: `0`
- User prompts: `38`
- Synthetic events: `1`
- Messages: `384`
- User messages: `39`
- Codex messages: `345`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
