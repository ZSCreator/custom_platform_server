import { DB1 } from "../../constant/RedisDict";
import redisManager from "./lib/BaseRedisManager";
import { RedisDB } from "./config/DBCfg.enum";

/**
 * 第三方上下分警告配置
 */

export class ThirdApiWarnGoldRedisDao {

    async findWarnGoldCfg() {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const data = await conn.hget(`${DB1.warnGoldConfig}`, "config");
            return !!data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }


    async updateWarnGoldCfg(data) {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.hset(`${DB1.warnGoldConfig}`, "config", JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }

}


export default new ThirdApiWarnGoldRedisDao();