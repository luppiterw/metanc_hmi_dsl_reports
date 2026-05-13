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
- 生成产物和 docs/report HTML 已刷新。
- 下一轮建议暂停 decomposition-only 工作，除非新的功能改动触达 P1 文件。
