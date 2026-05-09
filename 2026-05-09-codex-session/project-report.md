# Project Report

## Scope

本轮工作围绕 MAIN 页面 JOG 模式的职责边界展开。用户指出当前 JOG 主页
重复了大量软面板内容，容易让真实操作入口、状态展示和手动准备值混在一起。
本轮目标是把 JOG 主页收敛为“manual setup + read-only status”区域，
而把轴选、JOG +/-、rapid、increment、模式切换、进给/主轴启停、冷却、
Cycle Start/Stop 等实际操作继续保留在软面板。随后继续处理两类回归：
server simulator 中 FS Actual/Target 的语义混用，以及 DEBUG natural-query
输入框不能通过回车触发查询、查询偶发看似无响应、单轴缩写不能直接命中轴
数据的问题。

## Completed Work

- 重构 `definition/ui.structure.yaml` 的 `main_jog_panel`，删除原有
  `main_jog_summary` 和 `jog_axis_status_card`。
- 从 JOG 主页移除重复的软面板操作按钮：
  - `F ON` / `F OFF`
  - `CW` / `CCW` / `STOP`
  - `M8` / `M9`
  - 轴选、步进、rapid、模式切换和 cycle 类操作
- 保留并重命名手动准备区域：
  - `jog_feed_target`
  - `jog_spindle_target`
  - `jog_tool_card`
  - `jog_aux_card`
- 增加 `jog_live_status_card`，集中显示只读状态：
  - feed actual / override / enabled
  - spindle actual / override / running / direction
- 修复 server simulator 中 feed actual 与 target/cmd 的混用：
  - `feed.speed_actual` 不再因为当前模式是 JOG 就持续等于 `feed.speed_cmd`；
  - 离散 JOG 运动完成后，actual feed 回到 `0`；
  - `feed.speed_cmd` 和 `jog.manual_feed_target` 继续保留设定目标值。
- 重新生成 Web/QML 最终产物和快照，使 `generated/` 与 retained DSL 保持一致。
- 更新 `definition/story.catalog.yaml`，把手动操作故事明确为：
  - MAIN/JOG 只展示手动准备和只读状态；
  - 真实操作入口属于 generated soft panel；
  - actual feed 是运动状态输出，不能只从 JOG 模式或 target 值推导；
  - 后续 real motion adapter 测试应围绕 soft-panel command surface 展开。
- 更新 status、runtime split、client/server 计划和 DSL data dictionary 相关文档，
  清理 `view_runtime.jog_mode_summary` 仍被当前 JOG 主区使用的旧口径。
- 生成 2026-05-09 report、brief user history 和完整 Codex conversation export。
- 修复 DEBUG natural-query 输入框的键盘提交路径：
  - Web 端把输入行改为真实 `form` submit，并让 `Run` 与 `Enter` 共用
    `submitDebugQuery()`。
  - Web 端保留 IME composition guard，避免中文输入组合态被提前提交。
  - Web 端增加 `keyup` fallback，覆盖部分浏览器或焦点路径下 `keydown`
    没有完成提交的情况。
  - QML 端把 TextField 的 `onAccepted`、`Keys.onReturnPressed`、
    `Keys.onEnterPressed` 和 `Run` 按钮统一到同一个 `submitDebugQuery()`
    helper。
- 更新 README、CHANGELOG、status matrix 和 agent handoff，把 DEBUG
  natural-query 的键盘提交行为纳入维护文档。
- 重新生成 Web/QML/server/distribution 最终产物，并同步测试快照。
- 继续收敛 DEBUG natural-query 的稳定性：
  - Web 端把提交状态提升到 view-level queue，避免输入框 rerender 后丢失
    pending submit。
  - Web 端在 `applyDebugQueryPlan()` 后直接刷新当前可见 DEBUG result panel，
    解决 `preserveFocus` 保护输入焦点时整页不 rerender 导致结果表看似不更新的问题。
  - QML 端把 `Run`、`Accepted`、`Return` 和 `Enter` 统一到 Timer 延迟提交，
    降低同一按键路径重复或被 UI 刷新打断的概率。
