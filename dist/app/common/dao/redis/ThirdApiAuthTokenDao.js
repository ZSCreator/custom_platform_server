"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOne = exports.findOne = exports.insert = exports.exits = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const databaseService = require("../../../services/databaseService");
const pinus_logger_1 = require("pinus-logger");
const redisManager_1 = require("./lib/redisManager");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function getRDSClient() {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        return null;
    }
    return redisClient;
}
async function exits(token) {
    return await (0, redisManager_1.exists)(`${RedisDict_1.DB1.thirdApiAuthToken}:${token}`);
}
exports.exits = exits;
async function insert(token, data, seconds = 180) {
    try {
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }
        await client.setex(`${RedisDict_1.DB1.thirdApiAuthToken}:${token}`, seconds, JSON.stringify(data));
        return true;
    }
    catch (e) {
        logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}
exports.insert = insert;
async function findOne(token) {
    try {
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }
        const res = await client.get(`${RedisDict_1.DB1.thirdApiAuthToken}:${token}`);
        return res ? JSON.parse(res) : false;
    }
    catch (e) {
        logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}
exports.findOne = findOne;
async function deleteOne(token) {
    try {
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }
        await client.del(`${RedisDict_1.DB1.thirdApiAuthToken}:${token}`);
        return true;
    }
    catch (e) {
        logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}
exports.deleteOne = deleteOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRBcGlBdXRoVG9rZW5EYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9UaGlyZEFwaUF1dGhUb2tlbkRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBK0M7QUFDL0MscUVBQXFFO0FBQ3JFLCtDQUF5QztBQUN6QyxxREFBMEM7QUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCxLQUFLLFVBQVUsWUFBWTtJQUN2QixNQUFNLFdBQVcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUUzRCxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2QsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFFTSxLQUFLLFVBQVUsS0FBSyxDQUFDLEtBQWE7SUFFckMsT0FBTyxNQUFNLElBQUEscUJBQU0sRUFBQyxHQUFHLGVBQUcsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFIRCxzQkFHQztBQUVNLEtBQUssVUFBVSxNQUFNLENBQUMsS0FBYSxFQUFFLElBQVMsRUFBRSxVQUFrQixHQUFHO0lBQ3hFLElBQUk7UUFFQSxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBRyxDQUFDLGlCQUFpQixJQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdkYsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekUsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBaEJELHdCQWdCQztBQUVNLEtBQUssVUFBVSxPQUFPLENBQUMsS0FBYTtJQUN2QyxJQUFJO1FBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDeEM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWZELDBCQWVDO0FBRU0sS0FBSyxVQUFVLFNBQVMsQ0FBQyxLQUFhO0lBQ3pDLElBQUk7UUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLGlCQUFpQixJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFdEQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUUsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBZkQsOEJBZUMifQ==