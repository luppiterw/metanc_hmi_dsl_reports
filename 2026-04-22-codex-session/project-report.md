# Project Report

## 1. 报告目标

本报告总结 2026-04-22 这轮工作的八个连续主题：

- 参考新的简约面板图，把共享软操作面板从“延续旧分组再微调”切换成“按新结构重排”
- 将软面板按钮整体收紧到更小字号和约 `30px` 高度，并让留白和分隔关系更协调
- 把 `XYZAC + RAPID` 那一块改成新的 `3x4` 运动 12 宫格，同时合并模式/坐标系切换区
- 重新整理 `F/S` 倍率与开关区域，让倍率滑条、当前值与 `S/F ON/OFF` 控件形成稳定的一组
- 在首轮极简布局完成后，再按用户的第二轮约束把按钮统一到 `40x40`、把 `JOG/WCS` 移到运动区右侧、把 `F/S` 上移、把底部留白并入指令区，并重做急停造型
- 在第二轮之后，再做第三轮 shared-alignment 收口：顶部保留 `急停 + 4` 个主控按钮、空白保留键恢复正常按钮底色、各组之间插入稳定分割线，并让整块 operations deck 在软面板中水平/垂直居中
- 试装左上角 `MetaNC` 品牌图，对比方图和 `2:1` 横图在 masthead 里的可用性，并把结果收成一个内部 `text/logo` 开关，而不是直接替换默认交付外观
- 补齐 Web 浏览器截图运行时，生成新的 Web/QML 预览图，并更新当天 session report、aggregate 索引、验证结果和下游同步准备

这轮工作的核心不是单点样式 tweak，而是围绕一个新的硬件面板布局目标，对 retained 结构、QML/Web 生成器、设计映射和视觉验证链路做一次成组收口。

## 2. 证据范围

本报告对应 2026-04-22 当天在当前工作区完成的一组连续修改，核心范围包括：

