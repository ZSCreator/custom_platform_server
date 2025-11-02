import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { DayLoginPlayerInRedis } from "./entity/DayLoginPlayer.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

export class DayLoginPlayerRedisDao implements AbstractDao<DayLoginPlayerInRedis>{
    /**
     * 记录今日玩家登陆次数以及时间
     * @returns {Array<IOnlineGameHash>}
     * @description  DayLoginPlayer
     */
    async findList(parameter: { uid?: string; loginTime?: Date; loginNum?: number; }): Promise<DayLoginPlayerInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const data = await conn.hgetall(`${DB2.DayLoginPlayer}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB2 | 获取所有真实玩家信息出错: ${e.stack}`);
            return [];
        }
    }
    /**
     * 获取一个玩家当日登陆信息
     * @param {string} uid
     * @returns
     */
    async findOne(parameter: { uid?: string; loginTime?: Date; loginNum?: number; }): Promise<DayLoginPlayerInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            const DayLoginPLayerWithStr = await conn.hget(`${DB2.DayLoginPlayer}`, parameter.uid);
            return !!DayLoginPLayerWithStr ? JSON.parse(DayLoginPLayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 获取一个真实在线玩家信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 更新玩家当日登陆信息
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @returns {boolean}
     * @description  DayLoginPlayer
     */
    async updateOne(parameter: { uid?: string; loginTime?: Date; loginNum?: number; }, partialEntity: { uid?: string; loginTime?: Date; loginNum?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(DB2.DayLoginPlayer, parameter.uid, JSON.stringify(partialEntity));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 更新玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 新增玩家当日登陆信息
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @description hall:DayLoginPlayer
     */
    async insertOne(parameter: { uid?: string; loginTime?: Date; loginNum?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            const DayLoginPLayerWithStr: any = await this.findOne({ uid: parameter.uid });
            if (DayLoginPLayerWithStr) {
                DayLoginPLayerWithStr.loginNum += 1;
                await this.updateOne(DayLoginPLayerWithStr, DayLoginPLayerWithStr);
            } else {
                await conn.hset(DB2.DayLoginPlayer, parameter.uid, JSON.stringify(parameter));
            }
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 新增玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }

    /**
     * 获取当日玩家登陆玩家个数
     * @returns {boolean}
     * @description Sp:dayLoginPlayer
     */
    async getPlayerLength(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const length = await conn.hlen(`${DB2.DayLoginPlayer}`);
            return length;
        } catch (e) {
            console.error(`Redis | DB2 | 获取当日玩家登陆玩家个数: ${e.stack}`);
            return 0;
        }
    }

    /**
     * 删除玩家当日登陆信息
     * @returns {boolean}
     * @description Sp:dayLoginPlayer
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            await conn.del(DB2.DayLoginPlayer);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除单个删除玩家当日登陆信息
     * @returns {boolean}
     * @description Sp:dayLoginPlayer
     */
    async deleteOne(parameter: { uid: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(DB2.DayLoginPlayer, parameter.uid);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除单个删除玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }

}

export default new DayLoginPlayerRedisDao();