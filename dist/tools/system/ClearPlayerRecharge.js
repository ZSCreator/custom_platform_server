'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const redisManager = require("../../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const playerTableName = 'player_info';
const playerDao = MongoManager.player_info;
const justRealPlayer = true;
const onceFindNumber = 100;
async function clean() {
    try {
        await DatabaseService.initConnection({
            "host": dbMongo.production.host,
            "port": dbMongo.production.port,
            "user": dbMongo.production.user,
            "pwd": dbMongo.production.pwd,
            "name": dbMongo.production.name,
        });
        console.log("-------user_info------ start");
        await clearPatternKey('user_*');
        console.log("-------user_info------ end");
        console.log("-------user_info------ start");
        await clearPatternKey('real_player_*');
        console.log("-------user_info------ end");
        console.log('#############修改玩家数据###############');
        await modifyPlayerInfo();
        console.log('#############修改玩家数据###############');
        console.log('#############删除mongo数据###############');
        await clearDatabase(['pay_info', 'pay_order']);
        console.log('#############删除mongo数据###############');
    }
    catch (err) {
        console.log(err);
    }
}
async function clearPatternKey(pattern) {
    let keys = await redisManager.getKeysSatisfyPattern(pattern);
    console.log("开始删除user_info缓存条数 : " + keys.length);
    console.log(keys);
    await redisManager.deleteKeyFromRedis(keys);
    console.log("完成删除user_info缓存:");
    let finishUser = await redisManager.getKeysSatisfyPattern(pattern);
    console.log("查询user_info:\n" + finishUser);
}
async function modifyPlayerInfo() {
    let findTimes = 1;
    while (true) {
        console.log(`---------${findTimes}-------- start`);
        let players = await findPlayer();
        console.log(`查询到位修改的玩家数:${players.length}`);
        if (!players || players.length == 0) {
            console.log(`-----完成修改玩家数据------`);
            break;
        }
        let count = 0;
        for (let player of players) {
            try {
                player.walletGold = 0;
                player.gold = 0;
                player.clear = 1;
                await updatePlayer(player);
                count++;
            }
            catch (e) {
                console.error(`修改玩家:${player.uid} 异常 e : ${e.stack | e}`);
                player.clear = -1;
                await updatePlayer(player);
            }
        }
        console.log(`修改:${players.length}个玩家执行完成，成功：${count} 失败：${players.length - count}`);
        console.log(`---------${findTimes}-------- end`);
        findTimes++;
    }
}
async function findPlayer() {
    if (justRealPlayer) {
        return await playerDao.find({
            $and: [{ isRobot: 0 }, {
                    $or: [{
                            gold: 0
                        }, { walletGold: { $ne: 0 } }]
                }]
        }).limit(onceFindNumber);
    }
    return await playerDao.find({
        $or: [{
                gold: 0
            }, { walletGold: { $ne: 0 } }]
    }).limit(onceFindNumber);
}
async function updatePlayer(player) {
    await playerDao.updateOne({ uid: player.uid }, player);
}
async function clearDatabase(allTablesName) {
    try {
        let tableDao;
        for (let tableName of allTablesName) {
            console.log(`----------${tableName}----------- start`);
            tableDao = MongoManager[tableName];
            if (tableDao) {
                await tableDao.remove();
            }
            console.log(`----------${tableName}----------- end`);
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
}
clean();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJQbGF5ZXJSZWNoYXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9DbGVhclBsYXllclJlY2hhcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFNYixzRUFBdUU7QUFDdkUsNEVBQTZFO0FBQzdFLDhFQUErRTtBQUUvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUV0RCxNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUM7QUFDdEMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUMzQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBRTNCLEtBQUssVUFBVSxLQUFLO0lBQ2hCLElBQUk7UUFDQSxNQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUM7WUFDakMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtZQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztZQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1NBQ2xDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1QyxNQUFNLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMs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