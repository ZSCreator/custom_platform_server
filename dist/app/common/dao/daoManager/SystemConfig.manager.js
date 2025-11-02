"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigManager = void 0;
const SystemConfig_entity_1 = require("../mysql/entity/SystemConfig.entity");
const SystemConfig_entity_2 = require("../redis/entity/SystemConfig.entity");
const SystemConfig_mysql_dao_1 = require("../mysql/SystemConfig.mysql.dao");
const SystemConfig_redis_dao_1 = require("../redis/SystemConfig.redis.dao");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const systemConfigJson = require('../../../../config/data/system/systemConfig.json');
class SystemConfigManager {
    async findOne(parameter, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                let systemConfig = await SystemConfig_redis_dao_1.default.findOne(parameter);
                if (systemConfig) {
                    return systemConfig;
                }
                if (!systemConfig) {
                    const systemConfigOnMysql = await SystemConfig_mysql_dao_1.default.findOne(parameter);
                    if (systemConfigOnMysql) {
                        const sec = await SystemConfig_redis_dao_1.default.insertOne(new SystemConfig_entity_2.SystemConfigInRedis(systemConfigOnMysql));
                    }
                    else {
                        return await this.init();
                    }
                    return systemConfigOnMysql;
                }
            }
            else {
                const systemConfigOnMysql = await SystemConfig_mysql_dao_1.default.findOne(parameter);
                if (systemConfigOnMysql) {
                    const sec = await SystemConfig_redis_dao_1.default.insertOne(new SystemConfig_entity_2.SystemConfigInRedis(systemConfigOnMysql));
                }
                else {
                    return await this.init();
                }
                return systemConfigOnMysql;
            }
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            await SystemConfig_mysql_dao_1.default.insertOne(parameter);
            await SystemConfig_redis_dao_1.default.insertOne(new SystemConfig_entity_2.SystemConfigInRedis(parameter));
            return true;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await SystemConfig_redis_dao_1.default.updateOne(parameter, new SystemConfig_entity_2.SystemConfigInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async init() {
        try {
            await this.insertOne(systemConfigJson);
            return systemConfigJson;
        }
        catch (e) {
            return false;
        }
    }
}
exports.SystemConfigManager = SystemConfigManager;
exports.default = new SystemConfigManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtQ29uZmlnLm1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9kYW9NYW5hZ2VyL1N5c3RlbUNvbmZpZy5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZFQUFtRTtBQUNuRSw2RUFBMEU7QUFDMUUsNEVBQW1FO0FBQ25FLDRFQUFtRTtBQUNuRSxzRUFBK0Q7QUFFL0QsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztBQUVyRixNQUFhLG1CQUFtQjtJQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWtDLEVBQUUsWUFBcUIsS0FBSztRQUN4RSxJQUFJO1lBQ0EsSUFBRyxDQUFDLFNBQVMsRUFBQztnQkFFVixJQUFJLFlBQVksR0FBRyxNQUFNLGdDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakUsSUFBSSxZQUFZLEVBQUU7b0JBQ2QsT0FBTyxZQUFZLENBQUM7aUJBQ3ZCO2dCQUNELElBQUcsQ0FBQyxZQUFZLEVBQUM7b0JBQ2IsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGdDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFMUUsSUFBSSxtQkFBbUIsRUFBRTt3QkFDckIsTUFBTSxHQUFHLEdBQUcsTUFBTSxnQ0FBb0IsQ0FBQyxTQUFTLENBQUMsSUFBSSx5Q0FBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7cUJBQ2xHO3lCQUFJO3dCQUNELE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7cUJBQzNCO29CQUNELE9BQU8sbUJBQW1CLENBQUM7aUJBQzlCO2FBQ0o7aUJBQUk7Z0JBQ0QsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGdDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFMUUsSUFBSSxtQkFBbUIsRUFBRTtvQkFDckIsTUFBTSxHQUFHLEdBQUcsTUFBTSxnQ0FBb0IsQ0FBQyxTQUFTLENBQUMsSUFBSSx5Q0FBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7aUJBQ2xHO3FCQUFJO29CQUNELE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7aUJBQzNCO2dCQUNELE9BQU8sbUJBQW1CLENBQUM7YUFDOUI7U0FFSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWtDO1FBQzlDLElBQUk7WUFFQSxNQUFNLGdDQUFvQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxNQUFNLGdDQUFvQixDQUFDLFNBQVMsQ0FBQyxJQUFJLHlDQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWtDLEVBQUUsYUFBc0M7UUFDdEYsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUU3QixJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNLGdDQUFvQixDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSx5Q0FBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQzNGO1lBRUQsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBa0M7UUFDM0MsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxJQUFJO1FBQ04sSUFBSTtZQUlBLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sZ0JBQWdCLENBQUM7U0FDM0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUtKO0FBOUZELGtEQThGQztBQUVELGtCQUFlLElBQUksbUJBQW1CLEVBQUUsQ0FBQyJ9