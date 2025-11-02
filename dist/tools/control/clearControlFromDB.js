"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const GameNidEnum_1 = require("../../app/common/constant/game/GameNidEnum");
const redisManager_1 = require("../../app/common/dao/redis/lib/redisManager");
const mongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const personal = mongoManager.personal_control;
const scene = mongoManager.scene_control;
clear(GameNidEnum_1.GameNidEnum.dzpipei).then(res => process.exit());
async function clear(nid) {
    await initDB();
    if (!nid) {
        const keys = await redisManager_1.getKeysSatisfyPattern('control:*');
        await redisManager_1.deleteKeyFromRedis(keys);
        await scene.remove({});
        await personal.remove({});
        return;
    }
    else {
        const sceneKeys = await redisManager_1.getKeysSatisfyPattern(`control:scene_control:${nid}`);
        const personalKeys = await redisManager_1.getKeysSatisfyPattern(`control:personal_control:${nid}`);
        await redisManager_1.deleteKeyFromRedis(sceneKeys);
        await redisManager_1.deleteKeyFromRedis(personalKeys);
        await scene.remove({ nid });
        await personal.remove({ nid });
    }
    console.warn('删除完成');
}
async function initDB() {
    return DatabaseService.initConnection({
        "host": dbMongo.production.host,
        "port": dbMongo.production.port,
        "user": dbMongo.production.user,
        "pwd": dbMongo.production.pwd,
        "name": dbMongo.production.name,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJDb250cm9sRnJvbURCLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvY29udHJvbC9jbGVhckNvbnRyb2xGcm9tREIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzRUFBdUU7QUFDdkUsNEVBQXVFO0FBQ3ZFLDhFQUFzRztBQUN0Ryw4RUFBOEU7QUFFOUUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDO0FBQy9DLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUM7QUFFekMsS0FBSyxDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFNdkQsS0FBSyxVQUFVLEtBQUssQ0FBQyxHQUFpQjtJQUNsQyxNQUFNLE1BQU0sRUFBRSxDQUFDO0lBRWYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLE1BQU0sSUFBSSxHQUFHLE1BQU0sb0NBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFHdEQsTUFBTSxpQ0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvQixNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRzFCLE9BQVE7S0FDWDtTQUFPO1FBQ0osTUFBTSxTQUFTLEdBQUcsTUFBTSxvQ0FBcUIsQ0FBQyx5QkFBeUIsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM5RSxNQUFNLFlBQVksR0FBRyxNQUFNLG9DQUFxQixDQUFDLDRCQUE0QixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXBGLE1BQU0saUNBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsTUFBTSxpQ0FBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV2QyxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7S0FDaEM7SUFHRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFHRCxLQUFLLFVBQVUsTUFBTTtJQUNqQixPQUFPLGVBQWUsQ0FBQyxjQUFjLENBQUM7UUFDbEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtRQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1FBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7UUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztRQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0tBQ2xDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==