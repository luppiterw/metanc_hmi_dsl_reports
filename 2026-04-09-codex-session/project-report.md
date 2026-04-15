# Project Report

## 1. 报告目标

本报告总结 2026-04-09 这轮工作中围绕 CNC HMI DSL 生成器 runtime 层的关键改动、问题定位、验证结果和当前状态。

这次工作的重点不再只是“生成出静态页面”，而是把以下约束落实为代码和测试:

- Web 与 QML 不再各自内嵌一套孤立的 mock 展示文本
- 两个 target 都通过同一份 runtime contract 读取属性、流、命令和本地状态
- command / stream / local state 的交互在生成产物里可执行，而不是只停留在静态展示
- runtime contract 的输出、快照和测试结果保持确定性

## 2. 本次工作主题

当前这轮工作的核心是把 retained DSL 生成链从“编译时直接拼装显示文案”推进到“生成运行时计划 + 运行时种子数据 + target 侧运行时适配层”。

关键新增能力包括:

- 从 IR 中收集当前页面实际使用到的 runtime 绑定
- 为属性、事件流和 local state 生成确定性的 mock runtime seed
- Web 侧输出 `runtime.js`
- QML 侧输出 `RuntimeStore.qml`
- 让 command action、event table、state argument 解析进入统一运行时模型

## 3. 本次主要问题

### 3.1 绑定值过去主要在生成阶段被直接格式化

之前的 Web/QML 生成逻辑更接近“把 mock 值直接写死到展示文本里”。
这会导致几个问题:

- target 之间共享的运行时语义不足
- command 和 local state 的交互难以统一表达
- stream 类组件只能显示占位文本，不是真正从 runtime 数据结构读取

### 3.2 Web 与 QML 缺少同构的 runtime 接口层

虽然两个 target 同源于同一份 retained DSL，但行为层并没有通过同一套 runtime 抽象来组织。

后果:

- Web 和 QML 的交互能力容易漂移
- 某些 action 逻辑只能在一个 target 上描述清楚
- 测试很难明确验证“两个 target 是否真的共享同一种运行时模型”

### 3.3 生成契约和文档覆盖需要同步升级

当 runtime 层引入后，生成器 contract、README、tooling 文档、snapshot 和 pipeline assertions 都必须一起更新。

否则:

- 文档会落后于真实产物
- 快照回归无法锁定新的 target 输出
- 后续继续工作的人需要重新猜测 generator 行为

## 4. 本次主要处理动作

### 4.1 新增 runtime planning 层

新增:

- `tools/hmi_dsl/runtime_plan.py`

该模块负责:

- 遍历 IR 页面树
- 收集被实际使用的 property / stream / command / local state
- 记录这些 runtime entry 的定义与使用点
- 生成确定性的 mock runtime seed

其中当前重点覆盖了:

- `alarm.commands.acknowledge`
- `alarm.streams.active_events`
- `runtime_state.selected_alarm_id`

### 4.2 统一 generator payload

更新:

- `tools/hmi_dsl/generators/common.py`
- `tools/hmi_dsl/__init__.py`

处理结果:

- `prepare_generation_payload()` 现在不仅提供 IR 和 theme
- 还统一提供 `runtime_plan` 与 `runtime_seed`
- generator 不再各自临时拼 runtime mock，而是消费同一份准备好的运行时数据

### 4.3 扩展 Web 生成器

更新:

- `tools/hmi_dsl/generators/web.py`

Web 现在会输出:

- `index.html`
- `styles.css`
- `runtime.js`
- `app.js`
- `README.md`

新增行为包括:

- `runtime.js` 暴露 `readProperty`、`readStream`、`readLocalState`、`writeLocalState`、`invokeCommand`
- `app.js` 从 runtime 读取绑定值，而不是只使用静态 mock 文本
- event table 从 `alarm.streams.active_events` 读取数据
- command button 通过 `RUNTIME.invokeCommand()` 触发
- action 参数支持从 `state://...` / `if://...` 引用解析

