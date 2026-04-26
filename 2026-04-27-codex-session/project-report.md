# Project Report

## 1. 目标

这轮工作的目标比较集中：

1. 确认为什么最终 `docs_html` 里看到的 report 仍然是旧内容
2. 回答前端 Web 方案后续部署时是否必须依赖 `Nginx`
3. 把这轮部署选型讨论整理成可阅读的 `Markdown + PDF`
4. 创建今天的 report，并说明跨机器更新同一天 report 的协作边界

## 2. 发布问题定位

用户发现最终 `docs_html` 里的 `2026-04-26` report 没更新，但 session 目录里的内容已经是新的。

这次核对后确认：

- `2026-04-26-codex-session/build_html/` 是最新本地构建产物
- `metanc_hmi_dsl/docs_html/reports/2026-04-26-codex-session/` 仍停留在更早的发布时间
- 问题不在 report 源文件，而在最终 portal 发布步骤没有重跑

因此这轮执行了：

- `./tools/build_docs_html.sh`

结果是：

- 最终 `docs_html/reports/2026-04-26-codex-session/` 已同步到最新 session 内容
- `Prompt Time` 列名、`Messages: 391`、`HMI Server Recommendation` 章节和 PDF/图片链接都已出现在最终发布目录

## 3. 前端部署方案结论

这轮没有改前端代码，而是把部署思路收成一份独立建议文档。

主结论如下：

- 前端正式部署通常仍需要一层专门的 `Web entry layer`
- 这层入口不一定非得是 `Nginx`，也可以是 `Caddy` 或 `Traefik`
- `Python http.server` 只适合本地预览和临时联调，不适合生产
- 结合当前 `HMI Web client + runtime + 设备网关` 场景，当前阶段最推荐 `Nginx + Docker Compose`

原因很直接：

- 单站点边缘部署更看重稳定、可控和排障直接
- `Nginx` 处理静态文件、`/api` 反向代理和 `WebSocket` 转发都成熟
- 未来如果服务规模变大，再演进到 `Traefik` 也不晚

## 4. 本次新增文档

今天这轮新增了一份独立的部署建议材料：

- `frontend-web-deployment-recommendation.md`
- `assets/frontend-web-deployment/frontend-web-deployment-recommendation.pdf`

文档内容包括：

- 为什么正式环境最好保留一层入口服务
- `Nginx / Caddy / Traefik / Python http.server` 对比
- 不同阶段的推荐选型
- 面向 `Web client + /api + /ws + runtime` 的最小推荐拓扑

## 5. 当日自动导出状态

虽然今天已经创建了 `2026-04-27-codex-session/`，但 `Codex user-history` 导出器当前对 `2026-04-27` 返回的仍然是：

- `Sessions: 0`
- `User prompts: 0`
- `Messages: 0`

这不是 report 目录没建出来，而是当前会话的原始本地存档还没有进入导出器扫描范围。

因此今天这轮 report 的有效内容主要来自：

- 手工整理的 `project-report.md`
- 手工整理的 `conversation-report.md`
- 单独导出的前端部署建议文档和 PDF

## 6. 跨机器协作边界

关于“另一台机器再更新 report，会不会覆盖本机内容”，需要明确两点：

1. 已经提交并推送到远端的内容，不会被另一台机器静默覆盖
2. 但同一天 report 目录是固定的 `YYYY-MM-DD-codex-session/`，所以两台机器如果都修改今天同一份 report，本质上是在编辑同一批文件

这意味着：

- 另一台机器如果先 `pull` 再更新，通常会在最新基础上继续改
- 如果两边同时各自修改后再提交，就可能在 `git pull/merge` 时产生冲突
- 不建议两台机器并行重导同一天 report，除非明确分工或改目录命名策略

## 7. 当前建议

如果后续还要继续双机协作 report，我建议按这个规则执行：

1. 先 `git pull` report submodule 最新内容
2. 尽量由一台机器负责同一天 report 的最终导出
3. 另一台机器如果只做补充说明，优先追加到新章节，减少重写同一段
4. 如果以后双机并行成为常态，再考虑把 report 目录命名从“按日期”扩展成“按日期 + 机器/会话标识”
