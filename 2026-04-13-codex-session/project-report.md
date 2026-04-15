# Project Report

## 1. 报告目标

本报告总结 2026-04-13 这轮工作中，如何继续收敛 June demo 的页面布局、程序页行为和主页运行视图，让 Web 与 QML 两个 target 在程序浏览、打开、编辑、模式执行和右侧操作面板上更接近同一套交互。

这次工作的目标集中在四条线上:

- 重新组织顶部区、主体区和右侧 `ops` 面板，让布局在显示/隐藏右侧面板时真正自适应
- 修正 QML 程序页在切换不同文件时内容不同步的问题
- 修正 Web 程序页“打开无反应”和“编辑时每输入一次就丢焦点”的行为问题
- 打通 `AUTO / MDA / JOG` 与主页运行视图的联动，并让执行中的程序内容和当前块高亮可见

## 2. 证据范围

本报告对应 2026-04-13 当天当前工作区和生成产物中可直接验证的一组改动，核心范围包括:

- `examples/june-demo/ui.structure.yaml`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/runtime_plan.py`
- `tools/generate_targets.sh`
- `tests/snapshots/web/*`
- `tests/snapshots/qml/*`
- `generated/web/*`
- `generated/distribution/run_web.sh`

## 3. 本轮处理前的主要问题

### 3.1 页面布局已经拆出右侧面板，但空间关系仍不稳定

在这轮开始前，右侧操作面板虽然已经从主画布里抽离出来，但整体页面仍存在多处结构性问题。

后果:

- 主页右侧和各页底部仍能看到明显空白
- 隐藏 `ops` 面板后主内容没有自动铺满
- 顶部条和状态提示存在叠压与信息堆叠

### 3.2 操作面板信息密度不对，软面板按钮反而被挤压

操作面板早期改造时保留了过多状态说明块和不必要的文字说明。

后果:

- 急停区旁边堆了很多状态字段
- 真正需要高频操作的软面板按钮区空间不够
- Web 和 QML 两边在视觉上出现“功能有但看起来少”的错觉

### 3.3 程序页行为在 QML 和 Web 两边都存在关键缺陷

QML 侧:

- 切换 `SHAFT_A.MPF` / `SHAFT_B.MPF` / `TOUCH_OFF.SPF` 时，编辑器会一直显示第一份程序内容

Web 侧:

- 启动后会弹出一个空的 confirm/cancel 对话框
- `Open Program`、列表 `Open`、新建程序后切页都不稳定
- 编辑器每输入一次就丢焦点，无法连续编辑

## 4. 本次主要处理动作

### 4.1 重构 retained 布局，让右侧 `ops` panel 真正成为独立区域

更新:

- `examples/june-demo/ui.structure.yaml`

处理结果:

- `Show Ops` 和 `Theme` 统一改为顶部水平布局
- 左上角标题从 `CNC HMI June Demo` 收敛为 `MetaNC + 当前页面名`
- 去掉 `Doc-Aligned CNC HMI` 和 `/pos` 等无效次级文案
- 右侧 `hardware_console_zone` 改为独立 dock，默认展开
- 隐藏 `ops` panel 时主内容回到单栏并铺满可用宽度
- 首页程序预览区改为更大的 `Program Execution Preview`

### 4.2 重新压缩操作面板，突出 840D 风格功能按钮

更新:

- `examples/june-demo/ui.structure.yaml`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`

处理结果:

- 去掉 `MACHINE STATE` 这类纯说明文本区
- 保留并重组急停、模式/Jog、轴选择、驱动控制、周期/主轴/冷却等操作块
- Web 和 QML 两侧都改成扁平化按钮网格，减少层层嵌套
- 目标从“展示很多信息”改成“把一页内高频操作摆齐”

### 4.3 修复 QML 程序页切换文件后内容不刷新

更新:

- `tools/hmi_dsl/generators/qml.py`

处理结果:

- 程序编辑器不再把 `TextArea.text` 直接绑死在初始内容上
- 通用绑定读取链显式依赖 runtime 状态刷新，而不是停留在第一次渲染值
- 行号区改为稳定的纵向结构，不再堆叠在同一行
- 重新打开不同程序时，编辑器能够显示各自真实内容

### 4.4 修复 Web 程序目录打开链路与启动行为

更新:

- `tools/hmi_dsl/generators/web.py`
- `tools/generate_targets.sh`
- `tests/snapshots/web/*.snap`
- `tests/snapshots/qml/*.snap`

处理结果:

- 修正 `.dialog-overlay` 与 `hidden` 的样式冲突，启动时不再弹空对话框
- 新增 `run_web.sh`，并在分发目录中提供一键启动脚本
- `Open Program`、列表行单击、列表内 `Open`、`New Program` 确认后都会显式切到 `page_program + editor`
- `prog.commands.load` / `prog.commands.new` 在 Web runtime 内也会直接写入目标页面状态，减少 UI 层兜底遗漏
- 分发版 `index.html` 对 `styles.css`、`runtime.js`、`app.js` 加了内容指纹参数
- `run_web.sh` 使用 no-cache 本地服务，降低浏览器缓存把旧脚本留在页面里的概率

### 4.5 修复 Web 编辑器输入后立刻丢焦点

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- runtime 的 `writeProperty` / `writeLocalState` 对“值未变化”的写入不再触发全量 `notify`
- 程序编辑器对 `prog.content` 和 `prog.cursor_line` 的输入态更新改为静默写入
- 因此按键输入不再触发整页重建，`textarea` 焦点和光标位置能持续保留

### 4.6 打通 `AUTO / MDA / JOG` 与主页主体区联动

更新:

- `examples/june-demo/ui.structure.yaml`
- `examples/june-demo/interfaces.machine.yaml`
- `tools/hmi_dsl/runtime_plan.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`

处理结果:

- 右侧 `ops` panel 不再只是视觉按钮区，而是开始真实驱动 `AUTO / MDA / JOG`
- `JOG` 支持选轴后做 mock 移动，`RAPID` 走更大步长
- `AUTO` 和 `MDA` 统一通过 `CYCLE START` 触发执行
- 程序页 `Execute` 会先把当前程序切到 `AUTO + MAIN`，再等待 `CYCLE START`
- `RESET`、`FEED STOP/START`、`SPINDLE STOP/START` 都接入了 mock 运行态

### 4.7 修复主页执行预览，让 `AUTO / MDA` 都显示实际程序内容和当前行

更新:

- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`

处理结果:

- 主页右侧 `AUTO` 执行区不再只剩 `N` 行号，而是明确显示“左侧行号 + 右侧具体块内容”
- 预览区会剥离程序行里前导的 `Nxxx`，避免行号重复显示
- `MDA` 执行时不再停留在可编辑态，而是切换到与 `AUTO` 一致的运行预览态
- `AUTO / MDA` 当前执行行都会同时使用字色和背景色强化高亮
- QML 侧补上了 `revision` 依赖，避免 `mdi.state` 切到 `Running` 后预览分支不刷新
- QML 侧预览容器宽度也改成稳定表达式，避免代码列被压缩后只剩行号

## 5. 这次工作的工程收益

本轮处理的工程价值主要在于把“已经能跑”的程序页继续推进到“能用、能验证”的状态:

- 页面布局开始具备主内容区和右侧操作区的真实伸缩关系
- 操作面板从信息堆叠改成接近 840D 风格的功能操作面板
- QML 程序页的文件切换行为与实际文件内容重新对齐
- Web 程序页从“命令大多存在但链路不稳定”提升到“打开、切页、编辑都可连续使用”
- 主页开始具备和模式联动的执行视图，而不是静态状态标签
- `AUTO / MDA` 执行过程中的具体程序块和当前行高亮开始对齐到主视图区
- 分发目录现在同时具备 `run_qml.sh` 和 `run_web.sh` 风格的启动入口

## 6. 验证与回归范围

这轮工作实际执行并通过的验证包括:

```bash
python3 -m tools.hmi_dsl validate examples/june-demo/product.manifest.yaml
python3 -m unittest tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files
python3 -m unittest tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store
python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots
python3 -m unittest tests.test_pipeline.PipelineTests.test_qml_offscreen_snapshot_matches_baseline
python3 -m unittest tests.test_story_docs
./tools/generate_targets.sh
mdbook build reports/2026-04-13-codex-session
```

除此之外，还做了两类当天新增的自检:

- 用 Node VM 直接执行 `generated/web/runtime.js`，确认 `prog.commands.load` 会把 `active_page` 切到 `page_program`，并载入目标程序内容
- 用最小 DOM harness 运行 `generated/web/runtime.js + app.js`，模拟点击 `Open` 与编辑器输入，确认:
  - 点击 `Open` 后状态进入 `editor`
  - 编辑器 DOM 确实出现
  - 输入后 `textarea` 不会被重建，焦点持续保留

## 7. 当前边界

截至 2026-04-13 这轮收尾，仍有几个边界需要保持清楚:

- Web 自测仍主要依赖生成检查、快照和局部运行时自检，不是完整图形浏览器自动化
- 操作面板已经可用，但还不是完整 840D 功能全集
- 程序编辑器目前重点是打开、切换、连续输入和基础执行预览闭环，不包含更深的语法语义能力

## 8. 建议下一步

1. 为 Web 侧补一条真正的浏览器级交互回归，用于覆盖 `AUTO / MDA / Open / Edit` 的页面行为
2. 为右侧 `ops` panel 继续补齐 840D 常用操作组合，并约束按钮分组规则
3. 将程序执行从当前的逐块 mock 推进到更细的暂停/继续/恢复链
4. 为页面布局增加更明确的尺寸策略测试，避免后续又出现“隐藏面板后主区不铺满”的回归
