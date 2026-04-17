# Conversation Report

## 1. 记录原则

本文件记录的是摘要化过程和工程推进脉络。
它不包含模型内部原始思维链，而是保留对后续阅读最有价值的背景、实施顺序、关键决策和验证范围。

本报告对应的时间边界是 2026-04-17 当天，从用户提出 `MetaNC/nrt/hmi` 迁移诉求开始，到双目录最终产物重建、对比和报告落盘结束的连续一组工作。

## 2. 阶段时间线

### 阶段 A: 盘点旧导出实现与新目录结构

会话从一个明确问题开始：原有 `tools/export_to_metanc.sh` 仍然假定 HMI 内容直接放在 `MetaNC/` 根目录，而真实下游已经迁到 `MetaNC/nrt/hmi/`。

实际动作:

- 审查当前仓库中的 `tools/export_to_metanc.sh`
- 扫描仓库中所有与 `MetaNC`、`nrt/hmi`、导出和构建相关的引用
- 读取真实的 `/home/iaar/workspace/ccmix-wp/MetaNC` 目录结构
- 确认 `nrt/hmi` 已经是完整包目录，而不是简单副本

关键结论:

- 旧脚本直接同步 `MetaNC` 根目录，风险过高
- 下游 HMI 包已经具备独立的 `docs/`、`examples/`、`tests/`、`tools/` 结构

### 阶段 B: 比对当前仓库与下游包目录差异

在没有贸然修改脚本之前，先对当前仓库和 `MetaNC/nrt/hmi` 做结构与实现比对，判断是“只有路径变化”还是“下游已经有更多修复”。

实际动作:

- 对比 `tools/`、`docs/`、`tests/` 和生成器实现
- 对比当前仓库与下游的关键脚本行为
- 对比生成快照，确认是否会因回退旧实现导致最终产物变化

关键发现:

- 下游目录里已经存在一批比当前仓库更新的生成器实现
- 如果只改导出脚本，不先把这些差异回流，导出会把下游修复覆盖回旧版本

### 阶段 C: 先做兼容性补丁，再做导出

这一阶段的策略是先让当前仓库“自己就支持嵌套包根”，再让它作为单一可信源导出到下游。

实际动作:

- 更新 `tools/export_to_metanc.sh`，支持 `MetaNC` 根和 `MetaNC/nrt/hmi` 两种目标
- 为 docs portal 和 story docs 增加内容根识别逻辑
- 让 `build_docs_html.sh` 和 `generate_targets.sh` 显式在内容根执行
- 为测试补齐 `sys.path` 保障

关键决策:

- 内容根识别优先级高于 `.git` 根识别
- 导出目标只清空 HMI 包目录，不接触 `MetaNC` 其他模块
- 提示命令中的 `git add` 路径也根据解析结果动态生成

### 阶段 D: 回流影响最终产物的下游生成器实现

第一次完整测试时，`test_generated_outputs_match_snapshots` 失败，说明当前仓库中的生成器实现与快照不一致。

诊断过程:

- 单独运行失败测试
- 直接生成临时 `web/` 和 `qml/` 产物
- 对比快照与生成结果
- 继续对比当前仓库与 `MetaNC/nrt/hmi` 的生成器文件

结论:

- 失败不是新兼容性改动导致的
- 根因是当前仓库落后于下游已存在的生成器实现

实际动作:

- 回流 `web.py`
- 回流 `web_runtime_shell.py`
- 回流 `web_widget_emitters.py`
- 回流 `qml_runtime_shell.py`

结果:

- 快照测试恢复通过
- 当前仓库重新成为可导出的可信源

### 阶段 E: 双侧验证

在源码级兼容性和生成器回流完成后，执行双层验证：

1. 当前仓库根验证
2. `/tmp` 下模拟 `MetaNC/nrt/hmi` 的隔离验证

验证动作:

- `python3 -m unittest -v tests.test_story_docs tests.test_docs_portal tests.test_pipeline`
- `./tools/generate_targets.sh`
- 用临时 `MetaNC` 仓库做导出
- 在临时 `nrt/hmi` 内再次执行同一组测试和一键生成

结果:

- 两侧验证全部通过

### 阶段 F: 实际目录重建与产物对比

在用户确认后，继续对真实目录执行：

- 当前仓库重新生成最终产物
- 导出到 `/home/iaar/workspace/ccmix-wp/MetaNC/nrt/hmi`
- 在真实 `MetaNC/nrt/hmi` 中重新生成最终产物
- 对两边产物进行实际比对

关键发现:

- `generated/web/` 一致
- `generated/qml/` 一致
- `distribution/web` 一致
- NC 示例程序一致
- 差异集中在 QML 编译二进制、`qml-build/` 缓存、以及 HTML 中与内容根和 reports 子模块相关的环境差异

## 3. 关键决策记录

### 先比对下游，再决定是否直接导出

没有假定当前仓库一定比下游新，而是先检查 `MetaNC/nrt/hmi`。这个顺序避免了把下游已存在修复覆盖回旧状态。

### 内容根识别优先于 git 根识别

对于嵌套包结构，真正需要稳定的是“这个 HMI 包自己的根”，不是更上层 monorepo 的 `.git` 根。这个决策直接影响 docs portal、story docs、测试和构建脚本的可复用性。

### 产物对比以源码级输出为主，不以二进制字节相等为目标

QML 可执行和 `qml-build/` 缓存天然包含路径和构建环境差异，字节级比对没有工程意义。对比重点放在：

- `generated/web`
- `generated/qml`
- `distribution/web`
- 打包的 NC 资源

### docs/report 差异允许体现环境信息

`MetaNC/nrt/hmi` 被设计为不携带 `submodules/metanc_hmi_dsl_reports/`，因此 docs portal 在那边显示 `No reports detected.` 是预期行为，而不是缺陷。

## 4. 未处理事项

- 真实 `MetaNC` 工作区里仍保留这次导出与重建带来的未提交改动，后续是否拆分提交由用户决定
- `MetaNC/nrt/hmi/docs_html` 不会包含当前仓库 reports 子模块历史，这是导出过滤策略的直接结果；如果未来希望下游也内嵌报告历史，需要重新定义导出范围
