# Project Report

## Scope

本轮先按用户要求回到“生成器源码拆解优化”的方向，完成当前 Web/QML generator
源码体量盘点，把后续是否还值得拆、该拆哪里、什么时候停止拆写成可引用的文档；
随后按该结论完成 Web app-shell P0 最小拆分并收口。后续又处理了 docs portal
兼容性和 PROG DIR 文件管理补齐，重点是把原先 partial 的 Rename/Delete/Refresh
做成 Web/QML/server 一致的可测试闭环。

最后继续抽出 server-side `ProgramWorkspaceAdapter` 边界：现有 Web/QML
northbound contract 不变，program file/directory 行为先从 `SimulatorAdapter`
内部状态迁到可替换 adapter 后端，为后续 filesystem/controller-backed program
workspace 留出实现位置。

## Completed Work

- 统计 `client/web_client` 和 `client/qml_client` 下的 Python 源文件体量：
  - Python 文件数：200。
  - 总行数：28,882。
  - 大于等于 250 行的文件：35。
  - 大于等于 500 行的文件：9。
  - Web 侧大于等于 250 行的文件：21。
  - QML 侧大于等于 250 行的文件：14。
- 新增英文文档：
  - `docs/development_guidelines/generator_decomposition_inventory.md`
- 新增中文 overlay：
  - `docs_i18n/zh-CN/development_guidelines/generator_decomposition_inventory.md`
- 更新中英文 docs navigation：
  - `docs/SUMMARY.md`
  - `docs/development_guidelines/index.md`
  - `docs_i18n/zh-CN/SUMMARY.md`
  - `docs_i18n/zh-CN/development_guidelines/index.md`
- 文档结论：
  - 继续拆分需要有明确停止条件，不能为了 housekeeping 无止境拆。
  - Web `client/web_client/app_shell.py` 是本轮 P0，因为它原先仍有 1,375 行，
    且混合 settings、custom select、page render、footer navigation、theme、
    Program editor focus preservation、chrome/status/notice helpers。
  - P1 文件只在真实功能改动触达时顺手拆，不建议为了 housekeeping 一口气拆完。
  - 本阶段停止条件建议为：没有超过 1,000 行的 generator source 文件，高频编辑
    文件约束到 600 行左右，decomposition-only 工作不引入新的公开 DSL/runtime 行为。
- 完成 Web app-shell P0 拆分：
  - 新增 `client/web_client/app_shell_fragments/settings.py`，承接 settings panel、
    field helpers、defaults、persistence、runtime URL normalization 和 connection
    probe helpers。
  - 新增 `client/web_client/app_shell_fragments/selects.py`，承接 reusable custom
    select control rendering、keyboard handling、open/close behavior 和 focus helpers。
  - `client/web_client/app_shell.py` 从 1,375 行降到 783 行，保留 compatibility
    assembler、page rendering、footer navigation、theme application、chrome/status
    chips、Program editor focus preservation、auxiliary panel 和 shortcuts。
  - 拆分后 Web/QML generator Python 文件总数为 203，总行数为 28,913，已无超过
    1,000 行的文件。
- 完成 docs portal 和 runtime status 文档修复：
  - `bookshelf.toml` 从旧 `entry-page` 字段升级为 `mdbook-bookshelf 0.2.x`
    兼容模型，显式声明 documentation index、book ids 和 categories。
  - `tools/hmi_dsl/docs_portal.py` 生成新版 bookshelf config，English、zh-CN
    和 dated report books 都从根 `docs_html/index.html` 入口索引。
  - `tests/test_docs_portal.py` 更新为验证新版根入口，不再依赖旧
    `en/bookshelf.html`。
  - `server/README.md` 删除过期的 Web/QML subscription/strict-client Next Steps，
    改为记录真实 southbound adapters、生产 command schema 和 persistence state
    stores 这些仍待完成的 server 方向。
  - README 与开发指南补充 `mdbook-bookshelf 0.2.x` docs portal 模型说明。
