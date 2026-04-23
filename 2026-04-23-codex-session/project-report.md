# Project Report

## 1. 目标

本报告总结 2026-04-23 这轮围绕 HMI 前后端分离的两类连续工作：

- 在 `MetaNC/nrt/hmi` 中继续把前后端分离从“内部 split”推进到“未来独立 `hmi_backend` 可落地”的状态
- 将最新共享 HMI 包同步回 `metanc_hmi_dsl`，并在源仓库里重新生成、测试、补 report 和准备提交

## 2. 主要结果

### 2.1 规范层和迁移层文档被彻底拆开

这轮不是继续堆一份大的迁移文档，而是把内容分层：

- 规范层放在 `docs/product/spec`
  - `backend_contract.md`
  - `runtime_resources.md`
  - `contract_versioning.md`
- 迁移和治理层放在 `docs/project`
  - `hmi_backend_migration_plan.md`
  - `hmi_backend_doc_topology.md`
  - `hmi_backend_execution_checklist.md`
  - `hmi_backend_target_skeleton.md`

关键点是把“共享内容存在，但共享所有权不能存在”写成了明确规则：

- `hmi` 定义 contract
- `hmi_backend` 实现 contract
- 文档依赖方向主要是单向，不允许双向规范引用

### 2.2 contract export boundary 开始真正落地

这轮不再只是写设计文档，而是开始做第一批实际代码收口：

- 新增 `tools/hmi_dsl/contract/contract_payload.py`
  - 用 contract-side payload builder 代替 generator-side payload builder 作为 bundle 出口
- `tools/hmi_dsl/contract/export_bundle.py`
  - 不再直接依赖 `generators/shared/common.prepare_generation_payload`
  - 现在走 contract-side payload builder
- bundle 增加明确的 contract metadata
  - `contract_version`
  - `fingerprint`
  - `schema_version`
  - `manifest_document_id`
  - `product_key`
  - `active_theme_id`
- 新增 `contract.metadata.json`，并把它打进 distribution/backend

这使得未来独立 `nrt/hmi_backend` 可以把 contract bundle 当成真正的启动输入，而不是继续 import generator 内部 helper。

### 2.3 fixture backend 对 generator internals 的直接依赖继续减少

这轮继续往“fixture 只是 fixture，不再是假装生产 backend”这个方向推进：

- `fixtures/mock_runtime_backend.py`
  - 移除对 `prepare_generation_payload()` 的直接依赖
  - 直接从 `build_runtime_contract_bundle()` 获取输入
  - bootstrap 里显式暴露 `contract` metadata

同时，program workspace 相关 helper 被提升到 contract 层：

- 新增 `tools/hmi_dsl/contract/program_workspace.py`
- `generators/shared/program_workspace.py` 退化为兼容 wrapper

这一步很重要，因为这意味着：

- backend-facing contract/export/fixture 这条线，已经不再需要从 generator 目录“借”语义 helper

### 2.4 断线后的 strict split 行为继续收口

在此前的 strict split 基础上，这轮继续修了断线时 `PROGRAM` 页异常的问题：

- 如果 backend 曾经连上过，再断开时，Web/QML 都保留最后一份快照
- 不再在断线瞬间清空全部 `properties/resources/streams`
- 内部 silent 回写在离线时直接 no-op，避免 `PROGRAM` 页编辑器和 footer 反复触发额外刷新

这让 split 结果从“能跑”进一步靠近“可维护、可说明、可迁移”。

## 3. 同步到 `metanc_hmi_dsl`

这轮没有把 `MetaNC` 里的生成物直接拷过来，而是按 shared package 边界同步：

- 同步共享包源码和文档
- 保留 `metanc_hmi_dsl` 自己的 report surface
- 不把 MetaNC 的宿主集成状态和本地 scratch 内容带进源仓库

同步后，`metanc_hmi_dsl` 本地重新承担：

- tests
- `generate_targets.sh`
- report 更新
- docs rebuild

## 4. 验证

在 `MetaNC/nrt/hmi` 中已完成：

- `python3 -m unittest -v tests.test_mock_runtime_backend tests.test_generator_refactor tests.test_pipeline`
- `./tools/generate_targets.sh`

在 `metanc_hmi_dsl` 中，本轮同步后继续执行：

- HMI 包 tests
- `./tools/generate_targets.sh`
- report book rebuild

## 5. 当前结论

截至本轮结束，前后端分离工作已经从“只在一个模块里做结构分层”向“准备独立 `hmi_backend` 模块”迈出了第一批真正的实现步骤。

最关键的成果不是单个脚本，而是三件事一起成立：

1. 文档 ownership 被厘清
2. contract export boundary 开始代码化
3. 源仓库和宿主仓库的同步边界开始稳定
