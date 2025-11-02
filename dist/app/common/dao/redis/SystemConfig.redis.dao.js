"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const SystemConfig_entity_1 = require("./entity/SystemConfig.entity");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const SystemConfig_mysql_dao_1 = require("../mysql/SystemConfig.mysql.dao");
class SystemConfigRedisDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.get(`${RedisDict_1.DB3.systemConfig}`);
            return !!SystemConfigWithStr ? JSON.parse(SystemConfigWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const SystemConfigWithStr = await conn.get(`${RedisDict_1.DB3.systemConfig}`);
            if (!SystemConfigWithStr) {
                const systemConfigOnMysql = await SystemConfig_mysql_dao_1.default.findOne(parameter);
                if (systemConfigOnMysql) {
                    await conn.set(RedisDict_1.DB3.systemConfig, JSON.stringify(new SystemConfig_entity_1.SystemConfigInRedis(Object.assign(systemConfigOnMysql, partialEntity))));
                }
            }
            else {
                await conn.set(RedisDict_1.DB3.systemConfig, JSON.stringify(new SystemConfig_entity_1.SystemConfigInRedis(Object.assign(JSON.parse(SystemConfigWithStr), partialEntity))));
            }
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 修改系统配置信息出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            await conn.set(RedisDict_1.DB3.systemConfig, JSON.stringify(parameter));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 插入系统配置出错: ${e.stack}`);
            return null;
        }
    }
    delete(parameter) {
        throw new Error("Method not implemented.");
    }
}
exports.SystemConfigRedisDao = SystemConfigRedisDao;
exports.default = new SystemConfigRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtQ29uZmlnLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1N5c3RlbUNvbmZpZy5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLG9EQUE4QztBQUM5QyxzRUFBbUU7QUFDbkUsNkRBQWtEO0FBRWxELDRFQUFtRTtBQUVuRSxNQUFhLG9CQUFvQjtJQUU3QixRQUFRLENBQUMsU0FBYTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBYTtRQUN2QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSTtZQUNBLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFFbEUsT0FBTyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ3pFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUlELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBYSxFQUFFLGFBQTZsQjtRQUN4bkIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUk7WUFDQSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLElBQUcsQ0FBQyxtQkFBbUIsRUFBQztnQkFDcEIsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGdDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDMUUsSUFBRyxtQkFBbUIsRUFBQztvQkFDbkIsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlDQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hJO2FBQ0o7aUJBQUk7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlDQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVJO1lBRUQsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWlmO1FBQzdmLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQWE7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FFSjtBQXRERCxvREFzREM7QUFFRCxrQkFBZSxJQUFJLG9CQUFvQixFQUFFLENBQUMifQ==