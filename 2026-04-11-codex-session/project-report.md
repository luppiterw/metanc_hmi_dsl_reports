# Project Report

## 1. 报告目标

本报告总结 2026-04-11 这轮工作中，如何参考 `.docs/CNC_HMI_AI对话规格说明书_V1.0.docx`，把当前仓库里的 June demo 和 Web/QML 生成产物从“局部 840D 风格演示”重做为“更贴近通用 CNC HMI 文档模型”的界面实现。

这次工作的目标不是在现有外观上做小修，而是完成以下四件事:

- 按文档重组示例 DSL 的页面、字段和动作
- 让 Web/QML 生成器外壳从 sidebar prototype 切换到 CNC HMI 式状态栏布局
- 把 mock runtime 扩展到真正驱动坐标切换、JOG、AUTO、程序、报警、参数等动作
- 同步刷新产物、快照、分发目录和今日报告

## 2. 文档驱动范围

从 `.docs` 提取的规格重点包括:

- 全局常驻顶部状态栏
- 8 个核心页面域: `POS / PROG / AUTO / JOG / OFS / ALM / DGN / PAR`
- 统一 mock/runtime 接口分层
- 深色 shop-floor 主题、轴颜色、等宽数值、报警高亮
- 坐标系切换、程序装载/保存、AUTO 控制、JOG 移轴、报警确认、参数修改等核心动作

基于这个范围，本轮选择把原来分散的 demo 页面压成文档语义明确的 8 页，并保留 `page_overview` 上的若干旧 node id，以兼容现有设计导入映射和相关测试。

## 3. 重构前的主要差距

### 3.1 示例 DSL 仍偏向局部 840D 画面复刻

之前的页面集合主要是:

- `Machine`
- `Program Manager`
- `Offset`
- `Alarm`
- `Menu Select`
- `Custom`

这与文档中的 POS / PROG / AUTO / JOG / OFS / ALM / DGN / PAR 分层并不一致。

### 3.2 生成器外壳仍是侧栏原型

旧 Web/QML shell 以左侧导航栏为主，和文档中“顶部状态栏 + 主内容区 + 底部软键区”的 HMI 结构不一致。

### 3.3 运行时命令只覆盖少量 demo 交互

旧 runtime 主要支持:

- 开页
- 软键聚焦
- 选轴
- 简单 start/pause/stop
- 报警确认

这不足以支撑文档要求的程序管理、坐标系切换、JOG、AUTO、参数和权限相关动作。

## 4. 本次主要处理动作

### 4.1 重构示例 UI 结构和接口契约

更新:

- `examples/june-demo/ui.structure.yaml`
- `examples/june-demo/interfaces.machine.yaml`

处理结果:

- 页面重组为 `POS / PROG / AUTO / JOG / OFS / ALM / DGN / PAR`
- `PROG` 页面同时覆盖编辑和目录管理
- 保留 `page_overview.masthead_bar`、`context_strip`、`machine_position_panel` 等关键 ref，避免设计导入链路断裂
- 接口契约切换为文档语义字段，如 `sys.time`、`mode.current`、`prog.name`、`alarm.active`、`param.table`
- 新增坐标显示层字段 `display.axis.*`，让 POS 页坐标系切换真正改变数值而不是只改按钮状态

### 4.2 重做默认主题方向

更新:

- `examples/june-demo/style.theme.yaml`

处理结果:

- 默认主题改成更接近文档规范的深色工控风格
- 轴颜色与文档中 X/Y/Z 的语义色保持一致
- 数值类字体切换为 `Roboto Mono / Courier New` 风格组合
- 保留多主题结构和既有 theme id，避免周边工具链和测试大范围断裂

### 4.3 扩展 mock runtime 种子和数据模型

更新:

- `tools/hmi_dsl/runtime_plan.py`

处理结果:

- mock 属性覆盖页面所需的核心数值、表格、报警、参数、IO、伺服数据
- 补齐 `progdir.list`、`tool.table`、`wcs.table`、`alarm.history`、`diagnostics.*`、`param.table`
- 新的 runtime seed 直接服务于 Web/QML 生成目标，而不是只对旧 overview demo 生效

### 4.4 重写 Web 生成目标外壳与行为层

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- 去掉旧 sidebar shell，改为:
  - 顶部全局状态栏
  - 横向页面导航条
  - 页面标题区
  - 主内容舞台
  - 报警 / 急停叠加层
