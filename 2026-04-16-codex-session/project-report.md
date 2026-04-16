# Project Report

## 1. 报告目标

本报告总结 2026-04-16 这轮工作中，如何系统性地排查并修复 QML 与 Web 双目标生成器在运行时行为上的六处不一致，同时将动画时钟从 90ms 降至 30ms 以提升坐标轴变化的流畅度，并在此基础上继续修复 Web 原型主界面三处可见布局问题。

这次工作的目标集中在三条线上:

- 对齐 QML 与 Web 运行时行为：执行游标语义、属性去重写、目录同步回退逻辑、文件重命名保护
- 提升 mock 运行时动画流畅度：将运动时钟从 11fps 提升至 33fps，同步缩放步长
- 修复 Web 原型三处布局回归：页头列宽溢出、主体高度链断裂导致的滚动条、警报覆层文字穿透

## 2. 证据范围

本报告对应 2026-04-16 当天已经存在于主仓库提交历史中的一组修改，核心范围包括:

- `tools/hmi_dsl/generators/qml_runtime_shell.py`
- `tools/hmi_dsl/generators/web_runtime_shell.py`
- `tools/hmi_dsl/generators/qml_widget_emitters.py`
- `tools/hmi_dsl/generators/web.py`
- `generated/web/styles.css`（由 web.py 生成）
- `generated/web/app.js`（由 web_runtime_shell.py 生成）
- `generated/qml/`（由 QML 生成器生成）

## 3. 本轮处理前的主要问题

### 3.1 QML 与 Web 运行时行为不一致

在代码审查中发现 QML 和 Web 两个目标生成器存在六处语义分歧：

**Bug 1 — 执行游标方向相反（最关键）**

QML 的 `prepareExecutionCursor` 使用 `>= requested` + break，找到"第一个大于等于目标行"即停止；
Web 则使用 `<= requested` 无 break，找到"最后一个小于等于目标行"。
当执行游标落在两个 NC 行号之间时，两者选择截然不同的目标块，导致运行时发散。

修复：将 QML 统一为 `<= requested` 无 break，与 Web 语义对齐。

**Bug 2 — QML 程序编辑器 emitter 含死代码**

`_emit_program_editor` 在 return 之后还有约 23 行引用未定义变量的代码（`binding`、`radius`、`content_id` 等），明显是从其他 emitter 粘贴过来且从未执行。已清理。

**Bug 3 — 目录同步回退缺失保护**

`syncProgramDirectory` 在目录为空时的回退逻辑被 `hasProgramWorkspaceBackend()` 包裹，导致 QML 在目录为空时不会重置到根目录，与 Web 行为不同。已移除该判断条件。

**Bug 4 — 文件重命名允许覆盖已存在名称**

`prog.commands.rename` 在目标名称已存在于程序文件列表中时不应执行重命名，QML 未做此检查。已补齐 `!programFiles.hasOwnProperty(oldName)` 判断。

**Bug 5 / 6 — `writeProperty` / `writeLocalState` 缺少去重**

两个函数在值未发生变化时仍然触发更新和版本号递增，导致不必要的重渲染和状态抖动。已加入 `Object.is` 相等判断，跳过无效写入。

### 3.2 mock 运行时动画卡顿

运动时钟间隔为 90ms（约 11fps），在 WSL/WSLg 环境下显示延迟叠加，坐标轴数值跳跃感明显。

根因：时钟频率不足，与目标 30fps 差距过大。WSL 显示延迟是外部因素，无法在代码层消除。

修复：将 QML 和 Web 的 `motionTicker` / `advanceMotionTick` 间隔均从 90ms 改为 30ms，同时在 `axisStep()` 中引入 `tickScale = 30.0 / 90.0` 对所有步长返回值进行等比缩放，保持表观速度不变。

### 3.3 Web 原型主界面三处布局问题

**问题 1 — 页头内容错乱**

`.global-status-bar` 的三列定义为 `300px minmax(0, 1fr) 260px`。左列 300px 中同时放置了产品名称标题（~150px）和主题选择控件（min-width: 180px），合计约 380px，超出容器宽度后发生溢出。

