# Codex User History

Date: 2026-04-28

- 看一下metanc_hmi_dsl最新的变更，检查有没有问题
- metanc_hmi_dsl和MetaNC都更新一下
- ~/workspace/github/vcpkg/vcpkg 加入到环境变量，方便非docker环境也能用
- 现在我想在本地环境能找到drogon相关，应该怎么安装
- 你现在最推荐的方式是什么
- 可以 按照你的推荐继续
- drogon_ctl能用vcpkg安装吗，我现在好想找不到drogon_ctl的命令
- 现在的server端的代码结构没问题吗，检查一下，我看保留了很多之前自己写的那套东西，然后现在websoket这块是不是还没有引入
- 可以，按照你说的实现一下
- 给我展示一下现在web端接入ws后怎么食用
- 给我展示一下现在web端接入ws后怎么使用
- 先提交+push一下，然后合并必要内容到MetaNC
  ./generated/distribution/run_split_web_native.sh 8010 8000方式启动后 http://127.0.0.1:8000/?server=http://127.0.0.1:8010/api/runtime打开界面
  点击软面板发现：unsupported simulator command: cnc.commands.set_mode  jog.commands.move_axis 等等（这里报错不全，应该还有很多），是不是分离后这些功能都没实现
  还有就是点击CYCLE START，界面数据也不执行了，
  是不是这种真实方式现在不work了，检查并处理一下
- JOG那些好像是可以了，但是AUTO模式跑程序，界面没有切换运行行、数据也没有变，是因为server端没有处理还是因为通信问题，你仔细检查一下
- 所以现在client显示的数据都是server端真实返回的是吗，然后server端自己先mock了数据是不
- 所以现在client的数据是通过sub server的某些定义，然后server pub过来的对吧
- 所以现在的client server分离算是基本完成了吗
- 更新一下今天的report和所有关联文档，commit+push，然后我们准备下一趴的讨论