- 扩展 DEBUG parser 的轴缩写：
  - `x` / `y` / `z` / `a` / `c` 直接查询对应轴 machine position。
  - `xy`、`xyz` 等连续轴写法按多个轴展开。
  - `x actual`、`x轴` 等写法也会识别为轴查询。
  - 普通词如 `connection` 不会因为包含 `c` 而误识别为 C 轴。
- 更新 README、CHANGELOG、status matrix 和 agent handoff，把 DEBUG
  submit stability 和 axis shorthand parser 规则纳入维护文档。
- 修复 Web MAIN 页 MDI 编辑焦点保护与主模式切换之间的冲突：
  - `page_overview` 渲染保护现在把 `runtime_state.main_mode_view` 纳入
    content render signature。
  - MDI 编辑器普通输入刷新仍然不会强制重建页面，避免重新引入光标跳动。
  - 当软面板 `AUTO` / `JOG` / `MDI` 改变主模式视图时，主页会重建内容区，
    让右侧主面板立即从 MDI 编辑器切到 AUTO/JOG/MDI 对应面板。
  - 同步刷新 Web generated snapshot 和 asset hash snapshot。
- 按后续计划完成 Web generator 源码级拆分的两步落地：
  - `client/web_client/generator.py` 只保留 `generate_web()` 主入口、payload
    准备、asset hash 和文件写出逻辑。
  - `client/web_client/styles.py` 现在是 7 行兼容入口，实际 CSS 被拆到
    `client/web_client/style_emitters/`，由 tokens、base、app shell、Program、
    DEBUG、Logs、Dialogs、Settings、Overview、Aux panel、Widgets、responsive
    等 emitters 按原输出顺序拼接，保持 `styles.css` byte-stable。
  - 原 `widget_emitters.py` 中的 Program editor、Runtime Logs 和 DEBUG
    natural-query JS 片段拆到 `client/web_client/features/` 下的独立模块，
    再由 `widget_emitters.py` 按原顺序拼接回最终 `WEB_WIDGET_EMITTERS_JS`。
  - 新增 generator refactor 测试，锁住 CSS emitter 顺序、styles builder
    marker、feature snippet marker 和最终 JS 拼接顺序。
  - 更新 status matrix 和 handoff 文档，把此状态标注为 Web 源码级拆分
    `Partial`，明确 `legacy_shell.py` 仍偏大、QML 拆分和最终生成文件拆分
    还未开始。
- 完成 Web generator 源码级拆分的第二阶段：
  - `client/web_client/widget_emitters.py` 现在是 99 行组装入口，核心
    widget JS 片段拆到 `client/web_client/widget_core/`。
  - `client/web_client/style_emitters/legacy_shell.py` 现在是兼容 shim，
    原 legacy shell CSS 拆到 `client/web_client/style_emitters/legacy/`。
  - 使用 AST 提取和快照测试保持原 Python 字符串运行时值、CSS/JS 输出和
    最终 Web/QML snapshots 稳定。
  - 更新 generator refactor 测试，锁住 `widget_core`、Web widget aggregate
    和 legacy style emitter 的组装顺序。
  - 更新 README、CHANGELOG、status matrix 和 handoff 文档，把下一步
    cleanup 目标收敛到 Program search/actions、gauges、runtime refs、
    legacy button styling 和 QML source decomposition。
