# Conversation Report

## 1. 记录原则

本文件只保留摘要化过程和工程推进脉络，不记录模型内部原始推理链。

## 2. 阶段时间线

### 阶段 A: 用户先要求检查文档问题

这轮一开始，不是继续做功能实现，而是先审计当前文档最终产物，重点问题来自用户观察：

- report 里有些链接点不进去
- `docs_html` 的 Reports 列表和语言页行为不一致
- 中文页生成方式对换机不稳

因此工作起点是把 docs / reports / i18n 三条线一起看，而不是只盯某一页。

### 阶段 B: 先修 report 资产发布与中文 overlay 归属

先解决的是“最终产物缺东西”和“中文覆盖层放在哪里”这两个基础问题：

- report 发布时把 `codex-conversations/` 一起带进最终 `docs_html/reports/`
- 让仓库内 `docs_i18n/` 成为可版本管理的 overlay 来源
- 同时确保 `docs_i18n/` 不同步进 `MetaNC`

这一步之后，中文页不再依赖单机目录，report 资产也开始真正随发布产物走。

### 阶段 C: 把 docs portal 收口成自包含站点

随后发现更深一层的问题不是 report 资产，而是 portal 本身仍有：

- 死链
- 本机绝对路径
- 源 markdown 与生成页漂移

这一阶段做的重点是：

- 去掉最终页里不可发布的 companion links
- 把动态 report 信息从手写页移走
- 拆开 docs build 与 target build
- 让最终 `docs_html` 更接近真正可发布站点

### 阶段 D: 用户要求盘一遍“还有什么不合理”

在 portal 第一轮收口后，用户要求把所有文档相关的不合理之处列出来。

这一阶段的关键不是立刻改代码，而是先形成问题清单和收敛方案，明确：

- 最终页不应再跳出 `docs_html`
- source docs 不应再手写漂移中的 latest report
- report 缺依赖时不应静默降级
- `zh-CN` overlay 必须有清晰的维护边界

### 阶段 E: 继续收 docs_html 的坏链

按方案继续处理后，又发现剩余问题已经集中到几类：

- 过期 `zh-CN` story-pack overlay
- `program_execution_story_breakdown` 中英手写页直链 repo 源码
- `schema_stubs` 的错链
- 中文 `status_matrix` 的旧状态

这一步的重点是把这些源头改到不会再污染最终页。

### 阶段 F: 主仓库与 MetaNC 同步完成

文档链路修完后，相关改动先在 `metanc_hmi_dsl` 提交，再同步到 `MetaNC/nrt/hmi`。
这样两边的 docs portal 生成逻辑不会再分叉。

### 阶段 G: 用户又要求处理 report transcript 的历史路径

最后，问题收敛到 report transcript 本身：

- 历史完整会话导出里还有 `/home/...`
- 还有 `/tmp/...`
- 这些虽不是 live link，但不适合继续原样发布

于是又加了一轮“发布期最小脱敏”，只作用在最终 `docs_html/reports/...`。

### 阶段 H: 回到今天这份 report

当 docs portal、report 发布和 MetaNC 同步都稳定之后，用户要求生成今天 `2026-04-26` 的 report，并更新关联文档但先不提交。

于是最后一步回到 reports 子模块：

- bootstrap 今天的 session 目录
- 导出当天 `user-history`
- 导出当天完整 `codex-conversations`
- 把今天这轮实际工作回写进今天的 report 文档与 aggregate 索引

### 阶段 I: 用户继续指出 codex history 展示仍然不合理

生成完今天的 report 后，用户继续看 `2026-04-25` 和 `2026-04-26` 的 `codex-conversations`，又发现：

- 详细页虽然有全部内容，但不像“User 对应 Codex 回应”
- index 里仍然只取第一条 user 做摘要
- `4.25` 因为同一逻辑 session 的重复 rollout snapshot，被列成很多行几乎一样的 Prompt Summary

于是最后一段工作又转到导出器本身。

### 阶段 J: 导出器切到 turn-level 视图

这一步没有删内容，而是纯粹重排展示：

- 详细页按 `Turn -> User -> Codex Response 1/2/...` 分组
- `index.html` 改成每个 turn 一行
- 链接直接跳到对应 `#turn-N`
- 同一 `session_id` 的多份 rollout snapshot 先去重，只保留更完整的一份

完成后：

- `4.25` 从 `11` 个重复 snapshot 收成 `3` 个逻辑 session
- `4.26` 虽然仍是 `1` 个逻辑 session，但 index 会按当天全部 turn 展开

### 阶段 K: 收口 HMI server 推荐方案包

