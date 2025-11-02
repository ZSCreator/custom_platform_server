'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const dbMongo = require('../config/db/mongo.json');
const redisManager = require("../app/dao/dbManager/redisManager");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    const PlayerInfo = MongoManager.getDao('player_info');
    const UserInfo = MongoManager.getDao('user_info');
    const allPlayers = await PlayerInfo.find({ isRobot: 2 }, 'isRobot uid nickname');
    console.log('机器人数量:', allPlayers.length);
    for (let m of allPlayers) {
        await PlayerInfo.remove({ uid: m.uid });
        await UserInfo.remove({ uid: m.uid });
        console.log(m.uid);
    }
    const playerKeys = await redisManager.getKeysSatisfyPattern('robot_player_info:*');
    const userKeys = await redisManager.getKeysSatisfyPattern('user_info:*');
    await redisManager.deleteKeyFromRedis(playerKeys);
    console.log('清理robot player完成:', playerKeys.length);
    await redisManager.deleteKeyFromRedis(userKeys);
    console.log('清理user完成:', userKeys.length);
    const available_robot_set = await redisManager.getKeysSatisfyPattern('robot:available_robot_set');
    await redisManager.deleteKeyFromRedis(available_robot_set);
    console.log('清理available_robot_set完成:', available_robot_set.length);
    console.log('删除机器人完成');
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUm9ib3RfYm9iaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL3JlbW92ZVJvYm90X2JvYmkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1FQUFvRTtBQUdwRSxrRUFBbUU7QUFJbkUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDbkQsa0VBQW1FO0FBRW5FLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVsRCxNQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsS0FBSyxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUU7UUFDdEIsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN0QjtJQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDbkYsTUFBTSxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekUsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEQsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTFDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxZQUFZLENBQUMscUJBQXFCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNsRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==