# 项目文档

项目业务逻辑较为复杂，常写文档，避免遗忘。

## 注意事项
node v12.16.1
redis:5.0
mongo:4.0
mysql:5.7
### 上线注意事项

- 通过Jenkins推送更新，禁止开发人员绕过Jenkins或直接修改线上代码
git config core.ignorecase false



### 刮奖游戏```GetKaiJiangArray.003```

```bash
需要导入表 scratch_card_result.json
```

## 项目结构

```txt
.
├── app
│   ├── consts              常量配置文件
│   ├── dao                 数据库操作类
│   ├── domain              业务控制
│   ├── servers             定义服务
│   ├── services            服务实现
│   └── utils               工具类
├── ci                      持续集成脚本
├── config                  少量遗留配置
├── dist
|   └── config              主要配置
|       ├── data            游戏数据
|       ├── db              数据库配置
|       ├── lottery         彩票业务配置
|       ├── pay             支付配置
|       ├── protobufConfig  报文数据结构定义
|       ├── saltValue       游戏加密盐值
|       └── third           第三方接口配置
├── doc                     项目文档
├── test                    测试代码
└── tools                   工具目录
    ├── agent               代理相关工具
    ├── gameRecord          游戏分佣工具
    ├── robot               机器人工具
    └── system              系统工具
```

## 数据与缓存

### player_info数据库模型存取层 ```playerManager.ts```

| 方法                         | 说明                                     |
| ---------------------------- | ---------------------------------------- |
| createPlayer                 | 创建账户信息                             |
| getPlayer                    | 查找单个玩家信息                         |
| findPlayerList               | 查找多个只读玩家                         |
| getAllBufferPlayer           | 获取缓存中玩家的数据                     |
| lockPlayer                   | 给 player 加锁                           |
| resetAllPlayers              | 重启的时候：初始化所有玩家的一些状态字段 |
| randomChoseMatchPlayers      | 随机选择给定数量的玩家                   |
| updateOnePlayer              | 更新玩家信息，游戏中更新均调用该方法     |
| updateAllBufferPlayerInstant | 把所有缓存里的真实玩家信息同步到数据库   |
| updateSomePlayer             | 更新一些玩家的信息                       |

### user_info数据库模型操作层 ```userManager.ts```

| 方法                       | 说明                                                  |
| -------------------------- | ----------------------------------------------------- |
| createUser                 | 创建账户信息                                          |
| findOneUser                | 查找单个账户信息                                      |
| findUserList               | 查找多个账户信息                                      |
| updateOneUser              | 更新账户信息，游戏中更新均调用该方法                  |
| updateAllBufferUserInstant | 把缓存里所有 uidArr 包含的uid的 user 信息同步到数据库 |

### player_info高级封装```PlayerClassManager.ts```

| 方法                   | 说明                                          |
| ---------------------- | --------------------------------------------- |
| getClassPlayer         | 获取一个类对象玩家 默认带锁                   |
| getBasePlayer          | 获取只读对象玩家                              |
| BuildClassPlayer       | 构建一个机遇BasePlayer的玩家对象              |
| isPlayerOnline         | 返回玩家是否在线                              |
| getAllOnlinePlayerUids | 获取所有在线玩家的uid集合，包括机器人         |
| refreshLockDBPlayer    | 重置基于BasePlayer 的对象相关参数每日重置处理 |

## 计时任务

app/services/common/timeService.js

| 编号 | 计划时间                          | 任务描述                                             | 任务调度                                                                  |
| ---- | --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| 1    | ```0 0 6 * * *```                 | 删除渔场开奖记录                                     | fisheryManager.deleteRecordRedis()                                        |
| 2    | ```30 59 23 * * *```              | 每天23.59.30秒的时候去设置一下刷新每日盈利榜的时间点 | footballBufferService.setRefreshProfitRankTimePoint                       |
| 3    | ```0 0 6 * * *```                 | 重置ATT返奖率                                        | db.getDao('att_data').update()                                            |
| 4    | ```0 0 6 * * *```                 | 清除草花机开奖次数每天6点                            | CaohuajiMgr.get_sceneInfo('41').forEach.initHistorys()                         |
| 5    | ```setInterval(10 * 60 * 1000)``` | 海盗船每十分钟执行一次把流水池的钱转入基础奖池       | RoomManager.updateOneRoom(m, ['jackpot', 'runningPool'])                  |
| 6    | ```setInterval(60000```)          | 监控放奖状态                                         | Room.updateAward()                                                        |
| 7    | ```0 59 23 * * *```               | 每天凌晨12点清空红黑大战房间开奖记录                 | RoomManager.updateOneRoom                                                 |
| 8    | ```setInterval(20 * 1000)```      | 草花机每20s执行一次把流水池的钱转入基础奖池          | RoomManager.updateOneRoom()                                               |
| 9    | ```setInterval(2 * 60 * 1000)```  | slots777每五分钟执行一次把流水池的钱转入基础奖池     | Slots.dosharing()                                                         |
| 10   | ```0 1 * * * *```                 | 每小时的1分扣除金币                                  | RoomManager.updateOneRoom() JacpotRecordManager.addJackpotRecordForRoom() |

app/services/hall/hallScheduleJobService.js

