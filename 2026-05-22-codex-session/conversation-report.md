# Conversation Report

Date: 2026-05-22

## Summary

本轮会话围绕 HMI 刀偏表、工件零偏表和命名一致性展开。前半段确认刀具测量/工件测量暂不做，因为它不是纯 HMI 需求，会牵涉后台测量流程、变量参数存放、tooling_management 接口以及后续零偏/工件测量统一边界。中段集中收敛当前已经进入 HMI 的刀偏表和 work offset 表资源、文档、代码与生成物。后段进一步把 Tool Offset / Work Offset UI 自动化从手动 smoke 收口成可复用门禁。

## Decisions

- `wcs.offset.table` 暂定为 work offset 表 canonical resource。
- `tooling.wcs.table` 保留为 legacy alias，不再作为普通 active resource 或 story interface ref 使用。
- 中文语义采用“工件零偏/零偏”解释 work offset，但代码与文档主语义使用 `Work Offset`，避免 `Zero Offset` 误解。
- 刀具测量、工件测量和测量流程后续需要后台数据模型与接口支持，本轮不作为 HMI 单独功能实现。
- `metanc_hmi_dsl` 同步脚本继续保留；它负责源码导入/导出，最终产物必须在目标仓库重新生成。
- UI automation gate 不应隐式重建 generated artifacts；它作为显式重门禁运行，
  依赖已有 packaged distribution、native server 和 QML/browser 环境。
- Work Offset 当前只做 UI binding smoke，不替代后续完整
  command/resource contract。
- Tool Offset 设计文档需要拆成目录化短页。`tool_offset_table_ui_design.md`
  同时承载 UI 设计、操作流程、facade contract、交付阶段和验证记录，
  已经不适合作为单页维护。
- `docs_i18n` 本轮先同步导航和状态，不批量翻译新增 Tool Offset 子页；
  新子页进入 missing 清单，留作后续翻译同步。

## Implementation Notes

- Web/QML runtime fragment、mock runtime、native server 和 runtime seed 都保持 `wcs.offset.table` 与 `tooling.wcs.table` 值同步。
- Native server 现在在合并 adapter overlay 前做 resource alias canonicalization，覆盖 legacy-only backend 上报场景。
- Story pack、data dictionary、runtime resources 和 product specs 已按 canonical/legacy 边界刷新。
- 两个仓库的 generated distribution 与 docs_html 都已重新生成。
- Web UI runner 增加 PARAM/tooling/WCS snapshot 字段、DOM expectation、
  command payload expectation 和 resource alias equality。
- 新增统一入口 `tools/run_ui_automation_smoke.sh`，覆盖三条 Web UI
  scenario 和三条 QML UI smoke。
- 新增 `docs/project/tool_offset/` 分类目录，并把 UI design、workflow、
  create/edit、contract、delivery、smoke report 和 persistence plan 拆分归档。
- `tools/hmi_dsl/docs_portal.py` 改为从 `project/...` 生成项目索引相对路径，
  修复嵌套 project 页面在 `print.html` 中的本地断链。
- 相关 tests、story catalog、story pack、parity docs、status matrix 和
  zh-CN summary/navigation 已随目录调整。

## Follow-Up

- 刀具测量/工件测量进入设计前，需要先定义后台测量数据、变量存放、流程状态、写表策略和错误边界。
- 如果后续决定替换 `wcs.offset.table` 命名，需要以兼容 alias 迁移方式处理，不能直接破坏已生成客户端和脚本。
- 将 UI automation gate 继续保持在显式重门禁，不放入普通轻量单测路径。
- 后续为 Work Offset 增加完整 parity/contract 时，应独立于
  `tooling_management` 边界推进。
- 后续如需刷新本日 raw Codex history，需要单独确认数据导出授权。
