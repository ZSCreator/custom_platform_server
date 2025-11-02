import { pinus } from "pinus";
import { getLogger } from 'pinus-logger';
import getRedisClinet from "./lib/redisConnection";
const logger = getLogger('server_out', __filename);

import { DB1 } from "../../constant/RedisDict";
import {TenantControlBetKill} from "../mysql/entity/TenantControlBetKill.entity";
/**
 * 插入一条租户押注必杀调控信息
 * @param data 数据
 * @param tenantId 租户id
 */
export async function saveOneByTenantId(tenantId: string, data: any) {
    try {
        const connection = await getRedisClinet();

        await connection.hset(DB1.TenantBetKill, tenantId, JSON.stringify(data));
        return true;
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 插入租户押注必杀调控信息出错 | ${tenantId} ${JSON.stringify(data)} | ${e.stack}`);
        return false;
    }
}


/**
 * 获取一条租户押注调控信息
 * @param tenantId 租户id
 */
export async function findOneByTenantId(tenantId: string):Promise<TenantControlBetKill> {
    try {
        const connection = await getRedisClinet();

        return JSON.parse(await connection.hget(DB1.TenantBetKill, tenantId));
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 获取租户押注必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}

/**
 * 删除一条租户押注必杀调控信息
 * @param tenantId 租户id
 */
export async function removeOne(tenantId: string):Promise<any> {
    try {
        const connection = await getRedisClinet();
        return connection.hdel(DB1.TenantBetKill, tenantId);
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 删除租户押注必杀调控信息出错 | ${tenantId} | ${e.stack}`);
        return null;
    }
}
