# Project Report

## 1. 目标

这一天的工作聚焦在 `metanc_hmi_dsl` 当前 server 迁移状态、host 依赖路径、client/server split 闭环和最终报告产物：

1. 检查 native server 是否已经真正以 Drogon 作为服务端框架
2. 查找 legacy/mock/server 相关历史遗留是否仍混入生产路径
3. 梳理非 Docker host 环境下的 vcpkg/Drogon 使用路径
4. 引入 native server WebSocket subscription，并让 Web client 接入
5. 补齐 split 模式下软面板命令和 AUTO 程序运行刷新
6. 规划并落地 Web 端 npm/esbuild 拆分，避免继续把第三方库和编辑器逻辑写死在生成器大字符串中
7. 引入 CodeMirror Program 编辑器，修复编辑区布局、执行时编辑光标被运行行带动、以及选中态对比度不足的问题
8. 修复检查中发现的构建上下文、用户可见文案和 WS revision 问题
9. 验证 Docker/Drogon 路径、one-shot 启动、split native 浏览器行为、Web editor 行为和生成器快照
10. 生成当天 report、完整会话导出、聚合报告入口和最终 HTML 产物

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

## 5. Host vcpkg 与 Drogon 工具链

用户希望非 Docker 环境也能直接找到 vcpkg 和 Drogon。当天结论如下：

- 推荐路径是继续使用 `/home/iaar/workspace/github/vcpkg` 作为 host vcpkg 根目录
- CMake native build 应通过 `CMAKE_TOOLCHAIN_FILE=/home/iaar/workspace/github/vcpkg/scripts/buildsystems/vcpkg.cmake` 找 Drogon
- `drogon_ctl` 可以随 vcpkg 的 Drogon port 安装
- 当前可执行文件位于 `/home/iaar/workspace/github/vcpkg/installed/x64-linux/tools/drogon/drogon_ctl`
- 直接运行 `drogon_ctl` 仍找不到，是因为该 tools 目录尚未进入当前 shell `PATH`

这部分属于 host 开发环境准备，不改变 Docker builder 或 runtime image 的服务路径。

## 6. WebSocket Subscription 与 Client 接入

当天新增了 native server subscription 闭环：

- server 提供 `/api/runtime/ws`
- client 启动后先通过 `/api/runtime/bootstrap` 获取完整初始 state
- client 再通过 WebSocket 发送 `runtime.subscribe`
- server 按 revision、filter 和 journal replay 返回 `runtime.snapshot`
- 后续命令完成、状态变化和 tick 推进通过 `runtime.state.changed` / `runtime.command.completed` 推送给 client

Web client 的使用方式保持简单：

```bash
./generated/distribution/run_split_web_native.sh 8010 8000
```

然后打开：

```text
http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime
```

在这个 strict split 模式下，client 显示的运行态数据来自 server 的 HTTP/WS state，不再依赖浏览器本地模拟 AUTO 运行。

## 7. Split 命令和 AUTO 运行修复

真实 split 启动后发现软面板命令仍有缺口：

- `cnc.commands.set_mode`
- `jog.commands.move_axis`
- `jog.commands.set_mode`
- 以及同类 soft-panel 操作

这些问题说明 server 侧 simulator adapter 的命令覆盖还不完整。当天补齐后，JOG 相关软面板命令已经可由 native server 处理。

随后继续定位 AUTO `CYCLE START` 后界面没有切换运行行、数据不变化的问题。最终根因不是 server 没处理，也不是 WebSocket 没连接，而是 Web client 的 state revision 应用顺序错误：

- subscription handler 先把 `transportState.lastRevision` 更新成了 incoming revision
- 随后 `applyServerPayload()` 看到 incoming revision 等于 `lastRevision`
- payload 被误判为 no-op，`applyRemoteSnapshot()` 没有执行
- JOG 看起来正常，是因为 command POST response 会立即刷新一次状态
- AUTO 的后续运行行和轴数据主要靠 WS tick 推送，因此受影响最明显

修复方式：

- 移除 subscription handler 中提前消费 revision 的逻辑
- 只在 state payload 实际应用后推进 `lastRevision`
- 增加生成器测试，断言 `payload.state` 必须先于 subscription ready/updated 分支处理，并禁止重新出现旧的提前 revision 更新片段

## 8. Web Client 拆分与 Program 编辑器

在 split runtime 闭环稳定后，继续处理 Web/QML 生成方式和 Program 编辑体验。

Web 侧选择 npm + esbuild，而不是直接引入 Vite dev server，原因是当前产物仍以静态 generated/distribution 为主，esbuild 更适合先把第三方依赖和手写前端模块从 Python generator 字符串中拆出，同时保持最终部署形态简单。

本次 Web 侧落地内容：

