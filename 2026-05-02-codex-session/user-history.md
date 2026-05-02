# Codex User History

Date: 2026-05-02

- 现在LOGS单独在DIAG外侧，DIAG里面又有一个LOGS的选项，会不会很奇怪
- 那保留DIAG里的LOGS入口，把外层的LOGS入口的功能移到里面替换掉呢
- 你尝试改一下，先不要提交，因为现在DIAG进去默认就是LOGS，如果新的LOGS移进去，可能默认页得改成DIAG里面其他的，不然会很奇怪
- 现在点击DIAG没反应了，是不是默认菜单进去出问题了
- DIAGS进去默认还是改成LOGS
- 创建今天的report，提交一下今天的变更，然后同步一下MetaNC，commit+push
- 生成最终产物我看一下
- 你生成的这个没有启动server是吧
- ok，更新一下今天的report然后提交push
- 你看下现在的web程序编辑器的行号这块是不是不是做在编辑器里面的、而是单独做的一个控件，我发现很容易二者不对齐（行号和实际行），现在用的那个编辑器本身有行号功能吗，有的话最好直接用，你做的这个可靠性太差了，然后看一下qt版本是不是也有问题，都在metanc_hmi_dsl里统一改一下
- 可是我看web的没有显示行号，是没做吗
- 可以，更新一下report和所有关联文档，然后commit+push，然后合并到MetaNC commit+push
- 程序选择页点击Open后没有跳转到程序编辑，也没有切换打开的程序，然后我记得原来示例程序里有很多，比如LOOP等程序，我现在只看到3个，是因为什么，这些程序不是server端的了吗
- 创建一下提交，然后修复一下程序编辑页面在系统空闲的时候点击execute执行没有跳转到主页并切换执行程序为当前编辑程序的问题（注意，空白或者不存在的编辑程序时不能切换，要有提示）
- commit + sync MetaNC + push
- 今天的report更新了吗，所有关联文档更新了吗，没有的话处理一下，然后commit + push
- 你现在考虑过日志性能问题吗，比如说超过多少条以后，界面是否会卡，通讯会否性能受影响等，
- state 和 command response 里移除默认 logs意思是现在的pub sub里默认带了最多200条日志是麻
- state 和 command response 里默认 logs意思是现在的pub sub里默认带了最多200条日志是麻
- 日志以外的其他数据，比如坐标等，现在的实现是什么样的，我记得之前说的是server端根据client sub哪些变量去pub，所以那些应该不是client轮询，而是sub之后server端pub的
- 是的，还要考虑全局变量和页面变量，全局变量需要的是全程sub，页面变量是切换到对应页才sub，server应该根据sub切换、而不应该全量pub；
  logs那个也有问题，理论上应该设置server端的log硬上限、这个可以做成一个配置，然后关于client/server的日志交互我们需要再讨论一下
- 可以 你做吧
- update report&amp; docs , sync MetaNC, commit +push
