'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const redisManager = require("../../app/common/dao/redis/lib/redisManager");
const dbMongo = require('../../config/db/mongo.json');
const PlayerManager = require("../../app/common/dao/PlayerInfoManager");
const UserManager = require("../../app/common/dao/UserInfoManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
const playerInfoTableName = 'player_info';
const userInfoTableName = 'user_info';
async function updateAndClear() {
    try {
        const realUidArr = await PlayerManager.updateAllBufferPlayerInstant();
        await UserManager.updateAllBufferUserInstant();
        const playerKeys = await redisManager.getKeysSatisfyPattern('*_player_info:*');
        const userKeys = await redisManager.getKeysSatisfyPattern('user_info:*');
        await redisManager.deleteKeyFromRedis(playerKeys);
        console.log('清理player完成:', playerKeys.length);
        await redisManager.deleteKeyFromRedis(userKeys);
        console.log('清理user完成:', userKeys.length);
        let playerDao = MongoManager.player_info;
        await playerDao.remove({});
        console.log('3333333 删除所有机器人 player 数据库');
        let userDao = MongoManager.user_info;
        await userDao.remove({});
        console.log('444444444 删除所有机器人 user 数据库');
    }
    catch (error) {
        console.log('000:', error);
    }
}
updateAndClear();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQW5kQ2xlYXJVc2VyUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvc3lzdGVtL3VwZGF0ZUFuZENsZWFyVXNlclBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBTWIsc0VBQXVFO0FBQ3ZFLDRFQUE2RTtBQUM3RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCx3RUFBeUU7QUFDekUsb0VBQXFFO0FBQ3JFLDhFQUErRTtBQUUvRSxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQztBQUMxQyxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQztBQUV0QyxLQUFLLFVBQVUsY0FBYztJQUN6QixJQUFJO1FBRUEsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztRQUV0RSxNQUFNLFdBQVcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0UsTUFBTSxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekUsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUxQyxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFFMUMsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztRQUNyQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzdDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUM3QjtBQUNMLENBQUM7QUFFRCxjQUFjLEVBQUUsQ0FBQyJ9