### 4.4 扩展 QML 生成器

更新:

- `tools/hmi_dsl/generators/qml.py`

QML 现在会输出:

- `CMakeLists.txt`
- `Main.qml`
- `RuntimeStore.qml`
- `ThemeStore.js`
- `main.cpp`
- `README.md`

新增行为包括:

- `RuntimeStore.qml` 编译进生成的 Qt QML module
- `Main.qml` 中的 metric、panel、button、event-table 通过 `runtime.read*()` 读取值
- 本地选中态写回 `runtime.writeLocalState()`
- acknowledge action 通过 `runtime.invokeCommand()` 修改 stream 与 local state

### 4.5 同步更新快照、测试和文档

更新内容覆盖:

- `tests/test_pipeline.py`
- `tests/snapshots/web/runtime.js.snap`
- `tests/snapshots/web/app.js.snap`
- `tests/snapshots/web/index.html.snap`
- `tests/snapshots/web/styles.css.snap`
- `tests/snapshots/qml/Main.qml.snap`
- `tests/snapshots/qml/RuntimeStore.qml.snap`
- `README.md`
- `docs/generator-contract.md`
- `docs/tooling.md`
- `CHANGELOG.md`

另外，当前工作区还包含用于统一生成与运行的辅助脚本:

- `tools/generate_targets.sh`
- `run_qml.sh`

## 5. 实际验证结果

本次在当前工作区中实际执行了:

```bash
python3 -m unittest -v tests.test_pipeline
python3 -m unittest discover -s tests -v
```

结果:

- 两轮测试均通过
- 共 18 个测试通过
- 1 个浏览器级 Web 视觉快照测试按设计被跳过

关键验证点包括:

- runtime plan 能收集实际用到的 command / stream / local state
- mock runtime seed 产生确定的类型化初始值
- Web 生成器输出 `runtime.js`
- QML 生成器输出 `RuntimeStore.qml`
- 生成结果与更新后的 snapshots 一致
- QML 离屏构建与截图基线测试通过

## 6. 当前已得到的工程收益

这轮 runtime 层改造带来的直接收益包括:

- Web 与 QML 共享同一种 target-side runtime 语义
- stream / command / local state 不再只是文档层概念，而是进入了真实生成产物
- 后续替换 deterministic mock seed 为真实 backend adapter 时，接入点更清晰
- pipeline test 现在能更明确地保护 runtime contract

## 7. 当前已知边界

当前 runtime 仍然是 generator 输出中的 deterministic mock runtime，而不是真实机床后台连接。

仍然存在的边界:

- `invokeCommand()` 目前只实现了有限的模拟命令路径
- stream 更新仍是静态种子 + 本地命令变更，不是实时订阅
- browser-level Web 视觉回归仍需显式打开环境变量
- runtime contract 目前主要覆盖 June demo 已使用到的 binding 范围

## 8. 推荐下一步

建议下一轮继续推进以下部分:

1. 把 runtime plan 扩展为可选导出独立 contract 文件，便于 target 与后端适配器共享
2. 为 command 和 stream 增加更明确的数据类型与参数 schema
3. 把 Web/QML runtime 的命令实现抽成更可替换的 adapter 层
4. 为更多 stateful widget 增加行为回归测试，而不仅是产物文本快照
5. 在本地或专用环境中补跑 Web 浏览器视觉快照，锁定运行时交互后的视觉基线

## 9. 本次产出清单

本次工作主要覆盖了:

- `tools/hmi_dsl/runtime_plan.py`
- `tools/hmi_dsl/__init__.py`
- `tools/hmi_dsl/generators/common.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `tests/test_pipeline.py`
- `tests/snapshots/web/`
- `tests/snapshots/qml/`
- `README.md`
- `docs/generator-contract.md`
- `docs/tooling.md`
- `CHANGELOG.md`
- `tools/generate_targets.sh`
- `run_qml.sh`

以及当前报告目录。
