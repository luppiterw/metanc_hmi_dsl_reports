# Project Report

## Scope

本轮工作围绕 2026-05-07 的 QML Logs 回归修复、PROG 编辑器工具状态收敛、
Search/Replace 第一版可用、最终产物刷新、文档同步和 MetaNC 下游同步展开。
重点不是新增 server log 能力，而是让 QML target 与 Web Logs 页面已经具备的
交互行为保持一致，同时把 PROG 编辑页面从执行态跟随中剥离，回到纯编辑器职责，
并把查找/替换从临时弹框升级成可持续使用的编辑器内工具。

## Completed Work

- 拉取并检查 `metanc_hmi_dsl` 与 `MetaNC` 当前分支状态，为后续同步做准备。
- 重新生成 Web、QML、native server、distribution 和文档产物，确认本地最终产物可构建。
- 修复 QML Logs 表格中的 `font_family_ui` 主题字段引用。该字段不存在，会导致
  `Unable to assign [undefined] to QString`。
- 为 QML Logs 下拉框增加显式 option value 读取，避免依赖不同 Qt 版本上不稳定的
  `currentValue` 行为。
- 修复 QML Logs 的 `Filter` 和 `More` 面板点击后不显示的问题。根因是相关
  `visible`、`checked` 和高度绑定直接读取 `runtime.readLocalState()`，缺少
  `runtime.revision` 依赖，状态写入后 QML 不会重新计算绑定。
- 为 Logs toolbar 增加稳定宽度，压缩 Level、Time、Search 的默认宽度，并固定
  More 按钮宽度，避免窗口较窄时被挤压。
- 为 Clear Client Debug 和 Run Retention 的 QML 本地命令补齐服务端操作完成后的
  log refresh 闭环。
- 更新 QML 快照和 pipeline 测试，锁住 `font_family_ui` 不再回归、Logs 面板使用
  revision-aware helper 的生成结果。
- 更新客户端日志、视觉设计和状态矩阵文档，记录 QML Logs 面板状态绑定和溢出按钮
  布局约束。
- 清理 PROG 概念边界：`prog.cursor_line` 标记为 deprecated compatibility path，
  并在 interface 文档中继续明确编辑器光标不是后端属性写入。
- 调整 PROG/PROG EDIT/PROG DIR softkey 职责：`PROG` 保留 Select、Save、Save As、
  Edit、Check、Execute；`PROG EDIT` 聚焦 Undo、Redo、Cut、Copy、Paste、Search、
  Goto；`Block No.` 和 `Format` 入口隐藏但保留内部占位注释。
- Web/QML 的 Undo、Redo、Cut、Copy、Paste 使能状态改为读取编辑器真实状态，
  去掉 `programLoaded` 这类额外 gating，避免编辑后按钮不亮显。
- Web PROG EDIT 改为复用同一个 PROG 主内容编辑器，而不是切换到第二个编辑器实例；
  运行时刷新时不再销毁 CodeMirror 实例和 undo history。
- Runtime plan 现在会收集 `enabled_ref` 等 node props 中的运行时引用，使编辑器能力
  local state 可以出现在数据字典和 runtime usage 索引中。
- New File/Save As 对话框选中默认文件名时只选中 stem，不选中 `.MPF` / `.SPF`
  后缀，降低误删扩展名的概率。
- Paste 改为直接粘贴系统剪贴板到当前编辑器光标/选区，不再弹二次输入框；Web
  和 QML 使能状态都尽量读取当前编辑器/平台剪贴板能力。
- Goto 改为跳转自然文档行号，而不是按 `N` block 编号解析；Web CodeMirror 保留
  DOM 的同时会显式调用编辑器跳转 API，避免状态写入后光标不动。
- Search/Replace 第一版可用：Web/QML 都提供编辑器内 Search/Replace 面板，
  状态保存在 `runtime_state.program_search_*`，替换只更新
  `res://program.document.content`，不伪装成 backend command。
- Web CodeMirror Search/Replace 以当前编辑器实例内容为事实源，Replace 通过
  CodeMirror/textarea 写入编辑器后再回写 resource，避免“resource 已变但界面没变”。
- Web CodeMirror 支持全部匹配弱高亮、当前匹配强高亮、Next/Prev、Replace、
  Replace All、match-case 和 whole-word；QML 第一版负责选中并滚动当前匹配。
