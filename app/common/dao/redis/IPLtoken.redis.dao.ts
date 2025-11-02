import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class IPLtokenRedisDao {
    async findOne(): Promise<string> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const token = await conn.get(DB2.IPL_token);

            return !!token ? token : null;
        } catch (e) {
            return null;
        }
    }

    async updateOne(token: string): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            // const game = await conn.hset(DB3.game, parameter.nid, JSON.stringify(partialEntity));
            await conn.set(DB2.IPL_token, token);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default new IPLtokenRedisDao();
