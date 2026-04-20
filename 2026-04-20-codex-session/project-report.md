# Project Report

## 1. 报告目标

本报告总结 2026-04-20 这一轮工作的四个连续主题：

- 收紧 `metanc_hmi_dsl <-> MetaNC/nrt/hmi` 双向同步边界，保护下游本地维护的 report 入口 Markdown
- 把仓库里的 docs / story 文档与 retained source package 一起收口到更正式的结构：单一 `docs/` 主书，加 `src/hmi_dsl/` 作为唯一源包入口
- 重排共享 Web/QML shell 的顶部、底部和 operations panel 布局，减少无效边框与壳层噪音
- 按职责拆分过长的 generator 模块，降低后续修改时需要反复装载的大文件上下文

本轮目标不是只修一个脚本问题，而是同时让以下几件事成立：

- `MetaNC` 下游本地 report 入口面不会再被共享同步误覆盖
- story docs 不再维护独立小书，而是并入主 docs 书
- retained package 不再继续使用历史遗留的 `examples/june-demo`
- 测试、文档、生成入口和最终产物都围绕 `src/hmi_dsl/` 一致收口
- Web/QML 壳层布局在不改 retained contract 的前提下更紧凑、更一致，也更接近真正可读的 HMI 画面
- generator 的后续布局迭代不再每次都必须进入最大的几个入口文件

## 2. 证据范围

本报告对应 2026-04-20 当天在当前工作区完成的一组连续修改，核心范围包括：

