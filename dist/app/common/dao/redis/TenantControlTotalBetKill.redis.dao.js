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
        await connection.hset(RedisDict_1.DB1.TenantTotalBetKill, tenantId, JSON.stringify(data));
        return true;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 插入租户打码必杀调控信息出错 | ${tenantId} ${JSON.stringify(data)} | ${e.stack}`);
        return false;
    }
}
exports.saveOneByTenantId = saveOneByTenantId;
async function findOneByTenantId(tenantId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        return JSON.parse(await connection.hget(RedisDict_1.DB1.TenantTotalBetKill, tenantId));
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 获取租户打码必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}
exports.findOneByTenantId = findOneByTenantId;
async function removeOne(tenantId) {
    try {
        const connection = await (0, redisConnection_1.default)();
        return connection.hdel(RedisDict_1.DB1.TenantTotalBetKill, tenantId);
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 删除租户押注必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}
exports.removeOne = removeOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbFRvdGFsQmV0S2lsbC5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9UZW5hbnRDb250cm9sVG90YWxCZXRLaWxsLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBOEI7QUFDOUIsK0NBQXlDO0FBQ3pDLDJEQUFtRDtBQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRW5ELHdEQUErQztBQVF4QyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsUUFBZ0IsRUFBRSxJQUFTO0lBQy9ELElBQUk7UUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFHLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RSxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JILE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQVZELDhDQVVDO0FBT00sS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQWdCO0lBQ3BELElBQUk7UUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBRyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDOUU7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSw2QkFBNkIsUUFBUSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBVEQsOENBU0M7QUFNTSxLQUFLLFVBQVUsU0FBUyxDQUFDLFFBQWdCO0lBQzVDLElBQUk7UUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBQzFDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFHLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDNUQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSw2QkFBNkIsUUFBUSxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBUkQsOEJBUUMifQ==