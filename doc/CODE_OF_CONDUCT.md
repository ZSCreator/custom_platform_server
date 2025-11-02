# 代码规范

## 约定

- 包名: 数字+下划线+小写字母,首字不用数字       app/xxx/game_scene
- 文件: 首字母大写驼峰命名                      RedisConst.ts
- 方法: 首字母小写驼峰命名                      getPlayerFromRedis()
- 变量: 首字母小写驼峰命名                      isOnline
- 引入文件: 首字母大写驼峰命名                  import * as PlayerClassManager from '../../../dao/domainManager/hall/PlayerClassManager';
- 引号: 使用单引号                              'x-forwarded-for''
- 数据库表名: 使用小写字母和数字 下划线分割单词 game_record
- 内部方法: 方法名以下划线起头                  _setUserOnline()

## 术语表

| 名称     | 解释                               | 字段标识 |
| -------- | ---------------------------------- | -------- |
| 金币     | 玩家在系统里面的货币               | gold     |
| 从库     | MongoDB 只读丛库                   | slave    |
| 第三方   | API调用方                          | third    |
| 返点率   | 返还给玩家的金额百分比             | rebate   |
| 游戏抽水 | 平台按设置比例抽取游戏流水         |          |
| 返奖率   | 出奖金额除以玩家总投注             |          |
| 代理返水 | 代理根据返水比例抽取下线返水       |          |
| 玩家返水 | 彩票类游戏玩家可选择返水比例       |          |
| 代理返点 | 平台定时结算代理推广佣金(负盈利值) |          |
