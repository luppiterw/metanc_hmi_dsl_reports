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
- Continue the generator decomposition plan by reducing the remaining large
  `client/web_client/style_emitters/legacy_shell.py` slice, then mirror the same
  source-level feature split on the QML generator before changing final generated
  file layout.
