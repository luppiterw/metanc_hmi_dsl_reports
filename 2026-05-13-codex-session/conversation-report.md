# Conversation Report

## Summary

本轮开始时，上一条计划误把下一步切到了 Logs S3 shared scenario。用户指出这已
经不是前面持续做的 generator 拆解优化方向。随后方向被重新收敛为：

- 先做当前 Web/QML generator Python 源码体量盘点。
- 找出还值得拆的文件和不值得继续拆的文件。
- 把判断落到 docs 和中文 overlay，作为后续是否继续拆的依据。
- 本轮不直接修改 generator 行为。

盘点结果显示，前面多轮拆分已经把大量职责拆到 `style_emitters/`、
`runtime_fragments/`、`widget_core/`、`widget_fragments/`、`main_qml_parts/`
和二级 runtime/program fragments 中，但仍存在 35 个大于等于 250 行的文件。
唯一仍超过 1,000 行的是 Web `app_shell.py`。

## Key Decisions

- 继续拆分仍有价值，但不能无止境进行。
- 下一步 P0 只推荐拆 `client/web_client/app_shell.py`。
- Web Logs、server bridge、command handlers、DEBUG query、Program search 和
  QML Logs/Program fragments 都标为 P1：只在真实功能改动触达时顺手拆。
- QML smoke helper、gauge、support files、style emitters 等当前不是瓶颈。
- decomposition-only slice 必须验证 generated snapshots，不应引入新 runtime
  或 DSL 行为。

## Outcome

- 新增 generator decomposition inventory 文档。
- 中英文 docs navigation 已挂载。
- 生成产物和 docs/report HTML 已刷新。
- 下一轮可以基于该文档讨论是否做 Web app-shell 最小拆分，或者暂停拆分回到功能。
