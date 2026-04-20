# Conversation Report

## 1. 记录原则

本文件记录的是摘要化过程和工程推进脉络。
它不包含模型内部原始思维链，而是保留对后续阅读最有价值的背景、实施顺序、关键决策和验证范围。

本报告对应的时间边界是 2026-04-20 当天，从用户指出 `MetaNC` report 入口 Markdown 被误覆盖开始，到同步脚本修复、真实下游验证和 report 更新收尾结束的连续一组工作。

## 2. 阶段时间线

### 阶段 A: 先确认真实误改范围

起点不是抽象的同步担忧，而是用户明确指出：

- `MetaNC` 里面关于 report 的部分不能直接拷贝覆盖
- 尤其是那几个 Markdown 文件，因为下游本地没有 report 相关子模块

实际动作:

- 检查 `MetaNC` 当前工作区状态
- 查看误改文件 diff
- 读取 `export_to_metanc.sh` / `import_from_metanc.sh`

结果:

- 真实受影响文件被收敛到 4 个 Markdown
- 问题不是 report 子模块被导出，而是 report 入口文案被源仓库版本覆盖

### 阶段 B: 定位为什么“排除文件”还不够

继续检查发现，旧脚本的致命点不在 rsync 本身，而在于它会先清空目标目录。

这意味着即使后来给 rsync 增加 `exclude`，下游原本那几个本地文件也已经先被删掉了。

关键决策:

- 修复方式不能只停留在“多排几个路径”
- 必须把同步模式改成保护性 rsync

### 阶段 C: 修改 export/import 两个方向

实际动作:

- `export_to_metanc.sh`
  - 去掉先清空目标目录
  - 切换到 `rsync -a --delete`
  - 加入 4 个 downstream-local report surfaces 的 `--filter=P` 和 `--exclude`
- `import_from_metanc.sh`
  - 在 `docs/` 与 `examples/` 目录同步时加入对称保护
  - 避免未来从 `MetaNC` 回灌时把下游本地版反向覆盖到 DSL 仓库

结果:

- 两个方向对同一组路径都有保护
- 问题从一次性修补提升成了长期同步规则

### 阶段 D: 做最小可证伪验证

为了确认不是“看起来像对了”，先在 `/tmp/metanc_export_preserve` 构造一个最小 `MetaNC` 仓库。

实际动作:

- 把 4 个目标文件写成自定义哨兵值
- 执行修复后的导出
- 再读回这些文件

结果:

- 四个哨兵值都被保住
- 说明“保护性 rsync”不仅语法正确，而且行为正确

### 阶段 E: 回到真实 `MetaNC` 做恢复与复验

有了临时仓库验证之后，再处理真实下游：

实际动作:

- 把 `MetaNC` 里这 4 个误覆盖文件恢复到 `HEAD`
- 重新执行修复后的 `export_to_metanc.sh /home/iaar/workspace/ccmix-wp/MetaNC`
- 检查 `git status --short --branch`

结果:

- `MetaNC` 工作区回到干净状态
- 说明真实下游已不再受这 4 个文件影响

### 阶段 F: 更新 report 与入口索引

最后把这次修复补进文档资产，而不是只停在脚本修改：

- 新增 `2026-04-20-codex-session`
- 更新 aggregate report timeline
- 准备重建 session HTML、aggregate site 和主仓库 docs portal

## 3. 关键决策记录

### “先删后拷”必须改成“保护性同步”

如果还保留原来的清空步骤，这类下游本地保留面会持续被误伤。

### import 和 export 必须使用同一组保护路径

只修一个方向是不够的。今天是 export 覆盖下游，明天也可能是 import 回灌覆盖上游。

### 先做临时仓库验证，再碰真实下游

这样可以先验证规则本身，再把修复应用到真实 `MetaNC`，风险更小。

## 4. 未处理事项

- 这次保护的是当前已知的 4 个 report 入口页；如果后续 `MetaNC` 再新增宿主本地 Markdown，需要继续纳入保护清单
- 当前 report 已经记录修复和验证结果，但如果未来要把“共享内容”和“下游本地内容”彻底分层，仍可以再抽一层 manifest
