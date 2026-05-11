# Conversation Report

## Summary

用户要求继续上一轮拆分计划，并完成 report/docs 更新、同步 MetaNC、
commit 和 push。本轮先确认 `metanc_hmi_dsl`、reports submodule 与 MetaNC
工作区均干净，然后执行 QML header body 拆分。

主要判断：

- 继续保持 source-level decomposition 优先，不改变 generated output layout。
- header body 已经是独立职责边界，适合从 `generator.py` 中移出。
- 本轮拆分必须用 generated artifact diff 证明语义稳定。
- 文档和 report 必须同步反映 header body 已拆出，避免仍把它列为下一步目标。

执行结果：

- `header_body.py` 已新增并纳入 stable part registry。
- `generator.py` 继续收敛，只保留 header body builder 调用和模板插入点。
- `program_search.py` 第一阶段低风险拆分完成，Program navigation、Search
  local state 和 Search engine 被移入二级 fragments，动作层暂时保留。
- 测试与最终产物生成均通过。
- 后续重新生成 Web、Qt/QML、server/distribution 和 docs_html 最终产物，供
  用户检查当前效果。
- 用户反馈 Logs 页面拖到中间查看日志时，刷新后仍会跳回顶部；本轮定位到
  Web 端除了表格内滚动外，还存在父层 `renderPage()` 同页刷新后重置
  `pageShell.scrollTop` 的路径。
- 修复方案改为双层保持：Logs 组件按日志行 id 记录可见 anchor，父层页面渲染在
  同页数据刷新时保留外层 scroll；QML `ListView` 同步加入 row-anchor 恢复。
- Headless Web 验证覆盖了 `120` 条日志滚到 `probe-0075`，刷新成 `123` 条后
  可见行仍保持为 `probe-0075`。
- 用户继续追问 QML 和 Web 两端功能同步性，随后确认按计划落地第一版
  parity tracking。
- 本轮新增 Web/QML parity 文档、中文 overlay、SUMMARY/client index/status
  matrix 入口，并补 `tests/test_web_qml_parity_docs.py` 约束矩阵字段、枚举、
  P0 验证/follow-up 和中英文行一致性。
- 用户随后要求按计划实施 QML parity smoke，并先确认目的：把 Web/QML parity
  从文档矩阵推进到可执行证据，减少后续 PROG、Logs、Reconnect 调整风险。
- 本轮新增 QML smoke hook、root-level smoke helper、两个 smoke scripts 和
  `tests/test_qml_smoke.py`，第一版覆盖 MAIN mode switching 与 DEBUG `x` /
  `x axis` 查询。
- 用户随后要求按最小闭环先做 PROG 覆盖，本轮继续扩展 QML smoke helper，
  新增 PROG Save persistence 与 natural-line Goto 两个脚本，并把
  Web/QML parity matrix 中 PROG Save/Goto 的验证方式更新为
  `tests.test_qml_smoke`。
- 今天的 report session 通过 Codex history export 自动创建，并补全项目报告、
  会话摘要、工作流图和架构图。

下一轮讨论点：

- 是否继续拆 Program search/editor action assembler。
- 是否转向 QML DEBUG/log view helpers 或 Web Program search/actions、Web
  gauges、Web runtime command handlers/server bridge、legacy button styling。
- Logs UI 后续若继续扩展，应把 viewport preservation 纳入固定交互验证，而不是
  只靠 snapshot 或静态 DOM 断言。
- Web/QML parity matrix 的 follow-up 行应逐步转化为 durable interaction
  automation，避免只在 Web probe 中验证主流程。
- 下一轮更适合继续把 PROG file-switch freshness 和 Search/Replace 接入 QML
  smoke，而不是立即继续大拆 Program action assembler。
