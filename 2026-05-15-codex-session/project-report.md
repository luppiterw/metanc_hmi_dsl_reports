# Project Report

## Focus

本轮围绕 `metanc_hmi_dsl` 与 `MetaNC` 的 HMI 同步链路收口，重点处理了
AUTO 周期启动的客户端体验问题、最终产物验证、报告导出、docs 刷新和
MetaNC downstream 同步准备。

## Delivered Changes

- Web/QML 客户端的 `cnc.commands.cycle_start` 增加自动准备流程。
- 当当前程序已经被选中但 active program 仍处于 `loaded` 状态时，客户端先调用
  `prog.commands.prepare_execute`，等待 `program.active.meta.state` 进入
  `prepared`，再发送 `cnc.commands.cycle_start`。
- server 侧生命周期约束保持严格：`cycle_start` 仍只接受 `prepared/paused`
  active program，避免把 UI 便利性下沉成 server 宽松状态机。
- `prog.commands.prepare_execute` 的 Web/QML payload 组织被收敛到共享 helper，
  减少当前程序、编辑器内容、光标行号三者在不同动作中的漂移。
- `metanc-layout` 下的 HMI package root 补回 `.dockerignore`，避免 filtered export
  删除 `MetaNC/nrt/hmi/.dockerignore`，保持 Docker build context 边界一致。

## Verification

同步前已完成以下验证：

- `./tools/generate_targets.sh`
- `python3 -m py_compile nrt/hmi/client/web_client/widget_core/command_guards.py nrt/hmi/client/qml_client/main_qml_parts/command_actions.py`
- `python3 -m unittest nrt.hmi.tests.test_mock_runtime_server nrt.hmi.tests.test_program_execution_contract nrt.hmi.tests.test_web_qml_parity_docs`
- `ctest --test-dir generated/server-build --output-on-failure`
- split Web/native live smoke:
  - 启动 `./nrt/hmi/generated/distribution/run_split_web_native.sh 8010 8000`
  - 通过 headless Chromium 点击最终 Web 产物的 `START`
  - 捕获到 `prog.commands.prepare_execute` 后接 `cnc.commands.cycle_start`
  - 最终状态进入 `runtime_state.execution_state = Running`

## Final Artifacts

本轮重新生成并检查了这些最终产物：

- `generated/web`
- `generated/qml`
- `generated/qml-final/appCNC_HMI_DSL`
- `generated/server-build/server`
- `generated/distribution`

## Sync Notes

同步到 `MetaNC` 时继续使用 filtered export：

- 保留 `metanc_hmi_dsl` 中的 report submodule、repo sync 工具和本地报告输出。
- 向 `MetaNC/nrt/hmi` 下游同步 HMI runtime/client/server/docs 源内容。
- 同步后需要在 `MetaNC` 再跑关键测试，确认 downstream 结构没有破坏导入路径。

## Follow-Up

UI 自动化测试需要进入常规验证链路。当前已有一次临时 CDP smoke 证明问题可以被
自动化捕获，后续建议把它固化为 Web split smoke，并为 QML 增加等价的轻量状态机
或 UI 驱动测试入口。
