## 调控方案
    
- [方案一](#planOne)
- [方案二](#planTwo)

### 描述
由于需求变动, 在原来的调控基础上（方案一）新增以奖池为基础调控条件的调控方案二。      
游戏内部判断当前游戏使用哪种调控方案:
```ts
import * as ControlRPCService from 'app/services/rpc/controlRPCService';

// 获取调控状态
const controlInfo = await ControlRPCService.getControlState({nid});

// 如果返回的state为调控方案二 
if (controlInfo.state === 1) 
{
    ...   
} 
else if (controlInfo.state === 2) 
{
    ...
}
```

- - -

### 方案一
#### 描述（不想写）
```ts
// 引用调控方案一
import putAwardService = require('app/services/putAwardService');

// 获取结果调控模型以及调控结果 lotteryMethod 为开奖结果的方法 len为开几次
const {allResult, currM} = await putAwardService.setAllResult({nid}, lotteryMethod, len);

// 把结果从小到大进行一次排序
allResult.sort((x, y) => x - y);

// 最后把排序后的结果传入进去得到最终结果
const result = await putAwardService.getResult({nid}, allResult, currM);

```
- - -
### 方案二
- - -
#### 描述
针对棋牌对战、百人、电玩街机三种类型的游戏具体分为两种精控规则   
统一规则房间全是机器人不调控
1.以系统胜率为基准 作用游戏类型（百人、电玩街机）
     
> 获取当前系统胜率(百分比)，    
> 若系统胜率为正数，则先按胜率算出系统是否获胜，否则随机出结果								
> 若系统胜率为负数，则先按胜率的绝对值算出玩家是否获胜，否则随机出结果   

eg:     
```ts
        // 龙虎斗调控
        // 判断玩家是否跟系统对压
        const gambling = this.players.length === 1 && this.players[0].isRobot === 0;
        const cf = gambling ? {
            nid: this.nid, sceneId: this.sceneId, gambling,
            player: utils.filterProperty(this.players[0])
        } : { nid: this.nid, sceneId: this.sceneId, gambling };

        // 获取当前调控方案以及系统胜率
        const controlInfo = await getSystemWinRate(cf);

        let result;
        // 调控方案为2且房间里有真人
        if (controlInfo.state === 2 && this.players.find(p => p.isRobot === 0)) {
            let bet = 0;
            this.players.forEach(player =>  {
                if (player.isRobot === filterType) {
                    bet += player.totalBet
                }
            });
            // 获取结果 参数一为系统胜率 参数二为系统必胜方法 参数三为系统必输方法 参数四为随机开奖
            // 如果 
            result = utils.getControlResult(controlInfo.systemWinRate,
                DragonTigerService.getWinORLossResult(this.players, betDetail, filterType, bet, true),
                DragonTigerService.getWinORLossResult(this.players, betDetail, filterType, bet, false),
                DragonTigerService.getRandomLotteryResult(betDetail));

        } else {
            // 走以前调控逻辑
            ......
        }

```
2.以玩家胜率为基准 作用游戏类型（棋牌对战）
    
> 获取当局真实玩家的胜率(如果房间内全是机器人则不进行调控)     
> 如果真实玩家胜利则从最大的牌开始取，反之则从最小牌开始取。
> 如果有多个真实玩家算出来都赢则从胜率的降序依次取最大的牌，反之则以升> 序依次取最小的牌
> 机器人则从剩下的牌随机取           

eg:
```ts
            // 三公调控
            // 获取参与的真实玩家胜率
            const controlInfo = await getPlayerWinRate({
                nid: this.nid, sceneId: this.sceneId,
                players: gamePlayers.map(player => utils.filterProperty(player))
            });
            
            // 如果调控方案为一 或者没有真实玩家则走原来调控发牌逻辑
            if (controlInfo.state === 1 || !controlInfo.players || controlInfo.players.length === 0) {
                ......
                // 走以前调控逻辑
            } else {
                let realPlayers: string[] = [], lossRealPlayers: any[] = [];
                // 逆序排序
                controlInfo.players.sort((x, y) => y.winRate - x.winRate);
                // 先给真实且胜利的玩家发最大的牌型 失败的玩家进入败者组
                controlInfo.players.forEach(realPlayer => {
                    realPlayers.push(realPlayer.uid);
                    // 如果赢从头部取大牌 输则进败者组
                    if (realPlayer.winRate > Math.random()) {
                        const handCards = this.cards.shift();
                        const player = gamePlayers.find(p => p.uid === realPlayer.uid);
                        player.licensing(handCards.cards, handCards.cardType);
                    } else {
                        lossRealPlayers.push(realPlayer);
                    }
                });
    
                // 然后给机器人发牌 机器人从剩余的牌的开始取
                gamePlayers.filter(player => !realPlayers.includes(player.uid))
                    .sort(r_p => 0.5 - Math.random())
                    .forEach(robotPlayer => {
                        const handCards = this.cards.shift();
                        robotPlayer.licensing(handCards.cards, handCards.cardType);
                });
    
                // 败者组开始取牌
                lossRealPlayers.forEach(lossPlayer => {
                    const handCards = this.cards.shift();
                    const player = gamePlayers.find(p => p.uid === lossPlayer.uid);
                    player.licensing(handCards.cards, handCards.cardType);
                });
            }
```