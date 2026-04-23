# Conversation Report

## 1. 记录原则

本文件保留的是摘要化过程和工程推进脉络，不记录模型内部原始推理链。

## 2. 阶段时间线

### 阶段 A: 从“继续讨论架构”切换到“开始做第一批实活”

用户先要求不要再只停留在方案层，要开始真正落地，并在完成后同步到 `metanc_hmi_dsl`：

- `MetaNC` 不提交
- `metanc_hmi_dsl` 需要同步、生成产物、测试、补 report 并提交 `front_back_seperate`

因此这轮的工作重点从“继续解释分离方案”切到“真正做 export boundary 和同步流程”。

### 阶段 B: 先把文档层的 ownership 彻底厘清

在开始改代码前，先明确一个长期维护问题：

- `hmi`
- `hmi_backend`

两边将来一定会共享主题，但不能共享所有权。

于是这轮先把文档拆成三层：

- contract-defining docs
- backend implementation docs
- migration/project docs

并明确依赖方向主要是一条单向链：

`hmi spec -> contract export -> hmi_backend docs/code`

### 阶段 C: 开始把 contract export 从 generator helper 上拆下来

进入代码实现后，首先定位到最关键的一层耦合：

- `export_bundle.py`
- `mock_runtime_backend.py`

都还依赖 `prepare_generation_payload()` 这类 generator-side helper。

这意味着未来真正的 backend 很容易继续“顺手 import generator 代码”，这是明显错误的方向。

于是这轮的关键决策是：

- 在 contract 层新增独立 payload builder
- 让 export bundle 和 fixture backend 都改走 contract-side helper

### 阶段 D: 让 contract bundle 成为真正的 backend 输入面

只是把 helper 挪个目录还不够。
未来独立 backend 需要的，不是“凑巧能读的 json”，而是带版本和身份的 contract artifact。

于是这轮继续补上：

- contract metadata
- contract version
- fingerprint
- schema version
- manifest/product/theme 标识

并单独导出：

- `contract.metadata.json`

### 阶段 E: 连 program workspace 也从 generator 语义层抽出来

继续检查后发现：

- program workspace helper 仍然挂在 `generators/shared`

这对生成器没问题，但对 future backend/export/fixture 语义来说，目录归属不对。

因此这轮继续把：

- `build_program_workspace`
- `build_program_workspace_seed`
- `normalize_relative_path`
- `count_program_lines`

提升到 contract 层，并让旧 generator 路径只保留 wrapper。

### 阶段 F: MetaNC 本地先验证，再同步回 `metanc_hmi_dsl`

代码收口后，先在 `MetaNC/nrt/hmi` 本地验证：

- mock backend tests
- generator tests
- pipeline tests
- full `generate_targets.sh`

验证通过后，再按 shared package 边界同步到 `metanc_hmi_dsl`，避免把宿主仓库里与 host 集成有关的东西直接倒灌回源仓库。

### 阶段 G: report 不只生成 user-history，而是补成可审阅材料

同步完成后，这轮没有只停在 “跑 export_codex_user_history.py 生成一个空 session 目录”。

还继续补了：

- README
- project-report
- conversation-report
- workflow diagram
- architecture diagram

这样今天这轮不仅有代码和测试，还有结构化交付记录。
