# Project Report

## 1. 报告目标

本报告总结 2026-04-14 这轮工作中，如何继续收敛 June demo 的操作面板和表格页，让 Web 与 QML 两个 target 在操作分组、状态表达、表格显示和编辑能力上更接近同一套可验证的 mock HMI。

这次工作的目标集中在四条线上:

- 把 `SPINDLE / FEED START/STOP` 从 cycle 区挪到各自的 override 区旁边
- 修正各类表格页的数据展示、列宽和编辑链路
- 排查并降低 Web 端“单个控件异常导致操作面板和底部导航一起消失”的风险
- 生成当天 report，并把流程文档和索引文档一起回写

## 2. 证据范围

本报告对应 2026-04-14 当天当前工作区和生成产物中可直接验证的一组改动，核心范围包括:

- `examples/june-demo/ui.structure.yaml`
- `tools/hmi_dsl/runtime_plan.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `docs/status-matrix.md`
- `docs/tooling.md`
- `docs/story-driven-delivery.md`
- `docs/agent-handoff.md`
- `reports/2026-04-14-codex-session/*`
- `tests/snapshots/web/*`
- `tests/snapshots/qml/*`
- `generated/web/*`
- `generated/distribution/*`

## 3. 本轮处理前的主要问题

### 3.1 override 区和 start/stop 区仍然割裂

上一轮收敛后，`SPINDLE / FEED OVERRIDE` 已经改成线性拖拽条，但 `SPINDLE START/STOP` 和 `FEED START/STOP` 仍然留在 cycle 区。

后果:

- 同一类功能分散在两块区域里
- 用户在调倍率时看不到紧邻的启停状态
- 软面板分组逻辑仍然不够直观

### 3.2 表格页虽然有 retained 配置，但用户实际看到的是空值和不可编辑

从 retained 配置和 runtime seed 来看，刀偏表、零偏表、用户参数、NC Vars、PLC Vars 理论上都有数据，也都声明了可编辑。

但用户实际反馈是:

- `Value` 列大面积空白
- 表格点击后没有形成有效编辑闭环
- 刀偏和零偏页的可读性仍不足

### 3.3 Web 页面对渲染异常不够稳健

用户反馈 Web 端出现了操作面板、底部导航一起消失的现象。这说明 Web 端当前还是“某个节点 render 失败，整页关键区域一起丢”的脆弱结构。

## 4. 本次主要处理动作

### 4.1 重排操作面板，把启停控制并回 override 区

更新:

- `examples/june-demo/ui.structure.yaml`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`

处理结果:

- `ops_cycle_cluster` 只保留 `RESET / CYCLE STOP / CYCLE START / SINGLE BLOCK`
- `ops_spindle_start / stop` 被移动到 `override_spindle_control_cluster`
- `ops_feed_start / stop` 被移动到 `override_feed_control_cluster`
- Web/QML 两端的 override 区都改成“倍率条 + 启停键”并列布局
- 启停按钮尺寸继续和其他软面板按钮保持同一基线

### 4.2 扩充 mock 表格数据，并重新调整列宽与高度

更新:

- `tools/hmi_dsl/runtime_plan.py`
- `examples/june-demo/ui.structure.yaml`

处理结果:

- `tool.table` 从原先的基础刀具组扩到更完整的生产用刀具样本
- `wcs.table` 增补到 `G54.1P1 / G54.1P2`
- `alarm.history` 增加更多历史记录，便于日志页和复制操作联调
- `diagnostics.nc_var_rows`、`diagnostics.plc_var_rows` 增加更多真实风格变量
- `param.table` 增加更多 `R` 变量，并显式展示 `access_level` 和 `require_reset`
- retained 表格列宽和 `max_height` 一并扩大，降低数值折叠和可读性问题

### 4.3 补强 Web 表格显示与页面容错

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- 表格单元格现在会把完整内容挂到 `title`，长值即便被裁切也能悬停看到
- 表格布尔值输出统一为 `TRUE / FALSE`
- `renderPage()` 调整为先渲染 footer 和 ops，再渲染主页面，避免主区出错时导航和操作面板一起消失
- 新增 `safeRenderNode()` 和错误占位节点，单个节点渲染异常时会降级显示，不再把整页关键区域打空

### 4.4 同步 QML 端布局与表格表达

更新:

- `tools/hmi_dsl/generators/qml.py`

处理结果:

- override 区新增控制簇宽度提示，和新的 retained 分组对齐
- 表格布尔值显示统一为 `TRUE / FALSE`
- Web/QML 两端在 override 区、表格列信息和 mock 数据层面继续保持同一模型

### 4.5 更新报告与流程文档

更新:

- `reports/2026-04-14-codex-session/*`
- `docs/status-matrix.md`
- `docs/tooling.md`
- `docs/story-driven-delivery.md`
- `docs/agent-handoff.md`

处理结果:

- 当天新增 session report
- 把最新 report 日期推进到 `2026-04-14`
- 文档里补充“代码修改 -> 生成 targets -> 生成 story docs -> 生成 docs portal/report”的维护顺序
- 后续 agent 更容易按同一流程收尾，不再只更新代码不更新报告和 portal

## 5. 这次工作的工程收益

本轮处理的工程价值主要在于把“看起来已经有功能”的页面，推进到“分组更合理、数据更像样、Web 更不容易塌”的状态:

- override 区和启停控制终于形成可读的同类功能分组
- 表格页不再只靠少量样本数据撑场面
- 表格值显示、布尔值表达和编辑入口更明确
- Web 即便出现单点渲染异常，也不再轻易把整块操作面板和底部导航一起打没
- 当天改动能同步沉淀为 report、docs portal 和流程文档，而不是只停留在代码层

## 6. 验证与回归范围

这轮工作实际执行并通过的验证包括:

```bash
python3 -m py_compile tools/hmi_dsl/generators/web.py tools/hmi_dsl/generators/qml.py tools/hmi_dsl/runtime_plan.py
python3 -m unittest tests.test_pipeline.PipelineTests.test_example_package_validates
python3 -m unittest tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files
python3 -m unittest tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store
python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots
python3 -m unittest tests.test_pipeline.PipelineTests.test_qml_offscreen_snapshot_matches_baseline
./tools/generate_targets.sh
python3 -m tools.hmi_dsl generate-story-docs examples/june-demo/story.catalog.yaml --output examples/june-demo/story-docs
python3 -m tools.hmi_dsl generate-docs-portal . --output docs_html
mdbook build reports/2026-04-14-codex-session
```

## 7. 当前边界

截至 2026-04-14 这轮收尾，仍有几个边界需要保持清楚:

- Web 侧仍缺一条真正覆盖操作面板和表格页的浏览器级自动化回归
- 当前表格编辑仍是 mock runtime 链路，不是后端真实写回
- QML 侧目前主要通过生成检查和 offscreen snapshot 保证稳定，不等同于全流程人工联调

## 8. 建议下一步

1. 给 Web 端增加一个最小 DOM 或浏览器交互回归，直接覆盖 footer、ops panel 和表格页
2. 继续把 `ops` 面板分组规则固化，避免后续需求迭代时按钮再次漂移
3. 为 NC/PLC/参数表补充“编辑后联动右侧详情区”的交互，而不只是表内改值
4. 把 session report 与 docs portal 刷新流程做成固定交付清单

## 9. 同日追加收尾

在当天后续收尾中，又完成了两组直接影响可维护性和 CI 稳定性的工作。

### 9.1 继续按生成器职责拆分主模板

本次没有再改生成结果，而是把原本仍然过大的生成模板继续拆成更清晰的模块边界：

- `tools/hmi_dsl/generators/web_runtime_shell.py`
- `tools/hmi_dsl/generators/web_widget_emitters.py`
- `tools/hmi_dsl/generators/qml_runtime_shell.py`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`

处理后：

- `web.py` / `qml.py` 只保留更薄的入口和装配职责
- Web 端的 `runtime shell`、`app shell`、`widget emitters`、`node renderer` 不再全部堆在同一文件
- QML 端的 `RuntimeStore` 壳层、页面壳层和 `_emit_*` 组件发射器也被拆开
- 后续继续细拆时，能按模块而不是按整份超长模板定位问题

### 9.2 修正本地 CI 真实失败，并重建最终产物

后续直接运行本地 `unittest` 后，发现此前 GitHub Actions 持续失败并不只是远端偶发问题，而是有 3 个断言已经落后于当前 retained demo：

- `test_ir_builder_uses_active_theme_and_normalizes_bindings`
- `test_import_design_practice_updates_design_import`
- `test_build_screenshot_practice_file_infers_style_and_interface_evidence`

处理方式不是修改运行时行为去迎合旧断言，而是把测试更新到当前 DSL 结构和设计输入事实上：

- `page_overview` 当前不再存在独立 `masthead_bar` 节点
- `design.input.840d_01.yaml` 中 `masthead` 区域当前映射到 `main_axis_panel`
- 在仅靠 `semantic_guess` 自动推断时，`masthead_bar / context_strip` 也不会再唯一解析到某个 UI 节点

修正后，本地验证恢复为稳定通过：

```bash
python3 -m unittest -v tests.test_pipeline
python3 -m unittest -v tests.test_docs_portal tests.test_story_docs
```

此外还重新执行了完整目标生成：

```bash
./tools/generate_targets.sh
```

最终分发产物已同步刷新到：

- `generated/web/`
- `generated/qml/`
- `generated/qml-final/`
- `generated/distribution/`
- `docs_html/`

### 9.3 当天结束时的状态

截至 2026-04-14 当天这轮追加收尾完成时，可以确认：

- 生成器模板结构比前一轮明显更清晰
- Web/QML 产物与快照保持一致，没有因为拆分引入输出漂移
- 本地 `CI` 主路径对应的 `unittest` 已恢复为绿色
- 最终生成物和 docs portal 也都已重建，而不是只停留在源码修改

### 9.4 跨 clone 产物不一致的根因分析

当天后续又出现了一个更工程化的问题：当前工作区里 `run_qml.sh`、`run_web.sh`、`generated/distribution/` 都能正常使用，但用户在另一个新 clone 的工作区里重新生成后，发现：

- 没有 `generated/distribution/`
- 看不到 `run_qml.sh` / `run_web.sh`
- 某些 UI 区域又回到了坐标重叠或 Web 面板异常的状态

这类现象容易被误判成“某些最终产物只存在当前目录，没有被归约回原始工程”。实际排查后，结论分成三层。

第一层，`distribution` 本来就是派生产物，不是受 git 管理的源文件：

- `.gitignore` 明确忽略了 `generated/`
- `generated/distribution/run_qml.sh` 和 `generated/distribution/run_web.sh` 都是在 `tools/generate_targets.sh` 里现场生成
- 只执行 `generate-web` / `generate-qml` 时，只会刷新 `generated/web` 和 `generated/qml`，不会生成最终分发目录

所以，一个 fresh clone 没有 `generated/distribution/` 是符合当前仓库约定的，不代表文件“漏提交”。

第二层，跨 clone 结果要一致，前提是两边都在同一 commit 上跑完整生成链：

- 当前仓库里最终可对比的交付不是单独的 `generate-web`
- 而是 `./tools/generate_targets.sh` 这一条完整链路
- 它同时重建 `generated/web`、`generated/qml`、`generated/qml-final`、`generated/distribution` 和 `docs_html`

如果另一边只跑了局部命令，或者停在比当前目录更旧的 commit，就会看到“这里正常、那里异常”的分叉结果。

第三层，这次确实存在“当前工作区已有本地验证通过但尚未推送的修复”：

- Web 操作面板滚动壳层修复，避免 `JOG / MDA / AUTO` 等中下段内容被容器裁掉
- Web `app.js` 补上 `numberOr()` / `roundTo()` helper，修复 override gauge fallback
- 这些改动在当前目录已重新生成并验证，但在被提交推送前，其他 clone 自然拿不到

因此，这次差异不应归因为“当前目录偷偷保留了未归约的最终文件”，而应归因为：

- `distribution` 设计上就是 ignored derived output
- 最终一致性依赖同一 commit 的完整重建
- 当天后续还有一组已验证但尚未 push 的 Web 修复，导致其他 clone 暂时无法复现当前目录的稳定结果

### 9.5 针对一致性问题的文档回写

为避免后续再次把这类现象误判成“分发目录没纳管”或“最终产物没有回写源工程”，这次又补写了几处文档：

- `README.md` 明确说明 `generated/` 是 ignored derived output
- `docs/tooling.md` 明确说明 `run_qml.sh` / `run_web.sh` 由 `./tools/generate_targets.sh` 生成
- `docs/agent-handoff.md` 明确说明跨工作区比较时必须先在同一 commit 上重建
- `CHANGELOG.md` 补记这轮关于打包脚本、Web 修复和生成一致性的约束

这样后续 agent 或协作者在新 clone 中看不到 `generated/distribution/` 时，会先回到生成流程，而不是误判成仓库状态不完整。
