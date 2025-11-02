"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdApiWarnGoldRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
class ThirdApiWarnGoldRedisDao {
    async findWarnGoldCfg() {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const data = await conn.hget(`${RedisDict_1.DB1.warnGoldConfig}`, "config");
            return !!data ? JSON.parse(data) : null;
        }
        catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateWarnGoldCfg(data) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            await conn.hset(`${RedisDict_1.DB1.warnGoldConfig}`, "config", JSON.stringify(data));
            return true;
        }
        catch (e) {
            console.error(`Redis | DB3 | 查询系统配置信息出错: ${e.stack}`);
            return null;
        }
    }
}
exports.ThirdApiWarnGoldRedisDao = ThirdApiWarnGoldRedisDao;
exports.default = new ThirdApiWarnGoldRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRBcGlXYXJuR29sZC5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9UaGlyZEFwaVdhcm5Hb2xkLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBK0M7QUFDL0MsNkRBQWtEO0FBQ2xELG9EQUE4QztBQU05QyxNQUFhLHdCQUF3QjtJQUVqQyxLQUFLLENBQUMsZUFBZTtRQUNqQixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMzQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSTtRQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0NBRUo7QUF6QkQsNERBeUJDO0FBR0Qsa0JBQWUsSUFBSSx3QkFBd0IsRUFBRSxDQUFDIn0=