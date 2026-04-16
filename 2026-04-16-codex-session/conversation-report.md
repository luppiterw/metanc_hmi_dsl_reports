# Conversation Report

## 1. 记录原则

本文件记录的是摘要化过程和工程推进脉络。
它不包含模型内部原始思维链，而是保留对后续阅读最有价值的背景、实施顺序、关键决策和验证范围。

本报告对应的时间边界是 2026-04-16 当天主仓库提交历史中，从会话开始到布局修复落盘的连续一组工作。

## 2. 阶段时间线

### 阶段 A: 系统性审查 QML / Web 运行时不一致

会话从一个宏观问题切入：QML 和 Web 双目标输出的实际运行效果不一致，且整体效果不理想。这不是从单一 bug 报告开始的，而是先做了范围界定。

实际动作:

- 阅读 `qml_runtime_shell.py` 和 `web_runtime_shell.py`，逐函数对比逻辑差异
- 识别出六处语义分歧，按严重程度排列
- 依次修复，每次修复后立刻确认对应 Web 端的参照逻辑

关键决策:

- Bug 1（执行游标）被确认为最关键的行为发散点，优先处理
- 以 Web 运行时为基准，QML 侧向 Web 对齐，而不是反方向
- Bug 2 的死代码虽然不影响运行，但保留会造成维护混淆，一并清理

结果:

- 六处不一致全部对齐，两个目标的执行游标、属性写入、目录同步、文件重命名逻辑统一

### 阶段 B: 诊断并修复动画卡顿

在运行时对齐完成后，用户反馈 mock 运行时坐标轴变化感觉不流畅，整体有点卡顿，并询问是否与 WSL 环境有关。

诊断过程:

- 确认运动时钟间隔为 90ms，约 11fps，远低于感知流畅阈值 30fps
- WSL/WSLg 确实增加显示延迟，但这是环境因素，代码无法干预
- 根本原因是时钟频率不足，可以在代码层修复

关键决策:

- 将时钟从 90ms 改为 30ms（33fps），对 QML 和 Web 同步修改
- 引入 `tickScale = 30.0 / 90.0` 对步长进行等比缩放，保持表观速度不变
- 不改变 execution tick（180ms），因为执行语义与帧率无关

结果:

- 坐标轴数值变化明显更平滑，表观进给速度不变

### 阶段 C: 生成最终产物并提交

运行时修复完成后重新生成双目标产物（QML + Web），确认构建无误，创建本次运行时修复的提交记录。

### 阶段 D: 根因分析 Web 主界面三处布局问题

用户指出 Web 原型主界面存在三个可见问题：左侧显示警报文字、页面有滚动条、顶部显示错乱。

分析过程遵循系统性调试原则，逐层追因:

**问题 1（页头错乱）** → `global-status-bar` 左列 300px 装不下标题 + 主题选择控件（合计约 380px），列内容溢出，导致机器状态条被挤压错位。

**问题 2（滚动条）** → 高度链在多处断裂：
1. `page-shell.is-fixed-stage` 使用 `justify-content: center` 将 `page-root` 居中，但未赋予拉伸高度
2. `display_shell` 作为 CSS Grid 项目填充轨道，但 `screen_workspace` 未继承高度
3. `screen_workspace` 的 `align-items: start` 阻止列元素填充行高
4. 模式面板固定高度 520px 在任何视口下必然溢出

**问题 3（警报文字透出）** → `justify-content: center` 在 `page-root` 两侧留出空白间隙，警报覆层（`position: absolute`）铺满整个 `page-stage`，文字在间隙区域显示。

### 阶段 E: 应用 CSS 修复并验证

基于根因分析，对 `tools/hmi_dsl/generators/web.py` 施加 10 处 CSS 修改：

- 页头三列从固定宽度改为 `auto minmax(0, 1fr) auto`
- 机器状态条加入 `flex-wrap: nowrap; overflow: hidden`
- `is-fixed-stage` 切换为拉伸填充，移除居中
- `page-root` 从 `is-fixed-stage` 获得 `height: 100%; width: 100%`
- `page-root` grid 追加 `grid-template-rows: minmax(0, 1fr)`
- `display_shell` 追加 `min-height: 0`
- `screen_workspace` 追加 `height: 100%; align-items: stretch; grid-template-rows: minmax(0, 1fr); min-height: 0`
- 模式面板从 `height: 520px` 改为 `height: 100%; max-height: none; min-height: 0`
- `page-shell` 追加 `position: relative; z-index: 1`

重新构建验证：生成的 `styles.css` 包含所有修改，构建无报错。

## 3. 关键决策记录

### 以 Web 为基准对齐 QML

QML 生成器历史上是先行实现的，但 Web 端的部分逻辑更接近预期语义（如执行游标的 `<=` 无 break）。决定以 Web 为参考基准，QML 向 Web 对齐。

### tickScale 模式替代直接修改常数

步长缩放不是通过修改每个数值常数实现，而是引入一个 `tickScale = 30.0 / 90.0` 乘数。这样修改点集中，且命名清晰表达了缩放的来源和意图，后续如果再次调整间隔，只需修改分子。

### 高度链修复采用 CSS 语义修复而非数值调整

将 520px 改为 `height: 100%` 是语义修复（让元素填充可用空间），而非将 520px 调大。这避免了在不同视口尺寸下继续出现滚动条。

### `align-items: stretch` 替代 `height: 100%` 作为列填充手段

在 `screen_workspace` 的子列（`main_left_column`、`main_runtime_panel`）上，选择在父容器上设置 `align-items: stretch` 而不是在每个子元素上分别添加 `height: 100%`，减少冗余样式并利用 CSS Grid 的默认拉伸行为。

## 4. 未处理事项

- `node-main_auto_editor` 的 `min-height: 420px` 在极小视口（<600px）下仍可能引发内容溢出，但在目标场景（工业触摸屏 / 正常浏览器窗口）中不会触发
- WSL 显示延迟是环境因素，代码层无法消除，只能通过提高帧率来减轻感知影响
