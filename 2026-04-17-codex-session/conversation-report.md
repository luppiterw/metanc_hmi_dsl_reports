# Conversation Report

## 1. 记录原则

本文件记录的是摘要化过程和工程推进脉络。
它不包含模型内部原始思维链，而是保留对后续阅读最有价值的背景、实施顺序、关键决策和验证范围。

本报告对应的时间边界是 2026-04-17 当天，从 `MetaNC/nrt/hmi` 同步问题的整理开始，到 Web/QML 大布局重构、基线更新和下游验证收尾结束的连续一组工作。

## 2. 阶段时间线

### 阶段 A: 盘点旧导出实现与新目录结构

起点是同步问题：原有 `tools/export_to_metanc.sh` 仍把 HMI 内容视为 `MetaNC/` 根目录，而真实下游已经迁到 `MetaNC/nrt/hmi/`。

实际动作:

- 检查当前仓库中的导出脚本
- 读取真实 `MetaNC` 目录结构
- 确认 `nrt/hmi` 已经是完整包目录

结果:

- 同步逻辑必须从“根目录拷贝”升级为“包目录同步”

### 阶段 B: 先比对，再决定谁是权威源

在动手改脚本之前，先比对当前仓库与 `MetaNC/nrt/hmi` 的关键实现，而不是默认当前仓库一定更新。

实际动作:

- 对比 `tools/`、`tests/`、`docs/`
- 对比生成器输出和快照

关键发现:

- 下游目录里已经存在比当前仓库更完整的部分生成器实现
- 如果不先回流这些差异，当前仓库一旦导出，反而会把下游修复覆盖回旧版本

### 阶段 C: 修复同步链路与内容根识别

这一阶段的目标是让当前仓库先成为可靠源头，再向下游导出。

实际动作:

- 修复 `export_to_metanc.sh`
- 增加 `import_from_metanc.sh`
- 为 docs portal / story docs 增加内容根识别
- 让测试与构建脚本在包根执行

结果:

- `metanc_hmi_dsl`
- `MetaNC/nrt/hmi`

这两个目录都可以被一致地看作 HMI 包根

### 阶段 D: 双目录验证与报告基础落盘

在同步边界和生成器回流完成后，执行两层验证：

- 当前仓库根
- 模拟和真实的 `MetaNC/nrt/hmi`

实际动作:

- 跑 pipeline / docs / story docs 测试
- 跑 `./tools/generate_targets.sh`
- 对比源码级生成物
- 生成 2026-04-17 当天的初版 session report

结果:

- 同步链路被稳定下来
- report 初版建立

### 阶段 E: 需求转向大布局重构

随后用户明确提出新的重点：需要对 QML/Web 布局做一次大的调整。

这意味着工作重点从“同步安全”切换为“结构性布局重构”，但不能打破刚刚建立的同步边界。

关键决策:

- 不直接进入局部 CSS/QML 小修
- 先把布局方向冻结，再进入代码改造

### 阶段 F: 启动 superpowers 流程并固化目标方向

这一步不直接改生成器，而是先建立显式的 superpowers 资产：

- 布局 overhaul spec
- 布局 overhaul plan
- current vs target 结构图

用户接受的统一方向是：

- 保留 `顶部栏 + 中间舞台 + 底部栏`
- 右侧 docked ops drawer
- 优先 `overview` / `program`
- 桌面固定舞台优先，小窗口退化
- 工业高密、操作区分明确

结果:

- 这次大改不再是口头描述，而是有规格、计划和图示的可执行设计输入

### 阶段 G: 第一轮壳层重构

先改壳层，不碰 retained YAML。

Web:

- header / runtime-notice / page-stage / footer rail 重组
- `ops panel` 变成独立的右侧 docked drawer 区

QML:

- masthead 宽度钳制
- 固定主舞台 + 右侧 drawer
- footer rail 对齐 Web

结果:

- 两边先共享一个新的壳层骨架

### 阶段 H: overview / program 第一轮比例收敛

壳层稳定后，再做 page-level 比例：

- `overview` 左右主区比例
- `overview` 下半区运动/统计比例
- `program` editor/browser 的高度链
- `program` summary / body / footer 的分层

关键决策:

- 仍然优先通过 generator shell/layout hints 实现
- 在这一轮不改 `ui.structure.yaml`

### 阶段 I: 刷新基线与全量回归

结构改完后，旧 snapshots 已经不再成立，因此立即执行基线更新。

已更新:

- Web text snapshots
- QML text snapshots
- QML 离屏图基线

未更新:

- Web 浏览器截图基线

原因:

- 本机缺 Playwright 与 Web runtime libs

最终验证:

- `HMI_ENABLE_QML_VISUAL_SNAPSHOT=1 python3 -m unittest -v tests.test_pipeline`
- 结果通过，只有 Web 浏览器图基线测试按环境条件跳过

## 3. 关键决策记录

### 先稳住同步边界，再做大重构

如果同步边界没收稳就直接做大布局改造，后续导出到 `MetaNC` 时会混淆“布局差异”和“同步链路问题”。

### 布局大改必须先冻结方向

这次没有让生成器直接进入无约束重写，而是先建立 spec / plan / diagram 三件套。这样 Web/QML 改动能围绕同一目标推进，而不是两边各改各的。

### retained YAML 第一轮不动

优先通过 generator shell、runtime shell 和 layout hints 完成壳层与页面比例收敛。只有当 generator 侧明显表达不了新结构时，才需要回头改 retained YAML。

### 基线更新不是收尾琐事，而是这轮交付的一部分

既然这是结构性布局调整，那么 text snapshots 和 QML 离屏图必须一起更新，否则测试只能持续报告已经接受的旧差异。

## 4. 未处理事项

- Web 浏览器截图基线仍未更新，受限于本机缺少 Playwright/runtime 依赖
- `overview` / `program` 目前只完成了第一轮比例收敛，后续还可以继续细调视觉层级和交互密度
- 如果本轮结果要进入 `MetaNC` 历史提交，仍需要在下游仓库做最终同步提交
