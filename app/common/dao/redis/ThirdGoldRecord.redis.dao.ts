import { DB1 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { ThirdGoldRecordInRedis } from "./entity/ThirdGoldRecord.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

export class ThirdGoldRecordRedisDao  implements AbstractDao<ThirdGoldRecordInRedis>{
    /**
     * 获取所有下分预警记录
     * @returns {Array<IOnlineGameHash>}
     * @description  ThirdGold_Length
     */
    async findList(parameter: { id?: number; orderId?: string; uid?: string; type?: number; agentRemark?: string; goldChangeBefore?: number; gold?: number, goldChangeAfter?: number , status?: number , remark?: string, createDate?: Date }): Promise<ThirdGoldRecordInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${DB1.ThirdGold}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB1 | 获取所有下分预警记录: ${e.stack}`);
            return [];
        }
    }
    /**
     * 获取一个下分预警记录
     * @param {string} uid
     * @returns
     */
    async findOne(parameter: {id?: number; orderId?: string; uid?: string; type?: number; agentRemark?: string; goldChangeBefore?: number; gold?: number, goldChangeAfter?: number , status?: number , remark?: string, createDate?: Date }): Promise<ThirdGoldRecordInRedis> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${DB1.ThirdGold}`, parameter.uid);
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB1 | 获取一个下分预警记录: ${e.stack}`);
            return null;
        }
    }
    /**
     * 更新下分预警记录
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @returns {boolean}
     * @description  ThirdGold_Length
     */
    async updateOne(parameter: { id?: number; orderId?: string; uid?: string; type?: number; agentRemark?: string; goldChangeBefore?: number; gold?: number, goldChangeAfter?: number , status?: number , remark?: string, createDate?: Date }, partialEntity: { uid?: string, nid?: string; isRobot?: number; entryHallTime?: Date; sceneId?: number; roomId?: string; frontendServerId?: string; entryGameTime?: Date, hallServerId?: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const data = await this.findOne({ uid: parameter.uid });
            await conn.hset(DB1.ThirdGold, parameter.uid, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 更新在下分预警记录: ${e.stack}`);
            return null;
        }
    }
    /**
     * 新增游戏预警记录
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @description hall:ThirdGold_Length
     */
    async insertOne(parameter: { id?: number; orderId?: string; uid?: string; type?: number; agentRemark?: string; goldChangeBefore?: number; gold?: number, goldChangeAfter?: number , status?: number , remark?: string, createDate?: Date }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(DB1.ThirdGold, parameter.uid, JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 新增下分预警记录: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除所有游戏预警记录
     * @returns {boolean}
     * @description hall:ThirdGold_Length
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.del(DB1.ThirdGold,);
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 删除所有下分预警记录: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除单个游戏预警记录
     * @returns {boolean}
     * @description hall:ThirdGold_Length
     */
    async deleteOne(parameter: { uid: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(DB1.ThirdGold, parameter.uid);
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 删除单个下分预警记录: ${e.stack}`);
            return null;
        }
    }


    /**
     * 获取游戏预警记录个数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async getPlayerLength(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const length = await conn.get(`${DB1.ThirdGold_Length}`);
            return length;
        } catch (e) {
            console.error(`Redis | DB1 | 获取下分预警记录: ${e.stack}`);
            return 0;
        }
    }

    /**
     * 新增下分预警个数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async addLength(parameter: {length : number}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${DB1.ThirdGold_Length}`);
            let num = 0;
            if(!length){
                num = parameter.length;
            }else {
                num = parameter.length + Number(length);
            }

            await conn.set(DB1.ThirdGold_Length, JSON.stringify(num));
            return num;
        } catch (e) {
            console.error(`Redis | DB1 | 获取下分预警个数: ${e.stack}`);
            return 0;
        }
    }
    /**
     * 减少下分预警个数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async delLength(parameter: {length : number}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${DB1.ThirdGold_Length}`);
            let num = 0;
            if(!length){
                num = 0;
            }else {
                num = Number(length) - parameter.length;
            }
            if(num < 0){
                num = 0;
            }
            await conn.set(DB1.ThirdGold_Length, JSON.stringify(num));
            return num;
        } catch (e) {
            console.error(`Redis | DB1 | 获取游戏预警记录个数: ${e.stack}`);
            return 0;
        }
    }
    /**
     * 重置下分预警记录
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async init(parameter: { length : number}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.set(DB1.ThirdGold_Length, JSON.stringify(parameter.length));
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 重置下分预警记录人数: ${e.stack}`);
            return 0;
        }
    }



}

export default new ThirdGoldRecordRedisDao();