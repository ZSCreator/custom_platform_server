import { DB3 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { GameCommissionInRedis } from "./entity/GameCommission.entity";
import { IBaseRedisDao } from "./interface.ts/IBaseRedisDao.interface";
import redisManager from "./lib/BaseRedisManager";

/**
 * 游戏抽水比例
 */
export class GameCommissionRedisDao extends IBaseRedisDao implements AbstractDao<GameCommissionInRedis>{
    async exits(nid: string): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            return !!await conn.hexists(DB3.commission, nid);
        } catch (e) {
            return false;
        }
    }

    async findList(parameter: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }): Promise<GameCommissionInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.hgetall(`${DB3.commission}`);
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

    async findOne(parameter: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }): Promise<GameCommissionInRedis> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const info = await conn.hget(DB3.commission, parameter.nid);

            return !!info ? JSON.parse(info) : null;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }, partialEntity: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(DB3.commission, parameter.nid, JSON.stringify(partialEntity));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(DB3.commission, parameter.nid, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { nid?: string; way?: number; targetCharacter?: number; bet?: number; win?: number; settle?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const delFlag = await conn.hdel(DB3.commission, parameter.nid);

            return !!delFlag;
        } catch (e) {
            return false;
        }
    }


    async deleteAll(parameter: {  }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
             await conn.del(DB3.commission);
            return true;
        } catch (e) {
            return false;
        }
    }


}

export default new GameCommissionRedisDao();
