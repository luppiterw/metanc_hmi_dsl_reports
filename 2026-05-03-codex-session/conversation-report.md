# Conversation Report

## Discussion Summary

今天围绕 runtime logs 与底部通知继续收敛设计。

最初问题集中在日志性能与交互边界：

- 日志超过一定数量后，界面是否会卡。
- `state` 和 command response 中默认 logs 是否意味着 pub/sub 会带最多 200 条日志。
- 坐标、全局变量、页面变量等非日志数据是否应按 client subscription 由 server filtered publish，而不是全量轮询。
- 日志本身是否应该有 server-side hard cap，并单独讨论 client/server 日志交互。

随后明确了方向：

- 非日志数据按 global/page subscription delivery：global variables 全程订阅，page variables 仅在对应页面订阅。
- 日志表不通过默认 state/command response 或普通 WebSocket state 全量推送。
- 日志存储要有 server-side hard cap，并通过 query/export/batch/payload caps 控制通信压力。
- client 操作日志会上传到 server，server-enriched 后进入 log store，但它们仍是 diagnostic only，不作为 audit authority。

## Footer Notice Decision

用户指出底部日志栏如果不反映最新即时反馈，就失去意义。
因此本次没有把设计留到以后，而是直接改为 server-driven。

最终边界：

- 底部提示仍绑定 `runtime_state.last_notice`。
- strict server mode 下，底部提示由 WebSocket 驱动，不靠轮询日志表。
- `runtime.command.completed` 用于 command 执行结果的即时反馈。
- `runtime.operator_notice` 用于 server-side log events 中筛选出的 operator-visible feedback。
- `runtime.operator_notice` 是轻量 notice，不是完整日志列表。

## Important Handoff Notes

后续 AI 或开发者不要把这三件事混在一起：

1. **Diagnostics Logs table**：通过 `GET /api/runtime/logs` 查询完整日志历史。
2. **Client diagnostic upload**：Web/QML 低频诊断事件通过 single/batch endpoint 上传到 server。
3. **Footer notice**：通过 WebSocket `operator_notices` domain 接收轻量即时反馈。

如果后续继续优化，应优先讨论 operator notice 的过滤策略、不同 level/category 的显示规则、以及底部通知历史是否需要单独的本地小队列，而不是把 full log table 重新塞回 state/pub-sub。

## Alarm Follow-Up

继续讨论后，又明确了 alarm 与 notice 的边界：

- Notice 里放最近几条报警/错误是合理的，但它应该是 operator-facing notice feed，不是 raw log tail。
- 没有报警/错误时，底部仍应显示 operator 有意义的 ephemeral feedback 或 idle/connected/system-ready 状态。
- 报警是否解除不能通过文本日志判断。
- 报警对象必须来自 backend active alarm state，例如 CNC、PLC、drive、IO、safety 或 adapter。
- `acknowledged` 和 `cleared` 是两件事：acknowledged 是 operator 已确认，cleared 是 backend 报警条件消失。

后续要补完整报警生命周期时，应增加 server-side AlarmService/active alarm state。
LogEvent 只记录 `alarm.raised`、`alarm.acknowledged`、`alarm.cleared` 等历史事件；
OperatorNotice 只负责从 active alarms、command result、runtime error 等输入里选择底部即时展示内容。

## Server API Documentation Decision

随后继续讨论 server-side API tests 与 API docs 的建设节奏。

结论是不等功能完全冻结后再写文档，而是现在开始维护 living API docs：

- 先覆盖当前 generated clients 已经使用的 northbound runtime API。
- 文档保持人类可读，不急于一次性生成完整 OpenAPI/JSON Schema。
- 每次 endpoint、WebSocket event 或 shared payload shape 变化时，代码和文档同改。
- 用轻量测试把源码里的 endpoint/event names 和文档覆盖关系绑起来，避免后续 AI 或开发者只改实现不改文档。

本轮落地了 `docs/server/api/` 与 zh-CN mirror，覆盖 REST API、WebSocket API、Client Flow、Error Model 和 Payload Schemas。
同时修正 docs portal 的 server navigation，确保 `server/api/*` 会发布为可浏览 HTML。

后续如果要继续推进 server 对外 API 能力，优先级应是：

1. 为 REST endpoints 增加更多 server-side contract tests。
2. 将现有 Markdown payload sketches 逐步收敛成可生成的 JSON Schema。
3. 在错误模型稳定后定义统一 error envelope。
4. 最后再生成 OpenAPI 或类似外部集成文档。