- `src/hmi_dsl/ui.structure.yaml`
- `src/hmi_dsl/design.import.yaml`
- `docs/development_guidelines/tooling.md`
- `tools/generate_targets.sh`
- `tools/hmi_dsl/generators/common.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/generators/qml_support_files.py`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/web_app_shell.py`
- `tools/hmi_dsl/generators/web_shell.py`
- `tools/hmi_dsl/generators/web_widget_emitters.py`
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

### 3.5 首轮极简布局之后，软面板还没有完全达到用户要的硬件感比例

在首轮 `3x4` 运动区和极简分隔线版落地后，用户继续把目标收紧为更明确的硬件面板约束：

- 所有常规按钮统一 `40x40`
- 圆角统一 `2`
- `Reset/CycleStart/CycleStop/SingleBlock` 高度 `40`，宽度按内容放宽
- 急停改成更合适的纯圆按钮，高度约 `60`
- 去掉急停外层黄色背景，只保留圆内实体
- `JOG/WCS` 从运动区下方移动到 `XYZ` 右侧
- `F/S` 从下方再上移一组
- 底部留白按钮并入 `HOLD/RLINE/COOL/DIAG`

这说明第一轮 soft-panel redesign 已经完成“结构重排”，但还没有完成“比例与排布收口”。

### 3.6 左上角品牌替换需要保留探索空间，但不能直接破坏默认交付外观

在软面板这条主线收稳后，用户又要求尝试把左上角的 `MetaNC` 文本替换成 `.pics/MetaNC-ChatGPT-金橙风格-透明背景*.png`。

这里实际有两个约束同时成立：

- 需要保留 logo 方案的实现，方便后续继续试装和快速切换
- 但当前默认交付结果仍应保持原来的 `MetaNC` 文字，而不是把 logo 试装直接变成默认外观

这意味着实现目标不是“直接改成 logo”，而是“保留 logo path + 增加内部开关 + 默认仍走 text”。

### 3.7 第二轮 `40x40` 版之后，软面板仍缺最后一轮对齐和居中收口

在第二轮收口完成后，用户继续提出更偏向面板几何关系的要求：

- 顶部 reset 行只保留急停和 4 个主控按钮
- `RESET / 轴 / F/S / 其他` 各组之间都要有更舒服的分割线
- 空白保留按钮底色不能继续和面板背景融在一起
- 整个 soft panel 的内容区域要在面板内水平、垂直居中

这说明问题已经不再是单个按钮尺寸，而是整个 operations deck 作为一块共享区域的总宽度、分组边界和上下留白分配。

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

### 4.4 第二轮把软面板进一步收成 `40x40` 硬件按钮节奏

在用户继续给出第二轮具体尺寸和排布要求后，这轮没有仅靠 CSS/QML 再做一次视觉偏移，而是继续把 retained 结构与两端布局规则一起收口：

- `ui.structure.yaml`
  - 删除独立的 `ops_selection_row`
  - 把 `ops_mode_coord_cluster` 直接并入 `ops_motion_row`
  - 把 `ops_override_row` 保持在运动区正下方
  - 删除独立的 `ops_blank_row`
  - 把 4 个空白保留按钮并入 `ops_command_row`，形成 `4x2` 命令+预留网格
- `qml_widget_emitters.py`
  - operations button 默认高度从首轮的约 `30` 改为 `40`
  - operations button 圆角统一为 `2`
  - `ops_reset / ops_cycle_stop / ops_cycle_start / ops_single_block` 切到更宽的非正方按钮尺寸
  - `ops_feed_hold / ops_restart_line / ops_coolant_toggle / ops_open_diag`、空白保留键、模式键、运动键和倍率开关键统一成 `40x40`
  - 急停从“黄底红心”的视觉结构改成更紧凑的纯红圆形按钮，外层约 `56-60px`
- `web.py`
  - 对应 CSS 网格同步改成：
    - `ops_primary_row`: `60px + cycle cluster`
    - `ops_motion_row`: `motion grid + mode/coord cluster`
    - `ops_override_row`: `override gauges + 2x2 control`
    - `ops_command_row`: `repeat(4, 40px)` 的 `4x2` 网格
  - 急停样式改成纯红圆形按钮，不再有黄色外环背景

这一步完成后，panel 才真正从“极简版原型”收成“尺寸规则统一、层级顺序稳定、接近硬件面板”的版本。

### 4.5 第三轮再把软面板收成共享 `48px` 栅格和居中 deck

用户最后一轮要求更强调几何对齐关系，因此这一步继续同时修改 retained 结构和两端 emitter：

- `ui.structure.yaml`
  - 删除顶部额外空白占位，只保留 `emergency_stop + ops_cycle_cluster`
  - 顶部主控键固定为 4 个：`RST / START / STOP / SBLK`
- `qml_widget_emitters.py`
  - 顶部主控键改成按行宽动态分配的更宽按钮，而不是继续固定 `48x48`
  - 空白保留按钮恢复为正常按钮不透明底色
  - `hardware_console_zone` 自身加入上下弹性占位，让整块内容在软面板内垂直居中
  - 各 row 容器继续锁到同一总宽度，保证顶部、运动区、倍率区和底部命令区共享左右边界
- `qml.py`
  - 让 auxiliary content 至少占满 `Flickable` 高度，并允许内部 loader 拉伸，这样居中逻辑不会因为内容高度偏小而失效
- `web.py`
  - `aux-panel-shell` 改成 flex 容器
  - `node-hardware_console_zone` 改成垂直居中布局
  - 顶部主控行保留 `急停 + 4` 键
  - cycle cluster 改成共享宽度的 4 列动态按钮
  - 空白按钮恢复普通按钮底色
  - 组间分割线保留，并把上下留白重新拉均衡
- `web_app_shell.py` / `web_widget_emitters.py`
  - 保持无标题条 panel 和空白按钮真实按钮渲染，不再让 reserve 位视觉上消失在背景里

这一步的结果是：soft panel 不再只是“分组正确”，而是整块内容作为一个 deck 在 panel 区域里稳定居中，视觉边界更像一块完成收口的硬件控制面。

### 4.6 测试和生成断言按新结构一起更新

由于这轮软面板结构已经从旧节点命名和旧标题条机制切到了新模型，`tests/test_pipeline.py` 里的断言也一起改了：

- Web 断言从旧的 `.node-ops_primary_row > .widget-title` 切换到：
  - `.node-ops_motion_grid_cluster`
  - `ops_command_row` 的 `repeat(4, 40px)` 网格
  - `.linear-gauge-footer { display: none; }`
- QML 断言从旧标题文案切换到：
  - `implicitHeight: 1`
  - `containerContent_ops_motion_grid_cluster`
  - `containerContent_ops_mode_coord_cluster`
  - `containerContent_ops_override_control_cluster`
  - `SPINDLE / FEED`

这样回归覆盖跟着新的软面板 contract 一起更新，而不是继续锁定旧结构。

### 4.7 Web 浏览器截图运行时补齐后，再补一次真正的 Web 预览

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

### 4.8 品牌图试装最后收成了内部 masthead brand switch，而不是强制改默认外观

在软面板主体收口之后，这轮又处理了左上角 masthead 品牌位：

- 先把用户给的 `.pics/MetaNC-ChatGPT-金橙风格-透明背景.png` 整理成生成器内部可复用资产
- 尝试把左上角 `MetaNC` 文本改成图片渲染
- 继续试装 `.pics/MetaNC-ChatGPT-金橙风格-透明背景-2比1.png`
- 对比后确认 `2:1` 横图比方图更适合 masthead 品牌位

但最终并没有把 logo 直接定成默认交付，而是把实现收成：

- `tools/hmi_dsl/generators/common.py`
  - 新增内部常量 `MASTHEAD_BRAND_MODE`
  - 可选值：
    - `"text"`
    - `"logo"`
  - 当前默认值是 `"text"`
- `web_shell.py` / `web.py`
  - 当模式是 `"text"` 时，继续输出原来的 `MetaNC` 文本头部
  - 当模式是 `"logo"` 时，才渲染品牌图片和对应的 masthead 样式
- `qml.py`
  - 同样按同一内部开关在文本头部和 logo 头部之间切换
- `qml_support_files.py`
  - 保留 logo 资源进入 QML 资源模块，保证切换到 `"logo"` 时不需要再补打包逻辑
- `generate_targets.sh`
  - 同步把 `generated/web/assets/` 拷到 `generated/distribution/web/assets/`
  - 避免 packaged Web 在 logo 模式下丢资源
- `tests/test_pipeline.py`
  - 增加对 `assets/metanc_brand_gold.png` 输出存在性的校验

这一步的关键结果是：

- logo 方案已经实现并留在仓库里
- 默认快照、默认最终产物和默认交付外观仍保持原来的 `MetaNC` 文本
- 后续 agent 只需要搜 `MASTHEAD_BRAND_MODE` 或查开发文档，就能快速切换和继续试装

同时，这个内部开关和打包注意事项已经写进：

- `docs/development_guidelines/tooling.md`

这样后续不需要再从 session report 倒推这套机制藏在哪里。

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

- `env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/hmi_soft_panel_preview_v3.png HMI_QML_SNAPSHOT_DELAY_MS=800 ./generated/qml-final/appCNC_HMI_DSL`

结果：

- QML 侧新的 `40x40` 软面板按钮已正确显示
- `JOG/WCS` 已移动到运动区右侧
- `F/S` 倍率区已上移到新位置
- 指令键和底部留白键已合并为统一网格
- 急停已切到纯红圆形外观

在第三轮对齐/居中收口后，又补抓了：

- `/tmp/hmi_soft_panel_qml_current_v3.png`

结果补充为：

- 顶部仅保留 `急停 + 4` 个主控按钮
- 各组之间的分割线已稳定存在
- 空白保留按钮恢复正常按钮底色
- 整块 soft-panel 内容在 QML 侧已按面板区域做上下/左右居中收口

### 5.5 Web 浏览器截图验证

已执行：

- `env HMI_WEB_PLAYWRIGHT_ROOT=/tmp/hmi_web_snapshot_tooling HMI_WEB_CHROMIUM_EXECUTABLE=/home/iaar/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome node tests/web_snapshot_runner.js generated/web/index.html /tmp/hmi_soft_panel_web_preview_v3.png`

结果：

- Web 浏览器截图链路已打通
- 新的 Web soft-panel 最终收口版预览图已成功输出

在第三轮收口后，又补抓了：

- `/tmp/hmi_soft_panel_web_current_v3.png`

结果补充为：

- 顶部主控行已缩成 `急停 + 4` 个动态宽度按钮
- reserve 按钮不再和 panel 背景混色
- 整块 operations deck 在 Web 侧也按共享居中布局显示

### 5.6 恢复默认文本 masthead 后，快照回归仍保持通过

已执行：

- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store`

