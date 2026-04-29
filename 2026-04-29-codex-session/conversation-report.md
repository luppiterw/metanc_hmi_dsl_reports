# Conversation Report

## Summary

本日会话从 generated 输出是否过期展开，随后扩展到界面设计规范、设置能力、顶部 shell 控件和 QML/WSL 运行体验。先审计并修正 Web/QML/distribution 脚本与 README，再建立 DESIGN.md 引用式文档结构，之后实现 Web/QML 设置面板并把 settings 入口迁移到顶部齿轮。最后处理顶部旧控件清理、QML 启动位置和 Alt 拖动窗口，并按既有流程刷新产物、提交源仓库、同步 MetaNC。

## Decisions

- generated README 必须描述真实启动路径，不再把 repo fixture helper 写成独立 packaged mock server。
- Web split native 场景继续采用严格 server URL：`?server=http://127.0.0.1:8010/api/runtime`。
- QML README 中的运行命令需要匹配 out-of-source build 结果，即使用 `./build/appCNC_HMI_DSL`。
- 根目录 `DESIGN.md` 只作为英文入口，具体设计规范放在 docs 内部并进入 docs_html，zh-CN 内容放入 `docs_i18n`。
- 设置入口统一为顶部右侧齿轮；旧的顶部软面板切换和主题下拉不再作为主路径暴露。
- Web 端旧控件最终从 HTML/JS 中移除，而不是只依赖 CSS 隐藏；QML 端保留生成结构但通过 `headerQuickControlsVisible` 关闭旧入口。
- QML WSL 启动要使用 `Screen.available*` 做尺寸和位置约束，并支持 `Alt + 鼠标左键` 调用系统窗口移动。
- report 更新要落到 `submodules/metanc_hmi_dsl_reports`，同时更新 aggregate index 并重建 HTML 输出。

## Published Artifacts

- Brief user history: `user-history.md`
- Full Codex conversation export: `codex-conversations/index.html`
- Aggregate report entry: `src/sessions/2026-04-29-codex-session.md`
- Session book output: `build_html/index.html`
- Generated Web/QML/distribution final outputs after shell/settings changes
