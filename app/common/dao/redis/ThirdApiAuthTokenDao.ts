import { DB1 } from "../../constant/RedisDict";
import * as databaseService from "../../../services/databaseService";
import { getLogger } from 'pinus-logger';
import {exists} from "./lib/redisManager";
const logger = getLogger('server_out', __filename);

async function getRDSClient() {
    const redisClient = await databaseService.getRedisClient();

    if (!redisClient) {
        return null;
    }

    return redisClient;
}

export async function exits(token: string): Promise<boolean> {

    return await exists(`${DB1.thirdApiAuthToken}:${token}`);
}

export async function insert(token: string, data: any, seconds: number = 180) {
    try {
        // await redisManager.storeFieldIntoHashTable(DB1_thirdApi.thirdApiAuthToken, uid, token);
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }

        await client.setex(`${DB1.thirdApiAuthToken}:${token}`, seconds, JSON.stringify(data));

        return true;
    } catch (e) {
        logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}

export async function findOne(token: string) {
    try {
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }

        const res = await client.get(`${DB1.thirdApiAuthToken}:${token}`);

        return res ? JSON.parse(res) : false;
    } catch (e) {
        logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}

export async function deleteOne(token: string) {
    try {
        const client = await getRDSClient();
        if (!client) {
            logger.warn(`没有获得可使用的rds连接`);
            return false;
        }

        await client.del(`${DB1.thirdApiAuthToken}:${token}`);

        return true;
    } catch (e) {
        logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
        return false;
    }
}