结果：

- 默认生成结果已经回到原来的 `MetaNC` 文本 masthead
- Web/QML 文本快照仍通过
- logo 资源输出存在性校验通过
- `text/logo` 开关逻辑没有破坏现有默认产物

## 6. 交付状态

本轮结束时，当前仓库已具备以下状态：

- retained soft-panel 结构已经切换到新的简约分组模型
- QML/Web 两端软面板已经共用新的 12 宫格、右侧模式/坐标系合组、上移的紧凑倍率区，以及合并后的底部命令/留白网格
- design import 映射已跟随新的 retained 节点重定向
- 回归断言已切到新 contract
- Web/QML 新预览图都已生成
- 第二轮 `40x40` 尺寸和急停收口已完成
- 第三轮 `48px` 共享栅格、顶部 `急停 + 4` 主控行、分割线、空白按钮底色恢复和 panel 内居中收口已完成
- masthead logo 方案已保留为内部可切换实现，但默认交付外观仍是原来的 `MetaNC` 文本
- `text/logo` 内部开关位置、打包行为和回归命令已写入开发文档，后续 agent 可以直接从 `tooling.md` 或 `MASTHEAD_BRAND_MODE` 入口继续修改
- 今日 session report、aggregate 索引和 user-history 已补齐

接下来的交付动作就是：

- 更新 `CHANGELOG.md`
- 提交 reports submodule
- 提交主仓库并推送
- 导出同步到 `MetaNC/nrt/hmi`
- 在 `MetaNC` 的 `feat/hmi` 上使用同一条提交信息提交并推送
