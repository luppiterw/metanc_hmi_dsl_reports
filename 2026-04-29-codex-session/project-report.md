# Project Report

## Scope

2026-04-29 的工作覆盖 generated 产物可用性、设计规范沉淀、设置功能落地和 Web/QML shell 体验收敛。目标是让 `generated/` 下的脚本、README、最终产物、docs_html 和下游 `MetaNC/nrt/hmi` 保持一致，同时让设置能力成为后续扩展 runtime server、主题和软面板显示策略的稳定入口。

## Completed Work

- 检查 `generated/distribution/*.sh`、`generated/distribution/README.md`、`generated/web/README.md`、`generated/qml/README.md` 和对应源模板。
- 修正 fixture mock server 与 packaged native Drogon server 的说明边界，明确 fixture helper 依赖仓库内 `fixture.mock_runtime_server`，native helper 才是自包含运行路径。
- 修正 split Web 运行说明：fixture Web 入口为 `http://127.0.0.1:8010/`，native split Web 入口为 `http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime`。
- 更新 QML 生成 README，补齐 `ProgramWorkspaceBackend.*`、`assets/`、`program-root/`，并修正 out-of-source build 后的运行命令。
- 通过 host vcpkg native-server 模式重新生成 Web/QML/distribution 产物，并确认 native server 与 QML executable 已刷新。
- 增加英文根 `DESIGN.md`，将实际设计规范放入 docs 内部，并补齐 zh-CN `docs_i18n` 与 development guide 索引。
- 修复 GitHub CI 中 Web bundle 依赖不可用时的 pipeline 测试假设，允许 fallback bundle 场景通过。
- 实现 Web 设置面板，支持 runtime server URL、strict/hybrid 模式、主题和软面板显示设置；随后实现 QML 设置面板并补齐连接测试、应用、重置、取消等基本动作。
- 将 settings 入口从底部迁移到顶部右侧齿轮；底部软键保持统一按钮风格。
- Web 端彻底移除顶部旧的 `operations-toggle` 和 `theme-select` DOM/JS；QML 端隐藏旧入口，保留 settings 齿轮。
- QML 端增加基于可用屏幕区域的启动尺寸/位置约束，缓解 WSL 下窗口顶部跑出屏幕的问题，并支持 `Alt + 鼠标左键` 拖动窗口。
- 刷新并验证 Web/QML/distribution 最终产物，随后准备提交并同步到 `MetaNC/nrt/hmi`。

## Verification

- `bash -n generated/distribution/*.sh`
- `python3 -m unittest tests.test_pipeline.PipelineTests.test_generated_outputs_match_snapshots -v`
- `python3 -m unittest -v tests.test_pipeline`
- `python3 -m tools.hmi_dsl validate definition/product.manifest.yaml`
- QML 临时工程 `qt-cmake` 配置与 `cmake --build`
- Web split native 实际页面截图验证顶部只剩 settings 齿轮
- `git diff --check`
- `MetaNC/nrt/hmi` 同步后运行同一生成快照测试

## Follow-up Notes

- Docker BuildKit 拉取 Docker frontend 时曾遇到 Docker Hub EOF，因此本次最终生成使用本机 `VCPKG_ROOT=/home/iaar/workspace/github/vcpkg` 和 `HMI_SERVER_NATIVE_BUILD_MODE=host` 完成。
- 当 `run_client_web.sh` 带 server URL 启动时会复制 Web 文件到 `/tmp/client_web_<port>`；如果旧服务未停掉，浏览器可能仍看到旧临时目录。
- 当前 report 发布仍需要同时更新 reports 子模块、父仓库 submodule pointer 和 `docs_html`，否则可见 portal 会显示旧状态。
