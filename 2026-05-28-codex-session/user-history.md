# Codex User History

Date: 2026-05-28

- 看一下现在的状态
- 看一下现在的实现状态
- Magazine这块今天考虑一下，设计一下
- 这个比之前合理很多。剩下最明显的不一致是：Add Edge 已经是 Detail draft 流程了，但 Add Tool 如果还保留独立创建方式，后面最好也统一到 Detail 的 create_tool 模式，这
    样用户心智会更一致。这个也考虑一下
- 可以 给个详细计划
- ok do
- generate/update report &amp; docs + sync MetaNC-feat/hmi metanc_hmi_dsl + commit + push
- 看一下下一步计划
- 看一下现在底部接口够Magazine用吗
- 这块是在hmi server做吗
- 是不是结构架构设计会有一个中间层之类的
- 详细设计一下
- HMI的菜单层级设计也有了吗
- ok 开做
- 远程ci有问题，修复一下，然后generate/update report &amp; docs + sync MetaNC-feat/hmi metanc_hmi_dsl + commit + push
- 现在什么状态
- 功能开发进度咋样了
- V2这些还是Magazine里面的功能吗
- 我的意思是Magazine现在要补齐什么功能
- ok 详细设计一下
- 这块不用改tooling_management的内容吧
- ok do
- 讨论一下西门子840D的参数系统，然后我们的MetaNC需要设计一套自己的参数系统
- 我感觉我们做的这套参数系统可能会有些联系和区别：
  1.语法上会借鉴840D，用户使用也会类似
  2.840D在实时任务里也是有可能访问参数的是吗？840D的实时访问参数是如何实现的？我们以前因为都是一台设备上，通过共享内存原子操作访问保证
  3.我觉得需要考虑参数的分层设计，比如不同模块的参数管理，但是都需要有合理的schem设计，contract约定
  4.我们以前的一套参数系统，包含了参数的类型、属性（比如是否可读写、是否退出保存、是否下电保存等等），然后所有通过相关模块给定的接口都能拿到对应共享内存地址，也可以通过接口读写，可定制化比较高，但是也有很多缺陷：就是缺乏可控性，容易乱读乱写、缺少合理规划
  5.我们之前还有一套hal引脚参数系统，可以和参数系统bit类型的绑定，类似于同步数据这样，也是共享内存实现
  6.PLC也有自己的一套能访问系统参数，但是我们以前PLC系统里也能读写CNC或者什么的参数，就没有强限制，因为很多需求都很hard
  7我不想被840D绑死，关键是要符合我们架构的一套参数设计
- 按照你这个设计，参数属性里保存用什么形式，如果一堆字符串一个参数那么多属性组合，数据结构不会很大、然后占用内存等很厉害吗
- hot data是什么意思
- 可是我怎么知道那些该放到hot data那些不用呢
- 可是很多变量使用都是跟实际的PLC或者NC code相关的呀，
- generate/update report &amp; docs + sync MetaNC-feat/hmi metanc_hmi_dsl + commit + push
- 你的意思是hot parameter是动态进入的吗
- 那比如说$PP这个变量，你没有加到Hot里面，但是用户换了个程序，里面用到它了，你会怎么办
