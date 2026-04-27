# Project Report

## 1. 目标

这一天的工作聚焦在 `metanc_hmi_dsl` 当前 server 迁移状态和最终报告产物：

1. 检查 native server 是否已经真正以 Drogon 作为服务端框架
2. 查找 legacy/mock/server 相关历史遗留是否仍混入生产路径
3. 修复检查中发现的构建上下文和用户可见文案问题
4. 验证 Docker/Drogon 路径、one-shot 启动和生成器快照
5. 生成当天 report、完整会话导出、聚合报告入口和最终 HTML 产物

## 2. Drogon Server 审计

审计范围覆盖了 `server/`、`docker/`、`tools/generate_targets.sh`、client runtime shell、server docs 和测试快照。

当前结论：

- `server/CMakeLists.txt` 直接 `find_package(Drogon CONFIG REQUIRED)`，并通过 `Drogon::Drogon` 链接 `server_core`
- `server/vcpkg.json` 的 server 依赖已收敛到 `drogon`
- HTTP 和 WebSocket 路由均由 `server/src/transport/http/http_server.cpp` 内的 Drogon app/controller 注册
- `/api/runtime/bootstrap`、`/api/runtime/state`、`/api/runtime/health`、property/resource/commands POST 和 `/api/runtime/ws` 都在 native Drogon transport 下暴露
- Docker runtime 镜像入口是 `/opt/hmi-server/server`，通过环境变量注入 bundle、host 和 port

未发现生产 server 仍使用旧 HTTP 框架承载的证据。Python mock runtime 仍然存在，但角色是 fixture/reference 和 generated 本地联调，不是 native server 入口。

## 3. 历史遗留清理

检查中发现两类需要立即清理的迁移遗留。

第一类是 Docker context 污染。host 侧尝试 CMake 配置后会生成 `server/build/CMakeCache.txt`。根 `.dockerignore` 原来只忽略顶层 `build`，不会忽略嵌套 `server/build`，因此 Docker build 可能把宿主缓存复制进容器并导致 CMake 源路径不匹配。

处理结果：

- `.dockerignore` 新增 `**/build`
- `.dockerignore` 新增 `**/cmake-build-*`
- `.dockerignore` 新增 `**/vcpkg_installed`

第二类是用户可见文案。Web/QML strict client 成功连接外部 runtime 后仍显示 `Connected to split mock server`，这会让 Drogon native server 切换后的状态表达不准确。

处理结果：

- Web runtime 文案改为 `Connected to HMI server`
- QML runtime 文案改为 `Connected to HMI server`
- 同步更新 `tests/snapshots/web/runtime.js.snap`
- 同步更新 `tests/snapshots/qml/RuntimeStore.qml.snap`
- 因 runtime hash 变化，同步更新 `tests/snapshots/web/index.html.snap`

## 4. Generated Distribution 文案

`tools/generate_targets.sh` 生成的 distribution README 中仍有一处把 `runtime_contract_bundle.json` 描述为只供 mock server 使用。

本次改为：

- bundle 由 fixture 和 native server 共用
- QML client 连接命令描述为“连接一个已经运行的 HMI server”，不再限定为 packaged mock server

这属于文档准确性修复，不改变 generated runtime 行为。

## 5. 验证结果

已执行的验证：

- `cmake -S server -B server/build`
- `./tools/docker_hmi_server.sh smoke`
- `docker run --rm metanc-hmi-server:local --oneshot`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots -v`

验证结论：

- host 侧 CMake 配置在当前机器失败，因为本机没有导出 `VCPKG_ROOT`，也没有可被 CMake 找到的 Drogon package。这是环境限制，不是 server 源码回退到 legacy path。
- Docker smoke 通过，compose 构建并启动 `metanc-hmi-server:local`，健康检查成功。
- one-shot 启动输出 `transport=drogon-rest-ws`，说明容器内 native server 使用 Drogon transport。
- 生成器快照测试通过，Web/QML runtime 文案和 hash 已同步。

## 6. Report 产物

随后按当天日期 `2026-04-28` 生成 report：

- brief user history
- full Codex conversation export
- session README
- project report
- conversation report
- workflow diagram
- architecture diagram
- aggregate session page
- aggregate timeline entry

本次完整会话导出统计为：

- `Sessions: 1`
- `Primary sessions: 1`
- `User prompts: 2`
- `Messages: 21`

## 7. 当前剩余注意点

- 当前机器 host 构建 native server 仍需要安装/导出 vcpkg toolchain；没有这个环境时应使用 Docker builder/smoke 路径。
- `fixture/mock_runtime_server.py` 仍应保留为测试和 generated 本地联调路径，但不应再被描述为生产 runtime 候选。
- 当天 report 在 commit 前仍会随当前会话继续增长；如果后续继续对话，需要再次刷新 full export。
