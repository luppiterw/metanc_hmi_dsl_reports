# Conversation Report

本轮会话先围绕 `metanc_hmi_dsl` 是否继续独立维护、如何与 `MetaNC` 保持结构同步、
report submodule 与 filtered sync 边界如何组织展开。结论倾向于保留
`metanc_hmi_dsl` 的 `metanc-layout` 分支作为独立可测试 HMI package，同时用过滤同步
将核心 HMI 内容推入 `MetaNC/nrt/hmi`。

运行验证阶段发现 Web/QML 界面已有当前程序但 `START` 仍报
`Prepare the active program before AUTO cycle start`。原因是 server 严格要求 active
program 已 prepared，而 UI 只呈现了 current program，不会在 START 前自动执行
prepare。最终方案是保持 server 严格，在 Web/QML client guard 里补齐
prepare-then-start。

会话最后进入发布链路：重新生成最终产物，执行同步前测试，刷新 report/docs，随后同步
到 `MetaNC` 并提交推送。
