# Codex User History

Date: 2026-04-29

- metanc_hmi_dsl和MetaNC都更新一下
- 生成一下最终产物和文档看一下
- 你给我详细介绍一下，你现在build了哪些东西，哪些是在docker以及在哪个docker构建的，哪些是host本地构建的
- docker images
                                                                                                                                                   i Info →   U  In Use
  IMAGE                            ID             DISK USAGE   CONTENT SIZE   EXTRA
  metanc-hmi-server-build:local    16a08e8317a5       7.93GB         1.98GB
  metanc-hmi-server:local          c708d8a4682f        148MB         37.8MB
  optimalcnc/metanc:latest         2cc9b6b4eef7       4.87GB         1.27GB
  unicollect-dev:ubuntu24.04       5a39e1a16d0c        830MB          204MB
  unicollect-runtime:ubuntu24.04   269416c6a199        151MB         38.6MB
  现在本地有这些docker image，每个都是干嘛的，看起来都是你下载的
- 意思是现在server端的编译其实在metanc-hmi-server-build:local，然后生成的server会拷贝回本地环境使用；
  然后metanc-hmi-server:local其实对应于本地的运行环境，可以跑server对吗
  然后optmalcnc/metanc:latest其实是MetaNC的编译或者什么环境
- 所以如果本地有vcpkg toolchain，就不会用metanc-hmi-server-build:local镜像是吗
- 若果现在要向别人介绍metanc_hmi_dsl，要怎么介绍
- 你还没说怎么介绍呢
- 检查一下现在metanc_hmi_dsl generated里的那些脚本和说明有没有问题，是不是有out of date的
- 移除本地unicollect相关的几个docker
- 提交一下，然后合并到MetaNC，然后都commit+push，注意commit msg要准确
- 新建一下今天的report和关联文档，然后更新一下，然后重新生成一下，然后commit + push
