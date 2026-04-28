# Conversation Report

## 1. 会话主线

这轮会话从用户要求检查 `metanc_hmi_dsl` 当前是否适合使用 Drogon 作为 server 框架开始，随后扩展到迁移遗留清理、host vcpkg/Drogon 环境、WebSocket 引入、split native 真实联调、AUTO/JOG 问题修复、MetaNC 同步，以及当天 report 生成和提交推送。

核心问题是：

- native server 是否已经真正走 Drogon
- 是否还有旧 HTTP/server 框架残留在生产路径
- generated/client/report 里是否还有误导性的 mock server 说法
- 非 Docker 环境下 Drogon 和 `drogon_ctl` 应该怎么安装和暴露
- WebSocket 是否已经接到 native server
- split 模式下软面板命令和 AUTO 程序执行是否真实可用
- client 显示的数据究竟来自本地模拟还是 server state
- 最终 report 和 HTML 产物是否能直接检查

## 2. Drogon 使用结论

审计后确认 native server 已经收敛到 Drogon：

- CMake 直接要求 Drogon package
- server core 链接 `Drogon::Drogon`
- HTTP REST 路由由 `drogon::app()` 注册
- WebSocket path 由 `drogon::WebSocketController` 提供
- Docker runtime 入口运行 native server binary

因此当前问题不是“是否还在用旧框架”，而是周边生成、文档和本地构建上下文还需要消除遗留痕迹。

## 3. 发现的问题

会话中实际发现两个问题。

第一个问题出现在 Docker build 复验时。为了验证 host 构建，先运行了普通 CMake 配置；因为当前机器缺少 Drogon package，配置失败并留下 `server/build/CMakeCache.txt`。随后 Docker build 把这个嵌套 build 目录复制进容器，导致容器内 CMake 认为 source/build 路径不匹配。

第二个问题是 Web/QML strict client 的连接成功提示仍然写着 `split mock server`，这和现在支持 native Drogon server 的状态不一致。

## 4. 处理方式

对应处理如下：

- 扩展 `.dockerignore`，排除嵌套 CMake 和 vcpkg build 产物
- 将 Web/QML runtime success copy 改为 `Connected to HMI server`
- 更新 Web/QML runtime 快照和 index hash
- 更新 generated distribution README 文案，避免把 shared runtime bundle 只描述成 mock server 输入
- 在 `CHANGELOG.md` 记录 Docker context 和 client copy 修复

## 5. 验证过程

验证过程中得到几个明确结果：

- host CMake 配置失败是环境缺少 Drogon/vcpkg，不是代码路径错误
- Docker smoke 成功，compose service 可启动并通过 `/api/runtime/health`
- 容器 one-shot 输出 `transport=drogon-rest-ws`
- 生成器快照测试通过
- compose smoke 退出后没有遗留运行容器

这说明 Drogon server 方向可用，且本次修复解决了“宿主失败缓存污染容器构建”的实际问题。

## 6. Host 环境和 Drogon 工具

用户希望非 Docker 环境也能使用 vcpkg/Drogon。会话中采用的判断是：

- 推荐继续走 vcpkg，而不是在系统包和源码安装之间混用
- CMake 用 vcpkg toolchain 找 Drogon
- `drogon_ctl` 可以由 vcpkg 的 Drogon port 提供
- 当前 `drogon_ctl` 已在 vcpkg tools 目录下，但直接命令不可用，原因是 tools 目录未加入 `PATH`

这给下一轮 host-native 调试留下了明确入口：先把 vcpkg root、toolchain file 和 Drogon tools path 固化，再做本机 server build/run。

## 7. WebSocket 和 Split Runtime

之后的重点转为 client/server 分离是否真正可用。

处理结果：

- native server 引入 WebSocket subscription
- Web client 在 strict split 模式下启动后先拉 `/bootstrap`
- client 发送 `runtime.subscribe`
- server 根据状态变化 publish runtime snapshot/change/command event
- client 接收 `payload.state` 后合并到 `properties/resources/streams/local_state`

用户使用的验证路径是：

```text
./generated/distribution/run_split_web_native.sh 8010 8000
http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime
```

会话中确认了当前数据边界：

- client 显示的是 server 返回的 state
- server 当前数据源是 `SimulatorAdapter`
- 因此这不是浏览器本地 mock，但也还不是实际 CNC 数据
- 真机接入需要下一阶段替换或扩展 server 侧 `MachineAdapter`

## 8. JOG 和 AUTO 问题定位

真实 split 启动后，用户发现 soft panel 报 `unsupported simulator command`，包括 `cnc.commands.set_mode`、`jog.commands.move_axis` 等。这个问题属于 server adapter 命令覆盖缺失，不是通信断开。补齐 server simulator command 后，JOG 类操作可以工作。

随后用户继续指出 AUTO 模式下 `CYCLE START` 后界面不切换当前行、数据也不变化。这个问题最终定位为 Web client 的 WS state 应用 bug：

- server 已经处理 `cycle_start`
- server 已经通过 WS 推送 AUTO 运行状态
- client 收到 payload 后提前更新 `lastRevision`
- 真正应用 payload 时被判定为 no-op revision
- 结果当前行、执行块、elapsed 和轴位置没有刷新

修复后，浏览器实测 AUTO 执行进入 `Running`，source 为 `AUTO`，当前块显示 `N40 G0 X60.000 Z10.000 C0.000`，elapsed 增长，X 轴位置继续变化。

## 9. Commit and MetaNC Sync

当天提交并推送了源仓库和下游仓库：

- `metanc_hmi_dsl/main` `55f15c8 server: add runtime websocket subscription`
- `metanc_hmi_dsl/main` `18d3085 fix: apply websocket state revisions`
- `MetaNC/feat/hmi` `7c5d07c feat: sync HMI runtime websocket support`
- `MetaNC/feat/hmi` `093ed15 fix: sync HMI websocket state application`

MetaNC 同步后在 `nrt/hmi` 跑了全量测试，结果为 53 个测试通过，6 个条件跳过。

## 10. Report 刷新

用户随后要求生成当天 report 和所有关联内容，并在检查最终产物后 commit/push。

执行方式：

- 使用 `tools/reports/export_codex_user_history.py --mode brief --date 2026-04-28`
- 使用 `tools/reports/export_codex_user_history.py --mode full --date 2026-04-28`
- 补写当天 README、project report、conversation report、workflow diagram 和 architecture diagram
- 更新 aggregate report timeline 和 session page
- 后续构建 session mdBook、aggregate mdBook 和主仓库 `docs_html`

## 11. 当前判断

当前状态可以提交，但提交顺序需要保持：

1. 先提交并 push `submodules/metanc_hmi_dsl_reports`
2. 再在父仓库提交源码修复和 reports submodule pointer
3. 最后 push 父仓库

这样父仓库不会指向一个远端还不存在的 report 子模块 commit。
