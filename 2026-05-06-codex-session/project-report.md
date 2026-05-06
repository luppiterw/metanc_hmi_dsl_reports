# Project Report

## Scope

2026-05-06 的工作覆盖 native build baseline、docs/report 发布链、Web/QML shell
交互和 Diagnostics Logs 视图。目标是让当前 HMI DSL 包在本地和 MetaNC 镜像中都保持
可生成、可构建、可阅读，并修正日志页面右侧详情常驻造成的横向空间浪费。

## Completed Work

### Native C++17 build floor

- 将 Drogon server CMake target 的最低语言标准从 C++20 降到 C++17。
- 将 generated Qt/QML C++ support target 同步为 C++17。
- 更新 README、server build docs、English/zh-CN build/tooling docs。
- 增加 pipeline 断言，避免后续误改回 C++20。

### Bookshelf docs portal

- 引入 root `bookshelf.toml`，把最终 docs portal 切换到 `mdbook-bookshelf` 输出。
- `./tools/build_docs_html.sh` 现在构建 English、zh-CN、reports 和 dated session books。
- 更新 docs portal 测试，确保 bookshelf entry、language books 和 latest report 链接可见。

### Web/QML shell and navigation polish

- 顶部 `TIME` chip 替换为 runtime server 连接状态 chip。
- 连接状态按 `Connected`、`Connecting`、`Offline`、`No Server`、`Local` 进行文案和色彩表达。
- 底部 Return softkey 改为图标按钮，减少底部导航文字噪声。

### Diagnostics Logs layout

- Web Logs 页默认改为全宽日志表格，不再常驻右侧详情预览。
- 表格列收敛为 `Time / Level / Source / Event / Message`，保留更好的横向扫读空间。
- 点击日志行后才在底部展开详情面板，详情支持 `Copy` 和 `Close`。
- QML Logs 页同步改为列表优先、底部按需详情。
- 新增 `runtime_state.log_detail_open`，使自动选中日志行不会自动打开详情。
- log refresh/reset/clear 会关闭详情，避免旧详情残留。

### Generated outputs and documentation

- 重新生成 Web、QML、runtime contract、distribution 和 snapshots。
- 刷新 runtime logs、server logging、status matrix、CHANGELOG 和本日报告。
- 重新导出当天 brief user history 与完整 Codex conversation export。

## Verification

已执行并通过：

```text
./tools/generate_targets.sh
```

结果：Web/QML/runtime contract/distribution 重新生成；native Drogon server 和 QML
final executable 均构建成功。

已执行并通过：

```text
env HMI_SKIP_HEAVY_SNAPSHOT_TESTS=1 python3 -m unittest tests/test_pipeline.py -v
```

结果：30 tests OK，2 heavy visual snapshot tests skipped。

已执行并通过：

```text
git diff --check
```

报告和 docs portal 发布链会在本轮提交前继续构建：

```text
mdbook build submodules/metanc_hmi_dsl_reports
mdbook build submodules/metanc_hmi_dsl_reports/2026-05-06-codex-session
./tools/build_docs_html.sh
```

## Repository State

- `submodules/metanc_hmi_dsl_reports` 本轮提交 2026-05-06 report/user-history/Codex
  conversation refresh。
- `metanc_hmi_dsl` 本轮提交 Logs 布局、C++17/docs/bookshelf 已有成果的关联文档刷新、
  generated snapshots 和 reports submodule pointer。
- `MetaNC/nrt/hmi` 会通过 `tools/export_to_metanc.sh` 同步必要 HMI 包内容；reports
  submodule 本体不导出到 downstream package。

## Remaining Work

- Logs 详情模式后续可做用户偏好项，例如 `Collapsed / Bottom / Side`。
- Web 和 QML Logs 仍缺少真实交互级 UI automation；当前主要依靠 generator snapshots
  和 pipeline coverage。
- server persistence 后续仍需要 settings/tool/parameter store，但这不属于本次 Logs UI
  布局调整范围。