- 新增 `client/web_client/package.json` 和 `package-lock.json`
- 新增 `client/web_client/esbuild.config.mjs`
- 新增 `client/web_client/bundler.py`
- 新增 `client/web_client/src/` 源码目录
- 生成 `assets/web-client.bundle.js`
- 生成 `model.generated.json`
- 生成 `runtime_seed.generated.json`
- 更新 `index.html`、`app.js` 和 generator 测试，使 generated Web 产物加载外部 bundle，同时保留静态分发能力

Program 编辑器侧落地内容：

- CodeMirror 作为 Web Program editor provider
- textarea fallback 仍保留，用于依赖不可用时降级
- 编辑器容器高度和 Program 页面 grid 行为修复，避免编辑器被压在异常位置
- 执行程序时不再把执行行写回 Program 编辑器光标；编辑页只反映编辑光标和编辑状态
- 多行选中态改为高不透明深蓝背景，避免白色代码文字落在偏银色选中背景上不可读

这个拆分为后续替换更强的编辑器、搜索/诊断面板和第三方 Web UI 依赖管理留下了稳定入口。

## 9. 验证结果

已执行的验证：

- `cmake -S server -B server/build`
- `./tools/docker_hmi_server.sh smoke`
- `docker run --rm metanc-hmi-server:local --oneshot`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots -v`
- `ctest --test-dir generated/server-build --output-on-failure`
- `node --check generated/web/runtime.js`
- `node --check generated/distribution/client/web/runtime.js`
- `npm run build --silent`
- `node --check generated/web/assets/web-client.bundle.js`
- `node --check generated/web/app.js`
- `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py' -v`
- `python3 -m unittest discover tests -v`
- split native browser/CDP 验证 AUTO `CYCLE START`
- split native browser/CDP 验证 Program 编辑器布局和多行选中态
- `MetaNC/nrt/hmi` 全量 Python 测试

验证结论：

- host 侧 CMake 配置在当前机器失败，因为本机没有导出 `VCPKG_ROOT`，也没有可被 CMake 找到的 Drogon package。这是环境限制，不是 server 源码回退到 legacy path。
- Docker smoke 通过，compose 构建并启动 `metanc-hmi-server:local`，健康检查成功。
- one-shot 启动输出 `transport=drogon-rest-ws`，说明容器内 native server 使用 Drogon transport。
- 生成器快照测试通过，Web/QML runtime 文案和 hash 已同步。
- `metanc_hmi_dsl` 全量 Python 测试通过：76 个测试通过，1 个条件跳过。
- `MetaNC/nrt/hmi` 全量 Python 测试通过：53 个测试通过，6 个条件跳过。
- 浏览器真实验证中，AUTO `CYCLE START` 后 execution state 为 `Running`，source 为 `AUTO`，当前行显示到 `N40 G0 X60.000 Z10.000 C0.000`，elapsed 继续增长，X 轴从 `18.337` 继续变化到 `35.007`。
- 浏览器真实验证中，Program 编辑器由 CodeMirror provider 渲染，编辑区填满主内容区域，多行选中背景为 `rgba(8, 57, 112, 0.88)`，白色文本保持可读。

## 10. Commits and Sync

当天相关提交：

- `0895f84 fix(server): clean drogon migration leftovers`
- `af8824f docs: update reports submodule for 2026-04-28`
- `55f15c8 server: add runtime websocket subscription`
- `18d3085 fix: apply websocket state revisions`
- `MetaNC/feat/hmi` `7c5d07c feat: sync HMI runtime websocket support`
- `MetaNC/feat/hmi` `093ed15 fix: sync HMI websocket state application`

同步边界：

- 源仓库 `metanc_hmi_dsl/main` 承载 server/client/report 源变更
- `MetaNC/feat/hmi` 只同步 `nrt/hmi` 必要内容
- report source 和完整 Codex conversation 导出保留在 `submodules/metanc_hmi_dsl_reports`

## 11. Report 产物

随后按当天日期 `2026-04-28` 刷新 report：

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
- `User prompts: 36`
- `Synthetic events: 1`
- `Messages: 335`

## 12. 当前剩余注意点

- 当前机器 host 构建 native server 仍需要稳定导出 vcpkg toolchain；没有这个环境时应使用 Docker builder/smoke 路径。
- `drogon_ctl` 已安装在 vcpkg tools 目录，但直接命令可用还需要补 `PATH`。
- `fixture/mock_runtime_server.py` 仍应保留为测试和 generated 本地联调路径，但不应再被描述为生产 runtime 候选。
- 当前 client/server split 的通信闭环基本完成，但 server 端数据源仍是 `SimulatorAdapter`。真实 CNC/NCU/PLC 接入需要下一阶段实现真实 `MachineAdapter`。
- Web 端已经具备 npm/esbuild 入口；后续新增第三方库应优先放入 `client/web_client/src/` 并由 bundle 输出进入 generated Web 产物。
- 当天 report 在 commit 前仍会随当前会话继续增长；如果后续继续对话，需要再次刷新 full export。
