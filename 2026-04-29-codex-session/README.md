# 2026-04-29 Codex Session Report

这个目录整理了 2026-04-29 这轮项目推进的结构化阅读材料。
本日重点从 generated 运行脚本说明修正，延伸到设计规范文档、设置入口与 Web/QML shell 行为收敛，并保持 `MetaNC/nrt/hmi` 同步发布链路可用。

目录：

- `project-report.md`: 项目进展总结占位页
- `conversation-report.md`: 会话摘要占位页
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 工作流图占位页
- `architecture-diagram.md`: 架构图占位页
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

本日摘要：

- 检查 `generated/distribution`、`generated/web`、`generated/qml` 的脚本和 README，确认存在 fixture/native server 说明混淆、split Web 打开地址过期、QML 文件清单与运行路径过期等问题。
- 修正源模板后重新生成最终产物，并验证脚本语法、生成快照测试和 diff check。
- 建立英文 `DESIGN.md` 根入口与 docs 内部设计规范页，并补齐 zh-CN i18n 与 development guide 导航。
- 实现 Web/QML 设置面板，覆盖 runtime server、server mode、theme、软面板显示等分类设置，并将 settings 入口收敛为顶部右侧齿轮。
- 移除 Web 顶部旧的软面板切换按钮和主题下拉框 DOM；QML 侧隐藏对应旧控件，增加 WSL 可见区域启动约束与 `Alt + 鼠标左键` 窗口移动。
- 刷新最终产物并用生成测试、DSL 校验、QML 编译、Web 实际页面截图验证。
- 将源仓库变更提交并推送，再通过同步脚本合并到 `MetaNC/feat/hmi` 并提交推送。
- 新建本日 report 包，导出简版 `user-history.md` 和完整 `codex-conversations/`。

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-04-29`
- Sessions: `1`
- Primary sessions: `1`
- Side sessions: `0`
- User prompts: `1`
- Synthetic events: `0`
- Messages: `6`
- User messages: `1`
- Codex messages: `5`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
