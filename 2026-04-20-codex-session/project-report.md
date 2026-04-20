# Project Report

## 1. 报告目标

本报告总结 2026-04-20 这轮工作的目标：

- 修复 `metanc_hmi_dsl` 导出到 `MetaNC/nrt/hmi` 时，把下游本地 report 入口 Markdown 误覆盖的问题
- 让 import/export 两个方向都显式保护同一组“下游本地保留面”，避免后续双向同步再次把这类文件带偏

最终目标不是只把误改文件恢复掉，而是让以下四件事同时成立：

- 当前仓库仍然是共享 HMI 源头
- `MetaNC/nrt/hmi` 仍能接收共享代码同步
- `MetaNC` 本地没有 report submodule 的几处入口页不会再被覆盖
- 后续无论是导出还是回灌，同一组路径都被一致保护

## 2. 证据范围

本报告对应 2026-04-20 当天在当前工作区完成的一组修改，核心范围包括:

- `tools/export_to_metanc.sh`
- `tools/import_from_metanc.sh`
- `submodules/metanc_hmi_dsl_reports/2026-04-20-codex-session/*`
- `submodules/metanc_hmi_dsl_reports/src/index.md`
- `submodules/metanc_hmi_dsl_reports/src/SUMMARY.md`
- `submodules/metanc_hmi_dsl_reports/src/sessions/2026-04-20-codex-session.md`

## 3. 本轮处理前的主要问题

### 3.1 导出流程会覆盖 `MetaNC` 本地维护的 report 入口页

`export_to_metanc.sh` 原来的执行方式是先清空目标 HMI 包目录，再整体把当前仓库 rsync 到 `MetaNC/nrt/hmi`。
这在共享代码上是有效的，但对下游本地维护的 report 入口页是不安全的。

真实受影响的文件是:

- `docs/src/index.md`
- `docs/src/reports.md`
- `examples/june-demo/story-docs/execution-links.md`
- `examples/june-demo/story-docs/src/execution-links.md`

这些文件在当前仓库中会指向 `submodules/metanc_hmi_dsl_reports/...`，但 `MetaNC` 下游并不携带这个 submodule。

### 3.2 仅加 `exclude` 不够，因为原实现是“先删后拷”

如果脚本先把目标目录清空，即使 rsync 阶段排除了某些路径，原本存在于下游的本地文件也已经被前置删除了。
所以问题不只是“排除哪些文件”，而是同步方式必须从“清空后复制”切到“保护性同步”。

## 4. 方案与实现

### 4.1 `export_to_metanc.sh` 改成保护性 rsync

导出脚本保留既有共享范围排除项的同时，引入一组明确的下游本地保留路径：

- `/docs/src/index.md`
- `/docs/src/reports.md`
- `/examples/june-demo/story-docs/execution-links.md`
- `/examples/june-demo/story-docs/src/execution-links.md`

实现变化有两点：

- 去掉“先清空目标目录”的步骤
- 改用 `rsync -a --delete`，并给这 4 个路径同时加 `--filter=P` 和 `--exclude`

这样共享范围内的文件仍会被正常删除/更新，但这 4 个下游本地文件会在同步时被保留。

### 4.2 `import_from_metanc.sh` 同步加入对称保护

回灌脚本也加入同一组本地路径保护，只是路径相对 `docs/` 和 `examples/` 目录来写：

- `docs/src/index.md`
- `docs/src/reports.md`
- `examples/june-demo/story-docs/execution-links.md`
- `examples/june-demo/story-docs/src/execution-links.md`

这样后续如果 `MetaNC` 那边因为宿主上下文改了这些文件，再回灌到当前仓库时，也不会把 DSL 源仓库自己的 report-linked 版本覆盖掉。

### 4.3 先回滚真实 `MetaNC`，再验证修复

在真实下游仓库里，先把这 4 个被误覆盖文件恢复到 `HEAD`，再重新执行修复后的导出。

这个顺序很重要，因为它能区分：

- 只是把错误结果撤回
- 还是脚本本身已经真正修好

### 4.4 report 资产同步更新

为了把这次修复留成可追溯记录，本轮新增 2026-04-20 session report，并更新 aggregate report timeline。

这样后续再看同步脚本历史时，可以明确知道：

- 问题是什么时候暴露的
- 为什么“排除文件”本身不够
- 具体保护的是哪 4 个路径
- 修复是怎么验证的

## 5. 验证结果

### 5.1 脚本语法与逻辑

已完成：

- `bash -n tools/export_to_metanc.sh`
- `bash -n tools/import_from_metanc.sh`

结果：

- 两个脚本语法通过
- 保护路径声明和 rsync 组装都成立

### 5.2 临时仓库保护验证

在 `/tmp/metanc_export_preserve` 中构造了一个最小 `MetaNC` 仓库，并把这 4 个目标文件手工写成哨兵值：

- `DOWNSTREAM_KEEP_INDEX`
- `DOWNSTREAM_KEEP_REPORTS`
- `DOWNSTREAM_KEEP_EXEC`
- `DOWNSTREAM_KEEP_EXEC_SRC`

然后执行修复后的 `export_to_metanc.sh`。

结果：

- 这 4 个文件的值在导出后保持不变
- 说明保护性排除是有效的

### 5.3 真实 `MetaNC` 下游验证

在真实仓库 `/home/iaar/workspace/ccmix-wp/MetaNC` 中，先恢复这 4 个文件，再重跑修复后的导出。

结果：

- `MetaNC` 工作区保持干净
- 这 4 个 report 入口页不再被导出弄脏

## 6. 结论

2026-04-20 这轮工作的稳定结果是：

1. `MetaNC` 下游本地维护的 report 入口页已经从共享同步范围中显式分离出来
2. export/import 两个方向现在都使用同一组保护规则，后续双向同步不容易再在这类路径上出问题
3. 这次修复已经经过临时仓库和真实 `MetaNC` 两层验证，不只是“理论上可行”
