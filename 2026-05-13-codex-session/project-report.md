# Project Report

## Scope

本轮先按用户要求回到“生成器源码拆解优化”的方向，完成当前 Web/QML generator
源码体量盘点，把后续是否还值得拆、该拆哪里、什么时候停止拆写成可引用的文档；
随后按该结论完成 Web app-shell P0 最小拆分并收口。后续又处理了 docs portal
兼容性和 PROG DIR 文件管理补齐，重点是把原先 partial 的 Rename/Delete/Refresh
做成 Web/QML/server 一致的可测试闭环。

## Completed Work

- 统计 `client/web_client` 和 `client/qml_client` 下的 Python 源文件体量：
  - Python 文件数：200。
  - 总行数：28,882。
  - 大于等于 250 行的文件：35。
  - 大于等于 500 行的文件：9。
  - Web 侧大于等于 250 行的文件：21。
  - QML 侧大于等于 250 行的文件：14。
- 新增英文文档：
  - `docs/development_guidelines/generator_decomposition_inventory.md`
- 新增中文 overlay：
  - `docs_i18n/zh-CN/development_guidelines/generator_decomposition_inventory.md`
- 更新中英文 docs navigation：
  - `docs/SUMMARY.md`
  - `docs/development_guidelines/index.md`
  - `docs_i18n/zh-CN/SUMMARY.md`
  - `docs_i18n/zh-CN/development_guidelines/index.md`
- 文档结论：
  - 继续拆分需要有明确停止条件，不能为了 housekeeping 无止境拆。
  - Web `client/web_client/app_shell.py` 是本轮 P0，因为它原先仍有 1,375 行，
    且混合 settings、custom select、page render、footer navigation、theme、
    Program editor focus preservation、chrome/status/notice helpers。
  - P1 文件只在真实功能改动触达时顺手拆，不建议为了 housekeeping 一口气拆完。
  - 本阶段停止条件建议为：没有超过 1,000 行的 generator source 文件，高频编辑
    文件约束到 600 行左右，decomposition-only 工作不引入新的公开 DSL/runtime 行为。
- 完成 Web app-shell P0 拆分：
  - 新增 `client/web_client/app_shell_fragments/settings.py`，承接 settings panel、
    field helpers、defaults、persistence、runtime URL normalization 和 connection
    probe helpers。
  - 新增 `client/web_client/app_shell_fragments/selects.py`，承接 reusable custom
    select control rendering、keyboard handling、open/close behavior 和 focus helpers。
  - `client/web_client/app_shell.py` 从 1,375 行降到 783 行，保留 compatibility
    assembler、page rendering、footer navigation、theme application、chrome/status
    chips、Program editor focus preservation、auxiliary panel 和 shortcuts。
  - 拆分后 Web/QML generator Python 文件总数为 203，总行数为 28,913，已无超过
    1,000 行的文件。
- 完成 docs portal 和 runtime status 文档修复：
  - `bookshelf.toml` 从旧 `entry-page` 字段升级为 `mdbook-bookshelf 0.2.x`
    兼容模型，显式声明 documentation index、book ids 和 categories。
  - `tools/hmi_dsl/docs_portal.py` 生成新版 bookshelf config，English、zh-CN
    和 dated report books 都从根 `docs_html/index.html` 入口索引。
  - `tests/test_docs_portal.py` 更新为验证新版根入口，不再依赖旧
    `en/bookshelf.html`。
  - `server/README.md` 删除过期的 Web/QML subscription/strict-client Next Steps，
    改为记录真实 southbound adapters、生产 command schema 和 persistence state
    stores 这些仍待完成的 server 方向。
  - README 与开发指南补充 `mdbook-bookshelf 0.2.x` docs portal 模型说明。
- 完成 PROG DIR 文件管理补齐：
  - 新增 DSL 命令 `progdir.commands.refresh`、`progdir.commands.rename`、
    `progdir.commands.delete`。
  - Web 和 QML footer command guard 已切到 `progdir.commands.*`，旧
    `prog.commands.rename/delete` 保留兼容。
  - Web local runtime、QML local runtime、fixture mock runtime 和 C++ simulator
    adapter 均实现同一套路径策略。
  - `Refresh` 仅刷新当前目录，不改变目录路径。
  - `Rename` 支持文件和目录；目录 rename 会移动子树，并保留当前打开程序路径。
  - `Delete` 支持文件和空目录；非空目录删除返回
    `program.directory_not_empty`，避免隐式递归删除。
  - 路径边界收敛为 basename-only rename，拒绝空名称、路径分隔符、越界路径、
    重名 target 和不存在 entry。
  - 删除当前打开程序时清空当前程序，避免自动回根目录或加载别的程序。
  - 中英文 interface integration、program story、Web/QML parity 和 data
    dictionary 已同步更新。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m unittest tests.test_generator_refactor`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 docs_i18n/tools/i18n_status.py mark-current --lang zh-CN development_guidelines/generator_decomposition_inventory.md --write-report`
- `python3 -m unittest tests.test_docs_portal`
- `python3 -m unittest tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 -m unittest tests.test_mock_runtime_server tests.test_pipeline tests.test_generator_refactor tests.test_parity_scenarios`
- `ctest --test-dir generated/server-build --output-on-failure -R "runtime_rest_api_test|server_smoke_test"`
- `python3 -m unittest tests.test_web_qml_parity_docs tests.test_server_api_docs docs_i18n.tests.test_i18n_status`
- `git diff --check`

Validation result: generated Web/QML/server/distribution artifacts were refreshed
without snapshot drift, the generator refactor tests still pass, and the
inventory page now records the completed app-shell split in both English and
zh-CN docs navigation. The rebuilt docs portal now succeeds with
`mdbook-bookshelf 0.2.x` and publishes the root documentation index plus dated
report books under `docs_html/`. The PROG DIR slice was completed with unit
coverage for mock runtime behavior, native REST coverage for the C++ simulator
adapter, regenerated Web/QML snapshots, and a clean whitespace check.

## Next Recommendation

Pause decomposition-only work unless the next product change touches a P1 file.
For product-facing work, the next durable branch should move from generated UI
polish back toward runtime semantics: PROG DIR recursive delete/permission policy
should remain explicit and deferred until the real program-file adapter boundary
is designed; runtime adapter boundaries, production command schema, persistence
state stores, and the planned Logs shared scenario remain the next larger product
directions.
