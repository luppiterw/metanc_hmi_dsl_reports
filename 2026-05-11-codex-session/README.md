# 2026-05-11 Codex Session Report

这个目录整理了 2026-05-11 这轮项目推进的结构化阅读材料。
本轮主线是继续推进 QML `Main.qml` generator entrypoint 的源码级拆分：
把顶部状态栏、状态 chip、隐藏的 header quick controls、theme selector 和
settings icon button 的 QML body 从 `client/qml_client/generator.py` 移入
`client/qml_client/main_qml_parts/header_body.py`。这一步只调整源码组织，
保留最终生成的 `Main.qml` 结构和运行语义。

本轮同时更新 README、CHANGELOG、status matrix、code map、英文/中文 agent
handoff 文档，并重新生成 Web/QML/server/distribution 最终产物和 docs_html。
`generator.py` 从上一轮 stage body 拆分后的 560 行继续降到 375 行，
`header_body.py` 承接 210 行 header body assembly，tracked generated Web/QML
和 contract 输出保持无 diff。
随后继续按同一低风险策略拆分 `main_qml_parts/program_search.py`：先只抽出
Program navigation/Goto、Search/Replace local state、search matching engine
三块，不触碰 replace、clipboard、execution preflight 和 local Program action
等高行为风险逻辑。`program_search.py` 从 522 行降到 391 行，新增三个
40-70 行级别的二级 fragments，tracked generated outputs 继续无 diff。
本轮后续又按用户要求重新生成 Web、Qt/QML、server/distribution 和最终文档
产物，用于人工检查当前效果；生成后的源码与 reports 工作区保持 clean。
随后修复 Diagnostics Logs 刷新时滚动位置跳回顶部的问题：Web 端现在同时
保留 table scroller 与外层 page shell 的可见日志行锚点，QML 端保留
`ListView` row anchor；显式 reset refresh 仍会回到顶部。该修复还顺手收紧了
分发版 Web 启动脚本的 `--restart PORT` 参数解析，并避免 packaged `config.js`
被错误覆盖为 strict 空 server URL。
最后落地 Web/QML parity tracking 第一版：新增英文与中文
`client/web_qml_parity.md`，用矩阵跟踪 Shell、MAIN、软面板、PROG DIR、
PROG EDIT、Diagnostics Logs、DEBUG Query 和 Runtime Transport/Reconnect
的 Web/QML 状态、差异类型、验证方式、优先级和 follow-up，并新增轻量
docs 测试锁定矩阵枚举和 P0 规则。
在此基础上又推进第一条可执行 QML parity smoke：generated QML 现在只在
`HMI_QML_SMOKE_SCRIPT` / `HMI_QML_SMOKE_RESULT_PATH` 环境变量存在时启用
测试 hook，offscreen QML executable 会执行脚本、导出 JSON 结果，并由
`tests.test_qml_smoke` 验证 MAIN mode switching 和 DEBUG axis query。
这一步把 parity matrix 中部分手工/快照验证升级为可重复的 runtime evidence。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: QML source decomposition、生成、验证、同步工作流图
- `architecture-diagram.md`: QML Main.qml helper 与 Program search fragment 结构图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-11`
- Sessions: `3`
- Primary sessions: `2`
- Side sessions: `1`
- User prompts: `45`
- Synthetic events: `3`
- Messages: `436`
- User messages: `48`
- Codex messages: `388`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
