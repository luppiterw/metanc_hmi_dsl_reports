# Project Report

## 1. 报告目标

本报告总结本次 CNC HMI DSL 项目推进过程中的关键工作、问题定位、修复动作、验证结果和当前项目状态。

本次工作重点不只是“能生成”，而是把以下约束逐步落实为代码与测试:

- Web 与 QML 同源于同一份 retained DSL
- 同一 retained DSL 输入下重复生成结果一致
- 同一张图在语义输入不变时，practice/import 结果一致
- 同一张图导入后最终生成的 Web/QML 结果一致

## 2. 项目当前定位

项目是一个 CNC HMI 的 retained multi-document DSL 工程。
核心思想是把结构、样式、接口、设计证据分离存储，再统一构建 IR，最后生成多个前端目标。

当前关键 retained 文档:

- `product.manifest.yaml`
- `ui.structure.yaml`
- `style.theme.yaml`
- `interfaces.machine.yaml`
- `design.import.yaml`

当前关键工具链:

- 包加载与交叉验证
- 主题继承与 materialization
- 截图 practice 文件生成
- design import 归一化导入
- IR 构建
- Web 生成
- QML 生成

## 3. 本次主要问题

### 3.1 缺失 Web 生成器模块

最初测试无法导入 `tools.hmi_dsl.generators.web`，导致整个测试套件直接失败。

影响:

- `generate-web` CLI 不可靠
- `tools.hmi_dsl.generators` 包导出损坏
- 测试无法验证整个 pipeline

### 3.2 Web 输出异常简陋

后续发现问题不只是“设计风格弱”，而是生成的 `app.js` 本身带有错误的模板转义。

实际后果:

- Web 页面主渲染逻辑未正常执行
- 页面表现为空壳或极简残缺状态
- 用户感知为“和图片完全不一样、几乎没东西”

### 3.3 一致性约束未显式编码

在修好生成器后，还暴露出更深层问题:

- 同一语义输入如果顺序不同，practice/import 可能漂移
- Web 输出里曾包含 provenance 路径噪声，导致同语义不同路径时产物不同
- 缺少“同图同结果”的显式回归测试

## 4. 本次主要处理动作

### 4.1 恢复 Web 生成器

新增并接通:

- `tools/hmi_dsl/generators/web.py`

Web 生成器现在能稳定生成:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

### 4.2 修复 Web 运行时脚本

修复点:

- 去除了无效的双大括号模板残留
- 让浏览器端脚本恢复为合法 JS
- 页面能够正常执行 theme / navigation / node rendering 逻辑

### 4.3 让 practice / import 顺序稳定

在 screenshot 适配和 import 过程中加入规范化排序:

- `regions` 排序
- `ocr_inputs` 排序
- `sources` / `imports` / `review_sessions` / `source_regions` / `node_mappings` / `ocr_observations` 等 retained section 排序

目的:

- 避免输入顺序差异带来输出漂移
- 让“同语义输入”获得稳定文件输出

### 4.4 去除 Web 输出中的路径漂移源

Web 端以前直接内嵌完整 IR，其中有 provenance 路径。
现在仅向浏览器写入运行时真正需要的 IR 子集。

效果:

- 保持渲染所需语义
- 去掉本地路径带来的非语义差异
- 提升 Web 产物可复现性

### 4.5 引入 screenshot semantic fingerprint

新增 `semantic_fingerprint` 概念。

它基于以下内容构造稳定哈希:

- 源图片字节 `sha256`
- 规范化后的 regions
- 规范化后的 OCR evidence
- OCR merge policy

写入位置:

- `design.input.generated.yaml` 的 `input_session.semantic_fingerprint`
- `design.import.yaml` 的 `imports[*].semantic_fingerprint`
- `design.import.yaml` 的 `review_sessions[*].semantic_fingerprint`

意义:

- 能判断两次处理是否来自同一份语义证据集
- 不依赖本地目录或输入顺序

## 5. 实际演示过的流程

用仓库自带示例图代替“新图片”，在 `/tmp/hmi_new_image_demo` 下实际跑通:

1. `adapt-screenshot`
2. `import-design`
3. `validate`
4. `build-ir`
5. `generate-web`
6. `generate-qml`
7. QML configure/build/offscreen smoke run

输出目录示例:

- `/tmp/hmi_new_image_demo/package/`
- `/tmp/hmi_new_image_demo/generated/web/`
- `/tmp/hmi_new_image_demo/generated/qml/`
- `/tmp/hmi_new_image_demo/build-qml/`

## 6. 当前已验证的确定性

以下约束已经通过自动化测试验证:

- 同一个 retained bundle 连续生成两次 Web 文件内容一致
- 同一个 retained bundle 连续生成两次 QML 文件内容一致
- 同一张截图在 regions / OCR 输入顺序变化时，practice 文件一致
- 同一张截图在 regions / OCR 输入顺序变化时，import 的语义结果一致
- 同一语义截图输入导入后的最终 Web/QML 结果一致
- 同一语义截图输入的 `semantic_fingerprint` 一致

## 7. 当前已知边界

这套确定性主要保证“相同语义输入 -> 相同 retained 输出 -> 相同生成结果”。

仍然存在的边界:

- 如果上游 OCR 或检测模型本身每次识别内容不同，下游自然也会变化
- 当前 Web 与 QML 仍未做到视觉实现完全等价，只是共享 retained 语义与稳定输入输出
- 当前图片到 retained DSL 的“语义提取”仍部分依赖外部标注 / OCR 输入

## 8. 推荐下一步

建议继续收紧以下部分:

1. 把 `style_candidates` 的提取与排序规则进一步规范化
2. 把 `interface_implications` 的生成规则进一步规范化
3. 为 `node_mappings` 增加更明确的 canonicalization 策略
4. 增加 Web/QML 视觉快照测试，而不仅是文本产物一致性
5. 为 screenshot intake 增加“同图多轮处理对比报告”

## 9. 本次产出清单

本次修改覆盖了:

- `tools/hmi_dsl/generators/web.py`
- `tools/hmi_dsl/adapters/design_practice.py`
- `tools/hmi_dsl/design_import.py`
- `tests/test_pipeline.py`
- `README.md`
- `docs/tooling.md`
- `docs/design-import-tool.md`
- `docs/design-input-workflow.md`
- `CHANGELOG.md`

以及当前报告目录。
