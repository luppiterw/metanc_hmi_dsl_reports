# Project Report

## 1. 报告目标

本报告总结 2026-04-12 这轮工作中，如何把 June demo 的程序管理能力从“生成后只在 mock runtime 里改字符串”的演示状态，推进到“基于指定程序根目录工作的真实 workspace”状态。

这次工作的重点不是再扩充 CNC 页面范围，而是把 `PROG` 页做成一条更可信的操作链，覆盖以下目标:

- 用 manifest 显式声明程序根目录，而不是把目录列表硬编码在 runtime 里
- 让生成阶段扫描真实目录并回填程序列表、默认打开项和目录状态
- 把程序页拆成更合理的浏览 / 编辑两种视图，而不是把目录和编辑器硬塞在一页
- 为 Web 和 QML 两个 target 都补齐选择、打开、保存、新建、删除、重命名、查找替换等程序工作流
- 让 QML 侧进一步落到真实文件工作区，而不是停留在内存 mock

## 2. 证据范围

本报告对应 2026-04-12 当天落盘的提交:

- `8eaa64a`
- subject: `feat: improve program workspace management`

结合本次提交中实际改动的文件，可归纳出的核心范围包括:

- `examples/june-demo/product.manifest.yaml`
- `examples/june-demo/program-root/`
- `examples/june-demo/ui.structure.yaml`
- `examples/june-demo/interfaces.machine.yaml`
- `tools/hmi_dsl/generators/common.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/runtime_plan.py`
- `tests/test_pipeline.py`
- `tests/snapshots/web/*`
- `tests/snapshots/qml/*`

## 3. 重构前的主要问题

### 3.1 程序目录仍然是生成器内置数组

此前的程序页虽然已经具备选择、打开、编辑、保存等基础 mock 交互，但目录内容主要来自 runtime 代码里的预置数据。

后果:

- 程序列表不对应真实目录
- 根路径没有明确配置入口
- 后续要替换示例程序或迁移目录时，需要同时改多处生成逻辑

### 3.2 程序目录与编辑器竞争同一块页面空间

旧程序页把目录、目录状态、编辑器和动作按钮塞进同一个横向布局里。

后果:

- 目录列宽容易和编辑器区域互相挤压
- 浏览文件和编辑文件这两类任务的视觉优先级混在一起
- 当目录项增长时，页面更容易出现布局拥挤或滚动体验变差

### 3.3 QML 侧尚未落到真实文件工作区

虽然 QML runtime 已能模拟程序编辑动作，但程序数据仍主要依赖内存态。

后果:

- `open / save / new / delete / rename` 还不是针对真实文件系统路径执行
- 运行时显示的根路径和真实工作目录之间缺少严格映射
- 分发包里没有一套可直接跟随应用运行的程序工作区

## 4. 本次主要处理动作

### 4.1 在 manifest 中引入 program root

更新:

- `examples/june-demo/product.manifest.yaml`
- `examples/june-demo/program-root/SHAFT_A.MPF`
- `examples/june-demo/program-root/SHAFT_B.MPF`
- `examples/june-demo/program-root/TOUCH_OFF.SPF`

处理结果:

- 新增 `program_runtime.root_path: ./program-root`
- 示例包开始自带真实的 NC 程序目录
- 后续如果要替换目录位置，只需要调整 manifest，而不是改 generator 内部硬编码

### 4.2 在共享生成准备层统一装载 workspace

更新:

- `tools/hmi_dsl/generators/common.py`

处理结果:

- 生成阶段会读取 manifest 中的 `program_runtime.root_path`
- 自动扫描目录内文件，构造 `program_workspace.files`
- 同步回填 `progdir.root_path`、`progdir.list`、`prog.name`、`prog.content`、`prog.total_lines`
- `progdir.used_mem` 会按真实文件内容大小计算
- 如果目录为空，仍保留兜底程序，避免 target 生成链断裂

这一步把“程序目录从哪里来”收敛到一个共享入口，避免 Web/QML 两侧各自维护一套目录装配逻辑。

### 4.3 重新规划 retained UI 的程序页结构

更新:

- `examples/june-demo/ui.structure.yaml`
- `examples/june-demo/interfaces.machine.yaml`

处理结果:

- 为运行时本地状态增加 `runtime_state.program_view_mode`
- 程序页拆成 `browser` 和 `editor` 两种视图模式
- 浏览态使用专门的 `program_browser`
- 编辑态使用专门的 `program_editor`
- 程序目录区可展示 `root_path`、当前选中项、存储介质和容量状态
- 命令契约继续补齐 `set_view_mode`、`replace` 等编辑场景需要的动作

