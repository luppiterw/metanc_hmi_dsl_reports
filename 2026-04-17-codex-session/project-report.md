# Project Report

## 1. 报告目标

本报告总结 2026-04-17 这轮工作中，如何把 `metanc_hmi_dsl` 仓库原本面向 `MetaNC/` 根目录的导出与构建假设，系统性迁移到新的 `MetaNC/nrt/hmi/` 包结构，并确认以下三件事同时成立：

- 当前仓库根目录下的一键生成产物仍然正确
- 导出后的 `MetaNC/nrt/hmi/` 包目录下的一键生成产物仍然正确
- 两边真正需要保持一致的源码级产物已经一致，可解释差异被限定在预期范围内

## 2. 证据范围

本报告对应 2026-04-17 当天已经在当前工作区完成的一组修改，核心范围包括:

- `tools/export_to_metanc.sh`
- `tools/build_docs_html.sh`
- `tools/generate_targets.sh`
- `tools/hmi_dsl/docs_portal.py`
- `tools/hmi_dsl/story_docs.py`
- `tests/test_pipeline.py`
- `tests/test_docs_portal.py`
- `tests/test_story_docs.py`
- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/generators/web_runtime_shell.py`
- `tools/hmi_dsl/generators/web_widget_emitters.py`
- `tools/hmi_dsl/generators/qml_runtime_shell.py`
- `submodules/metanc_hmi_dsl_reports/2026-04-17-codex-session/`

## 3. 本轮处理前的主要问题

### 3.1 导出脚本仍然把 MetaNC 仓库根视为 HMI 内容根

原始 `tools/export_to_metanc.sh` 默认目标是 `/home/iaar/workspace/ccmix-wp/MetaNC`，并直接清空和同步这个目录。这与新的目录结构不兼容，因为 HMI 内容已经迁入 `MetaNC/nrt/hmi/`。

风险:

- 直接导出会覆盖 `MetaNC` 仓库根的非 HMI 内容
- 下游包内脚本无法以 `nrt/hmi` 为真实工作根继续运行
- 后续一键处理链路会依赖人工记忆，而不是稳定脚本入口

### 3.2 多个工具仍假设“git 根 = HMI 内容根”

虽然 `MetaNC/nrt/hmi` 已经具备完整包结构，但当前仓库中的 docs portal、story docs、构建脚本和测试仍主要假定：

- 运行命令时所在目录就是 `.git` 仓库根
- `python3 -m tools.hmi_dsl ...` 的调用上下文默认是仓库根
- 报告索引、内容根展示、相对路径判断不需要区分“内容根”和“上层仓库根”

这会导致 `MetaNC/nrt/hmi` 中的以下行为出现不稳定或错误：

- 文档门户把仓库根显示为错误的绝对路径
- story docs 和 docs portal 的 repo root 探测在嵌套场景下失真
- 测试入口在嵌套目录执行时存在 `sys.path` 依赖隐患

### 3.3 当前仓库落后于下游已经生效的生成器实现

在检查 `MetaNC/nrt/hmi` 时发现，下游目录中已经存在一批比当前仓库更新的生成器实现。若只更新导出脚本而不先把这些实现回流到当前仓库，那么再次导出时会把下游已修正的最终产物逻辑覆盖回旧版本。

已识别的回流范围包括:

- `web.py` 的主界面布局生成样式
- `web_runtime_shell.py` 的行为节奏和面板重渲染策略
- `web_widget_emitters.py` 的按钮触发语义
- `qml_runtime_shell.py` 的 mock 运行时行为

## 4. 修复方案

### 4.1 导出脚本改为解析 MetaNC 仓库根和 HMI 包根

`tools/export_to_metanc.sh` 现在支持两种传参方式：

- 传 `MetaNC` 仓库根时，自动解析到 `MetaNC/nrt/hmi/`
- 传 `MetaNC/nrt/hmi` 时，直接把它作为目标包目录

同时补齐了以下保护和清理逻辑：

- 通过 `git rev-parse --show-toplevel` 识别真实下游仓库根
- 通过 `is_hmi_root()` 判断目标是否已经是 HMI 包根
- 拒绝把导出目标解析为当前源仓库自身
- 只清空下游 HMI 包目录，而不是误清空整个 `MetaNC` 根
- 过滤 `.claude`、`.codex`、`.docs`、`__pycache__`、`*.pyc`

### 4.2 包根识别从“git 根优先”改为“内容根优先”

`tools/hmi_dsl/docs_portal.py` 和 `tools/hmi_dsl/story_docs.py` 新增 `_is_hmi_root()`，优先根据以下内容根特征识别包根：

- `docs/src/index.md`
- `examples/june-demo/story.catalog.yaml`
- `tools/hmi_dsl/__init__.py`

这样在 `MetaNC/nrt/hmi` 场景下，工具会稳定地把 `nrt/hmi/` 当作内容根，而不是继续向上退回到 `MetaNC` 仓库根。

### 4.3 构建脚本显式切换到内容根执行

`tools/build_docs_html.sh` 和 `tools/generate_targets.sh` 现在都会先 `cd "${ROOT_DIR}"` 再调用 Python CLI，确保：

- 当前仓库根执行时行为不变
- 导出到 `MetaNC/nrt/hmi` 后仍以包根为工作目录执行

### 4.4 测试入口补齐嵌套包目录下的 `sys.path` 保障

三个核心测试入口补充了：

```python
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
```

这样在 `MetaNC/nrt/hmi/tests/` 中直接执行测试时，也能稳定导入 `tools.hmi_dsl`。

### 4.5 先回流生成器差异，再做导出

对比当前仓库与 `MetaNC/nrt/hmi` 后，先把下游已存在且影响最终产物的生成器实现回流到当前仓库，再执行导出。这样导出后的下游内容不会被旧逻辑覆盖。

结果:

- `generated/web` 在两个目录中完全一致
- `generated/qml` 在两个目录中完全一致
- `generated/distribution/web` 和打包的 NC 示例文件一致

## 5. 对比结果

### 5.1 真正需要保持一致的源码级产物已经一致

直接比对结果：

- `generated/web/` 无差异
- `generated/qml/` 无差异
- `generated/distribution/web/index.html` 哈希一致
- `generated/distribution/qml/program-root/INDEX_TABLE.MPF` 哈希一致

代表性哈希：

| 文件 | 当前仓库 | `MetaNC/nrt/hmi` |
| --- | --- | --- |
| `generated/web/index.html` | `fe3baab899be997e...` | `fe3baab899be997e...` |
| `generated/qml/Main.qml` | `fde0dfd04abb4329...` | `fde0dfd04abb4329...` |

### 5.2 保留差异 1: QML 二进制与 `qml-build/` 缓存

以下差异是预期的：

- `generated/qml-build/`
- `generated/qml-final/appCNC_HMI_June_Demo`
- `generated/distribution/qml/appCNC_HMI_June_Demo`

根因不是生成器输出不同，而是编译产物中包含构建目录、绝对路径和本地编译缓存信息。两个目录的源码一致，但二进制字节级比较不会一致。

### 5.3 保留差异 2: `docs_html` 与 story docs HTML 的环境差异

HTML 差异同样是预期的，主要来自两点：

- 当前仓库带有 `submodules/metanc_hmi_dsl_reports/`，所以 docs portal 会检测到最新 report
- `MetaNC/nrt/hmi` 导出时故意排除了 `submodules/`，因此 docs portal 会显示 `No reports detected.`

另一个差异源是内容根展示：

- 当前仓库显示 `Content root: .`
- `MetaNC/nrt/hmi` 显示 `Content root: nrt/hmi/`

这会进一步改变 mdBook 生成的 `searchindex-*.js` 文件名与部分 HTML 内容，但不代表功能语义不一致。

## 6. 验证

### 6.1 当前仓库验证

已完成:

- `python3 -m unittest -v tests.test_story_docs tests.test_docs_portal tests.test_pipeline`
- `./tools/generate_targets.sh`

结果:

- 单元测试通过
- story docs、docs portal、Web/QML 生成、QML 编译、distribution 打包通过

### 6.2 下游包目录验证

已完成:

- `./tools/export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
- 在 `MetaNC/nrt/hmi` 内执行 `./tools/generate_targets.sh`

结果:

- 导出路径正确落在 `MetaNC/nrt/hmi/`
- 下游包内一键生成成功
- 下游包内 `docs_html`、`generated/web`、`generated/qml`、`generated/distribution` 均成功刷新

## 7. 结论

本轮工作把原本只适配独立仓库根的导出与构建实现，升级为同时支持：

- 当前 `metanc_hmi_dsl` 独立仓库根
- 下游 `MetaNC/nrt/hmi` 嵌套包根

最终结论明确：

- 源码级生成物在两个目录中已经对齐
- 剩余差异都落在可解释的环境相关输出上
- 当前仓库和 `MetaNC/nrt/hmi` 两边都能独立执行一键生成
- 报告链路本身也已更新到 2026-04-17，可供后续审查和交付使用
