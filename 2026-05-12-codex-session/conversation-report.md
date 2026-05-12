# Conversation Report

## Summary

本轮延续前一轮的 Web/QML parity automation 计划。先确认并保留已经完成的
QML soft-panel JOG smoke 提交和 MetaNC 同步结果，然后进入下一步：
补 QML WebSocket-only reconnect smoke。

讨论和实现中重点收敛了两个边界：

- 新测试必须证明 QML 确实走 WebSocket subscription，而不是 HTTP polling
  fallback。
- 当前宿主机没有 QtWebSockets QML module，因此测试应按环境 skip，而不是
  让缺依赖环境造成误报。

最终实现选择由 Python test runner 启动 native server 和 QML client，再从
runner 侧通过 REST `/api/runtime/commands` 发送 `cnc.commands.set_mode`。
QML smoke script 只观察 WebSocket 连接态和 `mode.current` 到达情况。这样
QML 端不会因为自己发起 HTTP command response 而掩盖 WebSocket 推送路径。

随后继续收敛 CI 边界：当前本机没有 QtWebSockets，所以 smoke 会 skip；这不
能代表 CI 也允许长期 skip。最终方案是在 `tests.test_qml_smoke` 中加入
`HMI_REQUIRE_QTWEBSOCKETS=1` 开关，并让 GitHub Actions 的 QML runtime smoke
job 安装 QtWebSockets 后设置该开关。这样本地无依赖仍可开发，CI 则必须真实
执行 WebSocket-only reconnect。

本机安装 QtWebSockets 后继续实测，发现问题从“缺模块”变成“动态 QML socket
创建和订阅绑定不稳定”：当前 Ubuntu Qt6 包的 `QtWebSockets` 插件实际导出
`WebSocket 1.0/1.1`，而 generated runtime 使用 `import QtWebSockets 1.15`，
导致 socket 创建失败并回退到 HTTP polling。改成无版本 import 后 socket 能
open，但订阅回调需要从 runtime store 显式绑定。最终保留显式 signal connect
方案，并加上 socket identity guard，强制 WebSocket reconnect smoke 通过且
不再出现 QML TypeError warning。

## Key Decisions

- QML WebSocket-only smoke 使用 `QtWebSockets` module 探测作为执行前置条件。
- 外部 state change 使用 server command，而不是直接写 `mode.current`
  property，避免 simulator adapter 后续刷新覆盖 test intent。
- 文档中继续标记 QML WebSocket subscription 为 `partial`，因为不安装
  QtWebSockets 时仍会回退 HTTP polling；但 verification 已从 manual 提升到
  gated smoke。
- CI 中的 gated smoke 会把 QtWebSockets 缺失或测试被 skip 当成失败。
- report 刷新必须包含完整 `codex-conversations/` 导出，避免只看到 user
  history、看不到 Codex 对话详情。

## Outcome

- 新增 QML WebSocket-only reconnect smoke script 和 Python runner。
- 生成的 QML smoke helper 增加 transport state inspection。
- 修复 QML dynamic WebSocket source 的 QtWebSockets import 版本兼容问题。
- 修复动态 WebSocket status/message callback 绑定，使 `runtime.subscribe`
  能在 socket open 后稳定发送并接收 server ack/replay。
- parity matrix、status matrix、CHANGELOG 和中文 overlay 已更新。
- CI workflow、visual snapshot workflow 和 build/test 文档已更新，记录
  QtWebSockets 依赖与 `HMI_REQUIRE_QTWEBSOCKETS` 语义。
- 2026-05-12 report 已包含 user history 和完整 Codex conversation export。
