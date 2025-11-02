# 数据字段整理

## 彩票游戏 字段映射 betOrder

| 统计字段              | 统计字段名    | 表名      | 字段名        | 字段备注                 |
| --------------------- | ------------- | --------- | ------------- | ------------------------ |
| 单号                  | orderNo       | betOrder  | orderNumber   | 订单号                   |
| 投注状态              | orderState    | betOrder  | state         | 状态 未开奖0 开奖1 撤单2 |
| 用户ID                | uid           | betOrder  | uid           | 玩家uid                  |
| 期号                  | roundNo       | betOrder  | period        | 期号                     |
| 投注时间              | betTime       | betOrder  | time          | 下注时间                 |
| 投注类型              | betType       | betOrder  | type          | 玩法类型                 |
| 投注内容(URLEncode)   | betOption     | betOrder  | area          | 玩法区域                 |
| 投注金额(单位:分)     | betGold       | betOrder  | betGold       | 下注金币                 |
| 有效投注金额(单位:分) | betGoldValid  | betOrder  | validBet      | 真实押注                 |
| 开奖号码              | awardResult   | betOrder  | lotteryResult | 开奖结果                 |
| 开奖时间              | awardTime     | betOrder  | lotteryTime   | 开奖时间                 |
| 实际投注收益          | awardGoldReal | betOrder  | profit        | 实际投注收益             |
| 游戏名称              | gameName      | betOrder  | gameName      | 游戏名称                 |
| 投注时赔率            | instantOdd    | betOrder  | odds          | 赔率                     |
| 投注时返点率          | instantRebate | betOrder  | rebates       | 返点比例                 |
| 用户名                | username      | user_info | userName      | 用户名                   |
| 游戏类型("CP")        | gameType      |           |               |                          |
| 游戏ID                | nid           |           |               |                          |

## 其他游戏 字段映射 game_record

| 统计字段                  | 统计字段名    | 表名      | 字段名                 | 字段备注                                                |
| ------------------------- | ------------- | --------- | ---------------------- | ------------------------------------------------------- |
| 订单编号                  | orderNo       | betOrder  | id                     | 默认ID                                                  |
| 投注状态                  | orderState    | betOrder  | playStatus             | 记录状态                                                |
| 玩家ID                    | uid           | betOrder  | uid                    | 玩家ID                                                  |
| 投注时间                  | betTime       | betOrder  | createTime             | 时间戳                                                  |
| 投注金额(单位:分)         | betGold       | betOrder  | input                  | 押注金额 分                                             |
| 剩余金额(单位:分)         | leftGold      | betOrder  | gold                   | 当前金币 分                                             |
| 中奖金额(单位:分)         | awardGold     | betOrder  | win                    | 中奖金额 分                                             |
| 实际投注收益(单位:分)     | awardGoldReal | betOrder  | profit                 | 利润 正负分                                             |
| 计入自身的抽水值(单位:分) | rebateGold    | betOrder  | self_settle_commission | 计入自身的抽水值                                        |
| 抽水方式                  | rebateType    | betOrder  | way                    | 抽水方式: 1赢取抽水 2押注抽水 3赢和押注都抽水 4结算抽水 |
| 抽水对象                  | rebateObject  | betOrder  | object                 | 抽水对象: 1庄家可抽 2玩家可抽 3庄家玩家都可抽           |
| 游戏名称                  | gameName      | betOrder  | gname                  | 游戏名 中文名                                           |
| 用户名                    | username      | user_info | userName               | 用户名                                                  |
| 游戏类型("GAME")          | gameType      |           |                        |                                                         |
| 游戏ID                    | nid           |           |                        |                                                         |
