# Project Report

## Scope

本轮工作围绕 MAIN 页面 JOG 模式的职责边界展开。用户指出当前 JOG 主页
重复了大量软面板内容，容易让真实操作入口、状态展示和手动准备值混在一起。
本轮目标是把 JOG 主页收敛为“manual setup + read-only status”区域，
而把轴选、JOG +/-、rapid、increment、模式切换、进给/主轴启停、冷却、
Cycle Start/Stop 等实际操作继续保留在软面板。随后继续处理两类回归：
server simulator 中 FS Actual/Target 的语义混用，以及 DEBUG natural-query
输入框不能通过回车触发查询的问题。

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

## Validation

- `./tools/generate_targets.sh`
- `git diff --check`
- `cmake --build server/build --target server_smoke_test`
- `ctest --test-dir server/build -R server_smoke_test --output-on-failure`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots`
  after the DEBUG Enter/Return submit changes.
- Headless split Web CDP probe against `./generated/distribution/run_split_web_native.sh`
  verified that typing `show spindle status` in DEBUG and pressing Enter updates
  `runtime_state.debug_query_text`, produces a `runtime_values` plan, and renders
  6 spindle-related result rows.
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
