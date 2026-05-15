# 2026-05-13 Codex Session Report

这个目录整理了 2026-05-13 这轮项目推进的结构化阅读材料。
本轮先回到 generator/source decomposition 工作，完成当前 Web/QML generator
Python 源文件体量盘点、候选拆分排序和 Web app-shell P0 最小拆分；随后修复
docs portal 的 `mdbook-bookshelf 0.2.x` 兼容问题，并在后段完成 PROG DIR
文件管理闭环。

本轮结论：Web `client/web_client/app_shell.py` 已从 1,375 行降到 783 行，
settings panel/persistence 和 custom select control 已移入
`client/web_client/app_shell_fragments/`。生成输出保持 snapshot-stable。当前
Web/QML generator source 已没有超过 1,000 行的 Python 文件；后续不建议为了
housekeeping 继续无目标拆分，应只在 Logs、commands、server bridge、DEBUG query
等真实功能改动触达时顺手拆对应 P1 文件。

后续补充：本轮还修复并提交了 docs portal 的 `mdbook-bookshelf 0.2.x`
兼容问题，根 `bookshelf.toml` 和 portal generator 已切换到 documentation
index、显式 book id 和 category 模型；同时清理了 `server/README.md` 中已经
过期的 split-runtime Next Steps，明确 Web/QML strict clients 已接入 native
runtime server，剩余重点是真实 CNC/PLC adapter、生产 command schema 和
persistence manager/state store。

PROG DIR 后续补齐已按 TDD 落地：新增 `progdir.commands.refresh`、
`progdir.commands.rename`、`progdir.commands.delete`，Web/QML/local mock
runtime/C++ simulator server 都已接入；Rename 支持文件和目录，目录 rename 会
移动子树；Delete 支持文件和空目录，非空目录删除会被拒绝。英文/中文接口文档、
program story、parity 文档和 data dictionary 已同步更新，最终 Web/QML/server/
distribution 产物已重新生成。

随后继续按 TDD 抽出 server-side `ProgramWorkspaceAdapter` 边界：新增 adapter
interface、simulator-backed implementation 和 `program_workspace_adapter_test`，
把 `SimulatorAdapter` 内部 program file map/set 逻辑迁出。Web/QML northbound
contract 未变，现有 `progdir.commands.*` 和 `program.browser.*` 行为由 adapter
后端承载，后续可接 filesystem/controller-backed adapter。

本轮最后完成 `FilesystemProgramWorkspaceAdapter` 最小闭环：默认仍保留
simulator workspace，显式设置 `HMI_PROGRAM_WORKSPACE_BACKEND=filesystem` 和
`HMI_PROGRAM_WORKSPACE_ROOT` 后，server 会把 PROG DIR / PROG / Save 相关读写落到
真实本地目录。新增 filesystem adapter 单测和 REST 级测试，覆盖真实落盘、root
escape 拒绝、basename-only rename、空目录删除和非空目录拒绝；最终 C++ server
tests、Python unittest discovery 和 generated distribution 均已验证通过。

随后补齐 packaged split runtime 的真实 smoke：新增
`tests/test_filesystem_program_workspace_distribution.py`，通过
`generated/distribution/run_server_native.sh` 启动打包后的 native server，并用 HTTP
命令验证 filesystem workspace 的 new/save/new folder/rename/delete、非法路径拒绝
和非空目录拒绝，同时直接检查临时目录里的磁盘文件变化。该测试已进入 Python
unittest discovery，回归数从 139 增至 140。

本轮进一步把 filesystem workspace 场景扩展到 5 个 packaged distribution 测试：
外部文件变化后 Refresh 的目录可见性、Refresh 不覆盖未保存编辑器草稿而 Reopen
读取最新磁盘内容、当前目录下创建文件/目录、root/up 边界，以及 duplicate/missing/
invalid/target-exists 等错误路径。对应 server 修复为：目录 Refresh 只发布
`program.browser.*` 资源，不再重载 `program.document.content`。当前完整 Python
回归为 144 个通过、1 个环境跳过。

目录：

- `project-report.md`: 项目进展总结
- `conversation-report.md`: 会话摘要
- `user-history.md`: 当天用户发言原始导出
- `codex-conversations/`: Codex 完整会话导出目录
- `workflow-diagram.md`: 工作流图
- `architecture-diagram.md`: 架构图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口

<!-- codex-full-export:start -->
## Complete Codex Conversation Export

- Scope: `2026-05-13`
- Sessions: `7`
- Primary sessions: `5`
- Side sessions: `2`
- User prompts: `209`
- Synthetic events: `7`
- Messages: `1121`
- User messages: `216`
- Codex messages: `905`
- HTML index: [Open](codex-conversations/index.html)
- Single-page HTML: [Open](codex-conversations/all.html)
- Single-page Markdown: <a href="codex-conversations/all%2Emd">Open</a>
<!-- codex-full-export:end -->
