
# Pinus Cli

## 安装

```bash
npm install pinus-cli -g
```

## 非控制台命令

```bash
# 添加一个服务器
## 如须动态添加单个服务器 请在第一次启动时确认 /dist/config/ 目录下是否有 adminServer.json 文件
pinus add host=127.0.0.1 port=3868 serverType=DragonTiger id=DragonTiger-server-1
pinus add host=127.0.0.1 port=3854 serverType=schedule id=schedule-server-1
pinus add host=127.0.0.1 port=3882 serverType=bairenTTZ id=bairenTTZ-server-1
pinus add host=127.0.0.1 port=3855 serverType=http id=http-server-1
pinus add host=127.0.0.1 port=3889 serverType=7up7down id=7up7down-server-1
pinus add host=127.0.0.1 port=3886 serverType=Rummy id=Rummy-server-1
pinus add host=127.0.0.1 port=3864 serverType=qznn id=qznn-server-1
pinus add host=127.0.0.1 port=4000 serverType=TeenPatti id=TeenPatti-server-1
pinus add host=127.0.0.1 port=3855 serverType=gmsApi id=gmsApi-server-1
pinus add host=127.0.0.1 port=4003 serverType=slots777 id=slots777-server-1
pinus add host=127.0.0.1 port=3858 serverType=slots777 id=slots777-server-1
pinus add host=127.0.0.1 port=3891 serverType=fishPrawnCrab id=fishPrawnCrab-server-1
pinus add host=127.0.0.1 port=3873 serverType=att id=att-server-1
pinus add host=127.0.0.1 port=3884 serverType=pirate id=pirate-server-1
pinus add host=127.0.0.1 port=3881 serverType=fishery id=fishery-server-1
pinus add host=127.0.0.1 port=3889 serverType=7up7down id=7up7down-server-1
pinus add host=127.0.0.1 port=3863 serverType=xiyouji id=xiyouji-server-1
pinus add host=127.0.0.1 port=3865 serverType=GoldenFlower id=GoldenFlower-server-1
pinus add host=127.0.0.1 port=3866 serverType=SicBo id=SicBo-server-1
pinus add host=127.0.0.1 port=3859 serverType=baijia id=baijia-server-1
pinus add host=127.0.0.1 port=3862 serverType=RedBlack id=RedBlack-server-1
pinus add host=127.0.0.1 port=3871 serverType=chinese_poker id=chinese_poker-server-1
pinus add host=127.0.0.1 port=3895 serverType=BenzBmw id=BenzBmw-server-1
pinus add host=127.0.0.1 port=4001 serverType=FruitMachine id=FruitMachine-server -1
pinus add host=127.0.0.1 port=3860 serverType=bairen id=bairen-server-1
pinus add host=127.0.0.1 port=3870 serverType=WanRenJH id=WanRenJH-server-1
pinus add host=127.0.0.1 port=3867 serverType=BlackJack id=BlackJack-server-1
pinus add host=127.0.0.1 port=3855 serverType=gmsApi id=gmsApi-server-1
pinus add host=127.0.0.1 port=4006 serverType=checkPlayerInGame id=checkPlayerInGame-server-1
pinus add host=127.0.0.1 port=3695 serverType=checkPlayerInGame id=checkPlayerInGame-server-1
pinus add host=127.0.0.1 port=3695 serverType=checkPlayerInGame id=checkPlayerInGame-server-1
pinus add host=127.0.0.1 port=3875 serverType=caohuaji id=caohuaji-server-1
pinus add host=127.0.0.1 port=3350 serverType=hall id=hall-server-1
pinus add host=127.0.0.1 port=3351 serverType=hall id=hall-server-2
pinus add host=127.0.0.1 port=3352 serverType=hall id=hall-server-3
pinus add host=127.0.0.1 port=3353 serverType=hall id=hall-server-4
pinus add host=127.0.0.1 port=3867 serverType=BlackJack id=BlackJack-server-1
pinus add host=127.0.0.1 port=3886 serverType=fishPrawnCrab id=fishPrawnCrab-server-1
pinus add host=127.0.0.1 port=3886 serverType=fishPrawnCrab id=fishPrawnCrab-server-1
pinus add host=127.0.0.1 port=3898 serverType=Rummy id=Rummy-server-1



pinus add host=127.0.0.1 port=3861 serverType=redPacket id=redPacket-server-1
pinus add host=127.0.0.1 port=4004 serverType=fanTan id=fanTan-server-1


pinus add host=127.0.0.1 port=3350 serverType=hall id=hall-server-1
pinus add host=127.0.0.1 port=3351 serverType=hall id=hall-server-2
pinus add host=127.0.0.1 port=3352 serverType=hall id=hall-server-3
pinus add host=127.0.0.1 port=3353 serverType=hall id=hall-server-4



# 前端服务器
pinus add host=172.31.26.91 port=3150 serverType=gate id=gate-server-1 clientHost=gate.hs8228.com clientPort=63010 frontend=true
pinus add host=172.31.26.91 port=3151 serverType=gate id=gate-server-2 clientHost=gate.hs8228.com clientPort=63012 frontend=true


#select TRUNCATE(TIMER_WAIT / 1000000000000, 6) as duration,
#sql_text,
#EVENT_ID
#FROM 
#events_statements_history
#WHERE
#TRUNCATE(TIMER_WAIT / 1000000000000, 6) <> 0
#AND sql_text IS NOT NULL
#ORDER BY TRUNCATE(TIMER_WAIT / 1000000000000, 6) DESC
#LIMIT 1, 40;

## 关闭游戏
pinus add host=127.0.0.1 port=3872 serverType=sangong id=sangong-server-1
pinus add host=127.0.0.1 port=3884 serverType=pirate id=pirate-server-1
pinus add host=127.0.0.1 port=3891 serverType=fishPrawnCrab id=fishPrawnCrab-server-1
pinus add host=127.0.0.1 port=3889 serverType=7up7down id=7up7down-server-1
pinus add host=127.0.0.1 port=3874 serverType=payment id=payment-server-1
pinus add host=127.0.0.1 port=3879 serverType=buyu id=buyu-server-1
pinus add host=127.0.0.1 port=3881 serverType=fishery id=fishery-server-1
pinus add host=127.0.0.1 port=3887 serverType=andarBahar id=andarBahar-server-1
pinus add host=127.0.0.1 port=3873 serverType=att id=att-server-1
pinus add host=127.0.0.1 port=3875 serverType=caohuaji id=caohuaji-server-1
pinus add host=127.0.0.1 port=3875 serverType=caohuaji id=caohuaji-server-1
pinus add host=127.0.0.1 port=4002 serverType=DZpipei id=DZpipei-server-1
pinus add host=127.0.0.1 port=3883 serverType=pharaoh id=_pharaoh_-server-1
pinus add host=127.0.0.1 port=3866 serverType=SicBo id=SicBo-server-1
pinus add host=127.0.0.1 port=3890 serverType=colorPlate id=colorPlate-server-1

![img_1.png](img_1.png)
![img.png](img.png)




# 游戏列表 端口是3005或3008
pinus list -P 3008

# 重启单个服务 schedule（）N
pinus restart -P 3008 -t HeroFight -i HeroFight-server-1
```

