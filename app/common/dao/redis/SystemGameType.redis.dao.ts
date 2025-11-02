import { DB3 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { SystemGameTypeInRedis } from "./entity/SystemGameType.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

export class SystemGameTypeRedisDao implements AbstractDao<SystemGameTypeInRedis>{

    async findList(parameter: { id?: number; typeId?: number; sort?: number; name?: string; open?: boolean; nidList?: string; hotNidList?: string; }): Promise<SystemGameTypeInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.hgetall(`${DB3.gameType}`);
            const dataList = [];
            for (let key in SystemConfigWithStr) {
                dataList.push(JSON.parse(SystemConfigWithStr[key]));
            }
            return dataList ? dataList : [];
        } catch (e) {
            console.error(`Redis | DB3 | 查询游戏分类信息出错: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter: { id?: number; typeId?: number; sort?: number; name?: string; open?: boolean; nidList?: string;  hotNidList?: string; }): Promise<SystemGameTypeInRedis> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.hget(`${DB3.gameType}`, parameter.typeId.toString());

            return !!SystemConfigWithStr ? JSON.parse(SystemConfigWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB3 | 查询游戏分类信息出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { id?: number; typeId?: number; sort?: number; name?: string; open?: boolean; nidList?: string; hotNidList?: string; }, partialEntity: { id?: number; typeId?: number; sort?: number; name?: string; open?: boolean; nidList?: string; hotNidList?: string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);

        try {
            await conn.hset(DB3.gameType, parameter.typeId.toString(), JSON.stringify(partialEntity));
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 修改游戏分类配置信息出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { id?: number; typeId?: number; sort?: number; name?: string; open?: boolean; nidList?: string;  hotNidList?: string;}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            await conn.hset(DB3.gameType, parameter.typeId.toString(), JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 插入游戏分类信息出错: ${e.stack}`);
            return null;
        }
    }

    delete(parameter: {}): Promise<any> {
        throw new Error("Method not implemented.");
    }

}

export default new SystemGameTypeRedisDao();