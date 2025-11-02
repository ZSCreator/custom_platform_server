import { DB1 } from "../../constant/RedisDict";
import redisManager = require("./lib/redisManager");
import { getLogger } from "pinus-logger";
import { pinus } from "pinus";
const logger = getLogger("server_out", __filename);

const redisKey = DB1.GameDishRoadChannel;

/**
 * 判断指定服务器是否订阅对应的频道事件
 * @param channelName 频道名称
 * @param serverId    服务器ID
 */
export async function exitsByChannelName(
  channelName: string,
  serverId: string = pinus.app.getServerId()
) {
  try {
    if (!channelName) {
      logger.error(
        `Redis | key- ${redisKey}:${serverId} | 判断玩家是否在 redis 订阅消息通道"调用"出错 | 原因：传入 channelName 为 ${channelName}`);
    }

    return !!(await redisManager.isInSet(`${redisKey}:${serverId}`, channelName));
  } catch (e) {
    logger.error(
      `Redis | key- ${redisKey}:${serverId} | 判断玩家是否在 redis 订阅消息通道 出错 :${e.stack || e}`);
    return false;
  }
}

/**
 * 新增一个
 * @param channelName 频道名称
 * @param serverId    服务器ID
 */
export async function insertOne(channelName: string, serverId: string = pinus.app.getServerId()): Promise<boolean> {
  try {
    if (!channelName) {
      logger.error(
        `Redis | key- ${redisKey}:${serverId} | 新增玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 channelName 为 ${channelName}`
      );
    }

    await redisManager.storeInSet(`${redisKey}:${serverId}`, channelName);

    return true;
  } catch (e) {
    logger.error(`Redis | key- ${redisKey}:${serverId} | 新增玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
    return false;
  }
}

/**
 * 清除集合
 */
export async function deleteAll(serverId: string) {
  try {
    await redisManager.deleteKeyFromRedis(`${redisKey}:${serverId}`);
    return true;
  } catch (e) {
    logger.error(`Redis | key- ${redisKey} | 删除所有 redis 订阅消息通道 出错 :  ${e.stack || e}`);
    return false;
  }
}
