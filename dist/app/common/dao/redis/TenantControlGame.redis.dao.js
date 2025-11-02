"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOne = exports.findOneBySceneInfo = exports.saveOneBySceneInfo = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const redisConnection_1 = require("./lib/redisConnection");
const RedisDict_1 = require("../../constant/RedisDict");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function convertKey(tenantId, nid, sceneId) {
    return `${RedisDict_1.DB1.TenantGame}:${tenantId}:${nid}:${sceneId}`;
}
async function saveOneBySceneInfo(tenantId, nid, sceneId, probability) {
    try {
        const connection = await (0, redisConnection_1.default)();
        await connection.set(convertKey(tenantId, nid, sceneId), probability);
        return true;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 插入租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return false;
    }
}
exports.saveOneBySceneInfo = saveOneBySceneInfo;
async function findOneBySceneInfo(tenantId, nid, sceneId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        const result = await connection.get(convertKey(tenantId, nid, sceneId));
        if (result !== null) {
            return parseInt(result);
        }
        return null;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 获取租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return null;
    }
}
exports.findOneBySceneInfo = findOneBySceneInfo;
async function removeOne(tenantId, nid, sceneId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        return connection.del(convertKey(tenantId, nid, sceneId));
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 删除租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return null;
    }
}
exports.removeOne = removeOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEdhbWUucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvVGVuYW50Q29udHJvbEdhbWUucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE4QjtBQUM5QiwrQ0FBeUM7QUFDekMsMkRBQW1EO0FBQ25ELHdEQUErQztBQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBUW5ELFNBQVMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsR0FBVyxFQUFFLE9BQWU7SUFDOUQsT0FBTyxHQUFHLGVBQUcsQ0FBQyxVQUFVLElBQUksUUFBUSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM3RCxDQUFDO0FBVU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLFFBQWdCLEVBQUUsR0FBVyxFQUFFLE9BQWUsRUFBRSxXQUFtQjtJQUN4RyxJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQztRQUMxQyxNQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEUsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLDZCQUE2QixRQUFRLE1BQU0sR0FBRyxNQUFNLE9BQU8sTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuSCxPQUFPLEtBQUssQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFURCxnREFTQztBQVVNLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLEdBQVcsRUFBRSxPQUFlO0lBQ25GLElBQUk7UUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXhFLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUNqQixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSw2QkFBNkIsUUFBUSxNQUFNLEdBQUcsTUFBTSxPQUFPLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkgsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7QUFmRCxnREFlQztBQVFNLEtBQUssVUFBVSxTQUFTLENBQUMsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBZTtJQUMxRSxJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQztRQUMxQyxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUM3RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLDZCQUE2QixRQUFRLE1BQU0sR0FBRyxNQUFNLE9BQU8sTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuSCxPQUFPLElBQUksQ0FBQztLQUNmO0FBQ0wsQ0FBQztBQVJELDhCQVFDIn0=