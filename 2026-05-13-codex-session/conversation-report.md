# Conversation Report

## Summary

本轮开始时，上一条计划误把下一步切到了 Logs S3 shared scenario。用户指出这已
经不是前面持续做的 generator 拆解优化方向。随后方向被重新收敛为：

- 先做当前 Web/QML generator Python 源码体量盘点。
- 找出还值得拆的文件和不值得继续拆的文件。
- 把判断落到 docs 和中文 overlay，作为后续是否继续拆的依据。
- 先不修改 generator 行为，等用户确认后再执行 P0 app-shell 最小拆分。

盘点结果显示，前面多轮拆分已经把大量职责拆到 `style_emitters/`、
`runtime_fragments/`、`widget_core/`、`widget_fragments/`、`main_qml_parts/`
和二级 runtime/program fragments 中。用户随后同意收口当前 P0 切片，Web
`app_shell.py` 已完成拆分：settings 和 custom select 被移动到
`app_shell_fragments/`，`app_shell.py` 从 1,375 行降到 783 行。拆分后
Web/QML generator source 已无超过 1,000 行的 Python 文件。

## Key Decisions

- 继续拆分仍有价值，但不能无止境进行。
- P0 `client/web_client/app_shell.py` 拆分已完成；这是本轮收敛点。
- Web Logs、server bridge、command handlers、DEBUG query、Program search 和
  QML Logs/Program fragments 都标为 P1：只在真实功能改动触达时顺手拆。
- QML smoke helper、gauge、support files、style emitters 等当前不是瓶颈。
- decomposition-only slice 必须验证 generated snapshots，不应引入新 runtime
  或 DSL 行为。

## Outcome

- 新增 generator decomposition inventory 文档。
- 中英文 docs navigation 已挂载。
- Web app-shell settings/selects fragments 已落地，生成产物保持 snapshot-stable。
- docs portal 已升级到 `mdbook-bookshelf 0.2.x` 兼容配置，根入口改为
  `docs_html/index.html` 的 documentation index。
- server runtime README 已清理过期 Next Steps，当前剩余方向被重新表述为真实
  adapter、生产 command schema 和 persistence state store。
- 生成产物和 docs/report HTML 已刷新。
- 下一轮建议暂停 decomposition-only 工作，除非新的功能改动触达 P1 文件。

## Follow-up Closeout

在用户确认“功能内容还有什么要处理”后，本轮先处理文档部分：修正
`mdbook-bookshelf` 配置兼容性，更新 docs tooling 说明，清理 server README 中
已经完成的 split-runtime 客户端接入事项，并重新生成 docs portal。该工作以
`docs: align bookshelf portal and runtime status` 单独提交，随后进入 report、
MetaNC 同步和推送流程。

## PROG DIR Completion

用户随后追问 PROG DIR 中 Rename/Delete/Refresh 仍为 partial 的含义，并确认
可以按“当前目录边界、basename-only rename、空目录 delete、非空目录拒绝”的
策略补齐。实现过程中按 TDD 路径推进：

- 先在 `tests/test_mock_runtime_server.py` 增加 refresh、rename file、rename
  non-empty directory subtree、delete file、delete empty directory、reject
  non-empty directory、reject duplicate/unsafe path 等用例。
- 再在 `server/tests/runtime_rest_api_test.cpp` 增加 native REST 层覆盖，确保
  C++ simulator adapter 与 mock runtime 行为一致。
- 最后接入 Web/QML command guard 和 local runtime，并刷新 generated snapshots。

本轮决策是继续拒绝隐式递归删除和跨目录 rename，把权限、递归删除、重名冲突
交互和真实程序文件 adapter 留到后续真实后端边界设计中处理。当前交付目标是让
PROG DIR 的基础文件管理命令不再只是 UI 占位，而是在 Web/QML/server 上具有一致
行为和测试覆盖。
