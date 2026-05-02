# Project Report

## Scope

本轮工作解决 `LOGS` 同时出现在顶层导航和 `DIAG` 内部导航里的重复入口问题，并修复移动后的入口行为：

- 将 Runtime Logs 功能迁入 `DIAG > Logs`，移除外层独立 `LOGS` 页面和 footer 入口。
- 让外层 `DIAG` 入口默认进入 `Logs` 子页。
- 修复 Web/QML 普通按钮只执行第一条 action 导致 `DIAG` 点击后不进入目标页的问题。
- 为旧状态里的 `page_logs` 增加回退，避免删除页面后恢复过期 active page。
- 刷新快照、最终产物、报告与文档入口，并准备同步到 MetaNC。
- 重新生成最终产物后，明确静态 Web 预览与 native server 模式的区别。
- 修复 Web/QML 程序编辑器行号与实际代码行对齐的可靠性问题。
- 修复 native server 程序工作区只暴露 3 个硬编码示例的问题，恢复 generated contract 中的完整示例程序列表。
- 修复程序编辑页在系统 idle 时点击 `Execute` 没有切换到主页并执行当前编辑程序的问题，同时拒绝空白、不存在或非 idle 状态的执行准备。
- 针对日志性能和 runtime pub/sub 语义，补齐 runtime subscription plan：全局变量全程订阅，页面变量按 active page 订阅，诊断/参数等子视图按当前 local state 条件订阅。
- 将 logs 从默认 bootstrap/state/command response 中移除，改为通过显式 `/api/runtime/logs` 查询交互。
- 为 server 日志增加可配置硬上限和 query/export/client-batch/payload caps，并同步 memory 与 SQLite log store 行为。
- 让 Web/QML 严格 server 模式按 runtime plan 更新 WebSocket subscription；QML 在 QtWebSockets 可用时使用 WS，不可用时保留 HTTP polling fallback。

## Completed Work

- 在 `definition/ui.structure.yaml` 中把原 `page_logs` 的 Runtime Logs 视图移动到 `page_diagnostics` 内部的 `diagnostics_logs_view`。
- 删除顶层 `LOGS` footer 入口，保留 `DIAG` 内的 `Logs / NC Vars / PLC Vars` 子导航。
- 按最终需求将 `runtime_state.diagnosis_view` 默认值设为 `logs`，并让外层 `DIAG` 入口先设置 `diagnosis_view=logs`，再切换到 `page_diagnostics`。
- 在 Web 生成器里增加普通按钮的 `triggerActions(actions)` 路径，保留 repeat-while-pressed 控件的单 action 重复语义。
- 在 QML 生成器里增加 `triggerActions(actions)`、footer `buttonActions` 和通用按钮多 action 执行能力。
- 在 Web/QML shell 中加入已知页面检查，遇到过期的 `page_logs` active page 时自动回退到默认页。
- 更新 Runtime Logs 页面的过滤器占位上下文，从旧 `page_logs` 改为 `page_diagnostics`。
- 刷新 Web/QML 快照，并更新 pipeline 断言以锁定多 action 点击路径。
- 完成 metanc_hmi_dsl 与 MetaNC 的 commit/push 同步。
- 用户要求查看最终产物后，重新执行生成流程，产出 Web、QML、native server build 和 distribution 包。
- 启动 `generated/web` 的静态 HTTP 预览用于浏览生成页面，并确认该预览未启动 native server。
- 排查 Web 最终产物未显示行号的原因：本地缺少 `client/web_client/node_modules` 时，生成器会输出 346 字节的 `inline-fallback` bundle，导致没有走 CodeMirror。
- 安装 Web client npm 依赖并重新生成后，`generated/web/assets/web-client.bundle.js` 包含 CodeMirror、`renderCodeMirrorProgramEditor` 和原生 `lineNumbers()`。
- 保留 Web textarea fallback 行号，但改为从 textarea 的 computed `font-family`、`font-size`、`line-height`、padding 和 scrollTop 同步，避免旧版单独 gutter 度量漂移。
- QML program editor 删除独立行号 `TextArea`，改为由 `Repeater` 绘制行号，并通过编辑器 `TextArea.positionToRectangle(offsetForTextLine(...))` 获取每行真实布局坐标。
- 更新 pipeline 断言，锁定 Web bundle 中的 CodeMirror `lineNumbers()`、fallback gutter 存在，以及 QML 不再生成 `editorGutter_program_code_editor`。
- 在同步 MetaNC 前加固 export 脚本，显式排除 `node_modules/`，避免 source-local Web bundle 依赖缓存被 rsync 到下游镜像。
- 将 native server 的 program backend 改为加载生成出的 `program_workspace.files`，程序浏览器恢复 `MAIN.MPF`、`FACE_MILL.MPF`、`POCKET.MPF`、`LOOP.MPF` 等完整 seed 程序。
- 补齐 server `prog.commands.load` / `progdir.commands.activate` 的当前程序切换逻辑，`Open` 后同步更新 `prog.name`、`program.document.content`、cursor、selection 和 `progdir.selected_path`。
- 扩展 `prog.commands.prepare_execute`：Web strict-server 和 QML/Web local runtime 都传入当前 editor 的 `name/content/cursor_line`，并在空白、文件不存在或 runtime 非 idle 时返回 rejected 提示。
- 更新 `definition/interfaces.machine.yaml`、英中文 data dictionary 与 program execution story breakdown，使 `prepare_execute` 的编辑器载荷和拒绝条件与实现一致。
- 完成 source commits `248651c`、`149be6e` 与 MetaNC commit `89b1cbc` 的同步和推送。
- 在 `contract/runtime_plan.py` 中生成 `subscriptions` 结构，包含 `global`、`pages` 和 `conditions` 三类订阅桶。
- Web runtime 在 active page / subview local state 变化后重新计算 subscription request，并排除 `diagnostics.logs.*` 正常状态通道。
- QML runtime 增加同等 subscription 计算逻辑，通过动态 `Qt.createQmlObject` 加载 QtWebSockets，避免本地缺少 QtWebSockets 开发包时阻断 QML 构建。
- server WebSocket 新连接只发送 `runtime.subscription.ready`，不再在订阅前推送全量 snapshot。
- server `runtime.state.changed` 消息只序列化 changed path 所在 domain 的单路径 state，订阅和 reconnect snapshot 仍返回过滤后的当前 bucket。
- `serialize_app_state()` 默认不注入 log resources；`/api/runtime/logs` 和 export endpoint 继续提供日志查询与导出。
- `ServerConfig` 增加 `log_max_rows`、`log_query_limit_max`、`log_export_limit_max`、`client_log_batch_max` 和 `log_payload_max_bytes`，支持 env 与 CLI 配置。
- `InMemoryLogStore` 与 `SqliteLogStore` 在 append/batch append 后执行行数硬上限裁剪。
- 更新 server/client/runtime log 相关 docs、runtime logs spec、status matrix、story catalog 与 generated story pack，使文档与新日志交互边界一致。

