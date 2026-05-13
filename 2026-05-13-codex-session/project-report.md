# Project Report

## Scope

本轮按用户要求先回到“生成器源码拆解优化”的方向，没有继续推进新的 Web/QML
功能验收场景。目标是做一次当前 Web/QML generator 源码体量盘点，把后续是否还
值得拆、该拆哪里、什么时候停止拆写成可引用的文档。

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
  - 继续拆分仍有价值，但应有明确停止条件。
  - 下一步最值得做的是 Web `client/web_client/app_shell.py`，因为它仍有
    1,375 行，且混合 settings、custom select、page render、footer navigation、
    theme、Program editor focus preservation、chrome/status/notice helpers。
  - P1 文件只在真实功能改动触达时顺手拆，不建议为了 housekeeping 一口气拆完。
  - 本阶段停止条件建议为：没有超过 1,000 行的 generator source 文件，高频编辑
    文件约束到 600 行左右，decomposition-only 工作不引入新的公开 DSL/runtime 行为。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m unittest tests.test_generator_refactor`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 docs_i18n/tools/i18n_status.py mark-current --lang zh-CN development_guidelines/generator_decomposition_inventory.md --write-report`
- `git diff --check`

Validation result: generated Web/QML/server/distribution artifacts were refreshed
without snapshot drift, the generator refactor tests still pass, and the new
inventory page is reachable from both English and zh-CN docs navigation.

## Next Recommendation

Do one bounded Web app-shell decomposition slice:

1. extract settings storage and field helpers into
   `client/web_client/app_shell/settings.py`;
2. extract custom select helpers into `client/web_client/app_shell/selects.py`;
3. keep `client/web_client/app_shell.py` as the compatibility assembler;
4. require byte-stable generated Web/QML snapshots or a narrow, explained diff.

After that slice, reassess before splitting more.
