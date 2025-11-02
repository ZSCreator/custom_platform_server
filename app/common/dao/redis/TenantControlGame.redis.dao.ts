import { pinus } from "pinus";
import { getLogger } from 'pinus-logger';
import getRedisClinet from "./lib/redisConnection";
import { DB1 } from "../../constant/RedisDict";
const logger = getLogger('server_out', __filename);

/**
 * 转换db key
 * @param tenantId 租户id 
 * @param nid 游戏id
 * @param sceneId 场id
 */
function convertKey(tenantId: string, nid: string, sceneId: number) {
    return `${DB1.TenantGame}:${tenantId}:${nid}:${sceneId}`;
}


/**
 * 插入一条数据
 * @param tenantId 租户id
 * @param nid 游戏
 * @param sceneId 场id
 * @param probability 调控概率
 */
export async function saveOneBySceneInfo(tenantId: string, nid: string, sceneId: number, probability: number): Promise<boolean> {
    try {
        const connection = await getRedisClinet();
        await connection.set(convertKey(tenantId, nid, sceneId), probability);
        return true;
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 插入租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return false;
    }
}



/**
 * 获取一条租户游戏押注调控信息
 * @param tenantId 租户id
 * @param nid 游戏id
 * @param sceneId 场id
 */
export async function findOneBySceneInfo(tenantId: string, nid: string, sceneId: number):Promise<number|null> {
    try {
        const connection = await getRedisClinet();

        const result = await connection.get(convertKey(tenantId, nid, sceneId));

        if (result !== null) {
            return parseInt(result);
        }

        return null;
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 获取租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return null;
    }
}

/**
 * 删除一条租户单个游戏调控信息
 * @param tenantId 租户id
 * @param nid 游戏id
 * @param sceneId 场id
 */
export async function removeOne(tenantId: string, nid: string, sceneId: number):Promise<any> {
    try {
        const connection = await getRedisClinet();
        return connection.del(convertKey(tenantId, nid, sceneId));
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 删除租户单个游戏调控信息出错 | ${tenantId} | ${nid} | ${sceneId} | ${e.stack}`);
        return null;
    }
}
