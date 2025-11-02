
import { IBaseRedisDao } from "./interface.ts/IBaseRedisDao.interface";
import { AbstractDao } from "../ADao.abstract";
import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class TenantGameDataRedisDao extends IBaseRedisDao {

    async exits(uniqueDateTime: string): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            return !!await conn.exists(`${DB2.tenantGameData}:${uniqueDateTime}`);
        } catch (e) {
            return false;
        }
    }

    async findOne(uniqueDateTime: string): Promise<Array<any>> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${DB2.tenantGameData}:${uniqueDateTime}`);

            return !!game ? JSON.parse(game) : null;
        } catch (e) {
            return null;
        }
    }

    async insertOne(uniqueDateTime: string, parameter): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${DB2.tenantGameData}:${uniqueDateTime}`, 30, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

}

export default new TenantGameDataRedisDao();