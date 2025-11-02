
import { keys } from "ramda";
import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class ShareTenantRoomSituationRedisDao {

    async findAll() {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        if (!conn) {
            return false;
        }
        try {
            const result = await conn.hgetall(DB2.SHARE_TENANT_ROOM_SITUATION_KEY);
            keys(result).forEach(k => {
                result[k] = JSON.parse(result[k]);
            });

            return result;
        } catch (e) {
            console.error(`Redis | DB2 | 获取所有运行租户组、闲置租户组、内存、空闲房间号信息出错: ${e.stack}`);
            return false;
        }
    }

    async insertOne(nid: string, parameter) {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {
            if (!conn) {
                return false;
            }

            await conn.hset(DB2.SHARE_TENANT_ROOM_SITUATION_KEY, nid, parameter);

            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 插入运行租户组、闲置租户组、内存、空闲房间号信息出错: ${e.stack}`);
            return false;
        }
    }
}

export default new ShareTenantRoomSituationRedisDao();