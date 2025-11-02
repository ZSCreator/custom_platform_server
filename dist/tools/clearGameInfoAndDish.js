'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const RedisManager = require("../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function clean() {
    console.log("获取大厅数据redise-key.....");
    let keys = await RedisManager.getKeysSatisfyPattern("hall:*");
    console.log("删除大厅数据redise-key.....");
    let delCnt = await RedisManager.deleteKeyFromRedis(keys);
    console.log("已清除redise-key.....", delCnt);
    let db = MongoManager.system_game;
    console.log("清除 system_game.....");
    await db.remove({});
    console.log("清除 system_room.....");
    let db1 = MongoManager.system_room;
    await db1.remove({});
    console.log("清除 system_scene.....");
    let db2 = MongoManager.system_scene;
    await db2.remove({});
    console.log("清除 dish_data.....");
    let db3 = MongoManager.dish_data;
    await db3.remove({});
    console.log("clear all ok!!!!");
}
setTimeout(clean, 3000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJHYW1lSW5mb0FuZERpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9jbGVhckdhbWVJbmZvQW5kRGlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxZQUFZLENBQUM7O0FBSWIsbUVBQW9FO0FBSXBFLHlFQUEwRTtBQUMxRSwyRUFBNEU7QUFJNUUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFbkQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLEtBQUs7SUFFaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3JDLElBQUksSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNyQyxJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDbkMsSUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztJQUNuQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3BDLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7SUFDcEMsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqQyxJQUFJLEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDO0lBQ2pDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUEifQ==