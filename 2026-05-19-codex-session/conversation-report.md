# Conversation Report

本轮会话先收敛 PARAM 与 Tool Offset 的菜单层级，再集中处理刀偏表操作体验。
讨论确认 Tool Offset 不应该把结构性 Add/Delete 和 Available/Disabled 状态命令
直接塞进当前 footer；第一版底部菜单保留 Standard、Extend、Detail、Search、
Refresh、Return，表格主体负责当前视图内容。

随后用户指出表格弹窗编辑体验差、缺少单元格焦点和键盘操作。实现阶段改为
Web/QML inline editing，并补齐单元格级选择、上下左右移动、Enter/F2 编辑、
Tab/Shift+Tab 跨可编辑单元格、Esc 取消等行为。后续又修正了两个视觉问题：
可编辑单元格悬浮不再显示 `EDIT` 提示，编辑态不再出现焦点框和输入框双层边框。

数据来源讨论中确认：当前界面只显示两条刀偏数据，是 native server 默认
`MockToolingBackend` 的内存种子，不是 UI 写死。重启后会恢复默认种子。进一步
讨论后确认 `tooling_management` 已经有 SQLite persistence，但 HMI 当前真实
backend 还没有接 store-backed runtime。下一步设计将复用 `tooling_management`
已有 `PersistenceStore` / `SQLitePersistenceStore` / `StoreBackedToolingRuntime`
能力，不在 HMI 内新增刀具数据库 schema。

本轮报告刷新了 2026-05-19 的 user-history、完整 Codex conversation export、
项目报告和 docs portal，并同步到 MetaNC。
