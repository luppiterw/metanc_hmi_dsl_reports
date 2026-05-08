# Project Report

## Scope

本轮工作围绕 PROG DIR 的目录层级交互和 workspace mutation 语义展开。
目标是让程序文件浏览器更接近真实数控 HMI 的文件管理体验：目录层级返回属于
浏览器列表内部行为，底部 `Return` 只负责回到程序编辑区；进入子目录后新建文件
或文件夹必须写入当前目录；空目录也应保持固定列表行高和主体区域高度，不应把单行
条目拉伸成整块卡片。

## Completed Work

- 将 PROG DIR 底部 `Return` 软键收敛为页面返回动作，返回当前程序编辑器，不再承担
  目录上一级导航。
- 在 Web/QML 程序浏览器中增加 client synthetic `..` parent row。该行只在
  `runtime_state.program_browser_path` 低于 root 时显示，点击后调用
  `progdir.commands.up`。
- 保持 root 目录越界保护：root 下不渲染 parent row，server 端 `progdir.commands.up`
  继续拒绝向 root 之上返回。
- 修复 QML 程序浏览器键盘导航：选中 synthetic parent row 时不会把 `__parent__`
  写成真实程序选择，Enter 会触发目录上一级命令。
- 修复 native simulator server 的 `prog.commands.new` 作用域。空名称自动生成和显式
  文件名现在都会基于当前 `program_browser_path` 拼接路径，进入文件夹后创建文件不再
  写回 root。
- 增加 server REST 回归覆盖，锁住 nested folder 中创建 program file 的行为。
- 修复 Web 程序浏览器列表布局：空目录或单条目目录使用固定行高向上排列，不再被
  CSS grid 拉伸填满整个主体区域。
- 更新 Web/QML 生成快照、mock runtime 测试、pipeline 测试和 PROG DIR 相关文档。
- 生成 2026-05-08 report 与 Codex 完整会话导出，并准备同步到 MetaNC。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m unittest -v tests.test_pipeline.PipelineTests.test_generate_web_outputs_static_files tests.test_pipeline.PipelineTests.test_generate_qml_outputs_main_and_theme_store tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_mock_runtime_server.MockRuntimeServerTests.test_new_folder_creates_empty_program_directory_entry`
- `./generated/server-build/runtime_rest_api_test`
- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- `git diff --check`
- Headless Web split-mode probe against `./generated/distribution/run_split_web_native.sh`
  verified root/no-parent behavior, folder parent-row behavior, footer Return page navigation,
  current-directory file creation, and stable `37px` sparse-directory rows.

## Follow-Up

- Define rename/delete policy for nested folders before exposing those paths as production file
  management operations.
- Add durable CI-level browser interaction tests for PROG DIR navigation and current-directory file
  creation, replacing today's ad hoc headless probe with maintained coverage.
- Revisit save-as/new-file naming policy when real filesystem constraints and CNC controller naming
  rules are introduced.
