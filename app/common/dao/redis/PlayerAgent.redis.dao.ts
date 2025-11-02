import { DB2 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { playerAgentInRedis } from "./entity/playerAgent.entity";
import redisManager from "./lib/BaseRedisManager";
import PlayerAgentMysqlDao from "../mysql/PlayerAgent.mysql.dao";

export class PlayerRedisDao implements AbstractDao<playerAgentInRedis>{
    findList(parameter: {}): Promise<playerAgentInRedis[]> {
        throw new Error("Method not implemented.");
    }

    async findOne(parameter: {  uid?: string; platformName?: string; platformGold? : number; roleType? : number; }): Promise<playerAgentInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const playerAgentWithStr = await conn.get(`${DB2.playerAgent}:${parameter.platformName}`);
            if(!!playerAgentWithStr){
                return JSON.parse(playerAgentWithStr);
            }else{
                const playerAgent = await PlayerAgentMysqlDao.findOne({ platformName: parameter.platformName });
                if(playerAgent){
                    await this.insertOne(new playerAgentInRedis(playerAgent));
                    return playerAgent;
                }else{
                    return null ;
                }
            }
        } catch (e) {
            console.error(`Redis | DB1 | 查询真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }

    async findOneInRedis(parameter: {  uid?: string; platformName?: string; platformGold? : number; roleType? : number; }): Promise<playerAgentInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const playerAgentWithStr = await conn.get(`${DB2.playerAgent}:${parameter.platformName}`);
            if(!!playerAgentWithStr){
                return JSON.parse(playerAgentWithStr);
            }else{
                return null ;
            }
        } catch (e) {
            console.error(`Redis | DB1 | 查询真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }


    async updateOne(parameter: { uid?: string; platformName?: string; rootUid?: string; deepLevel?: number; platformGold? : number; roleType? : number; }, partialEntity: {  uid?: string; platformName?: string;  rootUid?: string; deepLevel?: number; platformGold? : number; roleType? : number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {
            const seconds = 7 * 24 * 3600 ;
            const playerAgentWithStr = await conn.get(`${DB2.playerAgent}:${parameter.platformName}`);
            if (playerAgentWithStr) {

                await conn.setex(`${DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(new playerAgentInRedis(Object.assign(JSON.parse(playerAgentWithStr), partialEntity))));
            } else {
                const playerAgent = await PlayerAgentMysqlDao.findOne({ uid: parameter.uid });
                if (playerAgent) {
                    await conn.setex(`${DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(new playerAgentInRedis(Object.assign(playerAgent, partialEntity))));
                }
            }
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 修改真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { uid?: string; platformName?: string; platformGold? : number; roleType? : number;  rootUid?: string; deepLevel?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const seconds = 7 * 24 * 3600 ;
            await conn.setex(`${DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(parameter));
            return seconds;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: { uid?: string; platformName?: string; platformGold? : number; roleType? : number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {

            await conn.del(`${DB2.playerAgent}:${parameter.platformName}`);
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }






}

export default new PlayerRedisDao();