# Project Report

## 1. 目标

这轮工作的目标不是再扩 story 结构，而是把已经生成出来的最终文档产物再收紧一层，重点解决：

1. `docs_html` 中仍然存在的最终页坏链与错误相对路径
2. `zh-CN` story-pack 被仓库内过期 overlay 覆盖后造成的中英文分叉
3. report transcript 在最终发布页里残留的本机绝对路径与临时目录路径
4. `codex-conversations` 导出读起来像消息流水账，而且 index 只显示第一条 user

## 2. 主要问题

### 2.1 最终页仍有不可发布链接

问题并不在主 portal 首页，而在：

- `requirements/program_execution_story_breakdown`
- `product/schema_stubs`
- `zh-CN` story-pack 深页

这些页面仍然把 repo 内源码路径当成最终 HTML 链接输出，结果 `docs_html` 中可以看到大量指向 `definition/`、`tests/`、`client/`、`server/` 的坏链。

### 2.2 中文 story-pack 覆盖层已经过期

仓库内 `docs_i18n/zh-CN/acceptance_reference/story_pack/` 里那批深页内容，已经和英文生成结果分叉。
英文 story-pack 这一轮已经改成“源码路径只做代码引用，不做最终链接”，但中文 overlay 还在保留旧 markdown 链接，因此最终中文站点比英文站点更差。

### 2.3 report transcript 泄露本机路径

虽然 portal 层坏链已经清掉了一批，但 `docs_html/reports/*/codex-conversations/*` 仍保留：

- `/home/.../workspace/...`
- `/home/.../.codex/...`
- `/tmp/...`

它们在很多地方不是 live link，但仍然会泄露本机路径，不适合继续原样发布。

### 2.4 codex user history 的阅读模型不对

用户在检查 `2026-04-25` 和 `2026-04-26` 的完整会话导出时，又指出了两个新的问题：

- 详细页虽然包含完整内容，但按原始消息流平铺，读起来不像一问一答
- `index.html` 仍按 rollout 文件一行，只取第一条 user 当标题

结果是：

- `2026-04-25` 会出现多行几乎一样的 Prompt Summary
- `2026-04-26` 虽然明明有很多轮对话，但 index 里仍只有一行

## 3. 处理方案

### 3.1 让生成结果优先于过期中文 overlay

这轮没有继续补旧 overlay，而是直接反过来处理：

- 删除 `docs_i18n/zh-CN/acceptance_reference/story_pack/` 下那批过期深页
- 在 portal 生成器中显式禁止这一路径覆盖 story-pack 生成结果

这样 `zh-CN` story-pack 会继续由 `definition/story.catalog.yaml` 派生，避免中英文站点长期分叉。

### 3.2 手写页中的源码路径退回为代码引用

对仍然需要引用 repo 内实现文件的手写页，这轮统一改成：

- 在源 markdown 中保留路径文本
- 最终 HTML 中显示为代码引用
- 不再尝试跳转到 `definition/`、`tests/`、`server/` 这些 repo 内文件

同时修正了 `schema_stubs` 里已经写错的文档链接目标。

### 3.3 report 发布期增加最小化路径脱敏

没有改历史 report 源 transcript，而是在 portal 发布阶段增加一层文本收口：

- workspace 绝对路径压缩成相对可读路径
- `CWD` 收缩成末段别名
- `/tmp/...` 统一替换成 `<tmp>/...`
- `~/.codex/...` 先保留为用户目录级语义，不再暴露具体 `/home/<user>/`

这一步是“发布期脱敏”，目的是先让最终产物可公开阅读，而不去重写历史源记录。

### 3.4 codex-conversations 改成 turn-level 阅读和索引

这一步不是改 report 正文，而是改导出器本身的展示模型：

- 详细页从“消息流水账”改成 “Turn -> User -> Codex Response 1/2/...”
- `index.html` 从“一个 rollout 文件一行”改成“一个 turn 一行”
- 同一个 `session_id` 的多份 rollout snapshot 会先去重，只保留消息数更多、更完整的那份

