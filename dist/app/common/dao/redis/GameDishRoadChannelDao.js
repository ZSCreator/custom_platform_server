"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.insertOne = exports.exitsByChannelName = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const redisManager = require("./lib/redisManager");
const pinus_logger_1 = require("pinus-logger");
const pinus_1 = require("pinus");
const logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
const redisKey = RedisDict_1.DB1.GameDishRoadChannel;
async function exitsByChannelName(channelName, serverId = pinus_1.pinus.app.getServerId()) {
    try {
        if (!channelName) {
            logger.error(`Redis | key- ${redisKey}:${serverId} | 判断玩家是否在 redis 订阅消息通道"调用"出错 | 原因：传入 channelName 为 ${channelName}`);
        }
        return !!(await redisManager.isInSet(`${redisKey}:${serverId}`, channelName));
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey}:${serverId} | 判断玩家是否在 redis 订阅消息通道 出错 :${e.stack || e}`);
        return false;
    }
}
exports.exitsByChannelName = exitsByChannelName;
async function insertOne(channelName, serverId = pinus_1.pinus.app.getServerId()) {
    try {
        if (!channelName) {
            logger.error(`Redis | key- ${redisKey}:${serverId} | 新增玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 channelName 为 ${channelName}`);
        }
        await redisManager.storeInSet(`${redisKey}:${serverId}`, channelName);
        return true;
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey}:${serverId} | 新增玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
        return false;
    }
}
exports.insertOne = insertOne;
async function deleteAll(serverId) {
    try {
        await redisManager.deleteKeyFromRedis(`${redisKey}:${serverId}`);
        return true;
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey} | 删除所有 redis 订阅消息通道 出错 :  ${e.stack || e}`);
        return false;
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZURpc2hSb2FkQ2hhbm5lbERhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL0dhbWVEaXNoUm9hZENoYW5uZWxEYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLG1EQUFvRDtBQUNwRCwrQ0FBeUM7QUFDekMsaUNBQThCO0FBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbkQsTUFBTSxRQUFRLEdBQUcsZUFBRyxDQUFDLG1CQUFtQixDQUFDO0FBT2xDLEtBQUssVUFBVSxrQkFBa0IsQ0FDdEMsV0FBbUIsRUFDbkIsV0FBbUIsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7SUFFMUMsSUFBSTtRQUNGLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsTUFBTSxDQUFDLEtBQUssQ0FDVixnQkFBZ0IsUUFBUSxJQUFJLFFBQVEsdURBQXVELFdBQVcsRUFBRSxDQUFDLENBQUM7U0FDN0c7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsSUFBSSxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQy9FO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLENBQUMsS0FBSyxDQUNWLGdCQUFnQixRQUFRLElBQUksUUFBUSwrQkFBK0IsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBaEJELGdEQWdCQztBQU9NLEtBQUssVUFBVSxTQUFTLENBQUMsV0FBbUIsRUFBRSxXQUFtQixhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtJQUM3RixJQUFJO1FBQ0YsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixNQUFNLENBQUMsS0FBSyxDQUNWLGdCQUFnQixRQUFRLElBQUksUUFBUSxxREFBcUQsV0FBVyxFQUFFLENBQ3ZHLENBQUM7U0FDSDtRQUVELE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsSUFBSSxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV0RSxPQUFPLElBQUksQ0FBQztLQUNiO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixRQUFRLElBQUksUUFBUSw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBZkQsOEJBZUM7QUFLTSxLQUFLLFVBQVUsU0FBUyxDQUFDLFFBQWdCO0lBQzlDLElBQUk7UUFDRixNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLFFBQVEsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLFFBQVEsOEJBQThCLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuRixPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQztBQVJELDhCQVFDIn0=