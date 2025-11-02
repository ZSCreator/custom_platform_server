import { SystemConfig } from "../mysql/entity/SystemConfig.entity";
import { SystemConfigInRedis } from "../redis/entity/SystemConfig.entity";
import SystemConfigMysqlDao from "../mysql/SystemConfig.mysql.dao";
import SystemConfigRedisDao from "../redis/SystemConfig.redis.dao";
import ConnectionManager from "../mysql/lib/connectionManager";

const systemConfigJson = require('../../../../config/data/system/systemConfig.json');
type Parameter<T> = { [P in keyof T]?: T[P] };
export class SystemConfigManager {
    async findOne(parameter: Parameter<SystemConfig> ,onlyMysql: boolean = false): Promise<SystemConfig | SystemConfigInRedis> {
        try {
            if(!onlyMysql){
                // Step 1: 是否只读 Mysql 数据库;
                let systemConfig = await SystemConfigRedisDao.findOne(parameter);
                if (systemConfig) {
                    return systemConfig;
                }
                if(!systemConfig){
                    const systemConfigOnMysql = await SystemConfigMysqlDao.findOne(parameter);
                    /** Mysql 有数据则更新进redis，无则返回 */
                    if (systemConfigOnMysql) {
                        const sec = await SystemConfigRedisDao.insertOne(new SystemConfigInRedis(systemConfigOnMysql));
                    }else{
                        return await this.init()
                    }
                    return systemConfigOnMysql;
                }
            }else{
                const systemConfigOnMysql = await SystemConfigMysqlDao.findOne(parameter);
                /** Mysql 有数据则更新进redis，无则返回 */
                if (systemConfigOnMysql) {
                    const sec = await SystemConfigRedisDao.insertOne(new SystemConfigInRedis(systemConfigOnMysql));
                }else{
                    return await this.init()
                }
                return systemConfigOnMysql;
            }

        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<SystemConfig>): Promise<any> {
        try {
            // 将数组存储成字符串
            await SystemConfigMysqlDao.insertOne(parameter);
            await SystemConfigRedisDao.insertOne(new SystemConfigInRedis(parameter));
            return true;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter<SystemConfig>, partialEntity: Parameter<SystemConfig>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;

            if (isSuccess) {
                await SystemConfigRedisDao.updateOne(parameter, new SystemConfigInRedis(partialEntity));
            }

            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: Parameter<SystemConfig>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    /**
     * 初始化游戏配置信息
     * @param parameter
     */

    async init(): Promise<any> {
        try {
            //如果数据库和缓存都没取到数据，直接加载配置表
            // const configJson = JsonMgr.get('system/systemConfig').datas;
            // console.warn("configJson",configJson)
            await this.insertOne(systemConfigJson);
            return systemConfigJson;
        } catch (e) {
            return false;
        }
    }




}

export default new SystemConfigManager();
