"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteOneByUid = exports.insertOne = exports.exitsByUid = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const redisManager = require("./lib/redisManager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const redisKey = RedisDict_1.DB1.GameDishRoadChannel;
async function exitsByUid(uid, nid) {
    try {
        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 判断玩家是否在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }
        return !!await redisManager.isInSet(`${redisKey}:${nid}`, uid);
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 判断玩家是否在 redis 订阅消息通道 出错 :${e.stack || e}`);
        return false;
    }
}
exports.exitsByUid = exitsByUid;
async function insertOne(uid, nid) {
    try {
        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 新增玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }
        await redisManager.storeInSet(`${redisKey}:${nid}`, uid);
        return true;
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 新增玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
        return false;
    }
}
exports.insertOne = insertOne;
async function deleteOneByUid(uid, nid) {
    try {
        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 删除玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }
        await redisManager.removeFromSet(`${redisKey}:${nid}`, uid);
        return true;
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 删除玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
        return false;
    }
}
exports.deleteOneByUid = deleteOneByUid;
async function deleteAll(nid) {
    try {
        await redisManager.deleteKeyFromRedis(`${redisKey}:${nid}`);
        return true;
    }
    catch (e) {
        logger.error(`Redis | key- ${redisKey} | 删除所有 redis 订阅消息通道 出错 :  ${e.stack || e}`);
        return false;
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZURpc2hSb2FkRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvR2FtZURpc2hSb2FkRGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUMvQyxtREFBb0Q7QUFDcEQsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbkQsTUFBTSxRQUFRLEdBQUcsZUFBRyxDQUFDLG1CQUFtQixDQUFDO0FBTWxDLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDckQsSUFBSTtRQUVBLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixRQUFRLElBQUksR0FBRywrQ0FBK0MsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNyRztRQUVELE9BQU8sQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNsRTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsUUFBUSxJQUFJLEdBQUcsK0JBQStCLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRixPQUFPLEtBQUssQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFaRCxnQ0FZQztBQU1NLEtBQUssVUFBVSxTQUFTLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDcEQsSUFBSTtRQUNBLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixRQUFRLElBQUksR0FBRyw2Q0FBNkMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNuRztRQUVELE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV6RCxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixRQUFRLElBQUksR0FBRyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hGLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWJELDhCQWFDO0FBTU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUN6RCxJQUFJO1FBQ0EsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLFFBQVEsSUFBSSxHQUFHLDZDQUE2QyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ25HO1FBRUQsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsUUFBUSxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLFFBQVEsSUFBSSxHQUFHLDRCQUE0QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEYsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBYkQsd0NBYUM7QUFLTSxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQVc7SUFDdkMsSUFBSTtRQUNBLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsUUFBUSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDNUQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsUUFBUSw4QkFBOEIsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQVJELDhCQVFDIn0=