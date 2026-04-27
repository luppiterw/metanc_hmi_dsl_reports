# Project Report

## 1. 目标

这一天的工作围绕 `metanc_hmi_dsl` 的工程化闭环展开：

1. 更新 `metanc_hmi_dsl` 与 `MetaNC` 当前本地分支，确认 reports 子模块状态
2. 输出并检查 `metanc_hmi_dsl` 的最终产物和 `docs_html`
3. 为 client/server 补产品定义、需求澄清、工作计划与中英文文档入口
4. 建立 `docs_i18n/zh-CN` 对英文源文件的翻译进度追踪机制
5. 分析并落地 server Docker/Drogon 运行路径
6. 补充前端 Web 部署建议材料
7. 修正 generated client/server 分发包，使原有 generated 测试入口继续可用
8. 刷新今天 report，让 `docs_html` 中的当天 report 不再是空会话快照

## 2. 仓库同步与最终产物检查

早间先处理了仓库状态：

- `MetaNC` 当前分支 `feat/hmi` 快进到远端同名分支
- `metanc_hmi_dsl` 当前分支 `main` 快进到 `origin/main`
- reports 子模块按父仓库记录同步检出，避免父仓库指针和子模块工作树不一致

随后按用户要求检查并刷新 `metanc_hmi_dsl` 的最终输出，包括生成目录、报告书和 `docs_html` 门户。

## 3. client/server 工程化文档

围绕后续 client/server 产品定义、需求澄清、work schedule、设计和实现路线，补充了可供 AI 与人类继续阅读的文档结构。

重点约束包括：

- 文档先落在 `metanc_hmi_dsl`，作为上游设计和实现记录
- 中文对照放在 `docs_i18n/zh-CN`
- `docs_html` 需要随文档变更同步重建，避免最终产物落后于源 Markdown

## 4. zh-CN 翻译进度记录

针对中文文档缺少英文源追踪的问题，本日新增了 `docs_i18n` 内部的进度记录设计与实现。

核心目标是：

- 记录每个中文文件对应的英文源
- 记录英文源最近一次翻译时的状态
- 当英文源变更后，能判断中文是否仍然 current
- 这个状态只在 `metanc_hmi_dsl` 中有效，不污染同步到 `MetaNC` 的 retained package

本轮还补充了检查/标记工具和测试，用于后续跨机器或多人协作时继续推进翻译进度。

## 5. Docker/Drogon server 路线

下午重点转向 server 容器化和后端框架选型。

结论是：

- Drogon 支持 WebSocketController，适合作为后续 C++ server 的 REST/WebSocket 后台框架
- 当前 server 已移除 legacy HTTP 传输，native server 直接使用 Drogon REST/WebSocket 运行时
- Docker 镜像应复用 `MetaNC` 现有 vcpkg/Docker 基础能力，避免在宿主机直接污染依赖
- 容器内 server 应监听 `0.0.0.0`，契约 bundle 路径、host、port 通过环境变量或参数传入

已落地的主要变更包括：

- `server/vcpkg.json`
- `server/CMakeLists.txt` 直接查找并链接 `Drogon::Drogon`
- `server/src/main.cpp` 的环境变量和命令行参数入口
- `server/src/transport/http/http_server.cpp` 的 Drogon REST/WebSocket server
- `server/include/hmi/transport/http/subscription_protocol.h`
- `server/src/transport/http/subscription_protocol.cpp`
- `docker/hmi-server.Dockerfile`
- `docker/compose.hmi-server.yml`
- `tools/docker_hmi_server.sh`
- 英文与中文 Docker deployment 文档

后续又补齐了 WebSocket subscription 协议的具体行为：

- `subscribe` 支持按 event types、components、fields 和 revision 过滤
- `snapshot` 可返回当前 runtime state
- `runtime.state.changed` 只发送订阅者关心的变更字段
- command 生命周期会产生 `runtime.command.requested` 和 `runtime.command.completed`
- server 内部维护有界事件 journal，便于新连接按 revision replay

已执行的验证包括：

