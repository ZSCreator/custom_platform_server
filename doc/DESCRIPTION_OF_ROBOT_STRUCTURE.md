# 游戏机器人实现文档

## 概要设计

```text
    由于游戏服务器基于pinus的分布式/集群架构的框架上开发的，每一个游戏都是独立进程。
线上生产环境中由于会对单独的某个游戏进行重启，为了避免对其他游戏进程的影响，将机器人
服务设计为挂载到相应的游戏进程中（也就是各游戏各自管理自己的机器人的启动和监控）。
```

## 代码实现

### 1.启动入口

#### 启动代码示例

```typescript
import * as robotServerController from '../app/services/robotService/overallController/robotServerController';
const nid = 1;
robotServerController.start_robot_server(nid);
```

#### 启动代码说明

```text
启动时需要引入 robotServerController.ts,接口中的 start_robot_server(nid) 方法是启动相应nid（游戏id）的入口。
```

### 2.机器人配置

#### 机器人配置代码示例

```typescript
 //获取机器人基础配置
 let robotConfig = JsonConfig.get_robotStatus(nid);
```

#### 机器人配置说明

```text
获取<project/dis/config/data/robot/robotConfig.json>的机器人启动配置

```

#### 机器人配置格式

```json
[
    {
         "nid": "5",
         "open": true,
         "number": 12,
         "fenscene": [0,1,2,3],
         "name":"三国杀"
    }
]
```

### 3.机器人定义

#### 机器人类结构定义

```text
app/domain/hall/Robot.ts
  `- app/domain/robot/robotEnterBase.ts
    `- app/services/robotService/*/robot.ts
    `- app/services/robotService/robot/*Robot.ts
```

#### 机器人类说明

```text
 Robot.ts:
 定义机器人的基类，封装基于websocket协议的消息通讯。管理机器人的网络连接
 robotEnterBase.ts:
 定义机器人的进入游戏、进入房间、退出游戏、退出房间
 app/services/robotService/robot/*Robot.ts:
 定义机器人的游戏行为逻辑
```

### 4.机器人控制

#### 机器人类调用

```text
app/services/robotService/<Game>/robotEnter<Game>:
  * 注册添加机器人事件
  * 机器人调度定时任务
app/services/robotService/<Game>/@*SingleRobotEnter:
  * 添加单个机器人到-->大厅--携带金币调整>进入游戏、场、房间-->监听通知-->添加到机器人集合。
```

#### 机器人类基本功能说明

```text
 Robot.ts:
 定义机器人的基类，封装基于websocket协议的消息通讯。管理机器人的网络连接
 robotEnterBase.ts:
 定义机器人的进入游戏、进入房间、退出游戏、退出房间
 app/services/robotService/robot/*Robot.ts:
 定义机器人的游戏行为逻辑
```

### 4.机器人web后台

```text
├── 机器人配置
│   ├── 扎金花配置                <需要前段配合修改>暂时无法使用
│   ├── 比牌牛牛配置              <需要前段配合修改>暂时无法使用
│   └── 德州扑克配置              <需要前段配合修改>暂时无法使用
└── 高级功能
    └── 机器人设置                所有游戏的机器人数量统计和调控
```

### 新服初始化机器人

```bash
# 添加机器人（4000个）
node dist/tools/robot/addRobot.js
# 修改机器人头像 使用微信头像(后台有开关)
node dist/tools/robot/changeRobotHeadImg.js
# 修改机器人头像 使用本地头像
node dist/tools/robot/changeRobotHeadImgLocal.js
```
