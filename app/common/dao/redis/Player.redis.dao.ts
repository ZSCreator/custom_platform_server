import { random } from "../../../utils";
import { RoleEnum } from "../../constant/player/RoleEnum";
import { DB2 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { PlayerInRedis } from "./entity/player.entity";
import redisManager from "./lib/BaseRedisManager";
import PlayerMysqlDao from "../mysql/Player.mysql.dao";

export class PlayerRedisDao implements AbstractDao<PlayerInRedis>{
    findList(parameter: {}): Promise<PlayerInRedis[]> {
        throw new Error("Method not implemented.");
    }

    async findOne(parameter: { uid?: string; }): Promise<PlayerInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const playerInfoWithStr = await conn.get(`${DB2.RealPlayer}:${parameter.uid}`);

            return !!playerInfoWithStr ? JSON.parse(playerInfoWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB1 | 查询真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { uid?: string; }, partialEntity: { createTime?: Date; shareUid?: string; addTixian?: number; addRmb?: number;  lineCode?: string; myGames?: string; group_id?: string; maxBetGold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; uid?: string; kickedOutRoom?: boolean; abnormalOffline?: boolean; loginCount?: number; groupRemark?: string; kickself?: boolean; closeTime?: Date; instantNetProfit?: number; dayMaxWin?: number; dailyFlow?: number; flowCount?: number; thirdUid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; position?: number; superior?: string; walletGold?: number; passWord?: string; ip?: string, language?: string, cellPhone?: string; guestid?: string, sid?: string; userId?: string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {
            const seconds = 3 * 3600;
            const playerInfoWithStr = await conn.get(`${DB2.RealPlayer}:${parameter.uid}`);
            if (playerInfoWithStr) {

                await conn.setex(`${DB2.RealPlayer}:${parameter.uid}`, seconds, JSON.stringify(new PlayerInRedis(Object.assign(JSON.parse(playerInfoWithStr), partialEntity))));
            } else {
                const player = await PlayerMysqlDao.findOne({ uid: parameter.uid });

                if (player) {
                    await conn.setex(`${DB2.RealPlayer}:${parameter.uid}`, seconds, JSON.stringify(new PlayerInRedis(Object.assign(player, partialEntity))));
                }
            }

            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 修改真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { createTime?: Date; shareUid?: string; addRmb?: number; addTixian?: number;  lineCode?: string; myGames?: string; superior?: string; group_id?: string; maxBetGold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; uid?: string; kickedOutRoom?: boolean; abnormalOffline?: boolean; loginCount?: number; groupRemark?: string; kickself?: boolean; closeTime?: Date; instantNetProfit?: number; dayMaxWin?: number; dailyFlow?: number; flowCount?: number; thirdUid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; position?: number; walletGold?: number; passWord?: string; ip?: string, language?: string, cellPhone?: string; guestid?: string, sid?: string; userId?: string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const seconds = 3 * 3600;

            await conn.setex(`${DB2.RealPlayer}:${parameter.uid}`, seconds, JSON.stringify(parameter));
            return seconds;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: { uid?: string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {

            await conn.del(`${DB2.RealPlayer}:${parameter.uid}`);
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async deleteAll(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            console.warn("删除所有redis玩家")
            const keys = await conn.keys(`${DB2.RealPlayer}:*`);
            if (keys.length != 0) {
                await conn.del(...keys);
            }
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }


    async deleteUids(uids: string[]): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (uids.length != 0) {
                await conn.del(...uids);
            }
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async getAllUid(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const keys = await conn.keys(`${DB2.RealPlayer}:*`);
            return keys;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async findListInUids(uids: string[]): Promise<PlayerInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            let valueArr = [];
            for (let uid of uids) {
                const playerInfoWithStr = await conn.get(`${DB2.RealPlayer}:${uid}`);
                if (!!playerInfoWithStr) {
                    valueArr.push(JSON.parse(playerInfoWithStr));
                }
            }
            return valueArr;
        } catch (e) {
            return null;
        }
    }

}

export default new PlayerRedisDao();