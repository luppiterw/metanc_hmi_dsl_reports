# Project Report

## Scope

2026-05-05 的工作重点是继续完善 HMI client/server 边界，先补齐
runtime subscription 的真实连接级测试，再把程序资源流从前端 mock 行为推进到
server simulator 的可变更资源契约。

## Completed Work

### WebSocket subscription conformance

- 新增真实 `/api/runtime/ws` WebSocket 黑盒测试。
- 覆盖 `runtime.subscription.ready`、`runtime.subscribe`、过滤后的
  `runtime.state.changed`、`runtime.command.completed`、`runtime.operator_notice`
  和非法 subscription message 的 `runtime.subscription.error`。
- 将新增测试挂入 server CTest，server 测试集从 3 个用例扩展为 4 个用例。
- 补充 Web/QML 生成代码的 subscription 行为断言：
  - global subscription 与 active page subscription 合并；
  - 页面切换会刷新 subscription；
  - `operator_notices` 始终全局订阅；
  - `diagnostics.logs.*` 不混入默认 state subscription。

相关提交：

- `metanc_hmi_dsl`: `e8659f4 test: add websocket subscription blackbox coverage`
- `MetaNC`: `8f13333 test(hmi): sync websocket subscription coverage`

### Program workspace mutation on server simulator

- server simulator 现在正式处理：
  - `prog.commands.save`
  - `prog.commands.save_as`
  - `prog.commands.new`
  - `prog.commands.rename`
  - `prog.commands.delete`
- 这些命令会更新 server 侧的 `program.browser.entries`、
  `program.document.content`、`prog.name` 和当前程序本地状态。
- 重复创建、缺失名称、重命名冲突、删除不存在程序等情况返回 rejected。
- `runtime_rest_api_test` 新增程序 workspace mutation 契约测试，覆盖
  create/save/save_as/rename/delete 以及重复创建拒绝。

相关提交：

- `metanc_hmi_dsl`: `ed47fa7 feat: handle simulator program workspace mutations`
- `MetaNC`: `c0bfe09 feat(hmi): sync simulator program mutations`

## Verification

已执行并通过：

```text
ctest --test-dir generated/server-build --output-on-failure
```

结果：4/4 passed。

已执行并通过：

```text
python3 -m unittest tests.test_pipeline tests.test_server_api_docs tests.test_mock_runtime_server tests.test_program_execution_contract
```

结果：43 passed，1 skipped。

已执行并通过：

```text
python3 -m unittest tests.test_program_execution_contract tests.test_mock_runtime_server
```

结果：9 passed。

已执行并通过：

```text
git diff --check
```

## Repository State

- `metanc_hmi_dsl` 当前包含今天新增的 HMI 变更提交，并在本轮报告创建后会更新
  reports submodule 指针。
- `MetaNC` 已同步 HMI 变更；reports submodule 内容不会导出到 `MetaNC/nrt/hmi`。
- `docs_html/reports/2026-05-05-codex-session/index.html` 已生成，用于本地最终
  文档门户查看。

## Remaining Work

- 程序 workspace mutation 目前仍是 simulator 层实现，真实 workspace adapter
  尚未接入。
- 后续需要继续补 Web/QML 在 strict server 模式下对程序 mutation command 的
  端到端验证。
- 程序资源流进一步扩展时，需要继续保持 server 为资源状态权威来源，避免 UI 本地
  mock 与 server workspace 状态再次分叉。