## Verification

- `python3 -m unittest -v tests.test_pipeline` 通过，28 个用例通过，1 个 Web visual snapshot 用例按现有配置跳过。
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh` 通过，刷新 Web/QML/server/distribution 最终产物。
- `./generated/server-build/server_smoke_test` 通过。
- `git diff --check` 通过。
- 最终静态 Web 预览通过 `http://127.0.0.1:4173/` 返回 `200 OK`，确认 `generated/web/index.html` 可访问。
- Web bundle 静态检查确认当前最终产物不是 `inline-fallback`：bundle 大小约 `722635` bytes，并包含 `renderCodeMirrorProgramEditor`、`lineNumbers()` 和 `.cm-lineNumbers`。
- QML 生成结果静态检查确认不再包含 `editorGutter` / `lineNumberText`，并包含 `lineNumberCount`、`offsetForTextLine` 和 `positionToRectangle(lineNumberOffset(index))`。
- `tests.test_sync_scripts` 覆盖 `node_modules/`、`__pycache__/` 和 `*.pyc` 等本地依赖/缓存排除规则。
- 生成产物静态检查确认：
  - 默认 `runtime_state.diagnosis_view` 为 `logs`。
  - 外层 `DIAG` 入口包含设置 `logs` 子页和切换 diagnostics 页面两条 action。
  - 已无顶层 `page_logs` / `LOGS` 导航入口。
- `python3 -m unittest -v tests.test_program_execution_contract` 通过，覆盖程序 workspace seed、Open/Activate 切换和 Execute preparation contract。
- server smoke test 覆盖 `/api/runtime/bootstrap` 中的完整 9 个程序条目，以及 `prog.commands.prepare_execute` 对当前 editor 程序的 accepted/rejected 路径。
- `python3 -m unittest -v tests.test_story_docs tests.test_pipeline tests.test_program_execution_contract` 通过，33 个用例通过，1 个 Web visual snapshot 用例按现有配置跳过。
- `./generated/server-build/server_smoke_test` 通过，覆盖日志默认响应移除、memory/SQLite 日志上限和订阅单路径 delta。
- `env VCPKG_ROOT=/home/i5/workspace/github/vcpkg HMI_SERVER_NATIVE_BUILD_MODE=host PKG_CONFIG=/usr/bin/pkgconf ./tools/generate_targets.sh` 通过，重新生成 Web、QML、native server 和 distribution 最终产物。
- `git diff --check` 通过。

## Notes

- 这次变更让 Runtime Logs 只保留一个正式入口：`DIAG > Logs`。
- MetaNC 同步时仍按既有 export 规则过滤 source-only 报告仓、`docs_i18n` 和本地生成目录。
- Browser-level 点击验证未作为本轮最终门禁执行，因为当前环境缺少 Playwright；行为由生成器快照、pipeline、QML 编译和服务端 smoke 覆盖。
- `python3 -m http.server 4173 --bind 127.0.0.1` 只提供静态 Web 预览，不会启动 HMI native server。
- 带 native server 的最终包入口在 `generated/distribution/` 下，典型命令是 `./run_split_web_native.sh` 或单独执行 `./run_server_native.sh`。
- 在没有 npm dependencies 的环境中，Web 仍可生成 fallback bundle；fallback 现在也有行号，但最佳 Web 体验需要先在 `client/web_client` 下执行 `npm ci`，从而打包 CodeMirror 原生行号编辑器。
- 当前程序示例来自 generated contract 的 deterministic workspace，而不是 server 端单独维护的一份硬编码列表。
- 现在普通 state/command response 不再默认携带最近 200 条 logs；日志页面应通过 `/api/runtime/logs` 进行显式查询。
- runtime subscription 当前解决的是“按订阅范围发布”和“delta 只带变化路径”，后续日志 UI 的 client/server 交互策略仍需要继续讨论。
- `HMI_LOG_MAX_ROWS` 是物理硬上限，会裁剪最旧日志；生产环境需要按 audit/retention 策略设置合适值。
