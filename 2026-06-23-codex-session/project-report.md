# Project Report

## HMI WorkOffset PR 收尾

- PR `#59` 保持面向 `main` 的 WorkOffset V1 零偏表集成入口，说明补充了 real backend 路径、generated launcher、验证项和 review 修复清单。
- 针对 review 反馈修复了 mock runtime WCS 激活状态刷新、`wcs.active` 数值保持、real backend stale detail 映射、WorkOffset view `snapshot_revision` 刷新、launcher recovery 文案和 fixture 非法 revision 拒绝。
- PR diff 从早期的大型 snapshot 变更收敛到语义代码、测试和文档；`full_settable_demo.snapshot.json` 改为生成器按需生成。
- Web/QML 大型 generated golden snapshot diff 改为 focused generated-output contract assertions，保留语义检查，减少 review 噪音。

## 同步与发布

- `feat/hmi-work-offset-table` 的后续修复已同步进 MetaNC 长期维护分支 `feat/hmi`。
- standalone `metanc_hmi_dsl` 从 MetaNC `feat/hmi` worktree 导入最新 HMI 包内容，保留 source-only report/docs surfaces。
- 6/23 Codex 完整会话导出已写入 reports submodule，用于后续 report book 和 docs portal 刷新。

## 验证记录

- 在 MetaNC `feat/hmi` worktree 运行 `./tools/generate_targets.sh`，生成 Web、QML、native server 和 distribution。
- `ctest --test-dir generated/server-build --output-on-failure` 通过 `12/12`。
- `python3 .mdbook/lint_docs_policy.py` 通过。
- `python3 -m unittest -v tests.test_mock_runtime_server` 通过 `19` 个测试。
- WorkOffset demo launcher、QML final executable、native server 和 Web index 文件存在性检查通过。
