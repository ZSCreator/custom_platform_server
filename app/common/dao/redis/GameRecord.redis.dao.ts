import { DB2, DB4 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { GameRecordInRedis } from "./entity/GameRecord.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";
import { PlayerInRedis } from "./entity/player.entity";
import { random } from "../../../utils";

export class GameRecordRedisDao implements AbstractDao<GameRecordInRedis>{

    async findList(parameter: { uid?: string; gameName?: string; sceneId?: number; roomId?: string; gold?: number; validBet?: number; input?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }): Promise<GameRecordInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const result = await conn.lrange(`${DB2.GameRecord}`, 0, 150);
            let arr = [];
            result.forEach(m => {
                arr.push(JSON.parse(m));
            });
            return arr;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter: { uid?: string; gameName?: string; sceneId?: number; roomId?: string; gold?: number; input?: number; validBet?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }): Promise<GameRecordInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const message = await conn.spop(`${DB2.GameRecord}`);
            return !!message ? JSON.parse(message) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { uid?: string; gameName?: string; sceneId?: number; roomId?: string; gold?: number; validBet?: number; input?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }, partialEntity: { uid?: string; gameName?: string; sceneId?: number; roomId?: string; gold?: number; validBet?: number; input?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const seconds = 15 * 60; //15分钟
            const AuthCodeStr = await conn.get(`${DB2.GameRecord}`);
            await conn.setex(`${DB2.GameRecord}`, seconds, JSON.stringify(new PlayerInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { uid?: string; gameName?: string; input?: number; sceneId?: number; roomId?: string; gold?: number; validBet?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            let valueOrArray = [];
            valueOrArray.push(parameter);
            await conn.sadd(`${DB2.GameRecord}`, ...valueOrArray);
            return;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const data = await conn.spop(`${DB2.GameRecord}`);
            return data;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }

    async lPush(parameter: { uid?: string; gameName?: string; input?: number; sceneId?: number; roomId?: string; gold?: number; validBet?: number; win?: number; profit?: number; addRmb?: number; createTimeDate?: Date; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            parameter.createTimeDate = new Date();
            await conn.lpush(`${DB2.GameRecord}`, JSON.stringify(parameter));
            const length = await conn.llen(`${DB2.GameRecord}`);
            if (length > 150) {
                await conn.rpop(`${DB2.GameRecord}`);
            }
            await conn.expire(`${DB2.GameRecord}`, 60 * 60 * 24);
            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }


    async insertGameRecordForUid(parameter: { nid?: string; uid?: string; gameOrder?: string; gameName?: string; roomId?: string; validBet?: number; profit?: number; createTimeDate?: Date; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.GameRecordData);
        try {
            const seconds = 60 * 60 * 24 * 14;
            let resultLst = [];
            let info = {
                roomId:parameter.roomId,
                validBet:parameter.validBet,
                profit:parameter.profit,
                createTimeDate:parameter.createTimeDate,
                gameOrder:parameter.gameOrder,
            }
            const playerGameWithStr = await conn.get(`${DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`);
            if (!!playerGameWithStr) {
                let list = JSON.parse(playerGameWithStr);

                list.unshift(info);

                if (list.length > 10) {
                    list.pop();
                }

                resultLst = list;
            } else {
                resultLst.unshift(info);
            }
            await conn.setex(`${DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`, seconds, JSON.stringify(resultLst));
            return true;
        } catch (e) {
            console.error(`Redis | DB4 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }


    async findGameRecordForUid(parameter: { nid?: string; uid?: string; gameName?: string; roomId?: string; validBet?: number; profit?: number; createTimeDate?: Date; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.GameRecordData);
        try {
            const playerGameWithStr = await conn.get(`${DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`);
            return !!playerGameWithStr ? JSON.parse(playerGameWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB4 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }

}

export default new GameRecordRedisDao();