## 控制台命令
```bash
# admin登录控制台
pinus-cli -h 127.0.0.1 -P 3008 -u admin -p admin

# 显示连接 connector-server-1 为真实玩家数量
show connections

# 关闭服务
stop zhajinhua-server-1
# 启动服务 可添加断点参数
add host=127.0.0.1 port=3478 serverType=zhajinhua id=zhajinhua-server-1
add host=127.0.0.1 port=3947 serverType=HeroFight id=HeroFight-server-1

# dump内存 需要在项目目录中 npm install heapdump
use zhajinhua-server-1
dump memory /tmp/zhajinhua-server-1 --force
```

优化总结

美术方向: 各个游戏之间的风格统一、部分游戏向2.5D方向调整
f

数据库优化：
1. 游戏记录从游戏数据库分离单独建库

    2. 游戏数据库做主备，强制走主节点数据库，从节点只做备份节点，当主节点异常才启用备份节点。
    
    3. 游戏记录数据库，采用一主多从的数据库结构。并开启Mysql数据库 GTID 模式，
       可动态添加从库，并保证了了主从切换的简易性。并对请求数据库进行分类，插入要求GTID返回，拉单请求允许过期读等一系列业务优化。

    4. 提高mysql的工作线程组，提高同步效率

    5. 考虑未来会有多个平台接入，在现有目前的所有游戏记录分月表的基础上再根据每个平台分月表，每个平台都会由自己的月表记录。
      根据目前打码量1亿左右，近950万注单记录，单次拉单查询15分钟，0.18s的查询表现。如果月表量超3000万，会再次进行自动分表。

拉单、以及上下分进程优化：
1. 协议限制，单次拉单时间范围为15分钟

    2. 引入kafka消息队列，所有上下分拉单请求队列化，并在必要情况进行限流处理。

    3. 开四个拉单进程、以及两个上下分进程。单个拉单进程并发经过优化，并发在200左右，下面附并发测试图，该数据为生产环境实际测试数据。

    4. 合理的连接数在200左右，下面附图，在后续提升了连接数单进程的性能并没有显著提升。所以要保证接口瞬时并发达到800以上，需启动4个拉单进程

![img_4.png](img_4.png) 拉单并发测试 150连接数 150并发
![img_1.png](img_1.png) 拉单并发测试 250连接数 150并发
![img_2.png](img_2.png) 拉单并发测试 250连接数 250并发
![img_3.png](img_3.png) 拉单并发测试 400连接数 250并发