# Project Report

## Scope

2026-05-06 的工作重点是把顶部状态栏中的 `TIME` 改成 runtime server 连接状态，
并保持 Web、QML、运行契约、数据字典、最终产物和日报文档一致。

## Completed Work

### Server status chip

- Web 顶部状态栏从 `Time` chip 改为 `Server` chip。
- QML 顶部状态栏同步使用 `Server` chip。
- 状态值统一为：
  - `Connected`: 已连接 runtime server，绿色状态。
  - `Connecting`: strict 模式下正在连接 runtime server，黄色状态。
  - `Offline`: server 已配置但当前不可用，红色状态。
  - `No Server`: strict 模式没有配置 server URL，红色状态。
  - `Local`: hybrid/local 模式没有连接 server，黄色状态。
- QML chip 的 value 字色也按状态区分，避免在深色 header 内只靠背景提示。

### Runtime state and generated output

- 新增 `runtime_state.server_connection_status`，与既有
  `runtime_state.server_connected` 一起驱动顶部状态栏。
- Web runtime bridge 在 server 未配置、连接中、连接成功、连接失败时都会写入明确
  状态。
- QML runtime store 在 strict/hybrid 模式切换、bootstrap、连接失败时同步维护相同
  状态。
- `definition/ui.structure.yaml` 补齐 `server_connected` 和
  `server_connection_status` 的 state model 字段及默认值，避免运行时字段只存在于
  生成代码中。
- 重新生成 Web、QML、contract、distribution 和 snapshot 产物。

### Related documentation

- 更新 DSL data dictionary 生成逻辑中的 server connection 字段说明。
- 刷新英文与 zh-CN 的 data dictionary 输出和 i18n 状态。
- 生成今天的 report session，并保留 brief user history 与完整 Codex conversation
  export。

## Verification

已执行并通过：

```text
./tools/generate_targets.sh
```

结果：Web/QML/runtime contract/distribution 重新生成；native Drogon server 和 QML
final executable 均构建成功。

已执行并通过：

```text
python3 -m unittest tests/test_pipeline.py
```

结果：29 tests OK，1 skipped。

已执行并通过：

```text
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

结果：85 tests OK，1 skipped。

已执行并通过：

```text
git diff --check
```

已执行并确认：

```text
python3 docs_i18n/tools/i18n_status.py check --lang zh-CN --strict
```

结果仍有既有 i18n backlog：19 stale、6 untracked；本次更新的
`product/spec/data_dictionary.md` 已保持 current。

## Repository State

- `metanc_hmi_dsl` 本轮会提交顶部 server status chip、runtime state、DSL 字段、
  生成 snapshot、data dictionary 和 reports submodule 指针。
- `submodules/metanc_hmi_dsl_reports` 本轮会提交 2026-05-06 session report 与聚合
  report navigation。
- `MetaNC/nrt/hmi` 会通过 `tools/export_to_metanc.sh` 同步必要 HMI 内容，reports
  submodule 本体不导出到 `MetaNC/nrt/hmi`。

## Remaining Work

- QML strict server 模式目前已有状态字段和 UI 表达，但仍建议后续补一个真实启动
  smoke 验证，覆盖 Connected/Offline 的可视状态。
- Web 侧可以继续补 browser smoke，直接断言 server 可用、不可用和未配置三种状态。
- 顶部状态栏后续如果还要显示 server revision、transport 类型或 replay 状态，应继续
  通过 runtime state 字段扩展，而不是把判断散落在 UI 组件内。