这样：

- `4.25` 从原来 `11` 个重复 snapshot 收成 `3` 个逻辑 session
- `4.26` 虽然仍是 `1` 个逻辑 session，但 index 会按当天所有 turn 展开，而不再只剩一行

## 4. 具体结果

### 4.1 docs portal

这轮之后：

- `docs_html` 的 unresolved 本地 `href/src` 已清零
- `zh-CN` story-pack 深页不再被旧 overlay 污染
- `404.html` 也不再默认指向站点根 `/`

### 4.2 reports

这轮之后：

- `docs_html/reports/2026-04-26-codex-session/` 已新增
- 旧 report 的 published transcript 中，大部分 `/home/...` 与 `/tmp/...` 已变成更适合发布的文本别名
- report timeline 也更新到了今天这轮
- `codex-conversations` 详细页按 turn 分组
- `codex-conversations/index.html` 改成 turn-level index
- `2026-04-25` 的重复 snapshot 已按逻辑 session 去重

### 4.3 MetaNC sync

本轮 docs 修复和 report 发布期脱敏，都同步到了：

- `MetaNC/nrt/hmi/tools/hmi_dsl/docs_portal.py`
- `MetaNC/nrt/hmi/tests/test_docs_portal.py`

这样主仓库和下游镜像在 docs portal 行为上保持一致。

## 5. 验证

已完成的关键验证：

- `python3 -m unittest -v tests.test_docs_portal tests.test_story_docs`
- `python3 -m unittest -v tests.test_codex_user_history_export`
- `./tools/build_docs_html.sh`
- `python3 -m unittest -v tests.test_docs_portal` on `MetaNC/nrt/hmi`

并额外执行了本地链接审计：

- `docs_html/en/` 无 unresolved 本地链接
- `docs_html/zh-CN/` 无 unresolved 本地链接
- `docs_html/en/project/reports.html` 和 `zh-CN/project/reports.html` 的 report 链接均可达

## 6. 结论

2026-04-26 这轮工作的价值不在“再多一层文档”，而在把当前文档与报告体系从“基本可用”推进到“最终产物可发布、可切换语言、且不会继续暴露错误链接和本机路径”的状态。

后续如果还要继续收这条线，下一步最自然的工作是：

1. 继续决定是否把 `~/.codex/...` 这层 source 语义也进一步脱敏
2. 视需要清理历史 aggregate timeline 里重复或过时的 focus 行
3. 决定是否把 `<subagent_notification>`、`<turn_aborted>` 这类事件从 turn-level index 中继续降噪

## 7. 新增：HMI Server 方案整理

在这轮 session 末尾，围绕当前 `HMI server` 的技术路线又补做了一份独立整理，目标不是改现有实现，而是把后续 server 演进方向收成一套可阅读、可执行的方案材料。

这份新增材料包括：

- `hmi-server-recommendation.md`
- `assets/hmi-server-recommendation/hmi-server-recommendation.pdf`
- `assets/hmi-server-recommendation/hmi-server-transport-current-vs-target.{png,svg}`
- `assets/hmi-server-recommendation/hmi-recommended-target-architecture.{png,svg}`

整理结论收敛为：

- northbound 推荐从 hand-written transport 演进到 `Drogon + HTTPS/REST + WebSocket`
- southbound 推荐 `OPC UA` 优先，legacy 协议尽量先经工业网关收口
- 厂商 `SDK / 专有协议` 只作为 fallback
- 数据与运维建议先采用 `PostgreSQL + OpenTelemetry + Prometheus + Grafana + Docker Compose + Traefik`

同时把实施清单拆成三段：

1. 第一阶段先把 northbound、contract 分层、观测和 Compose 部署打通
2. 第二阶段补 `OPC UA` 和工业网关链路
3. 第三阶段再根据规模决定时序库、`Kubernetes` 和更细粒度服务拆分