**问题 2 — 主体仍有滚动条**

高度链在 `display_shell` → `screen_workspace` 处断裂，并且 `screen_workspace` 的 `align-items: start` 阻止了列元素填充行高。模式面板（auto / mdi / jog panel）持有固定高度 `height: 520px; max-height: 520px`，在任何视口下都会产生溢出。

**问题 3 — 左侧显示警报覆层文字**

`.page-shell.is-fixed-stage` 使用 `justify-content: center`，使 `page-root` 居中显示并在两侧留出空白间隙。警报覆层（`position: absolute; inset: 16px`）覆盖整个 `page-stage`，其文字在 `page-root` 未覆盖的左侧间隙区域透出。

## 4. 修复方案

### 4.1 运行时行为对齐（QML 侧）

所有修改均在 `qml_runtime_shell.py` 和 `qml_widget_emitters.py` 中完成：

| 问题 | 修复方式 |
|------|----------|
| Bug 1 执行游标 | `>= requested` + break → `<= requested` 无 break |
| Bug 2 死代码 | 移除 `_emit_program_editor` return 之后的 23 行无效代码 |
| Bug 3 目录回退 | 移除 `hasProgramWorkspaceBackend()` 包裹 |
| Bug 4 重命名保护 | 加入 `!programFiles.hasOwnProperty(oldName)` 检查 |
| Bug 5/6 去重写入 | `writeProperty` / `writeLocalState` 加入 `Object.is` 判断 |

### 4.2 动画平滑度提升

```javascript
// QML: qml_runtime_shell.py
motionTicker.interval: 30  // 原 90

function axisStep(axis) {
    var tickScale = 30.0 / 90.0
    // 所有返回值乘以 tickScale
}

// Web: web_runtime_shell.py
setInterval(advanceMotionTick, 30)  // 原 90

function axisStep(axis) {
    const tickScale = 30 / 90
    // 所有返回值乘以 tickScale
}
```

### 4.3 Web 布局修复

**页头修复**

```css
/* 前 */
.global-status-bar { grid-template-columns: 300px minmax(0, 1fr) 260px; }

/* 后 */
.global-status-bar { grid-template-columns: auto minmax(0, 1fr) auto; }

.machine-strip { flex-wrap: nowrap; overflow: hidden; }
```

**高度链修复**

```css
/* page-shell */
.page-shell { position: relative; z-index: 1; }

/* is-fixed-stage: 去除居中，改为拉伸填充 */
.page-shell.is-fixed-stage {
  align-items: stretch;     /* 原 flex-start */
  overflow: hidden;
  /* 移除 justify-content: center */
}

.page-shell.is-fixed-stage > .page-root {
  height: 100%;             /* 新增 */
  width: 100%;              /* 原 min(1040px, 100%) */
}

/* page-root grid 行追加拉伸轨道 */
.page-root { grid-template-rows: minmax(0, 1fr); }

/* display_shell 防止超出 */
.node-display_shell { min-height: 0; }

/* screen_workspace 填充并拉伸列 */
.node-screen_workspace {
  align-items: stretch;     /* 原 start */
  height: 100%;             /* 新增 */
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
}

/* 模式面板改为流式高度 */
.node-main_auto_panel,
.node-main_mdi_panel,
.node-main_jog_panel {
  height: 100%;             /* 原 520px */
  max-height: none;         /* 原 520px */
  min-height: 0;
}
```

## 5. 结果

### 5.1 运行时行为

QML 和 Web 两个目标在以下维度的行为现已对齐：
- 执行游标定位逻辑
- 属性写入去重策略
- 空目录回退逻辑
- 文件重命名保护

### 5.2 动画流畅度

运动时钟从 11fps 提升至 33fps，坐标轴数值变化明显更平滑。表观进给速度保持不变（通过 `tickScale` 等比缩放）。

### 5.3 Web 布局

- 页头三列按内容宽度自动分配，主题选择控件不再溢出
- 主体内容填充可用高度，滚动条消失
- 警报覆层文字不再透出页面内容区域