- 完成 Web runtime shell 源码级拆分：
  - `client/web_client/runtime_shell.py` 从 3600 行级别收敛为 31 行
    public builder/assembler。
  - 新增 `client/web_client/runtime_fragments/`，按原 JS 顺序拆出
    header、config、store、command handlers、derived state、execution、
    program workspace、local state、machine helpers、logs、server bridge、
    transport helpers、remote state 和 utilities。
  - 保持最终 `runtime.js` 文件结构和内容 byte-stable，不改变 strict/hybrid
    mode、HTTP bootstrap/commands、WebSocket subscription/reconnect、runtime logs、
    program workspace 或 local simulator 语义。
  - 更新 generator refactor 测试，锁住 runtime fragment 拼接顺序和关键
    marker 顺序。
  - 更新 README、CHANGELOG、status matrix 和 handoff，把下一步拆解重心
    移到 QML generator/widget/runtime source decomposition。
- 完成 QML widget emitter 源码级拆分：
  - `client/qml_client/widget_emitters.py` 收敛为 91 行兼容 dispatch 入口。
  - 新增 `client/qml_client/widget_fragments/`，按职责拆出 Program、Runtime
    Logs、DEBUG natural-query、tables、gauges、buttons、containers、layout
    和 utils emitters。
  - container 与 key grid 的递归渲染改为由 dispatch callback 注入，避免
    fragment 模块之间形成循环 import。
  - 新增 generator refactor 测试，锁住 QML widget fragment 名称和 dispatch
    顺序。
  - 更新 README、CHANGELOG、status matrix 和 handoff，把后续 QML 拆解重心
    收敛到 `runtime_shell.py` 与更小的 domain fragments。
  - 重新生成最终产物，并确认 tracked 的 `generated/qml/Main.qml`、Web
    `app.js` 等生成文件没有 diff。
- 完成 QML runtime store 源码级拆分：
  - `client/qml_client/runtime_shell.py` 从 3600 行级别收敛为 55 行
    compatibility builder/assembler。
  - 新增 `client/qml_client/runtime_fragments/`，按原 `RuntimeStore.qml`
    输出顺序拆出 header、store、config、commands、derived state、
    execution、program workspace、local state、machine helpers、logs、
    WebSocket/HTTP transport、remote state 和 utilities。
  - 组装器增加 fragment 边界换行折叠，避免源码片段首尾换行影响最终
    `RuntimeStore.qml` 快照。
  - 通过直接 runtime-store 等价检查确认生成后的
    `generated/qml/RuntimeStore.qml` 与当前产物 byte-stable。
- 完成 QML runtime command 二级拆分：
  - `client/qml_client/runtime_fragments/commands.py` 收敛为 62 行
    `invokeCommand()` 入口和有序 block assembler。
  - 新增 `client/qml_client/runtime_fragments/command_blocks/`，按职责拆出
    `ui`、`position`、`program`、`program_dir`、`cnc`、`jog`、
    `manual_ops`、`alarm` 和 `diagnostics` 命令块。
  - 保留单一生成入口 `invokeCommand(path, args)` 和原命令分支顺序，避免
    改变 strict forwarding、PROG、CNC、JOG、manual operation 或 diagnostics
    runtime 行为。
  - 新增 generator refactor 测试，锁住 QML runtime fragment 顺序、
    command block 顺序和关键命令 marker 顺序。
- 完成 QML Program workspace runtime fragment 二级拆分：
  - `client/qml_client/runtime_fragments/program_workspace.py` 收敛为 31 行
    兼容 assembler。
  - 新增 `client/qml_client/runtime_fragments/program_workspace_blocks/`，按职责
    拆出 program lines、state、directory、editor、backend 和 path utils。
  - 保留原 QML 函数顺序和 fragment 边界换行折叠，避免影响程序目录、
    打开/保存、当前文档刷新、目录浏览和 path normalization 行为。
  - 新增 generator refactor 测试，锁住 Program workspace block 顺序和关键
    marker 顺序。
