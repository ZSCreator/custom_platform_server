import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { OnlinePlayerInRedis } from "./entity/OnlinePlayer.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

interface OnlinePlayerInRedisDTO {
    uid?: string;
    nid?: string;
    isRobot?: number;
    entryHallTime?: Date;
    sceneId?: number;
    roomId?: string;
    frontendServerId?: string;
    entryGameTime?: Date,
    hallServerId?: string
}

export class OnlinePlayerRedisDao implements AbstractDao<OnlinePlayerInRedis>{
    /**
     * 获取所有真实玩家信息
     * @returns {Array<IOnlineGameHash>}
     * @description  Online_game_hash
     */
    async findList(): Promise<OnlinePlayerInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${DB2.Online_game_hash}`);
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
     * 获取一个真实在线玩家信息
     * @param parameter
     * @returns
     */
    async findOne(parameter: OnlinePlayerInRedisDTO): Promise<OnlinePlayerInRedis> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${DB2.Online_game_hash}`, parameter.uid);
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 获取一个真实在线玩家信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 更新在线玩家信息
     * @param parameter
     * @param partialEntity
     * @description  Online_game_hash
     */
    async updateOne(parameter: OnlinePlayerInRedisDTO, partialEntity: OnlinePlayerInRedisDTO): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return false;
            }
            const data = await this.findOne({ uid: parameter.uid });
            if(!data){
                return false;
            }
            await conn.hset(DB2.Online_game_hash, parameter.uid, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 更新在线玩家信息信息出错: ${e.stack}`);
            return false;
        }
    }
    /**
     * 新增在线玩家信息
     * @param parameter
     * @description hall:Online_game_hash
     */
    async insertOne(parameter: OnlinePlayerInRedisDTO): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(DB2.Online_game_hash, parameter.uid, JSON.stringify(parameter));
            /**
             * 设置最大在线人数
             */
            const max = await conn.get(DB2.Online_max);
            const length = await this.getPlayerLength({});
            if (!max) {
                await conn.set(DB2.Online_max, JSON.stringify(length));
            } else {
                if (max < length) {
                    await conn.set(DB2.Online_max, JSON.stringify(length));
                }
            }
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 新增在线玩家信息出错: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除所有在线玩家信息
     * @returns {boolean}
     * @description hall:online_game_hash
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            await conn.del(DB2.Online_game_hash,);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除所有在线玩家信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除单个在线玩家信息
     * @returns {boolean}
     * @description hall:online_game_hash
     */
    async deleteOne(parameter: { uid: string }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(DB2.Online_game_hash, parameter.uid);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除单个在线玩家信息: ${e.stack}`);
            return null;
        }
    }


    /**
     * 获取玩家在线玩家个数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async getPlayerLength(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const length = await conn.hlen(`${DB2.Online_game_hash}`);
            return length;
        } catch (e) {
            console.error(`Redis | DB2 | 获取玩家在线玩家个数: ${e.stack}`);
            return 0;
        }
    }



    /**
     * 重置新的在线人数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async init(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const length = await conn.hlen(`${DB2.Online_game_hash}`);
            await conn.set(DB2.Online_max, JSON.stringify(length));
            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 重置新的在线人数: ${e.stack}`);
            return 0;
        }
    }


    /**
     * 获取最高在线人数
     * @returns {boolean}
     * @description Sp:DayCreatePlayer
     */
    async getOnlineMax(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            const length = await conn.get(DB2.Online_max);
            return length;
        } catch (e) {
            console.error(`Redis | DB2 | 获取最高在线人数: ${e.stack}`);
            return 0;
        }
    }
}

export default new OnlinePlayerRedisDao();