# 模块开发与维护

责任到人

## 游戏模块

* 游戏名称以前端为准

|     名称      |  状态  | 主责  | 次责  |  类别  | 备注             |
| :-----------: | :----: | :---: | :---: | :----: | :--------------- |
|    baijia     |        |  tom  |       |  棋牌  | 欢乐百人         |
|    bairen     |        |  tom  |       |  棋牌  | 百人斗牛         |
|     bipai     |        |  tom  |       |  棋牌  | 比牌斗牛         |
| chinese_poker |        |  tom  |       |  棋牌  | 十三张           |
|    RedBlack     |        |  tom  |       |  棋牌  | 红黑大战         |
|  DragonTiger  |        |  tom  |       |  棋牌  | 龙虎斗           |
|      BlackJack      |        |  tom  |       |  棋牌  | 21点             |
|   KASailor    |        |  tom  |       |  棋牌  | 国王与水手       |
|     qznn      |        |  tom  |       |  棋牌  | 抢庄斗牛         |
|    sangong    |        |  tom  |       |  棋牌  | 三公             |
|     SicBo     |        |  tom  |       |  棋牌  | 骰宝             |
|      ttz      |        |  tom  |       |  棋牌  | 极速推筒子(通比) |
|  ttz_zhuang   |        |  tom  |       |  棋牌  | 极速推筒子(庄)   |
|   WanRenJH    |        |  tom  |       |  棋牌  | 万人金花         |
|   zhajinhua   |        |  tom  |       |  棋牌  | 三张牌           |
|     bjSc      |        |  tom  |       |  彩票  | 北京赛车         |
|     cqSsc     |        |  tom  |       |  彩票  | 重庆时时彩       |
|     hjFt      |        |  tom  |       |  彩票  | 皇家飞艇         |
|     hjSsc     |        |  tom  |       |  彩票  | 皇家时时彩       |
|     jlKs      |        |  tom  |       |  彩票  | 吉林快三         |
|     jsKs      |        |  tom  |       |  彩票  | 江苏快三         |
|     jxKs      |        |  tom  |       |  彩票  | 江西快三         |
|     lhcHJ     |        |  tom  |       |  彩票  | 皇家六合彩       |
|     lhcXG     |        |  tom  |       |  彩票  | 香港六合彩       |
|     txSsc     |        |  tom  |       |  彩票  | 腾讯分分彩       |
| bairenCaipiao |        |  tom   |       | 旧彩票 | 秒速百人斗牛     |
|  scratchCard  |        |  tom  |       | 旧彩票 | 刮刮乐           |
|      att      |        |  tom  |       |  电玩  | 皇家翻牌         |
|   caohuaji    |        |  tom  |       |  电玩  | 五星宏辉         |
|    fishery    |        |  tom  |       |  电玩  | 渔场大亨         |
| FruitMachine  |        |  tom  |       |  电玩  | 水果机           |
|   HeroFight   |        |  tom  |       |  电玩  | 三国杀           |
|    pharaoh    |        |  tom  |       |  电玩  | 埃及夺宝         |
|   slots777    |        |  tom  |       |  电玩  | 幸运777          |
|  SpicyhotPot  |        |  tom  |       |  电玩  | 火锅英雄         |
|    xiyouji    |        |  tom  |       |  电玩  | 猴王传奇         |
|   redPacket   |        |  tom   |       |  电玩  | 红包扫雷         |
|   doudizhu    | 已下线 |  tom  |       |  棋牌  | 斗地主           |
|     pipei     | 已下线 |  tom  |       |  棋牌  | 德州             |
|  ~~racing~~   | 已下线 |       |       | 旧彩票 | 疯狂赛车         |
|    ~~ssc~~    | 已下线 |       |       | 旧彩票 | 时时彩           |
| ~~football~~  | 无前端 |       |       |        | 足球             |
| ~~hamburger~~ | 无前端 |       |       |        | 疯狂汉堡         |
|  ~~huoguo~~   | 无前端 |       |       |        | 火锅天下         |
|  ~~indiana~~  | 无前端 |       |       |        | 太空夺宝         |
|  ~~pirate~~   | 无前端 |       |       |        | 寻宝奇航         |

## 功能模块

|       名称       | 状态  | 主责  | 次责  | 备注 |
| :--------------: | :---: | :---: | :---: | :--- |
|      机器人      | 调整  |  tom  |       |      |
|       代理       | 开发  |  tom   |       |      |
|       后台       | 开发  |  tom   |       |      |
|       支付       | 稳定  |  tom   |       |      |
|     真人视讯     | 稳定  |  tom   |       |      |
|    彩票中间件    | 稳定  |  tom   |       |      |
| 皇家娱乐官网后台 | 稳定  |  tom   |       |      |
|       gate       | 稳定  |  tom   |       |      |
|       hall       | 稳定  |  tom   |       |      |
|    connector     | 稳定  |  tom   |       |      |
|     thirdApi     | 开发  |  tom   |       |      |
|     schedule     | 稳定  |  tom   |       |      |
|       奖池       | 开发  |  tom   |       |      |
|       调控       | 开发  |  tom  |       |      |

## 事务管理

|   名称    | 主责  | 次责  | 备注                                |
| :-------: | :---: | :---: | :---------------------------------- |
| 合并分支  |  tom   |       | merge代码，更新ChangeLog，打Tag     |
| BUG接口人 |  tom   |       | 接收各方BUG反馈，分发给具体责任人   |
| 集成测试  |  tom   |   -   | 集成测试项目代码                    |
| 静态分析  |  tom   |   -   | Sonar静态分析代码                   |
| 发布更新  |  tom   |       | 发布代码到生产环境，维护Jenkins任务 |
