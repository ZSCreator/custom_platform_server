import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { DayCreatePlayerInRedis } from "./entity/DayCreatePlayer.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

export class DayCreatePlayerRedisDao implements AbstractDao<DayCreatePlayerInRedis>{
    /**
     * 获取今日玩家创建以及时间
     * @returns {Array<IOnlineGameHash>}
     * @description  DayCreatePlayer
     */
    async findList(parameter: { uid?: string; createTime?: number; }): Promise<DayCreatePlayerInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const data = await conn.hgetall(`${DB2.DayCreatePlayer}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB2 | 获取今日玩家创建以及时间: ${e.stack}`);
            return [];
        }
    }
    /**
     * 获取一个玩家当日创建信息
     * @param {string} uid
     * @returns
     */
    async findOne(parameter: { uid?: string; createTime?: number; }): Promise<DayCreatePlayerInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            const DayCreatePayerWithStr = await conn.hget(`${DB2.DayCreatePlayer}`, parameter.uid);
            return !!DayCreatePayerWithStr ? JSON.parse(DayCreatePayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 获取一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 更新一个玩家当日创建信息
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @returns {boolean}
     * @description  DayCreatePlayer
     */
    async updateOne(parameter: { uid?: string; createTime?: number; }, partialEntity: { uid?: string; createTime?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(DB2.DayCreatePlayer, parameter.uid, JSON.stringify(partialEntity));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 更新一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 新增一个玩家当日创建信息
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @description hall:DayCreatePlayer
     */
    async insertOne(parameter: { uid?: string; createTime?: number; }): Promise<any> {
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
                await conn.hset(DB2.DayCreatePlayer, parameter.uid, JSON.stringify(parameter));
            }
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 新增一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }

    /**
     * 获取玩家当日创建信息玩家个数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async getPlayerLength(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const length = await conn.hlen(`${DB2.DayCreatePlayer}`);
            return length;
        } catch (e) {
            console.error(`Redis | DB2 | 获取玩家当日创建信息玩家个数: ${e.stack}`);
            return null;
        }
    }

    /**
     * 删除玩家当日创建信息
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            await conn.del(DB2.DayCreatePlayer);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除一个玩家当日创建信息
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async deleteOne(parameter: { uid: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(DB2.DayCreatePlayer, parameter.uid);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }

}

export default new DayCreatePlayerRedisDao();