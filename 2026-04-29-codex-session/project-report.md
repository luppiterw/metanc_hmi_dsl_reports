# Project Report

## Scope

2026-04-29 的工作集中在 generated 产物的可用性说明和发布链路上。目标不是改运行逻辑，而是让 `generated/` 下的脚本、README、最终产物和下游 `MetaNC/nrt/hmi` 保持一致，避免后续按旧说明启动 Web/QML/native split 环境。

## Completed Work

- 检查 `generated/distribution/*.sh`、`generated/distribution/README.md`、`generated/web/README.md`、`generated/qml/README.md` 和对应源模板。
- 修正 fixture mock server 与 packaged native Drogon server 的说明边界，明确 fixture helper 依赖仓库内 `fixture.mock_runtime_server`，native helper 才是自包含运行路径。
- 修正 split Web 运行说明：fixture Web 入口为 `http://127.0.0.1:8010/`，native split Web 入口为 `http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime`。
- 更新 QML 生成 README，补齐 `ProgramWorkspaceBackend.*`、`assets/`、`program-root/`，并修正 out-of-source build 后的运行命令。
- 通过 host vcpkg native-server 模式重新生成 Web/QML/distribution 产物，并确认 native server 与 QML executable 已刷新。
- 提交并推送 `metanc_hmi_dsl/main`，再导出同步到 `MetaNC/nrt/hmi` 并提交推送 `MetaNC/feat/hmi`。

## Verification

- `bash -n generated/distribution/*.sh`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots -v`
- `git diff --check`
- `MetaNC/nrt/hmi` 同步后运行同一生成快照测试

## Follow-up Notes

- Docker BuildKit 拉取 Docker frontend 时曾遇到 Docker Hub EOF，因此本次最终生成使用本机 `VCPKG_ROOT=/home/iaar/workspace/github/vcpkg` 和 `HMI_SERVER_NATIVE_BUILD_MODE=host` 完成。
- 当前 report 发布仍需要同时更新 reports 子模块、父仓库 submodule pointer 和 `docs_html`，否则可见 portal 会显示旧状态。