这样调整后，程序页的主要交互变成:

1. 在目录视图中选择程序
2. 打开目标程序
3. 切到编辑视图
4. 编辑并保存
5. 需要时再返回目录继续文件管理

### 4.4 Web target 切换到专用 program widgets

更新:

- `tools/hmi_dsl/generators/web.py`

处理结果:

- 新增 `program_browser` 渲染逻辑
- 新增 `program_editor` 渲染逻辑
- 浏览器支持:
  - 当前目录路径展示
  - 单击选中
  - 双击打开
  - 键盘上下切换
  - `Enter` 打开
- 编辑器支持:
  - `textarea` 直接编辑程序文本
  - 行号区与滚动同步
  - 当前行定位
  - 诊断信息展示
- 命令防护层新增 `find`、`replace`、`new`、`delete` 等对话框流程
- `page_program` 不再强制参与整页缩放，优先保证程序编辑可读性

这意味着 Web 原型不再把程序页当成通用表格 + 通用编辑器的拼装结果，而是转成了明确面向程序管理的交互面板。

### 4.5 QML target 落地真实文件工作区

更新:

- `tools/hmi_dsl/generators/qml.py`
- `tools/generate_targets.sh`

处理结果:

- 生成新的 `ProgramWorkspaceBackend.h/.cpp`
- QML 侧增加真实文件操作入口:
  - `listPrograms`
  - `readProgram`
  - `writeProgram`
  - `createProgram`
  - `deleteProgram`
  - `renameProgram`
- runtime 初始化时会把 `program-root` 解析为运行时工作区路径
- `progdir.root_path` 在 QML 中显示为解析后的真实路径
- 构建与分发流程同步携带 `program-root/`

这一步是本轮最关键的落地动作，因为它把 QML 程序管理从“更真实的 mock”推进到了“真正操作打包后的工作目录”。

### 4.6 同步更新快照、测试和文档

更新:

- `tests/test_pipeline.py`
- `tests/snapshots/web/*.snap`
- `tests/snapshots/qml/*.snap`
- `docs/generator-contract.md`
- `CHANGELOG.md`

处理结果:

- 生成器文本产物快照刷新到新的程序页结构
- QML 离屏截图基线刷新到新的界面布局
- 测试开始检查 `program-root`、`writeProperty`、程序命令等关键输出
- 生成器契约文档补上 program workspace 的生成职责

## 5. 这次工作的工程收益

本轮落地后，程序页的工程价值比之前更高，主要体现在:

- 程序目录来源从硬编码转成显式配置和真实目录扫描
- Web/QML 两个 target 共享同一套 workspace 输入，而不是各自维护分裂的 mock
- 程序页从“演示式并排布局”切换为更接近设备操作流的浏览 / 编辑模式
- QML 分发产物开始携带实际可操作的 program root
- 后续继续做程序管理能力时，可以围绕 workspace 和专用组件演进，而不必继续给通用表格打补丁

## 6. 验证与回归范围

从本次提交涉及的文件和测试更新看，4 月 12 日这轮工作同步维护了以下验证链:

```bash
./tools/generate_targets.sh
python3 -m tools.hmi_dsl validate examples/june-demo/product.manifest.yaml
python3 -m unittest tests.test_pipeline
```

结合提交内容可以确认:

- Web/QML 文本快照已刷新
- QML 离屏截图基线已刷新
- `tests/test_pipeline.py` 已扩展到 program workspace 相关断言

## 7. 当前边界

截至这轮落盘内容，仍有几个边界需要注意:

- Web 侧 program workspace 仍然以浏览器内 runtime 存储为主，不是直接操作本地文件系统
- 示例目录目前只覆盖单层文件，不涉及深层目录树、复制/移动等更复杂文件管理
- 程序语法诊断仍偏轻量，重点在文件管理与编辑闭环，而不是完整 G-code 解析

## 8. 建议下一步

建议后续继续沿这条线推进:

1. 为 program workspace 增加目录层级与路径导航能力
2. 补齐复制、导入、导出、覆盖冲突处理等真实文件管理场景
3. 把查找、替换、跳转行、修改标记等编辑态交互继续收敛为统一语义层
4. 为 QML 真实文件工作区增加更明确的异常提示与权限处理
5. 将 program workspace 的验证从文本快照进一步扩展到行为级回归
