"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const PlayerManager = require("../../app/dao/domainManager/hall/playerManager");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const PlayerInfo = MongoManager.getDao('player_info');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始执行');
    await DatabaseService.getRedisClient();
    let lockRef;
    try {
        const players = await PlayerInfo.find({ isRobot: 0 }, 'uid isRobot');
        let guaranteedToGame1 = {
            caipiao: 0,
            puker: 0,
            dianwan: 0,
            zhenren: 0,
            buyu: 0,
            liuhecai: 0,
        };
        let num = 0;
        for (let item of players) {
            console.log("uid", item.uid, num);
            const { player, lock } = await PlayerManager.getPlayer({ uid: item.uid, isRobot: item.isRobot }, true);
            lockRef = lock;
            let guaranteedToGame = player.guaranteedToGame ? player.guaranteedToGame : guaranteedToGame1;
            guaranteedToGame['liuhecai'] = 0;
            player.guaranteedToGame = guaranteedToGame;
            await PlayerManager.updateOnePlayer(player, ['guaranteedToGame'], lock);
            num++;
        }
        console.log('开始结束');
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log('updatePlayerLHC==>', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUGxheWVyTEhDLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdGhpcmRUb29scy91cGRhdGVQbGF5ZXJMSEMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFFdkUsZ0ZBQWlGO0FBQ2pGLHFFQUFzRTtBQUN0RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUNyRSxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJO1FBQ0EsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3JFLElBQUksaUJBQWlCLEdBQUc7WUFDcEIsT0FBTyxFQUFFLENBQUM7WUFDVixLQUFLLEVBQUUsQ0FBQztZQUNSLE9BQU8sRUFBRSxDQUFDO1lBQ1YsT0FBTyxFQUFFLENBQUM7WUFDVixJQUFJLEVBQUUsQ0FBQztZQUNQLFFBQVEsRUFBRSxDQUFDO1NBQ2QsQ0FBQTtRQUNELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZHLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDZixJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztZQUM3RixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1lBQzNDLE1BQU0sYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hFLEdBQUcsRUFBRSxDQUFDO1NBQ1Q7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFFWixPQUFPLElBQUksTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDNUM7QUFFTCxDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==