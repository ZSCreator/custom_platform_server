import {DB1} from "../../constant/RedisDict";
import { getLogger } from 'pinus-logger';
import redisManager from "./lib/BaseRedisManager";
import {RedisDB} from "./config/DBCfg.enum";
import TenantGameDataMysqlDao from "../mysql/TenantGameData.mysql.dao";
const logger = getLogger('server_out', __filename);

export class platformMonthKillRateRedisDao  {


    async  insert(parameter: { agentList?: any }): Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await  conn.set(`${DB1.platformKillRate}`, JSON.stringify(parameter.agentList));

            return true;
        } catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }



    async findOne(parameter: {}) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.get(`${DB1.platformKillRate}`);
            let agentList: any = [];
            if (!!playerAgentWithStr) {
                agentList = JSON.parse(playerAgentWithStr);
                return agentList;
            } else {
                const result = await TenantGameDataMysqlDao.getTenantMonthData();
                if(result && result.length != 0){
                    const list = result.map((info) => {
                        const { profitTotal, validBetTotal } = info;
                        const winRate = validBetTotal > 0 ? ((-Number(profitTotal))  / validBetTotal).toFixed(4) : 0;
                        delete info.profitTotal;
                        delete info.validBetTotal;
                        return { winRate,...info };
                    });
                    await this.insert({agentList : list});
                    return list;
                }else{
                    return [];
                }



            }
        } catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率  | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }



    async deleteOne(parameter: {}) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.del(DB1.platformKillRate);
            return true;
        } catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }



}

export default new platformMonthKillRateRedisDao();