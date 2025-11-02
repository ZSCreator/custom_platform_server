import { DB1 } from '../../constant/RedisDict';
import redisManager = require('./lib/redisManager');
import { getLogger } from 'pinus-logger';
const logger = getLogger('server_out', __filename);

const redisKey = DB1.GameDishRoadChannel;

/**
 * 判断玩家是否在 redis 订阅消息通道
 * @param uid 玩家编号
 */
export async function exitsByUid(uid: string, nid: string): Promise<boolean> {
    try {

        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 判断玩家是否在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }

        return !!await redisManager.isInSet(`${redisKey}:${nid}`, uid);
    } catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 判断玩家是否在 redis 订阅消息通道 出错 :${e.stack || e}`);
        return false;
    }
}

/**
 * 新增一个
 * @param uid 玩家编号
 */
export async function insertOne(uid: string, nid: string): Promise<boolean> {
    try {
        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 新增玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }

        await redisManager.storeInSet(`${redisKey}:${nid}`, uid);

        return true;
    } catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 新增玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
        return false;
    }
}

/**
 * 删除指定
 * @param uid 玩家编号
 */
export async function deleteOneByUid(uid: string, nid: string) {
    try {
        if (!uid) {
            logger.error(`Redis | key- ${redisKey}:${nid} | 删除玩家在 redis 订阅消息通道"调用"出错 | 原因：传入 uid 为 ${uid}`);
        }

        await redisManager.removeFromSet(`${redisKey}:${nid}`, uid);

        return true;
    } catch (e) {
        logger.error(`Redis | key- ${redisKey}:${nid} | 删除玩家在 redis 订阅消息通道 出错:${e.stack || e}`);
        return false;
    }
}

/**
 * 清除集合
 */
export async function deleteAll(nid: string) {
    try {
        await redisManager.deleteKeyFromRedis(`${redisKey}:${nid}`);
        return true;
    } catch (e) {
        logger.error(`Redis | key- ${redisKey} | 删除所有 redis 订阅消息通道 出错 :  ${e.stack || e}`);
        return false;
    }
}
