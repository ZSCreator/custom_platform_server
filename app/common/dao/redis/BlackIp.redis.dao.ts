import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { BlackIpInRedis } from "./entity/BlackIp.entity";
import redisManager from "./lib/BaseRedisManager";

interface BlackIpInRedisDTO {
    ip?: string;
    time?: Date;
    creator?: string;
}

export class BlackIpRedisDao  {
    /**
     * 获取黑名单
     * @returns {Array<BlackIpRedisDao>}
     * @description  Black_ip
     */
    async findList(): Promise<BlackIpInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${DB2.Black_ip}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB2 | 获取黑名单: ${e.stack}`);
            return [];
        }
    }


    /**
     * 获取黑名单的IP
     * @returns {Array<BlackIpRedisDao>}
     * @description  Black_ip
     */
    async findListForIp(): Promise<BlackIpInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${DB2.Black_ip}`);
            let list = [];
            for (let key in data) {
                list.push(key);
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB2 | 获取黑名单的IP: ${e.stack}`);
            return [];
        }
    }


    /**
     * 新增黑名单的IP
     * @param parameter
     * @description Sp:Black_ip
     */
    async insertOne(parameter: BlackIpInRedisDTO): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.ip) {
                return null;
            }
            await conn.hset(DB2.Black_ip, parameter.ip, JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 新增黑名单的IP: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除所有黑名单的IP
     * @returns {boolean}
     * @description Sp:Black_ip
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.del(DB2.Black_ip);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除所有黑名单的IP: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除单个黑名单的IP
     * @returns {boolean}
     * @description Sp:Black_ip
     */
    async deleteOne(parameter: { ip: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.ip) {
                return null;
            }
            await conn.hdel(DB2.Black_ip, parameter.ip);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除单个黑名单的IP: ${e.stack}`);
            return null;
        }
    }









}

export default new BlackIpRedisDao();