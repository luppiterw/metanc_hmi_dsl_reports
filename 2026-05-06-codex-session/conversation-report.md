# Conversation Report

## Summary

本次会话围绕 `metanc_hmi_dsl` 的当前生成成果继续推进。先确认把 native C++ 最低标准
降到 C++17 是否有影响，随后完成 C++17 build floor、docs/bookshelf、MetaNC 同步和
push。接着检查 Logs 页右侧详情常驻的问题，决定采用“全宽表格 + 底部按需详情”的
布局，并在 Web/QML 生成端实现。随后继续处理 Logs 列显示能力：默认保留高价值扫读列，
把低频字段放到可选列中，并让 `Message` 成为主要宽度列；最后补齐 Web Logs 工具按钮、
筛选控件和 More 面板控件的 hover/click/focus 反馈。之后继续处理 Logs
`Export JSONL`，把 Web 和 QML 都从剪贴板导出改成用户可保存的 JSONL 文件。

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
- Web Logs 默认列为 `Time / Level / Source / Event / Message`；低频字段通过 More
  面板显示，长 message 可切换 wrap。
- Logs 操作控件必须显式表达 hover、pressed 和 keyboard focus，不能像静态 label。
- Logs `Export JSONL` 应该是真正的文件导出。Web 优先使用浏览器 save picker 并提供
  download fallback；QML 使用 native `QFileDialog`，保存失败时才回退到剪贴板。

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

QML native dialog support 相关静态检查和启动检查：

```text
python3 -m py_compile client/qml_client/generator.py client/qml_client/runtime_shell.py client/qml_client/program_workspace_backend.py client/qml_client/support_files.py client/web_client/widget_emitters.py client/web_client/runtime_shell.py
env QT_QPA_PLATFORM=offscreen HMI_QML_SNAPSHOT_PATH=/tmp/metanc_qml_export_probe.png HMI_QML_SNAPSHOT_DELAY_MS=300 ./generated/qml-final/appCNC_HMI_DSL
```

日报生成和 Codex 对话导出：

```text
python3 tools/export_codex_user_history.py --mode brief --date 2026-05-06
python3 tools/export_codex_user_history.py --mode full --date 2026-05-06
```

report/docs 构建：

```text
mdbook build submodules/metanc_hmi_dsl_reports
mdbook build submodules/metanc_hmi_dsl_reports/2026-05-06-codex-session
./tools/build_docs_html.sh
```

## Follow-up

- 给 Logs 页补 browser-level 行点击和详情收起 smoke。
- 给 Logs visible-column popover 补 browser-level smoke，包括 column toggle、wrap
  toggle、reset 和外部点击关闭。
- 给 Web save picker/download fallback 和 QML native save dialog 补可维护的交互级
  smoke；当前 generator tests 能覆盖代码生成和静态语法，但不能模拟人工保存路径。
- 后续设置页可以加入 Logs detail mode，但第一版先保持默认 bottom detail。
- 如果真实现场日志列更多，应继续把低频字段放进详情面板，而不是恢复常驻右侧详情。