- 新增通用 `data_table` 渲染
- POS 页 metric card 支持轴颜色和负值高亮
- footer softkey 支持 `F1~F8` 键盘快捷触发
- Web mock runtime 现在可处理:
  - 坐标系切换与相对坐标清零
  - 程序保存 / 另存为 / 查找 / 跳转 / 装载 / 传输
  - AUTO 启动 / 保持 / 复位 / 指定行重启
  - JOG 移轴和模式切换
  - 主轴 / 冷却液控制
  - 刀补 / 工件坐标系 / 报警 / 参数 / 权限切换

### 4.5 重写 QML 生成目标外壳与行为层

更新:

- `tools/hmi_dsl/generators/qml.py`

处理结果:

- QML shell 与 Web 保持同一套信息架构，而不是各做一套演示壳
- 新增 QML `data_table` 节点生成
- 修复多处生成期 / 运行期问题:
  - QML 字符串换行未转义
  - `data_table` 表头模板多余闭合符
  - `Repeater` delegate 中 `index` 作用域缺失
- `RuntimeStore.qml` 与 Web runtime 保持一致的命令语义和数据派生逻辑

### 4.6 二次压缩顶部 chrome 并恢复整页缩放

在第一轮文档对齐重构完成后，又根据最新反馈继续处理了 target-side layout:

- 顶部 status / nav / page meta 区继续压缩高度
- QML 重新启用 top-aligned stage-fit 缩放，确保 overview 页默认一屏可见
- Web 恢复对应的 `page-fit-shell` / `page-scale-frame` 缩放逻辑
- Web footer softkey 栅格从错误的 5 列强制改回 8 列
- QML 的拨盘、急停按钮、按键矩阵尺寸进一步收紧，避免底部硬件区被截断

### 4.7 按新要求重排壳层信息架构

基于后续反馈，又继续做了三项结构调整:

- 页面切换导航改为全局底部菜单
- 当前页名称并入顶部标题栏，不再单独占一整条页面标题区
- `hardware_console_zone` 从 overview 主体中剥离，改为独立可显隐的 operations panel

处理结果:

- 主应用显示区不再因为操作面板占位而被压缩
- overview 主体默认只显示核心业务画面
- 操作面板只有在主动展开时才以 overlay 方式出现
- QML 新视觉基线已经按这一结构刷新

在后续修正中，又把这套 panel 语义从“当前页面是否定义辅助区”改成了“全局共享辅助区”:

- 操作面板统一从 `page_overview.hardware_console_zone` 提升为全局 control deck
- 所有页面都可以显示 / 隐藏同一套操作面板
- Web 与 QML 都采用同一策略，而不是分别保留页级判断

### 4.9 补齐程序页的可操作能力

基于后续反馈，又继续补齐了 `PROG` 页缺失的核心能力:

- 程序目录表现在支持选中当前程序
- 目录行双击可直接打开程序，按钮也可按当前选中项打开
- 编辑器改为真正可编辑，而不再只是只读预览
- `save` / `save as` 会把当前编辑内容写回 mock runtime 内部的程序存储

处理结果:

- Web 目标使用 `textarea` 直接编辑程序文本
- QML 目标使用 `TextArea` 编辑程序文本
- `progdir.selected` 不再只是展示字段，而是由表格选择驱动
- 程序页形成了“选程序 -> 打开 -> 编辑 -> 保存 -> 再打开验证”的完整闭环

### 4.10 将程序页切换到指定根目录模型

基于进一步反馈，又把程序页从“硬编码几条虚拟文件”切换为“指定程序根目录”模式:

- 在 `examples/june-demo/product.manifest.yaml` 中新增 `program_runtime.root_path`
- 在 `examples/june-demo/program-root/` 下放入实际示例程序
- 生成阶段扫描该目录，构造程序列表和初始打开文件
- UI 中增加了 `progdir.root_path` 展示
- 同时补上 `new` / `delete` 程序动作

处理结果:

- 程序页现在的目录列表来自真实规划目录，而不是写死在 runtime 代码里的几条名称
- Web/QML 两侧都围绕同一逻辑根路径工作
- 后续要迁移目录时，只需要改 manifest 中的 `program_runtime.root_path`

随后又继续补齐了 program UX:

- `new` 动作改为先弹出名称输入框
- `delete` 动作改为先弹出确认提示
- 程序目录表增加固定高度和内部滚动，避免目录增长时页面布局跳动

同时，QML 目标又进一步从“更真实的 mock”推进到了“真实文件工作区”:

- generator 现在会生成 `ProgramWorkspaceBackend.cpp/.h`
- QML 最终二进制直接操作打包后的 `program-root` 目录
- 程序目录完整路径在运行时显示为实际解析后的文件系统路径
- 分发目录现在也包含 `generated/distribution/qml/program-root/`

在后续继续修正中，程序页又被重新规划为更接近设备操作流:

