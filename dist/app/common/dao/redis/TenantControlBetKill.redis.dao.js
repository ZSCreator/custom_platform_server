"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOne = exports.findOneByTenantId = exports.saveOneByTenantId = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const redisConnection_1 = require("./lib/redisConnection");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const RedisDict_1 = require("../../constant/RedisDict");
async function saveOneByTenantId(tenantId, data) {
    try {
        const connection = await (0, redisConnection_1.default)();
        await connection.hset(RedisDict_1.DB1.TenantBetKill, tenantId, JSON.stringify(data));
        return true;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 插入租户押注必杀调控信息出错 | ${tenantId} ${JSON.stringify(data)} | ${e.stack}`);
        return false;
    }
}
exports.saveOneByTenantId = saveOneByTenantId;
async function findOneByTenantId(tenantId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        return JSON.parse(await connection.hget(RedisDict_1.DB1.TenantBetKill, tenantId));
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 获取租户押注必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}
exports.findOneByTenantId = findOneByTenantId;
async function removeOne(tenantId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        return connection.hdel(RedisDict_1.DB1.TenantBetKill, tenantId);
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 删除租户押注必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}
exports.removeOne = removeOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEJldEtpbGwucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvVGVuYW50Q29udHJvbEJldEtpbGwucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE4QjtBQUM5QiwrQ0FBeUM7QUFDekMsMkRBQW1EO0FBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbkQsd0RBQStDO0FBT3hDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLElBQVM7SUFDL0QsSUFBSTtRQUNBLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSx5QkFBYyxHQUFFLENBQUM7UUFFMUMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQUcsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JILE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQVZELDhDQVVDO0FBT00sS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQWdCO0lBQ3BELElBQUk7UUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ3pFO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLFFBQVEsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM3RixPQUFPLElBQUksQ0FBQztLQUNmO0FBQ0wsQ0FBQztBQVRELDhDQVNDO0FBTU0sS0FBSyxVQUFVLFNBQVMsQ0FBQyxRQUFnQjtJQUM1QyxJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQztRQUMxQyxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLDZCQUE2QixRQUFRLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDN0YsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7QUFSRCw4QkFRQyJ9