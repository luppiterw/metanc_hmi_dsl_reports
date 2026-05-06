# Conversation Report

## Summary

本次会话围绕 `metanc_hmi_dsl` 的当前生成成果继续推进。先确认把 native C++ 最低标准
降到 C++17 是否有影响，随后完成 C++17 build floor、docs/bookshelf、MetaNC 同步和
push。接着检查 Logs 页右侧详情常驻的问题，决定采用“全宽表格 + 底部按需详情”的
布局，并在 Web/QML 生成端实现。

最后根据用户要求刷新今天的 report、关联文档、生成产物，并准备按 reports submodule、
source repo、MetaNC downstream 的顺序提交和推送。

## Decisions

- native C++ target 的最低标准统一为 C++17；server 和 generated Qt/QML support target
  不再要求 C++20。
- 最终 docs portal 使用 `mdbook-bookshelf`，保留 reports submodule 的 dated session
  books 并由 `./tools/build_docs_html.sh` 统一发布。
- Logs 页的默认阅读目标是扫读和过滤日志列表，因此默认不占用右侧详情宽度。
- `selected_log_code` 继续表示当前选中行，但详情是否打开由新增
  `runtime_state.log_detail_open` 控制，避免自动选中最新日志导致详情自动展开。
- Web 和 QML 的 Logs 交互保持一致：点击行打开底部详情，`Close` 收起，`Copy` 复制
  当前日志。

## Commands And Evidence

关键生成：

```text
./tools/generate_targets.sh
```

关键测试：

```text
env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 python3 -m unittest tests/test_pipeline.py -v
git diff --check
```

日报生成和 Codex 对话导出：

```text
python3 tools/export_codex_user_history.py --mode brief --date 2026-05-06
python3 tools/export_codex_user_history.py --mode full --date 2026-05-06
```

待提交前的 report/docs 构建：

```text
mdbook build submodules/metanc_hmi_dsl_reports
mdbook build submodules/metanc_hmi_dsl_reports/2026-05-06-codex-session
./tools/build_docs_html.sh
```

## Follow-up

- 给 Logs 页补 browser-level 行点击和详情收起 smoke。
- 后续设置页可以加入 Logs detail mode，但第一版先保持默认 bottom detail。
- 如果真实现场日志列更多，应继续把低频字段放进详情面板，而不是恢复常驻右侧详情。