- `tools/export_to_metanc.sh`
- `tools/import_from_metanc.sh`
- `tools/generate_targets.sh`
- `tools/run_generated_qml.sh`
- `tools/hmi_dsl/docs_portal.py`
- `tools/hmi_dsl/story_docs.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/web_runtime_shell.py`
- `tools/hmi_dsl/generators/qml.py`
- `tools/hmi_dsl/generators/page_structure.py`
- `tools/hmi_dsl/generators/web_shell.py`
- `tools/hmi_dsl/generators/web_app_shell.py`
- `tools/hmi_dsl/generators/qml_page_fragments.py`
- `tools/hmi_dsl/generators/qml_support_files.py`
- `src/hmi_dsl/*`
- `docs/*`
- `tests/test_pipeline.py`
- `tests/test_story_docs.py`
- `tests/test_docs_portal.py`
- `tests/test_sync_scripts.py`
- `tests/test_generator_refactor.py`
- `tests/snapshots/web/*`
- `submodules/metanc_hmi_dsl_reports/2026-04-20-codex-session/*`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-20-codex-session.md`

## 3. 本轮处理前的主要问题

### 3.1 双向同步会碰到下游本地 report 入口面

`MetaNC` 下游并不携带 report submodule，但宿主仓库本地又需要少量 report 入口 Markdown。
如果共享同步不显式保护这些路径，它们会被源仓库版本覆盖。

最终需要保护的下游本地入口面是：

- `docs/index.md`
- `docs/project/reports.md`
- `docs/acceptance_reference/story_pack/execution_links.md`

### 3.2 docs / story 结构仍带有分裂和历史命名

在本轮整理前，仓库还保留了几类不够正式的历史结构：

- `docs/src/` 作为旧 mdBook source
- story docs 曾经走独立书路径
- retained package 继续挂在 `examples/june-demo/`

这会带来两个问题：

- 文档入口分裂，生成路径和引用路径不稳定
- 测试、脚本、快照和最终产物持续泄露 `june-demo` / `examples` 这类历史命名

### 3.3 命名和产物入口不一致

即使路径迁移，如果包标识、测试名和生成物名字不一起收口，仍会出现半迁移状态，例如：

- `product.june_demo`
- `story.june_demo`
- `appCNC_HMI_June_Demo`

这些名字会继续出现在快照、QML 构建物和文档里，影响后续维护。

### 3.4 壳层布局在可读性和空间利用上仍有明显噪音

在 docs/source-package 收口完成后，实际生成界面仍暴露出一组共享问题：

- 顶部条带包含低价值标签，控件高度与宽度也不一致
- 状态消息挤在顶部，和 page title / toolbar 混在一起
- 中间区域边框层级过多，真正的页面内容被压缩
- operations panel 的分组、按钮尺寸和可视节奏不稳定
- footer softkey 为了容纳两行文字被一次性抬高过头

这些问题同时出现在 Web 和 QML 目标里，因此不能只修单端样式。

### 3.5 generator 入口文件过长，后续修改上下文成本高

在继续迭代壳层布局时，很快暴露出另一个工程问题：

- `web.py`
- `web_runtime_shell.py`
- `qml.py`

仍包含过多壳层、support file 和 page 拆分逻辑。即使只改 footer、ops panel 或 page split，也需要反复进入体量最大的几个入口文件，不利于后续对话和维护。

## 4. 方案与实现

### 4.1 `export_to_metanc.sh` / `import_from_metanc.sh` 改成保护性同步

导出与回灌脚本都改成围绕同一组本地保留面做同步：

- `export_to_metanc.sh`
  - 使用 `rsync -a --delete`
  - 对 3 个下游本地 report 入口路径同时使用 `--filter=P` 和 `--exclude`
- `import_from_metanc.sh`
  - 同样保护 `docs/index.md`、`docs/project/reports.md`、`docs/acceptance_reference/story_pack/execution_links.md`
  - 同步共享范围从旧的 `examples/` 切到 `src/`

这样 export/import 两个方向对 report-linked surfaces 使用同一组规则，不再只修一半。

### 4.2 docs / story 文档收敛为单一主书

文档结构被统一到以 `docs/` 为 source root 的单书模型，story pack 直接生成到：

- `docs/acceptance_reference/story_pack/`

对应实现包括：

- `tools/hmi_dsl/docs_portal.py`
  - 直接从 `docs/` 生成 `docs_html/`
  - 主入口、requirements、development_guidelines、acceptance_reference、project 都围绕新骨架输出
- `tools/hmi_dsl/story_docs.py`
  - 直接消费 `src/hmi_dsl/story.catalog.yaml`
  - 在 story pack 里输出正式的 source-package 链接与标题

### 4.3 retained source package 硬迁移到 `src/hmi_dsl/`

本轮不保留兼容入口，直接把 retained package 从：

- `examples/june-demo/`

硬迁移到：

- `src/hmi_dsl/`

同步完成了几类收口：

- 所有 CLI 示例和工具默认 manifest 指向 `src/hmi_dsl/product.manifest.yaml`
- story catalog、文档引用、测试常量、快照断言全部切到 `src/hmi_dsl`
- source package 内部标识更新为 `product.hmi_dsl`、`story.hmi_dsl` 等正式命名
- QML 构建产物和分发入口更新为 `appCNC_HMI_DSL`

### 4.4 report 资产同步更新

为了让今天这轮修改可追溯，本轮同时更新了：

- 当前 session 的 `README.md`
- `project-report.md`
- `conversation-report.md`
- `workflow-diagram.md`
- `architecture-diagram.md`
- aggregate report book 的：
  - `src/index.md`
  - `src/sessions/2026-04-20-codex-session.md`

### 4.5 共享 shell chrome 做了更紧凑的一轮重排

在 retained contract 不变的前提下，Web/QML 两端的共享壳层都做了同一方向的收口：

- 顶部移除低价值的 `PROGRAM` / `THEME` 标签噪音
- `Show/Hide Ops` 和 theme selector 的高度、宽度做统一收紧
- 运行状态消息从顶部移到 footer 上方，形成独立的 notice rail
- 中间 stage 去掉多余边框与空白包裹层，把更多空间还给有效页面内容
- operations panel 改成更清晰的分组和更一致的按钮尺寸

这样两端生成物在视觉节奏上重新对齐，后续只需要围绕共享 token 和壳层结构继续收口。

### 4.6 footer softkey 高度改成共享 token，而不是散落硬编码

在壳层重排后，footer softkey 需要从“足够显示两行文字”回到“不过度占高”的平衡值。

处理方式不是简单把某个 `84` 改小，而是：

- 在 shared generator common 层定义统一的 footer softkey 高度常量
- Web 通过 CSS 变量消费这个值
- QML 通过生成的 `footerButtonMinHeight` 绑定消费这个值

最终高度收口到 `48`，同时移除了这块最明显的散落硬编码。

### 4.7 同步保护规则继续补漏到 `docs/project/index.md`

用户在后续同步里再次指出一个真实漏项：

- `MetaNC/nrt/hmi/docs/project/index.md`

虽然 `reports.md` 已被保护，但 `project/index.md` 仍可能把 reports 入口链接带到下游没有 reports tree 的仓库。

这轮补漏把 `docs/project/index.md` 也纳入：

- `export_to_metanc.sh` 的下游本地保留清单
- `import_from_metanc.sh` 的 source-local 保留清单
- `tests/test_sync_scripts.py` 的回归断言

同时继续保证：

- `docs/superpowers/` 保持 source-local tracked 内容
- 后续 export/import 都不会把它同步进 `MetaNC`

### 4.8 generator 模块按职责做了第一轮拆分

这轮没有按页面生硬切分，而是保留稳定入口函数，只把最容易反复改动的职责块拆出来：

- `page_structure.py`
  - 提供 page main / auxiliary / footer 拆分与 footer model 归一化
- `web_shell.py`
  - 负责 Web `index.html` 和生成 README 这类外壳资产
- `web_app_shell.py`
  - 负责 Web app shell / DOM chrome 生成
- `qml_page_fragments.py`
  - 负责 page loader、page component、global auxiliary component 片段
- `qml_support_files.py`
  - 负责 `CMakeLists.txt`、`main.cpp`、`ThemeStore.js`、program workspace backend 等 support file 生成

结果是：

- `qml.py` 明显变短
- `web_runtime_shell.py` 不再同时承担 app shell 生成
- 后续改 shell/layout 时，不需要每次都进入最大的 generator 入口文件

## 5. 验证结果

### 5.1 核心测试

已执行：

- `python3 -m unittest -v tests.test_sync_scripts tests.test_generator_refactor tests.test_pipeline tests.test_story_docs tests.test_docs_portal`

结果：

- `35` 个测试通过
- `1` 个测试跳过

跳过项是 Web 浏览器可视化快照，需要显式设置：

- `HMI_ENABLE_WEB_VISUAL_SNAPSHOT=1`

### 5.2 最终产物重建

已执行：

- `./tools/generate_targets.sh src/hmi_dsl/product.manifest.yaml`

结果：

- `generated/web/` 已重建
- `generated/qml/` 已重建
- `generated/qml-final/appCNC_HMI_DSL` 已生成
- `generated/distribution/` 已重建
- `docs/acceptance_reference/story_pack/` 已重建
- `docs_html/` 已重建

### 5.3 路径残留检查

已对当前源包、主 docs、story pack 和最终产物执行残留检查，确认：

- `examples/june-demo`
- `june-demo`

不再出现在本轮重建后的主入口范围内。

## 6. 结论

2026-04-20 这轮工作的稳定结果是：

1. `MetaNC` 下游本地维护的 report 入口面已经从共享同步范围中显式分离出来，export/import 两个方向都使用同一组保护规则
2. docs / story 文档已经收敛到单一 `docs/` 主书，story pack 成为主书的一部分，不再继续维护历史小书路径
3. retained package 已正式迁移到 `src/hmi_dsl/`，测试、文档、脚本、快照和最终产物都围绕这个入口完成了统一
4. 本轮结果已经通过核心测试和完整产物重建验证，当前报告也与最终仓库结构保持一致
5. 共享 shell 的空间利用和视觉层级已经收紧一轮，footer softkey 也从硬编码改成统一 token，后续尺寸微调会更低成本
6. generator 已完成第一轮按职责拆分，后续继续拆 `web.py` 的样式构建块会更直接