- 完成 PROG DIR 文件管理补齐：
  - 新增 DSL 命令 `progdir.commands.refresh`、`progdir.commands.rename`、
    `progdir.commands.delete`。
  - Web 和 QML footer command guard 已切到 `progdir.commands.*`，旧
    `prog.commands.rename/delete` 保留兼容。
  - Web local runtime、QML local runtime、fixture mock runtime 和 C++ simulator
    adapter 均实现同一套路径策略。
  - `Refresh` 仅刷新当前目录，不改变目录路径。
  - `Rename` 支持文件和目录；目录 rename 会移动子树，并保留当前打开程序路径。
  - `Delete` 支持文件和空目录；非空目录删除返回
    `program.directory_not_empty`，避免隐式递归删除。
  - 路径边界收敛为 basename-only rename，拒绝空名称、路径分隔符、越界路径、
    重名 target 和不存在 entry。
  - 删除当前打开程序时清空当前程序，避免自动回根目录或加载别的程序。
  - 中英文 interface integration、program story、Web/QML parity 和 data
    dictionary 已同步更新。
- 完成 Program workspace adapter 边界抽取：
  - 先新增 `server/tests/program_workspace_adapter_test.cpp`，用测试锁定
    list/read/write、create folder、rename、delete 和路径边界行为。
  - 新增 `ProgramWorkspaceAdapter` server-side interface。
  - 新增 `SimulatorProgramWorkspaceAdapter`，承接当前 in-memory simulator
    program workspace 行为。
  - `SimulatorAdapter` 改为委托 adapter，移除内部 program file map/set、目录
    子树 rename/delete 和路径策略实现。
  - 现有 `progdir.commands.*`、`program.browser.*` 和 program-file resource
    行为保持稳定。
  - `server/CMakeLists.txt` 纳入新 source 和 adapter-level test。
  - server README、interface integration 和 server target skeleton 文档已同步
    记录新边界。
- 完成 Filesystem program workspace 最小闭环：
  - 新增 `FilesystemProgramWorkspaceAdapter`，以本地目录作为 program workspace
    后端。
  - 默认仍使用 simulator backend；只有显式配置
    `HMI_PROGRAM_WORKSPACE_BACKEND=filesystem` 时才启用 filesystem backend。
  - 新增 `HMI_PROGRAM_WORKSPACE_ROOT` / `--program-workspace-root` 配置，未设置时
    fallback 到 `runtime-data/programs`。
  - `SimulatorAdapter` 持有 `ProgramWorkspaceAdapter` interface，并由
    `ServerApp` 在初始化时注入 simulator 或 filesystem workspace。
  - Filesystem backend 支持 list/read/write/create file/create directory/rename/
    delete/refresh；rename 保持 basename-only，delete 仅支持文件和空目录。
  - root escape、空 root delete、非法路径、重名 target 和非空目录 delete 均有
    拒绝策略。
  - 修复 `prog.commands.new` / `progdir.commands.new_folder` 中 `../name` 被当成
    空名称并自动生成新条目的边界问题。
  - 更新 server README、英文/中文 interface integration 和 server target
    skeleton，明确 filesystem backend 是本地开发/集成后端，不等同真实 controller
    文件系统。
- 完成 packaged split runtime filesystem smoke：
  - 新增 `tests/test_filesystem_program_workspace_distribution.py`。
  - 测试通过真实 `generated/distribution/run_server_native.sh` 启动 packaged native
    server，而不是 in-process C++ test。
  - 通过 `HMI_PROGRAM_WORKSPACE_BACKEND=filesystem` 和
    `HMI_PROGRAM_WORKSPACE_ROOT=<tempdir>` 启用 filesystem backend。
  - 通过 HTTP 调用 `GET /health`、`GET /bootstrap` 和 `POST /commands` 验证
    packaged server 可用。
  - 覆盖 `prog.commands.new`、`prog.commands.save`、
    `progdir.commands.new_folder`、`progdir.commands.rename`、
    `progdir.commands.delete`。
  - 每个关键命令后直接检查临时目录磁盘状态，确认创建、保存、rename 和 delete
    真实落盘。
  - 覆盖 `../ESCAPE.MPF` 非法路径拒绝，以及非空目录 delete 拒绝。
  - 该测试已纳入 `python3 -m unittest discover -s tests -p 'test_*.py'` 回归。
