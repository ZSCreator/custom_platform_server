import { DB2,} from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class FileExportDataRedisDao  {


    async findOne(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const str = await conn.get(`${DB2.FileExportData}`);

            return !!str ? JSON.parse(str) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }



    async insertOne(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const time = Date.now();
            await conn.set(DB2.FileExportData, JSON.stringify(time));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.del(DB2.FileExportData);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }

}

export default new FileExportDataRedisDao();