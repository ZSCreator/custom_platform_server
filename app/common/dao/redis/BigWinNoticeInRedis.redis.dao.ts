import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { BigWinNoticeInRedis } from "./entity/BigWinNotice.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";
import { PlayerInRedis } from "./entity/player.entity";

export class BigWinNoticeRedisDao implements AbstractDao<BigWinNoticeInRedis>{

    async findList(parameter: { messageID?: string; isRobot?: number; params?: []; }): Promise<BigWinNoticeInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const allMembers = await conn.smembers(`${DB2.BigWinNotice}`);
            return allMembers;
        } catch (e) {
            console.error(`Redis | DB2 | 查询喇叭出错: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter: { messageID?: string; isRobot?: number; params?: []; }): Promise<BigWinNoticeInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const message = await conn.spop(`${DB2.BigWinNotice}`);
            return !!message ? JSON.parse(message) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 查询喇叭出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { messageID?: string; isRobot?: number; params?: []; }, partialEntity: { messageID?: string; isRobot?: number; params?: []; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const seconds = 15 * 60; //15分钟
            const AuthCodeStr = await conn.get(`${DB2.BigWinNotice}`);
            await conn.setex(`${DB2.BigWinNotice}`, seconds, JSON.stringify(new BigWinNoticeInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 查询喇叭出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { messageID?: string; isRobot?: number; params?: []; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            let valueOrArray = [];
            valueOrArray.push(parameter);
            await conn.sadd(`${DB2.BigWinNotice}`, ...valueOrArray);
            return;
        } catch (e) {
            console.error(`Redis | DB2 | 查询喇叭出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const data = await conn.spop(`${DB2.BigWinNotice}`);
            return data;
        } catch (e) {
            console.error(`Redis | DB2 | 查询喇叭出错: ${e.stack}`);
            return null;
        }
    }

}

export default new BigWinNoticeRedisDao();