| 编号 | 计划时间          | 任务描述                     | 任务调度                                                                                                         |
| ---- | ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1    | ```10 01 * * *``` | 设置删除邮件的任务           | mailsModel.remove()                                                                                              |
| 2    | ```0 0 0 * * *``` | 处理每天重置玩家的一些属性值 | PlayerManager.updateSomePlayer() hallFeatureController.resetDailyRank() PlayerClassManager.refreshLockDBPlayer() |
| 3    | ```0 0 6 * * *``` | 重置 dailyNetProfit 字段     | PlayerManager.updateSomePlayer                                                                                   |

app/services/http/httpScheduleJob.js

| 编号 | 计划时间           | 任务描述                                                      | 任务调度                                                       |
| ---- | ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------- |
| 1    | ```00 01 * * *```  | 统计当天的利润                                                | 复杂逻辑                                                       |
| 2    | ```20 00 * * *```  | 记录每个渠道的利润                                            | InfiniteAgentService.getSubordinates() addQudaoProfitsRecord() |
| 3    | ```59 * * * *```   | 记录每个玩家的推广利润                                        | 复杂逻辑                                                       |
| 4    | ```59 23 * * 7```  | 計算大區的考核绩效                                            | RegionalProfitsRecord.create()                                 |
| 5    | ```*/30 * * * *``` | 记录玩家总的金币                                              | HourPlayerGold.create(info)                                    |
| 6    | ```*/10 * * * *``` | 每个玩家的推广利润 无限级                                     | 复杂逻辑                                                       |
| 7    | ```*/10 * * * *``` | 无线代的差级                                                  | AgentService.addDayPlayerProfitsPayRecord_wuxian_jicha()       |
| 8    | ```*/10 * * * *``` | 检查玩家的团队人数以及今日新增和今日活跃人数                  | AgentService.addDayPeopleAndActive()                           |
| 9    | ```*/10 * * * *``` | 检查玩家的团队人数以及今日新增和今日活跃人数 (不用手机号绑定) | AgentService.addDayPeopleAndActive_notCellPhone()              |
| 10   | ```59 23 * * 7```  | 計算代理的推广收益                                            | AgentService.addAgentKaoheProfitsRecord()                      |

## 数据同步

app/services/common/pomeloSyncService.js

- 每1分钟同步 用户数据
- 每5分钟同步 游戏数据、场景数据、房间数据、押注限制数据

```javascript
// 注册sync服务
app.use(sync, {sync: {path: __dirname + '/app/dao/mapping', dbclient: {}}});
```


## VSCode

### 启动调试

.vscode/launch.json

```json
{
    "version": "0.2.0",
    "configurations": [{
            "type": "node",
            "request": "attach",
            "name": "远程调试 9229",
            "address": "127.0.0.1",
            "port": 9129,
            "localRoot": "${workspaceFolder}",
            "remoteRoot": "/home/roy/Source/C.T/Server" // 需要修改
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Mocha Royal API",
            "program": "${workspaceFolder}/test/api/ApiUidTest.js",
            "runtimeArgs": [
                "${workspaceRoot}/node_modules/.bin/mocha",
                "--inspect-brk"
            ],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "port": 9229
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Pomelo",
            "console": "externalTerminal",
            "program": "${workspaceRoot}/app.js",
            "port": 9229 // 需要在servers.json打开调试端口 ==> "args":"--inspect=127.0.0.1:9229",
          },
          {
            "type": "node",
            "request": "attach",
            "name": "Pomelo attach",
            "processId": "${command:PickProcess}"
          }
    ]
}
```

### DEBUG

servers.json

```json
    "thirdApi": [{
      "id": "third-api-server-1",
      "host": "127.0.0.1",
      "port": 3980,
      "args":"--inspect=127.0.0.1:9229",
      "httpPort": 10001
    }]
```

### 推荐插件

- ```Gitlens```         快速查看当前行代码更改历史
- ```Git Graph```       图形化查看Git分支及提交日志
- ```Beautify```        格式化代码
- ```Better Align```    格式化代码，对齐变量
- ```Markdown Preview Enhanced```   增强Markdown文档预览效果
- ```markdownlint```    Markdown语法检查
- ```TSLint```          TypeScript开发必备
- ```Testing REGEX```   方便快速验证正则表达式
- ```Git Tree Compare```            git分支对比
- ```markdownlint```    Markdown语法错误检查

### 其他

- 代理环境获取真实IP需要修改Pinus组件 node_modules/pinus/dist/lib/connectors/hybrid/wsprocessor.js 让headers暴露出来

```diff
diff --git a/packages/pinus/lib/connectors/hybrid/wsprocessor.ts b/packages/pinus/lib/connectors/hybrid/wsprocessor.ts
index 163f098a..d112cc69 100644
--- a/packages/pinus/lib/connectors/hybrid/wsprocessor.ts
+++ b/packages/pinus/lib/connectors/hybrid/wsprocessor.ts
@@ -22,7 +22,9 @@ export class WSProcessor extends EventEmitter {
         let self = this;
         this.wsServer = new WebSocket.Server({ server: this.httpServer });
 
-        this.wsServer.on('connection', function (socket) {
+        this.wsServer.on('connection', function (socket, req) {
+            // pass http headers to outside, easy get real ip via http headers
+            socket['headers'] = req.headers;
             // emit socket to outside
             self.emit('connection', socket);
         });
@@ -54,4 +56,4 @@ export class WSProcessor extends EventEmitter {
         this.wsServer = null;
         this.httpServer = null;
     }
}
```
