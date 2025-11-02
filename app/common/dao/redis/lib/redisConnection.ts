import { getRedisClient } from '../../../../services/databaseService';
import IORedis = require('ioredis');
import { RedisDB } from '../config/DBCfg.enum';

export default async function redisConnect(db: RedisDB = RedisDB.Persistence_DB): Promise<IORedis.Redis> {
    const redisClient = await getRedisClient();
    if (!redisClient) {
        throw new Error('redis 客户端未连接');
    }
    await redisClient.select(db);
    return redisClient;
}
