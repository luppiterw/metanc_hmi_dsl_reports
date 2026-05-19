# Conversation Report

本轮会话先回到 PARAM 菜单设计分歧：刀偏表有多组子功能，继续让 `PARAM`
直接显示刀偏表会让底部菜单和页面主体的层级语义冲突。讨论后确认采用
PARAM Home 作为稳定入口。

关键结论：

- `PARAM` 是参数区入口，不是 Tool Offset 的别名。
- PARAM Home 是真实页面，不能只是空路由占位。
- 子功能页的 `Return` 回 PARAM Home，PARAM Home 的 `Return` 回 Overview。
- 当前先落 Home 和子页 footer 分层；刀偏表 CRUD 操作按钮暂留主体，后续再做
  footer 化迁移。
- `metanc_hmi_dsl` 保持源头实现，`MetaNC/feat/hmi` 通过 sync 接收同一套 HMI
  源码和生成逻辑。

实现阶段采用 TDD 方式补了 pipeline regression，随后刷新 Web/QML snapshots、
生成最终产物，并确认 MetaNC distribution 中已经带有 PARAM Home。

本轮报告同时刷新了 2026-05-19 的 user-history、完整 Codex conversation export
和 aggregate reports timeline。
