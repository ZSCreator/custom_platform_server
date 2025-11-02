"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const JsonMgr = require("../../config/data/JsonMgr");
const RedisManager = require("../../app/common/dao/redis/lib/redisManager");
const playerManager = require("../../app/common/dao/PlayerInfoManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const RoleEnum_1 = require("../../app/common/constant/player/RoleEnum");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
const playerInfoTableName = 'player_info';
const userInfoTableName = 'user_info';
async function clearRobot() {
    try {
        await JsonMgr.init();
        const allRobotPlayer = await playerManager.findPlayerList({ isRobot: RoleEnum_1.RoleEnum.ROBOT }, player => player.isRobot === RoleEnum_1.RoleEnum.ROBOT, 'uid');
        const allUid = allRobotPlayer.map(player => {
            return player.uid;
        });
        const allPlayerKeys = allRobotPlayer.map(player => {
            return 'robot_' + playerInfoTableName + ':' + player.uid;
        });
        let delCnt = await RedisManager.deleteKeyFromRedis(allPlayerKeys);
        console.log('0000000000 删除所有机器人缓存 player:', delCnt);
        const allUserKeys = allRobotPlayer.map(player => {
            return userInfoTableName + ':' + player.uid;
        });
        delCnt = await RedisManager.deleteKeyFromRedis(allUserKeys);
        console.log('111111111 删除所有机器人缓存 user:', delCnt);
        const robotRelatedKeys = await RedisManager.getKeysSatisfyPattern("robot:*");
        delCnt = await RedisManager.deleteKeyFromRedis(robotRelatedKeys);
        console.log('222222222 删除所有机器人相关的缓存:', delCnt);
        let playerDao = MongoManager.player_info;
        await playerDao.remove({ uid: { $in: allUid } });
        console.log('3333333 删除所有机器人 player 数据库');
        let userDao = MongoManager.user_info;
        await userDao.remove({ uid: { $in: allUid } });
        console.log('444444444 删除所有机器人 user 数据库');
        console.log("clear all ok!!!!");
    }
    catch (e) {
        console.log(e);
    }
}
clearRobot();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQWxsUm9ib3RSZWxhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvc3lzdGVtL3JlbW92ZUFsbFJvYm90UmVsYXRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2Isc0VBQXVFO0FBRXZFLHFEQUFzRDtBQUV0RCw0RUFBNkU7QUFDN0Usd0VBQXlFO0FBQ3pFLDhFQUErRTtBQUMvRSx3RUFBcUU7QUFDckUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFdEQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUM7QUFDMUMsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUM7QUFFdEMsS0FBSyxVQUFVLFVBQVU7SUFDckIsSUFBSTtRQUNBLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0sY0FBYyxHQUFHLE1BQU0sYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQkFBUSxDQUFDLEtBQUssRUFBRSxFQUNqRixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEQsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzlDLE9BQU8sUUFBUSxHQUFHLG1CQUFtQixHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwRCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVDLE9BQU8saUJBQWlCLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVqRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUUxQyxJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBRTFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNuQztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNqQjtBQUNMLENBQUM7QUFFRCxVQUFVLEVBQUUsQ0FBQyJ9