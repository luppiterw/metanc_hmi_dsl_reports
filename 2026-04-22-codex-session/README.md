# 2026-04-22 Codex Session Report

这个目录整理了 2026-04-22 这轮项目推进的结构化阅读材料。
本轮工作集中在共享软操作面板的再设计，并在首轮极简重排后继续收成更接近硬件控制面的紧凑版本，而不是停留在“先做出一版大方向正确”的状态。最终结果覆盖 retained 结构、Web/QML 生成器、视觉验证和下游同步准备：

- 参考 `.pics/panel-01.png` 的简约布局，重新整理共享软面板的区块关系和视觉密度
- 把按钮字号、按钮高度、组间留白、底部保留区统一收紧到更接近硬件面板的密集节奏
- 将原来分散的 `Axis / Jog / Increment / Mode / WCS-MCS / Override` 拆分重组为新的 12 宫格运动区、模式/坐标系区、紧凑操作区、F/S 倍率区和底部空白按钮区
- 去掉原来的分组标题条，改成细分隔线与留白，降低 panel 内部的视觉噪声
- 在第二轮收口里把常规按钮统一到 `40x40`、圆角 `2`，把急停改成约 `60px` 的纯圆形红色按钮，并把 `RST/STOP/START/SBLK` 做成固定 `40` 高的更宽按钮组
- 将 `JOG/WCS` 组横向移动到 `X/Y/Z` 运动 12 宫格右侧，把 `F/S` 倍率区整体上移到它们下方，再把 `HOLD/RLINE/COOL/DIAG` 和底部留白按钮合并成同一组 `4x2` 网格
- 同步修改 retained `ui.structure.yaml`、QML/Web 生成器、设计导入映射和回归断言，确保两端保持同一套结构语义
- 重新生成 Web/QML 产物，补抓新的 QML 离屏图和 Web 浏览器截图，并把今天的 session report、aggregate 索引和 user-history 一起补齐

说明：

- 这份报告覆盖 2026-04-22 当天围绕软操作面板极简重构、第二轮硬件化收口、Web 截图运行时补齐、报告收口和 MetaNC 同步准备的一组连续工作
- 这里不包含模型内部原始推理链
- 这里保留的是便于后续工程审查的过程摘要、关键决策、验证结果和可追溯资产入口

目录：

- `project-report.md`: 软面板重构目标、retained/generator 改动、验证结果与交付状态总结
- `conversation-report.md`: 从参考图重排、12 宫格设计、倍率区收口到 Web 截图环境补齐的摘要化过程记录
- `user-history.md`: 当天用户发言原始导出
- `workflow-diagram.md`: 从用户新布局要求到 retained/generator 重排、截图验证、报告补齐和 MetaNC 同步的工作流图
- `architecture-diagram.md`: retained package、QML/Web 生成器、截图资产、报告子模块和 `MetaNC/nrt/hmi` 导出目标之间的关系图
- `build_html/index.html`: 使用 `mdBook` 构建的可浏览 HTML 入口
