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

## Program Workspace Adapter Boundary

用户随后要求按规划详细设计实施，并强调 TDD 驱动。实现路径先新增
`program_workspace_adapter_test`，用测试锁定 program workspace 的 list/read/write、
create folder、rename、delete 和路径边界行为；随后新增
`ProgramWorkspaceAdapter` interface 和 `SimulatorProgramWorkspaceAdapter`。

这轮重构把 `SimulatorAdapter` 里原本直接维护的 program file map/set、目录树
rename/delete 和路径校验逻辑迁到 adapter 后端中。对 Web/QML 和 REST/WS client
来说，`progdir.commands.*`、`program.browser.*`、当前程序资源读取/保存语义保持
不变；变化集中在 server 内部边界，为后续 filesystem-backed 或真实 controller
program workspace adapter 留出替换点。

验证收口包括 dedicated adapter test、native REST smoke、完整 C++ server tests、
完整 Python unittest discovery、最终 Web/QML/server/distribution 生成，以及
docs/report HTML 重建。

## Filesystem Program Workspace

用户确认继续按 TDD 实施 filesystem-backed program workspace。实现时先新增
`filesystem_program_workspace_adapter_test`，确认缺少 adapter header 的失败点；
随后新增 `FilesystemProgramWorkspaceAdapter`，并把 `ProgramWorkspaceAdapter`
interface 补齐 `sorted_file_paths` 和 `used_bytes`，使 simulator/filesystem 后端都能
服务同一组 runtime 字段。

server 初始化增加 backend selection：默认仍为 simulator；设置
`HMI_PROGRAM_WORKSPACE_BACKEND=filesystem` 和 `HMI_PROGRAM_WORKSPACE_ROOT` 后，
`ServerApp` 会向 `SimulatorAdapter` 注入 filesystem workspace。REST 层测试证明
`prog.commands.new`、`prog.commands.save`、`progdir.commands.new_folder`、
`progdir.commands.rename` 和 `progdir.commands.delete` 能真实落盘，并且 root
escape、basename-only rename、空目录删除、非空目录拒绝等策略保持一致。

测试过程中发现 `../ESCAPE.MPF` 这类非法路径会在 command 层被 normalize 成空名称
并触发自动命名，随后修复为明确返回 `program.path_invalid`。当前 filesystem
backend 被定义为本地开发/集成后端，不等同真实 CNC/controller 文件系统；递归删除、
权限、冲突和多 client 策略仍需后续单独产品化。

## Packaged Filesystem Workspace Smoke

用户随后要求继续按 TDD 验证最终分发产物路径。新增测试
`tests/test_filesystem_program_workspace_distribution.py`，它不再使用 C++ in-process
server，而是带 `HMI_PROGRAM_WORKSPACE_BACKEND=filesystem` 和
`HMI_PROGRAM_WORKSPACE_ROOT=<tempdir>` 启动
`generated/distribution/run_server_native.sh`，等待 `/api/runtime/health` 后通过真实
HTTP 调用 `/api/runtime/bootstrap` 和 `/api/runtime/commands`。

该 smoke 覆盖 program new/save/new folder/rename/delete 的磁盘结果，并确认
`../ESCAPE.MPF` 不会逃逸 root、非空目录 delete 会被拒绝。第一次运行即通过，说明
distribution helper 已正确透传 env，打包 native server 也包含 filesystem backend。
随后完整 `ctest` 和 Python unittest discovery 通过，Python 回归数从 139 增至
140。

## Expanded Filesystem Workspace Scenarios

用户随后认为这部分需要更多实际测试场景，而不是只停留在策略描述。本轮继续扩展
packaged distribution 测试：外部文件创建、删除、重命名后，`progdir.commands.refresh`
能够更新目录列表；进入子目录后，New File 和 New Folder 必须写入当前目录；重复
创建、缺失文件打开、非法 rename、target exists、root up 和当前目录被外部移走后
refresh 回落 root 都被纳入回归。

测试同时暴露了一个真实行为问题：server 之前把目录 refresh 和文档资源 refresh
绑在一起，导致 `program.document.content` 会被磁盘内容覆盖。修复后 server 通过
独立的 document-resource dirty flag 区分两类更新：Refresh 只发布
`program.browser.*`，不会覆盖未保存草稿；重新打开程序条目才会重新读取磁盘内容。

验证结果为：`tests.test_filesystem_program_workspace_distribution` 5 个场景通过，
`ctest --test-dir generated/server-build --output-on-failure` 6 个 server 测试通过，
`python3 -m unittest discover -s tests -p 'test_*.py'` 144 个 Python 测试通过，1 个
环境相关测试跳过。
