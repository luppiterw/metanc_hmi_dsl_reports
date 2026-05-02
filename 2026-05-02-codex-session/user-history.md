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
