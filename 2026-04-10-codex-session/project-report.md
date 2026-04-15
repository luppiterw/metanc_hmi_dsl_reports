# Project Report

## 1. 报告目标

本报告总结 2026-04-10 这轮工作中围绕 CNC HMI DSL 生成器输出层的关键修复、问题定位、验证结果和当前状态。

这次工作的重点不再是 runtime contract 本身，而是把上一轮已经跑通的 Web/QML 生成链进一步推到“界面可读、交互有反馈、产物与快照一致”的状态。

在当天后续推进中，还补上了一条新的文档交付线:

- story-driven planning / testing / reporting 不再只是散落说明
- `story-docs` 现在可以生成带语言切换入口的文档包
- 英文与简体中文内容可以并存并切换，而不是把目录固定刷成某一种语言

本轮需要落实的约束包括:

- Web overview 页面不能继续出现布局塌陷或错误缩放
- QML overview 页面顶部不能保留大块无意义空白
- 按钮、键盘矩阵键和事件行在按下时必须有即时反馈
- generator 代码、快照基线、最终分发产物和文档必须一起更新

## 2. 本次工作主题

当前这轮工作的核心是修复 target-side presentation layer。

重点不在 retained DSL 语义层，而在两类 target 的“最后一公里”:

- Web 侧如何把 overview 页面正确铺开、缩放和滚动
- QML 侧如何把 chrome 和 page stage 放在合理密度下
- 交互控件如何在命令执行前就给出按下态反馈
- 视觉基线如何跟着真实产物同步刷新

## 3. 本次主要问题

### 3.1 Web 页面结构存在布局拦截层

Web generator 在 container 渲染时给子节点包了一层额外 wrapper。
这导致节点级样式虽然挂在外层 section 上，但真正参与布局的是内部 child host。

后果:

- `screen_workspace` 等节点的网格规则没有真正作用到实际子节点
- 左列、中心列和软键列出现宽度错误
- overview 页面高度被异常拉长，HTML 首屏观感不正确

### 3.2 Web 舞台缩放策略过于极端

之前为了把整页塞进一个 stage，Web 侧做了整页缩放。
在 overview 页面高度较大时，这种策略会把整页压得过小，虽然能“看到更多”，但可读性明显下降。

### 3.3 QML 顶部 chrome 会把页面挤出大块空白

QML 的顶部状态 chip 使用 `Flow` 放在 `RowLayout` 中，导致 chip 区容易纵向堆叠。
同时 page stage 的可视区域采用居中策略，overview 页面会在上方留下大块空白。

### 3.4 控件按下时缺少即时反馈

当前很多控件只有“已选中态”或命令执行后的状态变化。
如果用户只是点击、按下或短促触发动作，没有即时 pressed feedback，交互质感会很弱。

## 4. 本次主要处理动作

### 4.1 修复 Web container 布局传递

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- 移除了会拦截真实布局的多余 child wrapper
- container 的布局规则现在直接作用到实际子节点
- `screen_workspace`、`hardware_console_zone` 等节点重新按预期网格和横向流布局

### 4.2 重做 Web stage 布局策略

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- page stage 改为顶部对齐
- 保留滚动兜底能力
- 引入 controlled-fit 逻辑，而不是简单把整页强行缩到最小
- overview 页面现在优先保证可读性，同时避免之前的明显错误布局

### 4.3 压缩 Web hardware console 的换行压力

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- 调整 `hardware_console_zone` 的 gap 和对齐方式
- 缩小 `override_gauge_cluster` 的占位宽度
- 让右侧 drive action 区域不再轻易被挤到下一行

### 4.4 修复 QML 顶部空白与状态条布局

更新:

- `tools/hmi_dsl/generators/qml.py`

处理结果:

- 顶部 status chips 改为单行横向容器，并在宽度不够时水平滚动
- page viewport 从垂直居中改为顶部对齐
- 页面 implicitHeight 改为基于实际内容高度计算
- overview 页面不再带着大块顶部空白打开

### 4.5 为 Web/QML 补齐 pressed feedback

更新:

- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`

本次补齐的反馈点包括:

- 左侧导航按钮
- 命令按钮
- 软键按钮
- key grid 中的键位按钮
- event table 行

反馈形式包括:

- 按下时变色
- 按下时边框增强
- 按下时轻微位移或压下感
- 在 QML 中通过 `MouseArea.pressed` 驱动即时颜色切换

### 4.6 同步更新产物、快照和文档

更新内容覆盖:

- `generated/distribution/`
- `tests/snapshots/web/app.js.snap`
- `tests/snapshots/web/styles.css.snap`
- `tests/snapshots/web/main_window.chromium.png`
- `tests/snapshots/qml/Main.qml.snap`
- `tests/snapshots/qml/main_window.offscreen.png`
- `docs/generator-contract.md`
- `CHANGELOG.md`

### 4.7 增强 story-docs 语言切换能力

更新:

- `tools/hmi_dsl/story_docs.py`
- `tools/hmi_dsl/cli.py`
- `tests/test_story_docs.py`
- `examples/june-demo/story.catalog.yaml`

处理结果:

- `generate-story-docs` 现在支持 `--lang`
- 不传 `--lang` 时，默认生成多语言文档包
- 默认结构变为:
  - `story-docs/README.md`
  - `story-docs/index.html`
  - `story-docs/en/`
  - `story-docs/zh-CN/`
- 每种语言各自生成 markdown 和 `mdBook` HTML
- story catalog 开始支持 `*_i18n` 字段用于本地化文案

## 5. 实际验证结果

本次在当前工作区中实际执行了:

```bash
./tools/generate_targets.sh
python3 -m tools.hmi_dsl validate examples/june-demo/product.manifest.yaml
python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots
HMI_ENABLE_QML_VISUAL_SNAPSHOT=1 python3 -m unittest tests.test_pipeline.PipelineTests.test_qml_offscreen_snapshot_matches_baseline
HMI_ENABLE_WEB_VISUAL_SNAPSHOT=1 HMI_WEB_PLAYWRIGHT_ROOT=/tmp/hmi_web_snapshot_tooling HMI_WEB_RUNTIME_LIB_DIR=/tmp/hmi_web_runtime/usr/lib/x86_64-linux-gnu python3 -m unittest tests.test_pipeline.PipelineTests.test_web_browser_snapshot_matches_baseline
```

结果:

- `validate` 返回 `ok=True errors=0 warnings=0`
- 文本产物快照测试通过
- QML 离屏视觉快照基线测试通过
- Web 浏览器视觉快照基线测试通过
- story-docs 英文 / 简体中文生成测试通过
- story-docs 默认多语言包和单语言 `zh-CN` 输出都可成功构建 HTML
- `generated/distribution/` 已刷新到当前代码状态

## 6. 当前已得到的工程收益

这轮修复带来的直接收益包括:

- Web overview 页面重新具备可读的结构比例
- QML overview 页面顶部空白问题被消除
- 两个 target 的交互控件都具备即时按下态反馈
- 文本快照和视觉快照重新与真实产物对齐
- 后续继续做 generator 视觉迭代时，有一条更可信的回归基线
- story-driven 文档现在可以作为对外阅读入口，并支持多语言切换而不是固定单语输出

## 7. 当前已知边界

当前仍然存在的边界包括:

- Web 侧为了兼顾 overview 高度和首屏可读性，仍采用了受控缩放策略，而不是严格像素级一比一展示
- pressed feedback 目前主要覆盖基础交互壳层，并没有把所有语义状态都提升为 retained DSL 的显式 state overlay
- 当前验证基线以 June demo 为主，其他 future package 仍需要额外观察

## 8. 推荐下一步

建议下一轮继续推进以下部分:

1. 把 pressed / focused / selected 等交互态进一步抽象进 theme semantic role 或 state overlay
2. 为 Web 侧 stage-fit 增加更明确的策略开关，便于在“可读性优先”和“全局一屏预览”之间切换
3. 为更多控件增加行为级视觉回归，而不只是最终静态截图
4. 将 layout hint 的来源逐步从 generator hardcode 迁回更稳定的 retained 结构语义
5. 将更多 story 业务内容补成真正的中英双语，而不只是让框架具备语言切换能力

## 9. 本次产出清单

本次工作主要覆盖了:

- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `docs/generator-contract.md`
- `CHANGELOG.md`
- `tests/snapshots/web/`
- `tests/snapshots/qml/`
- `generated/distribution/`
- `examples/june-demo/story.catalog.yaml`
- `examples/june-demo/story-docs/`
- `reports/2026-04-10-codex-session/`
