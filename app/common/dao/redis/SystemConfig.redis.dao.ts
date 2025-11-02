import { DB3,} from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { SystemConfigInRedis } from "./entity/SystemConfig.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";
import SystemConfigMysqlDao from "../mysql/SystemConfig.mysql.dao";

export class SystemConfigRedisDao implements AbstractDao<SystemConfigInRedis>{

    findList(parameter: {}): Promise<SystemConfigInRedis[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter: {}): Promise<SystemConfigInRedis> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.get(`${DB3.systemConfig}`);

            return !!SystemConfigWithStr ? JSON.parse(SystemConfigWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }



    async updateOne(parameter: {}, partialEntity: { id?: number; defaultChannelCode?: string; tixianRabate?: number; iplRebate?: number; openUnlimited?: boolean;  unlimitedList?: any; signData?: any; bankList?: any; apiTestAgent?: string; customer?: string; languageForWeb?: string; backButton?: any; hotGameButton?: any; isOpenH5?: boolean; warn?: string; isCloseApi?: boolean; closeNid?: any; tixianBate?: number;  gameResultUrl?: string; tixianPoundage?: number;  tixianLimit?: number; goldToMoney?: number; startGold?: number; loginReward?: string; h5GameUrl?: string; inputGoldThan?: number; winGoldThan?: number; winAddRmb?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.get(`${DB3.systemConfig}`);
            if(!SystemConfigWithStr){
                const systemConfigOnMysql = await SystemConfigMysqlDao.findOne(parameter);
                if(systemConfigOnMysql){
                    await conn.set(DB3.systemConfig, JSON.stringify(new SystemConfigInRedis(Object.assign(systemConfigOnMysql, partialEntity))));
                }
            }else{
                await conn.set(DB3.systemConfig, JSON.stringify(new SystemConfigInRedis(Object.assign(JSON.parse(SystemConfigWithStr), partialEntity))));
            }

            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 修改系统配置信息出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { customer?: string; openUnlimited?: boolean; defaultChannelCode?: string; iplRebate?: number;  unlimitedList?: any; tixianRabate?: number; signData?: any; bankList?: any; isOpenH5?: boolean; id?: number; apiTestAgent?: string; languageForWeb?: string;  gameResultUrl?: string; isCloseApi?: boolean; closeNid?: any; backButton?: any;hotGameButton?: any; tixianBate?: number;    startGold?: number;  h5GameUrl?: string; inputGoldThan?: number; winGoldThan?: number; winAddRmb?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            await conn.set(DB3.systemConfig, JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 插入系统配置出错: ${e.stack}`);
            return null;
        }
    }

    delete(parameter: {}): Promise<any> {
        throw new Error("Method not implemented.");
    }

}

export default new SystemConfigRedisDao();