- `Search` / `Replace` 两个软键入口收敛为一个 `Search/Replace` 入口，`Goto`
  前移，旧 `prog_tools_replace` 不再出现在生成物中。
- Web 端移除 CodeMirror 默认 `searchKeymap`，并在 shell 捕获阶段把
  `Ctrl/Cmd+F` 路由到自定义 Find、`Ctrl/Cmd+H` / `Ctrl/Cmd+Alt+F` 路由到
  自定义 Replace；QML 端补齐相同的应用级快捷键入口。
- 重新生成 Web、QML、distribution、server build、数据字典和测试快照。
- 先后提交 `8a1e573 Add program editor search replace panel` 和
  `d130d3b Unify program search replace entry`，把第一版面板和入口/快捷键收敛
  分成两个可审查提交。
- 修复 Program Save 在 Web/QML、fixture mock server 和 native Drogon server
  三条路径上的持久化语义：保存命令现在优先携带当前编辑器文本 `content`，
  缺省时 server 会从 `program.document.content` 资源回退，避免只保存旧的
  program-store 内容。
- 为 native server 的 `prog.commands.save`、`save_as` 和 `prepare_execute`
  增加 active document resource fallback，保证严格分离模式下当前编辑器文档是
  Save/AUTO 准备执行的事实源。
- 增加 mock runtime 和 native REST API 回归测试，覆盖“编辑资源 -> 保存 ->
  切换到其他程序 -> 再打开原程序仍能看到保存内容”的 Program workspace 流程。
- 修复 Web PROG DIR 打开 A/B 程序时编辑器显示滞后的问题。此前为避免执行态刷新
  销毁 CodeMirror 实例，`page_program` 保留 DOM 的条件过宽；现在 Web shell
  按当前程序文档 key 判断，同一程序保留编辑器，切换程序则重新渲染文档内容。
- 重新生成 Web、QML、native server、distribution 和 snapshot 输出，并用真实
  `run_split_web_native.sh` 分离模式验证：打开 `SWITCH_A.MPF` 后编辑器显示 A，
  再切到 `SWITCH_B.MPF` 后编辑器显示 B，`program.document.content` 与可见编辑器
  文本一致。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests`
- `python3 -m unittest -v tests.test_mock_runtime_server`
- `env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 python3 -m unittest tests/test_pipeline.py -v`
- `git diff --check`
- Headless Web probe verified CodeMirror editing: typing enables Undo, clicking Undo clears the
  inserted text and enables Redo.
- Headless Web probe verified Paste writes clipboard text into the active CodeMirror editor and
  the Paste softkey follows clipboard/editor capability state.
- Headless Web probe verified Goto with a 14-line document and input `12` moves CodeMirror to
  document line 12 while keeping the compatibility cursor state at `120`.
- Headless Web probe verified Search/Replace updates both the visible CodeMirror document and
  `res://program.document.content`.
- Headless Web probe verified the unified `Search/Replace` softkey, absence of the old separate
  `Replace` softkey, `Ctrl/Cmd+F` interception, no CodeMirror native search panel, and
  `Ctrl/Cmd+H` focus on the Replace field.
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots
  tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files
  tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store
  tests.test_mock_runtime_server.MockRuntimeServerTests.test_save_persists_current_program_resource_draft`
- `./generated/server-build/runtime_rest_api_test`
- Headless Web probe against
  `./generated/distribution/run_split_web_native.sh 18161 18061` verified Program A/B
  activation updates both runtime resource content and the visible CodeMirror editor text.
- Final regression after the Search/Replace entry merge:
  `python3 -m unittest -v tests.test_pipeline.PipelineTests tests.test_mock_runtime_server`
  passed `38` tests with `1` opt-in Web visual snapshot skipped.
- QML offscreen startup with Logs state forced open. The environment produced a
  `1x1` image, so it is useful for QML warning detection only, not visual proof.

## Follow-Up

- Add real interaction automation for generated QML controls. Current coverage still relies on
  generated text snapshots plus startup-level QML warning checks.
- Continue the generator decomposition plan so Logs widgets can be tested in smaller emitted units.
- Define the next PROG workspace mutation slice before broadening Save As persistence,
  directory creation policy, editor-side Check behavior, and production decode/navigation tooling.
