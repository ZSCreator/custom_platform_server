'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RedisManager = require("../../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dzpipeiConst = require("../../app/servers/DZpipei/lib/DZpipeiConst");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function clean() {
    console.log("获取 hall:* 数据 redis-key.....");
    let keys = await RedisManager.getKeysSatisfyPattern("hall:*");
    const systemConfigIndex = keys.indexOf('hall:system_config');
    keys.splice(systemConfigIndex, 1);
    console.log("删除 hall:* 数据 redis-key.....");
    let delCnt = await RedisManager.deleteKeyFromRedis(keys);
    console.log("已清除  hall:* .....", delCnt);
    console.log("获取 live:* 数据 redis-key.....");
    let liveKeys = await RedisManager.getKeysSatisfyPattern("live:*");
    console.log("删除 live:* 数据 redis-key.....");
    let delCntOfLiveKeys = await RedisManager.deleteKeyFromRedis(liveKeys);
    console.log("已清除 live:* .....", delCntOfLiveKeys);
    console.log(`获取 ${dzpipeiConst.PLAYER_HISTORY_RECORD}* 数据 redis-key.....`);
    let dzRecordKeys = await RedisManager.getKeysSatisfyPattern(`${dzpipeiConst.PLAYER_HISTORY_RECORD}*`);
    console.log(`删除 ${dzpipeiConst.PLAYER_HISTORY_RECORD}* 数据 redis-key.....`);
    let dzRecordKeysCount = await RedisManager.deleteKeyFromRedis(dzRecordKeys);
    console.log(`已清除 ${dzpipeiConst.PLAYER_HISTORY_RECORD}* .....`, dzRecordKeysCount);
    let db = MongoManager.system_game;
    console.log("清除 system_game.....");
    await db.remove({});
    console.log("清除 system_room.....");
    let db1 = MongoManager.system_room;
    await db.remove({});
    console.log("清除 system_scene.....");
    let db2 = MongoManager.system_scene;
    await db.remove({});
    console.log("clear all ok!!!!");
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJIYWxsTGl2ZUdhbWVTY2VuZVJvb21pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvc3lzdGVtL2NsZWFySGFsbExpdmVHYW1lU2NlbmVSb29taW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxZQUFZLENBQUM7O0FBRWIsc0VBQXVFO0FBQ3ZFLDRFQUE2RTtBQUM3RSw4RUFBK0U7QUFDL0UsMkVBQTRFO0FBQzVFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBRXRELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxLQUFLO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUMzQyxJQUFJLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUU3RCxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUMzQyxJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXpDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUMzQyxJQUFJLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDM0MsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIscUJBQXFCLENBQUMsQ0FBQztJQUMzRSxJQUFJLFlBQVksR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLFlBQVksQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLENBQUM7SUFDdEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIscUJBQXFCLENBQUMsQ0FBQztJQUMzRSxJQUFJLGlCQUFpQixHQUFHLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxZQUFZLENBQUMscUJBQXFCLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBR25GLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDbkMsSUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztJQUNuQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3BDLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7SUFDcEMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9