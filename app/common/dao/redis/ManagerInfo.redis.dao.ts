import { IBaseRedisDao } from "./interface.ts/IBaseRedisDao.interface";
import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class ManagerInfoRedisDao  extends IBaseRedisDao {
    async findOne(token: any): Promise<any> {

        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${DB2.manager_info}:${token}`);

            return !!game ? JSON.parse(game) : null;
        } catch (e) {
            return null;
        }
    }

    async insertOne(token: any, parameter : {token : string , agent : string , userName : string , platformUid:string , rootAgent : string }): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${DB2.manager_info}:${token}`, 6 * 60 * 60, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async deleteOne(token: any): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            await conn.del(`${DB2.manager_info}:${token}`);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default new ManagerInfoRedisDao();