- `Program Directory` 与 `G Code Editor` 不再并排挤在一起
- 页面切成 `browser` 与 `editor` 两种视图模式
- 打开 / 新建程序后进入编辑模式
- 返回目录后重新看到完整文件管理区
- 程序目录列宽固定，避免 `name / size / modified / storage` 重叠
- 编辑器改为真正可滚动的编辑区，而不是内容和状态摘要混杂在一个小区域里

在最新一轮处理中，又把程序页进一步从“通用控件拼装”提升为“专用控件”:

- `program_browser` 专门负责当前目录栏、当前项高亮、单击选中、双击打开和键盘上下切换
- `program_editor` 专门负责全宽滚动编辑区和行号区
- 这样程序页不再依赖通用 `data_table` / `code_editor` 的残余行为

### 4.8 同步更新产物、快照、日志和 git 规则

更新:

- `generated/`
- `generated/distribution/`
- `tests/snapshots/web/*.snap`
- `tests/snapshots/qml/*.snap`
- `tests/snapshots/qml/main_window.offscreen.png`
- `.gitignore`
- `CHANGELOG.md`
- `docs/generator-contract.md`

处理结果:

- `.docs/` 被加入 git ignore
- 文本快照与当前产物重新对齐
- QML 离屏截图基线已刷新
- 生成器契约文档补上了本轮壳层 / 表格 / runtime 行为升级

## 5. 实际验证结果

本次在当前工作区中实际执行了:

```bash
python3 -m tools.hmi_dsl validate examples/june-demo/product.manifest.yaml
python3 -m tools.hmi_dsl generate-web examples/june-demo/product.manifest.yaml --output /tmp/hmi_web_check
python3 -m tools.hmi_dsl generate-qml examples/june-demo/product.manifest.yaml --output /tmp/hmi_qml_check
/usr/lib/qt6/bin/qt-cmake -S /tmp/hmi_qml_check -B /tmp/hmi_qml_build_check
cmake --build /tmp/hmi_qml_build_check
./tools/generate_targets.sh
python3 -m unittest tests.test_pipeline
HMI_ENABLE_QML_VISUAL_SNAPSHOT=1 python3 -m unittest tests.test_pipeline.PipelineTests.test_qml_offscreen_snapshot_matches_baseline
```

结果:

- `validate` 返回 `ok=True errors=0 warnings=0`
- `generated/web` 和 `generated/qml` 均可成功重建
- `generated/distribution/` 已刷新
- `tests.test_pipeline` 全量通过
- QML 视觉快照基线测试通过
- 新的 QML 基线截图已确认 overview 页面主体在默认窗口中可完整显示

未执行项:

- Web 浏览器视觉快照未刷新
  原因: 当前环境缺少 `node`、Playwright 和浏览器运行时目录

## 6. 当前已得到的工程收益

这轮重构带来的直接收益包括:

- 示例包不再只是旧版 840D 局部画面组合，而是按文档功能域组织
- Web/QML 两个 target 使用同一套文档化壳层和交互模型
- 默认 overview 页面不再依赖滚动条才能看到底部硬件控制区
- Web footer softkey 区重新按 8 键完整排列，不再发生明显错列
- mock runtime 已足以支撑“动作改变状态”的演示，而不只是静态展示
- 设计导入测试所依赖的关键 overview ref 仍可用
- 文本快照、QML 视觉基线和最终分发目录都已经更新到当前状态

## 7. 当前边界

当前仍有一些明确边界:

- Web 浏览器视觉基线未刷新，因为本机缺少 Playwright/浏览器运行时
- 权限控制目前主要体现在 UI 展示和 mock 数据切换，没有实现完整密码验证流程
- 文档中更细的输入弹层、数值键盘、危险操作确认对话框，目前仍属于下一轮增强项

## 8. 推荐下一步

1. 把参数修改、坐标清零等动作补成真正的确认对话框和输入弹层
2. 将 `auth.level` 真正用于组件可见性和可用性裁剪，而不仅是状态展示
3. 为 Web 目标补齐浏览器视觉快照运行时后，刷新 `main_window.chromium.png`
4. 将通用 `data_table` 进一步扩展为支持排序、选中行、编辑态和分页
5. 将文档中的更多模式约束和刷新策略下沉到 retained DSL 语义层，而不是主要放在 generator runtime 中

## 9. 本次产出清单

- doc-aligned `examples/june-demo` 页面与接口契约
- 重构后的 Web/QML 生成器壳层
- 更完整的 mock runtime 行为
- 刷新的 `generated/` 和 `generated/distribution/`
- 更新后的文本快照和 QML 视觉快照
- 2026-04-11 session report