- 扩展 packaged filesystem workspace 场景测试，并修复目录刷新语义：
  - `progdir.commands.refresh` 现在只刷新 `program.browser.*` 目录资源，不会重载
    `program.document.content`，避免覆盖未保存的编辑器草稿。
  - 重新打开程序条目仍会从 filesystem workspace 读取最新磁盘内容。
  - packaged test 继续通过真实 `generated/distribution/run_server_native.sh` 和 HTTP
    API 验证，而不是绕过最终分发路径。
  - 新增外部文件 create/delete/rename 后 refresh 可见性的测试。
  - 新增“本地草稿 + 外部磁盘修改 + refresh 不覆盖 + reopen 读取最新磁盘内容”的测试。
  - 新增进入子目录后 New File/New Folder 写入当前目录、`..`/up 返回 root、root
    再 up 被拒绝的测试。
  - 新增 duplicate file/folder、missing file activate、当前目录被外部移走后 refresh
    回落 root、非法 rename、target exists 等错误/边界结果测试。

## Validation

- `./tools/generate_targets.sh`
- `python3 -m unittest tests.test_generator_refactor`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 docs_i18n/tools/i18n_status.py mark-current --lang zh-CN development_guidelines/generator_decomposition_inventory.md --write-report`
- `python3 -m unittest tests.test_docs_portal`
- `python3 -m unittest tests.test_web_qml_parity_docs docs_i18n.tests.test_i18n_status`
- `python3 -m unittest tests.test_mock_runtime_server tests.test_pipeline tests.test_generator_refactor tests.test_parity_scenarios`
- `ctest --test-dir generated/server-build --output-on-failure -R "runtime_rest_api_test|server_smoke_test"`
- `python3 -m unittest tests.test_web_qml_parity_docs tests.test_server_api_docs docs_i18n.tests.test_i18n_status`
- `ctest --test-dir generated/server-build --output-on-failure -R "program_workspace_adapter_test|runtime_rest_api_test|server_smoke_test"`
- `ctest --test-dir generated/server-build --output-on-failure`
- `python3 -m unittest discover -s tests -p 'test_*.py'`
- `ctest --test-dir generated/server-build --output-on-failure -R "program_workspace_adapter_test|filesystem_program_workspace_adapter_test"`
- `ctest --test-dir generated/server-build --output-on-failure -R runtime_rest_api_test`
- `ctest --test-dir generated/server-build --output-on-failure`
- `python3 -m unittest discover -s tests -p 'test_*.py'`
- `python3 -m unittest tests.test_filesystem_program_workspace_distribution`
- `ctest --test-dir generated/server-build --output-on-failure`
- `python3 -m unittest discover -s tests -p 'test_*.py'`
- `git diff --check`

Validation result: generated Web/QML/server/distribution artifacts were refreshed
without snapshot drift, the generator refactor tests still pass, and the
inventory page now records the completed app-shell split in both English and
zh-CN docs navigation. The rebuilt docs portal now succeeds with
`mdbook-bookshelf 0.2.x` and publishes the root documentation index plus dated
report books under `docs_html/`. The PROG DIR slice was completed with unit
coverage for mock runtime behavior, native REST coverage for the C++ simulator
adapter, regenerated Web/QML snapshots, and a clean whitespace check.
The ProgramWorkspaceAdapter extraction was validated with the dedicated adapter
test, native REST/smoke coverage, full C++ server tests, full Python unittest
discovery, and regenerated generated artifacts.
The FilesystemProgramWorkspaceAdapter slice was also validated by a dedicated
filesystem adapter test, REST-level persistence coverage, full C++ server tests
including HTTP/WebSocket blackbox coverage, full Python unittest discovery, and
fresh generated Web/QML/server/distribution output.
The packaged distribution smoke now proves the same filesystem backend also
works through the final `generated/distribution/run_server_native.sh` startup
path, with real HTTP commands and disk assertions.
The expanded packaged scenarios now also lock refresh/document separation:
directory refresh can discover external filesystem changes without overwriting
the active editor draft, while explicit reopen remains the disk-content reload
boundary. Python unittest discovery now covers 144 tests with one environment
skip.

## Next Recommendation

Pause decomposition-only work unless the next product change touches a P1 file.
The filesystem program workspace spike is complete enough for local integration.
Next should be policy and product closure rather than more backend guessing:
document recursive delete, permission, conflict, external file-change, and
multi-client rules before expanding filesystem behavior. After that, move to
Logs shared scenario coverage and production command schema/state-store planning.