- Drogon-only CMake configure/build/ctest
- `docker build --check`
- `docker compose config`
- `./tools/docker_hmi_server.sh smoke`
- `./tools/generate_targets.sh`
- generated server native health check
- i18n strict check、unit test、`./tools/build_docs_html.sh`
- `git diff --check`

## 6. generated client/server 分发包调整

用户指出“原来 generated 里的那一套”需要继续能工作。处理后，`tools/generate_targets.sh` 不再只生成前端和 mock fixture，而是会同时准备 native Drogon server 分发入口。

当前策略是：

- 有可用 vcpkg toolchain 时走宿主机 CMake 构建
- 宿主机缺少 vcpkg/Drogon 时自动走 Docker builder
- builder 复用 `docker/hmi-server.Dockerfile` 的 build target
- 生成产物复制到 `generated/distribution/server/native/server`
- `generated/distribution/run_server_native.sh` 负责启动 Drogon native server
- `generated/distribution/run_server_fixture.sh` 仍保留为 fixture/mock 测试入口

已完成的本地验证包括：

- `./tools/generate_targets.sh`
- `./generated/distribution/run_server_native.sh 18112`
- `/api/runtime/health`
- `/api/runtime/bootstrap`
- `./generated/distribution/run_server_fixture.sh 18115`

bootstrap 返回的 `transport` 已是 `drogon-rest-ws`。

## 7. 前端部署方案结论

本日还把前端部署思路收成一份独立建议文档。

主结论如下：

- 前端正式部署通常仍需要一层专门的 `Web entry layer`
- 这层入口不一定非得是 `Nginx`，也可以是 `Caddy` 或 `Traefik`
- `Python http.server` 只适合本地预览和临时联调，不适合生产
- 结合当前 `HMI Web client + runtime + 设备网关` 场景，当前阶段最推荐 `Nginx + Docker Compose`

原因很直接：

- 单站点边缘部署更看重稳定、可控和排障直接
- `Nginx` 处理静态文件、`/api` 反向代理和 `WebSocket` 转发都成熟
- 未来如果服务规模变大，再演进到 `Traefik` 也不晚

## 8. 前端部署专题文档

今天这轮新增了一份独立的部署建议材料：

- `frontend-web-deployment-recommendation.md`
- `assets/frontend-web-deployment/frontend-web-deployment-recommendation.pdf`

文档内容包括：

- 为什么正式环境最好保留一层入口服务
- `Nginx / Caddy / Traefik / Python http.server` 对比
- 不同阶段的推荐选型
- 面向 `Web client + /api + /ws + runtime` 的最小推荐拓扑

## 9. 当日自动导出状态

今天 report 最初在 `docs_html` 中看起来“什么都没有”，主要原因是完整会话导出仍停留在零会话快照：

- `Sessions: 0`
- `User prompts: 0`
- `Messages: 0`

本次刷新重新执行了当天 brief 与 full export，当前状态已经更新为：

- `Sessions: 3`
- `Primary sessions: 3`
- `User prompts: 27`
- `Messages: 198`

因此最终 HTML 里应能看到当天用户历史、完整会话索引和三个 session 的导出页面。

## 10. 跨机器协作边界

关于“另一台机器再更新 report，会不会覆盖本机内容”，需要明确两点：

1. 已经提交并推送到远端的内容，不会被另一台机器静默覆盖
2. 但同一天 report 目录是固定的 `YYYY-MM-DD-codex-session/`，所以两台机器如果都修改今天同一份 report，本质上是在编辑同一批文件

这意味着：

- 另一台机器如果先 `pull` 再更新，通常会在最新基础上继续改
- 如果两边同时各自修改后再提交，就可能在 `git pull/merge` 时产生冲突
- 不建议两台机器并行重导同一天 report，除非明确分工或改目录命名策略

## 11. 当前建议

如果后续还要继续双机协作 report，我建议按这个规则执行：

1. 先 `git pull` report submodule 最新内容
2. 尽量由一台机器负责同一天 report 的最终导出
3. 另一台机器如果只做补充说明，优先追加到新章节，减少重写同一段
4. 如果以后双机并行成为常态，再考虑把 report 目录命名从“按日期”扩展成“按日期 + 机器/会话标识”
