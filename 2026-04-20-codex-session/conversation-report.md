# Conversation Report

## 1. 记录原则

本文件记录的是摘要化过程和工程推进脉络。
它不包含模型内部原始思维链，而是保留对后续阅读最有价值的背景、实施顺序、关键决策和验证范围。

本报告对应的时间边界是 2026-04-20 当天，从用户指出 `MetaNC` 下游 report 入口 Markdown 被误覆盖开始，到 docs/source-package 收口、shell chrome 调整、generator 拆分、最终产物重建和 report 更新收尾结束的连续一组工作。

## 2. 阶段时间线

### 阶段 A: 先确认真实同步风险

起点不是抽象的同步担忧，而是用户明确指出：

- `MetaNC` 里的 report 部分不能直接拷贝覆盖
- 尤其是那几个 Markdown 入口页，因为下游本地没有 report submodule

实际动作：

- 检查 `MetaNC` 当前工作区状态
- 查看误改文件范围
- 读取 `export_to_metanc.sh` / `import_from_metanc.sh`

结果：

- 问题被收敛到一组明确的 report-linked entry surfaces
- 结论不是“report 仓库被同步过去了”，而是“本地入口文案被共享版本带偏了”

### 阶段 B: 把同步模式从“先删后拷”改成“保护性同步”

继续检查后发现，旧实现的关键风险不在 rsync 自身，而在于同步前会清空目标目录。

这意味着即使给 rsync 增加 `exclude`，下游本地文件也会先被删掉。

关键决策：

- 修复不能只停在“多排几个路径”
- 必须把 export/import 两个方向都改成保护性同步

### 阶段 C: 做最小可证伪验证，再回到真实下游

为了确认修复不是“看起来像对了”，先在 `/tmp` 构造最小目标仓库做保护验证，再回到真实 `MetaNC` 做恢复与复验。

结果：

- 保护路径在临时仓库里可稳定保留
- 重新导出到真实 `MetaNC` 后，工作区保持 clean

### 阶段 D: 对比参考文档结构，决定收口方案

同步脚本问题处理完后，工作继续转到文档结构治理。
用户要求参考 `MetaNC/nrt/gcode_parser/docs` 的骨架，整理当前仓库 docs 与 story 文档。

关键决策：

- 不再保留独立 story 小书
- 主 docs 统一收敛到 `docs/`
- `docs_html/` 继续作为最终 HTML 输出路径

### 阶段 E: 先重构 docs/story，再确认是否继续保留历史源包路径

在 docs/story 主书模型落下之后，用户进一步要求：

- 把 `examples/june-demo` 改成 `src/hmi_dsl`
- 明确这是历史遗留，不保留兼容入口
- 顺手把测试里和文档里的非正式命名一起修掉

关键决策：

- 做硬迁移，不保留旧路径 fallback
- 不只改目录名，还同步收口包标识、测试命名、快照和生成物命名

### 阶段 F: 先改测试，再做物理迁移

为了避免“看起来迁完了，结果验证链全断”，先把测试和快照期望改成：

- `src/hmi_dsl/product.manifest.yaml`
- `src/hmi_dsl/story.catalog.yaml`
- `product.hmi_dsl`
- `appCNC_HMI_DSL`

然后跑测试，确认旧实现确实因为新路径不存在而失败。
这一步把迁移的真实阻塞点收敛出来，再进入目录与脚本修改。

### 阶段 G: 完成 `src/hmi_dsl` 硬迁移与全链路收口

实际动作包括：

- 把 retained package 从 `examples/june-demo/` 移到 `src/hmi_dsl/`
- 更新 `README.md`、`AGENT.md`、`AGENTS.md`、`docs/`、`tests/`、`tools/`
- 更新 `story.catalog.yaml` 和 story-doc 链接
- 更新 QML 可执行名为 `appCNC_HMI_DSL`
- 刷新 Web/QML 文本快照

结果：

- 旧路径不再作为仓库主入口存在
- docs、story、tests、generated outputs 的命名都围绕 `hmi_dsl` 收口

### 阶段 H: 重建最终产物并更新 report

最后执行完整验证与产物重建：