- 完成 QML execution runtime fragment 二级拆分：
  - `client/qml_client/runtime_fragments/execution.py` 收敛为 41 行兼容
    assembler。
  - 新增 `client/qml_client/runtime_fragments/execution_blocks/`，按职责拆出
    execution tick、motion stepping、tooling、MDI start、line parsing、
    cursor preparation、block application、modal words、completion、timers
    和 line helpers。
  - 保留 AUTO/MDA execution、JOG motion tick、F/S actual/cmd 更新、remain
    distance、part count、program end/loop 和 single-block pause 的原生成顺序。
  - 新增 generator refactor 测试，锁住 execution block 顺序和关键 marker
    顺序。
- 完成 QML WebSocket transport runtime fragment 二级拆分：
  - `client/qml_client/runtime_fragments/transport_ws.py` 收敛为 33 行兼容
    assembler。
  - 新增 `client/qml_client/runtime_fragments/transport_ws_blocks/`，按职责拆出
    connection/bootstrap、lifecycle、subscription、messages、notices、retry
    和 dynamic Qt WebSocket source。
  - 保持 strict/hybrid WebSocket bootstrap、reconnect/fallback、subscription
    request、`since_revision` replay、operator notice 和 command notice 行为
    的原生成顺序。
  - 新增 generator refactor 测试，锁住 transport block 顺序和关键 marker
    顺序。
- 完成 QML runtime logs fragment 二级拆分：
  - `client/qml_client/runtime_fragments/logs.py` 收敛为 41 行兼容
    assembler。
  - 新增 `client/qml_client/runtime_fragments/log_blocks/`，按职责拆出
    clear/export、query/retention args、client buffer/upload、poll/apply 和
    normalization。
  - 保留 `LOG_QUERY_QML` 和 `CLIENT_LOGS_QML` 两段 public export，因为
    `runtime_shell.py` 会把 log query 放在 transport 之前、client log
    buffer 放在 HTTP/WebSocket transport 之后。
  - 新增 generator refactor 测试，锁住 log block 顺序和关键 marker 顺序。

## Validation

- `./tools/generate_targets.sh`
- `git diff --check`
- `cmake --build server/build --target server_smoke_test`
- `ctest --test-dir server/build -R server_smoke_test --output-on-failure`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
  after the DEBUG Enter/Return submit changes.
- `python3 -m unittest -v tests.test_generator_refactor tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_docs_portal tests.test_story_docs`
  after the Web generator source split.
- `python3 -m compileall -q client/web_client/styles.py client/web_client/style_emitters`
  after the CSS emitter split.
- `python3 -m compileall -q client/web_client/widget_emitters.py client/web_client/widget_core client/web_client/style_emitters/legacy_shell.py client/web_client/style_emitters/legacy`
  after the `widget_core` and legacy shell split.
- `python3 -m compileall -q client/web_client/runtime_shell.py client/web_client/runtime_fragments tests/test_generator_refactor.py`
  after the Web runtime fragments split.