在 docs portal、report transcript 和导出器问题收住后，讨论重心又转到 `HMI server` 本身。
这一段工作不是直接改 server 代码，而是围绕后续技术路线整理一套可阅读、可讨论、可落地的方案包，重点包括：

- 当前 `HTTP + JSON + polling` 形态为什么更像过渡态
- 为什么 northbound 更适合演进到 `HTTPS/REST + WebSocket`
- 为什么 southbound 应该优先 `OPC UA`，再用工业网关收口 legacy 协议
- 为什么单站点边缘部署应先用 `Docker Compose + Traefik + PostgreSQL + OTel/Prom/Grafana`

这一阶段最终产出了一份独立文档、一份 PDF，以及两张架构图，全部归档到今天的 report 目录里。

### 阶段 L: 用户指出 report 导出仍然落后

在方案包已经写入 report 并推送后，用户继续检查今天 report，发现：

- `user-history.md` 还停在较早一轮
- `codex-conversations` 的统计和当天最后几轮对话没有一起刷新

于是又追加了一次 report 收尾：

- 重新导出 `2026-04-26` 的 `user-history.md`
- 重新导出 `2026-04-26` 的 `codex-conversations/`
- 将“方案整理完成、PDF 导出完成、用户指出导出落后、然后再次刷新 report”的结果一并回写到今天的摘要文档

这一轮刷新后，今天 report 的完整会话统计从较早快照推进到：

- `2` 个 session
- `37` 个 user prompts
- `371` 条 messages

### 阶段 M: 用户继续指出 turn 索引时间语义不对

当 report 已经补进最后一轮 session 后，用户继续检查 `codex-conversations/index.html`，又发现一个更细的展示问题：

- 每一行的第一列虽然叫 `Started`
- 但实际写的是整个 session 的起始时间
- 并不是这一行对应 user prompt 的真实发起时间

这个问题不是数据缺失，而是导出器表格字段语义不对。

因此这一步做了两件事：

- 修改 source-repo-only 导出器，让 `Prompt Index` 每一行读取该 turn 的 user timestamp
- 把列名从 `Started` 改成 `Prompt Time`

修完后，又重新导出今天的 `codex-conversations`，于是今天 report 统计再次前进到：

- `2` 个 session
- `38` 个 user prompts
- `384` 条 messages

## 3. 关键决策

### 先修最终产物，再考虑是否改历史源 transcript

这轮没有直接修改历史 report 源内容，而是先在 portal 发布期加脱敏。
这样风险更低，也更适合先让用户检查最终效果。

### `zh-CN` story-pack 以生成结果为准

没有继续维护过期的中文 story-pack 深页，而是让 `definition/story.catalog.yaml` 重新成为中英文共享来源，中文只做界面文本层面的镜像。

### docs 与 reports 要一起看

这轮反复证明，portal、reports、i18n overlay、MetaNC sync 不是独立问题。
如果只修其中一层，最终用户看到的还是断的。

### 完整会话导出不能再按“文件标题”思维展示

当一天只有一个 rollout 文件但里面有很多轮对话时，“一个文件一行”的 index 没有阅读价值。
这轮之后，完整会话导出以 turn 为主要阅读单位，而不再只把 rollout 文件当作唯一索引粒度。

### report 不是只在“写完正文时”刷新

这次最后一段又证明，session report 不能只在项目文档写完时刷新一次。
只要当天还在继续对话、继续产生产物，就应该把 `user-history` 和 `codex-conversations` 再同步一轮，否则 report 会落后于真实 session。

### turn 索引字段必须用 turn 级时间

当 `index` 已经按 turn 展开后，第一列如果继续沿用 session 级 `started_at`，会误导阅读者，以为每一行都在同一时刻发起。
所以 turn-level index 的时间列必须直接读取该 turn 的 user message timestamp，而不是 session meta。

## 4. 总结

2026-04-26 这轮工作的核心不是新增一批文档，而是把已有文档体系真正变成一套：

- 最终页能打开
- report 入口可达
- 中文页不再被旧 overlay 拖坏
- 发布产物不再继续暴露明显本机路径
- 主仓库和 MetaNC 行为一致
- 完整会话导出的 index 和详细页终于更接近真实对话结构
- `HMI server` 推荐方案、实施清单、图和 PDF 已归档到今天 report
- 今天 report 在最后一轮对话后又执行了一次导出刷新，避免 session 内容停在旧快照
- `Prompt Index` 的时间列已修正为每个 turn 的 user 发起时间，而不再复用 session 起始时间

今天这份 report 本身，也成为这轮“文档与报告产物收口”工作的最终落点。
