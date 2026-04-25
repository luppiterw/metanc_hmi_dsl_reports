# Project Report

## 1. 目标

本轮工作的目标不是继续堆更多 story 产物，而是把现有文档体系收口成一套真正可用于产品开发和 AI 持续实现的结构，同时把最终文档输出升级为中英文可切换的 HTML。

核心目标有四个：

1. 让 story 层从“平铺追踪项”变成“scope -> epic -> outcome story -> slice story -> evidence”的结构
2. 给读者一条明确的阅读顺序，避免一上来就掉进 generated traceability
3. 让 `docs_html` 支持 `en/` 与 `zh-CN/` 两套站点，并用下拉框切换
4. 保持英文源文件不变，中文只在构建期生成

## 2. story 文档结构收口

### 2.1 先解决“怎么读”

这轮首先不是继续加 story，而是先定义入口和阅读顺序：

- `story_reading_path.md`
- `story_structure_map.md`
- `story_map.md`
- `story_governance.md`
- `*_story_breakdown.md`

目的是把下面几层彻底分开：

- `scope`
- `epic`
- `story`
- `slice`
- `evidence`

这样后续做 client / server / CNC / PLC 接入时，story 才能真的作为产品开发骨架，而不是文档生成结果。

### 2.2 outcome story 和 slice story 被显式化

在 `definition/story.catalog.yaml` 中，这轮把产品 story 继续收紧成两层：

- `story_role: outcome`
- `story_role: slice`

并补上：

- `parent_story_ref`
- `child_story_refs`
- `breakdown_refs`

对应生成后的 `story pack` 中，也能直接看到：

- `Story Role`
- `Parent Story`
- `Child Slices`
- `Breakdown Refs`

这一步的作用是把“产品目标”和“当前实现切片”彻底拆开，避免一条 story 同时承担 epic、迭代切片和验收包三重语义。

### 2.3 review 文档降级为附录

此前那份 review 文档和若干 SVG/JSON 图容易把读者带偏。
这轮把它们降成附录性质：

- `story_system_review.md` 只保留诊断作用
- 不再把 review-only `svg/json` 产物当主入口
- 后续如需图，统一改用 Markdown 内的 Mermaid 源

## 3. docs 输出链改造

### 3.1 从“回写 docs/ 再构建”改成“staging build”

为了满足“英文源文件不出现中文”的约束，这轮把 docs portal 生成逻辑从：

- 直接回写 `docs/`

改成了：

- 复制 `docs/` 到 staging
- 在 staging 上覆盖 story pack 和生成页
- 再从 staging 生成 `docs_html`

这样英文源文档保持不动，所有中文和派生内容都只存在于构建期产物中。

### 3.2 双语输出目录固定下来

当前 `docs_html` 的最终形态是：

- `docs_html/index.html`
- `docs_html/en/`
- `docs_html/zh-CN/`
- `docs_html/reports/`

入口页会自动按语言偏好跳转，也保留语言选择入口。

### 3.3 语言切换控件改成下拉框

用户明确指出不想要点击式语言链接，希望改成下拉框。
这轮已经把：

- 入口页语言选择
- 各正文页语言切换

统一改成了 `select` 下拉框，而不是纯文本链接切换。

## 4. 中文镜像策略

### 4.1 不改英文源文档

这一轮没有把中文写回 `docs/` 或 `definition/`。

英文源继续保持为：

- 规范文档唯一来源
- story 与技术标识唯一来源
- repo 内长期维护内容

### 4.2 中文通过外部 overlay 生成

中文镜像通过外部 overlay 根目录注入：

- `~/.codex/memories/metanc_hmi_dsl_i18n/zh-CN/`

portal 构建时会把这些 overlay 应用到 staging docs tree，再生成 `docs_html/zh-CN/`。

### 4.3 逐页补齐策略

起初只有入口页和 story 主阅读路径有中文，用户明确指出“绝大多数页面没法切中文”。

之后这轮按批次逐页补齐：

1. requirements 主链
2. 各 section 入口页
3. product/spec 关键页
4. development_guidelines 关键页
5. server / project 子树
6. story_pack 深页
7. `docs/superpowers/` 下的内部计划与规格页

收尾后，`docs/` 下页面的中文 overlay 缺口已经清零。

## 5. 关键验证

本轮反复执行并通过的关键验证包括：

- `python3 -m unittest -v tests.test_story_docs`
- `python3 -m unittest -v tests.test_docs_portal`
- `python3 -m tools.hmi_dsl generate-docs-portal ... --output docs_html`

同时，`mdbook-mermaid` 已可用，因此：

- 主 docs portal
- reports 子模块
- 每个 session report

都能稳定重建 HTML。

## 6. 当前结果

到本轮结束时，已经成立的结果是：

1. story 结构不再只是平铺 pack，而有了明确的阅读层次
2. generated story pack 继续保留，但不再充当主规划入口
3. `docs_html` 已是稳定的双语站点
4. 语言切换是下拉框
5. 英文源文件保持不被中文污染
6. 中文镜像已覆盖 `docs/` 下所有页面
7. reports 子模块和主 docs portal 都已重建到今天这轮

## 7. 结论

这轮最重要的成果不是单篇文档，而是把“产品 story 主线”和“最终文档输出管线”同时拉直了。

以后继续做 story、client/server 持续开发或 CNC/PLC 对接时，可以沿着这条路径推进：

- 英文源文档继续维护真实语义
- 中文镜像通过构建期 overlay 持续更新
- story 层继续按 outcome / slice 拆分
- 最终交付始终输出一套可切换中英文的 `docs_html`
