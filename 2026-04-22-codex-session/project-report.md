# Project Report

## 1. 报告目标

本报告总结 2026-04-22 这轮工作的五个连续主题：

- 参考新的简约面板图，把共享软操作面板从“延续旧分组再微调”切换成“按新结构重排”
- 将软面板按钮整体收紧到更小字号和约 `30px` 高度，并让留白和分隔关系更协调
- 把 `XYZAC + RAPID` 那一块改成新的 `3x4` 运动 12 宫格，同时合并模式/坐标系切换区
- 重新整理 `F/S` 倍率与开关区域，让倍率滑条、当前值与 `S/F ON/OFF` 控件形成稳定的一组
- 补齐 Web 浏览器截图运行时，生成新的 Web/QML 预览图，并更新当天 session report、aggregate 索引、验证结果和下游同步准备

这轮工作的核心不是单点样式 tweak，而是围绕一个新的硬件面板布局目标，对 retained 结构、QML/Web 生成器、设计映射和视觉验证链路做一次成组收口。

## 2. 证据范围

本报告对应 2026-04-22 当天在当前工作区完成的一组连续修改，核心范围包括：

- `src/hmi_dsl/ui.structure.yaml`
- `src/hmi_dsl/design.import.yaml`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`
- `tools/hmi_dsl/generators/web.py`
- `tests/test_pipeline.py`
- `CHANGELOG.md`
- `submodules/metanc_hmi_dsl_reports/2026-04-22-codex-session/*`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-22-codex-session.md`

## 3. 本轮处理前的主要问题

### 3.1 软面板布局仍然继承了上一轮的大分组与标题条逻辑

用户这轮反馈已经不再是“微调一点间距”。
新的要求很明确：

- 参考 `.pics/panel-01.png` 的简约布局
- 允许保留一些空白，但整体需要协调
- Web/QML 要一起处理

这说明原来那版 soft panel 的大标题条、松散分组和相对宽大的按钮比例，不再适合作为继续微调的基础。

### 3.2 运动区的交互语义需要重新组织，而不是继续保留旧的 `Axis / Coord / Jog / Increment` 分裂结构

用户随后把目标进一步压缩成非常具体的面板语义：

- 所有按钮字号再缩小一点
- 按钮高度压到最大约 `30px`
- `XYZAC + RAPID` 那块改成 12 宫格：
  - 第一排 `X / Y / Z`
  - 第二排 `4th Axis / 5th Axis / 6th Axis`
  - 第三排 `- / ~ / +`
  - 第四排 `0.1 / 0.01 / 0.001`
- 模式切换和 `WCS/MCS` 放到一组

这意味着 retained layout 本身就需要重组，不能只在生成器里通过 CSS/QML 做视觉伪装。

### 3.3 `F/S` 倍率和开关区仍然不协调

用户明确指出：

- 当前 `F/S` 倍率及开关部分“不协调”

真实问题是旧结构里倍率区和开关按钮区是为较高按钮和较宽列比例设计的，压缩到新面板密度后：

- 滑条、数值、`S/F ON/OFF` 会互相抢空间
- 旧标题条会进一步加重纵向拥挤

### 3.4 Web 截图链路还缺本机运行时

QML 离屏截图在本机已经稳定，但 Web 这边要做最终视觉确认时，最初环境还缺：

- Chromium 运行库
- Playwright 本地运行时目录

因此这轮除了代码本身，还要把 Web 浏览器截图链路真正跑通，才能给用户新的 Web 预览图。

## 4. 方案与实现

### 4.1 先从 retained YAML 重新定义软面板分组，而不是只改样式

这轮先回到 `src/hmi_dsl/ui.structure.yaml` 做结构重排：

- `ops_primary_row`
  - 保留急停和 cycle/safety 主按钮，但把按钮文案缩成 `RST / STOP / START / SBLK`
- `ops_motion_row`
  - 改成单个 `ops_motion_grid_cluster`
  - 统一做成 `3x4` 的 12 宫格
  - 第二排把 `A / C` 改成 `4TH / 5TH`
  - 增加 `6TH` 作为保留位按钮
  - `RAPID` 改成 `~`
  - 底排改成 `0.1 / 0.01 / 0.001`
- `ops_selection_row`
  - 改成 `ops_mode_coord_cluster`
  - 把 `JOG / MDI / AUTO` 和 `WCS / MCS` 放进同一组
- `ops_command_row`
  - 文案缩成 `HOLD / RLINE / COOL / DIAG`
- `ops_override_row`
  - 倍率滑条标签缩成 `SPINDLE / FEED`
  - 开关区改成单个 `ops_override_control_cluster`
  - 文案缩成 `S ON / S OFF / F ON / F OFF`
- `ops_blank_row`
  - 新增底部空白按钮组，作为保留区和视觉收尾

这一步同时更新了 `design.import.yaml`，把仍然指向旧节点 `ops_axis_cluster / ops_mode_cluster` 的导入映射切到新的 `ops_motion_grid_cluster / ops_mode_coord_cluster`，避免 retained validation 断链。

### 4.2 QML 生成器改成“无标题条 + 细分隔线 + 小按钮”的新面板语言

在 `qml_widget_emitters.py` 里，这轮不是只改几个字号，而是把 operations panel 的内部生成规则也改了：

- `ops_*_row` 不再渲染浅色标题条
- 改成在部分 row 顶部插入 `1px` 分隔线
- 新的 panel 子组：
  - `ops_motion_grid_cluster`
  - `ops_mode_coord_cluster`
  - `ops_override_control_cluster`
  - `ops_blank_cluster`
- 对 soft-panel 按钮统一压缩：
  - 高度约 `30`
  - 圆角减小
  - 顶部 accent strip 更细
  - 字号按 `运动区 / 模式区 / 命令区 / 空白区` 再做细分
- `F/S` 倍率条同步压缩：
  - label 和刻度字号减小
  - value 变得更紧凑
  - footer 行对 override gauge 隐藏

这样 QML 端不再带着上一轮的“浅色标题条 + 较高按钮 + 高倍率区 footer”视觉遗留。

### 4.3 Web 生成器同步成同一套结构和视觉节奏

在 `web.py` 里，对应 CSS 也一起切换到新模型：

- `ops_motion_row / ops_selection_row / ops_command_row / ops_override_row / ops_blank_row`
  - 去掉标题条依赖
  - 部分 row 改成 `border-top + padding-top` 的细分隔线
- `ops_motion_grid_cluster`
  - 固定为 `3x4` 紧凑网格
- `ops_mode_coord_cluster`
  - 用更窄列宽承接模式和 `WCS/MCS`
- `ops_override_control_cluster`
  - 紧凑 `2x2` 布局
- `ops_blank_cluster`
  - 4 个底部保留位按钮
- 所有 operations button
  - `min-height` 压到 `30px`
  - padding 和字号同步缩小
- override 线性滑条
  - 高度、thumb、数值字号、footer 行都同步压缩

这保证 Web 不只是“结构上兼容 retained 变化”，而是视觉密度也真正和 QML 对齐。

### 4.4 测试和生成断言按新结构一起更新

由于这轮软面板结构已经从旧节点命名和旧标题条机制切到了新模型，`tests/test_pipeline.py` 里的断言也一起改了：

- Web 断言从旧的 `.node-ops_primary_row > .widget-title` 切换到：
  - `.node-ops_motion_grid_cluster`
  - `.node-ops_blank_cluster`
  - `.linear-gauge-footer { display: none; }`
- QML 断言从旧标题文案切换到：
  - `implicitHeight: 1`
  - `containerContent_ops_motion_grid_cluster`
  - `containerContent_ops_mode_coord_cluster`
  - `containerContent_ops_override_control_cluster`
  - `SPINDLE / FEED`

这样回归覆盖跟着新的软面板 contract 一起更新，而不是继续锁定旧结构。

### 4.5 Web 浏览器截图运行时补齐后，再补一次真正的 Web 预览

这轮一开始只有 QML 离屏图。
当用户要求补 Web 截图时，先确认了本机缺少：

- `libnspr4`
- `libnss3`
- `libasound`
- Playwright 本地运行时目录

用户安装完成后，这轮又做了两步确认：

- 检查 Playwright 模块和 Chromium 可执行文件存在
- 检查 `ldd` 输出中关键依赖都能解析

随后：

- 先在沙箱内尝试 `node tests/web_snapshot_runner.js ...`
- 由于 Chromium 在当前沙箱约束下直接退出，再把同一条本地截图命令切到沙箱外执行
- 最终成功生成新的 Web 预览图

这样这轮不再只有 QML 图，而是两端都有新的视觉资产可供比对。

## 5. 验证结果

### 5.1 retained 和生成器基础校验

已执行：

- `python3 -m py_compile tools/hmi_dsl/generators/qml_widget_emitters.py tools/hmi_dsl/generators/web.py tools/hmi_dsl/generators/qml.py`
- `python3 -m tools.hmi_dsl validate src/hmi_dsl/product.manifest.yaml`

结果：

- Python 生成器模块语法正常
- retained package 校验通过

### 5.2 产物重生与 QML 构建

已执行：

- `./tools/generate_targets.sh`

结果：

- Web 产物已刷新
- QML 工程与 `generated/qml-final/appCNC_HMI_DSL` 已重建
- docs portal 与 reports HTML 已一起重建

### 5.3 软面板相关最小回归

已执行：

- `python3 -m unittest -v tests.test_generator_refactor tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store`

结果：

- `4` 个测试全部通过

### 5.4 QML 预览验证

已执行：

- `env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/hmi_soft_panel_preview_v2.png HMI_QML_SNAPSHOT_DELAY_MS=500 ./generated/qml-final/appCNC_HMI_DSL`

结果：

- QML 侧新的 12 宫格运动区已正确显示
- 模式/坐标系合组已落到同一块
- `F/S` 倍率区和底部空白按钮组已按新布局生成

### 5.5 Web 浏览器截图验证

已执行：

- `env HMI_WEB_PLAYWRIGHT_ROOT=/tmp/hmi_web_snapshot_tooling HMI_WEB_CHROMIUM_EXECUTABLE=/home/iaar/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome node tests/web_snapshot_runner.js generated/web/index.html /tmp/hmi_soft_panel_web_preview_v2.png`

结果：

- Web 浏览器截图链路已打通
- 新的 Web soft-panel 预览图已成功输出

## 6. 交付状态

本轮结束时，当前仓库已具备以下状态：

- retained soft-panel 结构已经切换到新的简约分组模型
- QML/Web 两端软面板已经共用新的 12 宫格、模式/坐标系合组、紧凑倍率区和底部留白区
- design import 映射已跟随新的 retained 节点重定向
- 回归断言已切到新 contract
- Web/QML 新预览图都已生成
- 今日 session report、aggregate 索引和 user-history 已补齐

接下来的交付动作就是：

- 更新 `CHANGELOG.md`
- 提交 reports submodule
- 提交主仓库并推送
- 导出同步到 `MetaNC/nrt/hmi`
- 在 `MetaNC` 的 `feat/hmi` 上使用同一条提交信息提交并推送