- `python3 -m unittest -v tests.test_pipeline tests.test_story_docs tests.test_docs_portal`
- `./tools/generate_targets.sh src/hmi_dsl/product.manifest.yaml`

随后更新：

- 当前 session report
- aggregate report timeline
- 本 session HTML 与 aggregate HTML

### 阶段 I: 共享 Web/QML shell 再做一轮空间收口

在 source package 与文档结构收口完成后，用户继续把注意力转到真实界面反馈：

- footer 按钮太高
- 顶部 `PROGRAM` / `THEME` 噪音太重
- 状态消息位置不对
- 中间区域边框过多
- operations panel 太乱

关键决策：

- 不做“只改几个像素”的小修
- 直接按 shared shell chrome 重排处理 Web/QML 两端
- 先出 spec，再落 implementation，再重建最终产物

### 阶段 J: 同步边界再次补漏，并把 source-only superpowers 规则钉住

在继续 export 到 `MetaNC` 时，用户再次发现：

- `docs/project/index.md` 也会把 reports 入口泄漏到下游

随后又明确要求：

- `docs/superpowers/` 恢复为 tracked source-local 内容
- 相关 spec/plan 放回 `docs/superpowers/`
- export/import 到 `MetaNC` 时不能带过去

关键决策：

- 把 `docs/project/index.md` 纳入和 `reports.md` 同级的保护面
- 为 sync 脚本新增回归测试
- 明确把 `docs/superpowers/` 视为 source-only tracked docs，而不是 Git ignore 垃圾目录

### 阶段 K: 壳层细节继续收口到共享 token

在 shell 重排完成后，用户继续指出 footer softkey 高度仍偏高，并且代码里存在明显硬编码。

关键决策：

- 不只把某个数值改小
- 把 footer button minimum height 提升为 shared generator constant
- Web/QML 都从同一 source 生成对应变量和绑定

结果：

- softkey 高度统一收口到 `48`
- 后续再调 footer，不需要双端手工找散落硬编码

### 阶段 L: 开始按职责拆 generator，而不是按页面切

用户明确提出不想每次修改都消耗太多上下文，因此 generator 结构本身需要收口。

关键决策：

- 不按页面拆，因为页面是 retained DSL 数据驱动的
- 保留 `generate_web()` / `generate_qml()` 作为稳定 facade
- 把 page split、Web shell、Web app shell、QML page fragments、QML support files 先拆出来

结果：

- 新增专门模块承载重复修改的职责块
- `qml.py` 和 `web_runtime_shell.py` 的体量明显下降
- 后续 shell/layout 修改不再每次都进入同一批超长文件

## 3. 关键决策记录

### export 和 import 必须使用同一组保护路径

只修一个方向不够。今天是 export 覆盖下游，未来也可能是 import 回灌覆盖上游。

### story docs 应并入主 docs，而不是继续维护独立小书

这样可以把入口、结构、生成路径和最终 `docs_html/` 保持一致，减少路径漂移。

### `examples/june-demo` 不能再继续作为正式入口

用户明确把它定义为历史遗留，因此这次迁移采用硬切换，而不是兼容期双轨维护。

### 路径迁移必须伴随命名迁移

只换目录，不换包标识、测试名、QML binary 名，会留下半迁移状态，后续维护成本更高。

### 壳层布局调整必须双端同做

这些界面问题来自共享生成结构，而不是单一 target 的样式偶发偏差。因此本轮始终把 Web 和 QML 一起改，不接受“先修一端再看”的分裂处理。

### generator 拆分要按职责，而不是按页面

按页面切会把 shared widget/render 逻辑重新分散到多个模块里，反而更难维护。保留稳定入口、内部按 page-structure / shell / support file / runtime shell 分层，后续收益更稳定。

## 4. 未处理事项

- Web 浏览器可视化快照仍然是按需启用，没有在这轮默认验证里执行
- `web.py` 里的 CSS 构建块仍然较大，是 generator 下一轮最值得继续拆的目标
- 如果未来 `MetaNC` 侧再新增宿主本地 Markdown surface，需要继续纳入同步保护清单