- `python3 -m unittest -v tests.test_generator_refactor tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
  after the deeper Web generator/runtime split.
- `python3 -m unittest -v tests.test_generator_refactor tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_docs_portal tests.test_story_docs`
  after the deeper Web generator split and before final artifact refresh.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the QML widget fragment split.
- `python3 -m unittest tests.test_generator_refactor`
  after adding QML fragment-order coverage.
- Direct runtime-store equivalence check confirmed `build_runtime_store_qml()`
  still matches `generated/qml/RuntimeStore.qml` byte-for-byte after the
  QML runtime and command block source splits.
- `python3 -m unittest tests.test_docs_portal`
  after report/docs routing updates.
- `./tools/generate_targets.sh`
  after the QML widget, runtime, and command block fragment splits.
- `python3 -m unittest tests.test_pipeline`
  after the final artifact refresh.
- `git diff --check`
  after the QML source splits and docs update.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the QML Program workspace and execution block splits.
- `python3 -m unittest tests.test_generator_refactor`
  after adding Program workspace and execution block order coverage.
- `./tools/generate_targets.sh`
  after the QML Program workspace and execution block splits.
- `python3 -m compileall client/qml_client tests/test_generator_refactor.py`
  after the QML WebSocket transport and runtime log block splits.
- `python3 -m unittest tests.test_generator_refactor`
  after adding transport/log block order coverage.
- `./tools/generate_targets.sh`
  after the QML WebSocket transport and runtime log block splits.
- `python3 -m unittest tests.test_docs_portal`
  after the report/docs refresh.
- `python3 -m unittest tests.test_pipeline`
  after the final target regeneration.
- `git diff --check`
  after the final QML block split and docs refresh.
- Key generated-output diff check confirmed `generated/qml/RuntimeStore.qml`,
  `generated/qml/Main.qml`, `generated/web/app.js`, `generated/web/runtime.js`,
  `generated/distribution/contract/runtime_contract_bundle.json`, and
  `tests/snapshots/qml/RuntimeStore.qml.snap` did not change after the source split.
- Direct generated-output equivalence check confirmed `web/app.js`, `web/styles.css`,
  `web/index.html`, and `qml/Main.qml` still match the committed snapshots after the
  split.
- `./tools/build_docs_html.sh` rebuilt the bookshelf documentation portal and 35
  report books after the source/documentation update.
- Headless split Web CDP probe against `./generated/distribution/run_split_web_native.sh`
  verified that typing `show spindle status` in DEBUG and pressing Enter updates
  `runtime_state.debug_query_text`, produces a `runtime_values` plan, and renders
  6 spindle-related result rows.
- Headless split Web CDP stability probes verified:
  - repeated DEBUG Enter queries update status/result rows while input focus is preserved;
  - rapid query changes followed by Enter settle on the final query result;
  - `x`, `y`, `z`, `a`, `c`, `xy`, `xyz`, `x actual`, and `x轴` resolve to axis
    property rows;
  - `connection` continues to resolve to server connection local state rather than C-axis data.
- Headless split Web CDP probe verified that with the MAIN page in MDI mode and
  the MDI editor focused, clicking the soft-panel `AUTO` button changes both
  `mode.current` and `runtime_state.main_mode_view` to `AUTO`, hides the MDI
  panel, and shows the AUTO panel.
- Headless split Web DOM probe against `./generated/distribution/run_split_web_native.sh`
  verified that after switching to JOG:
  - `main_jog_panel` exists
  - `jog_feed_target`, `jog_spindle_target`, `jog_tool_card`, `jog_aux_card`,
    and `jog_live_status_card` are visible
  - forbidden duplicated operation nodes such as `jog_feed_on`,
    `jog_spindle_cw`, and `jog_coolant_on` are absent
  - `main_jog_panel` contains zero button nodes
  - soft-panel command buttons remain available in `hardware_console_zone`

## Follow-Up

- Promote the JOG DOM probe into maintained CI-level browser interaction coverage.
- Decide whether feed/spindle target sliders are long-term setup controls or should move
  behind a future dedicated manual setup page when real manual-operation adapters arrive.
- Add the next manual-operation slices for reference return, live override policy, and
  real motion-adapter rejection semantics.
- Extend server-level manual-operation coverage beyond the current smoke assertion into
  rapid, increment, rejection, and continuous-jog semantics.
- Promote the DEBUG Enter/Return natural-query browser probe into maintained CI-level
  interaction coverage once the generated Web UI test harness is formalized.
- Promote the DEBUG axis-shorthand parsing and direct result-panel refresh probes into
  maintained CI-level UI automation rather than leaving them as ad hoc CDP scripts.
- Promote the MDI-editor-focus plus soft-panel AUTO/JOG/MDI mode-switch probe
  into maintained generated Web UI automation.
- Continue the generator decomposition plan with the remaining QML runtime
  fragments first: `derived_state.py`, then `remote_state.py` if the derived-state
  split remains byte-stable. After that, split the QML generator entrypoint itself.
  Keep final generated Web/QML file layout unchanged until source-level decomposition
  and interaction coverage are stable.
