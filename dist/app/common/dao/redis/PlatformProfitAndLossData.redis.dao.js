"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformProfitAndLossDataRedisDao = void 0;
const IBaseRedisDao_interface_1 = require("./interface.ts/IBaseRedisDao.interface");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class PlatformProfitAndLossDataRedisDao extends IBaseRedisDao_interface_1.IBaseRedisDao {
    async exits(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            return !!await conn.exists(`${RedisDict_1.DB2.platformProfitAndLossData}:${uniqueDateTime}`);
        }
        catch (e) {
            return false;
        }
    }
    async findOne(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${RedisDict_1.DB2.platformProfitAndLossData}:${uniqueDateTime}`);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(uniqueDateTime, parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${RedisDict_1.DB2.platformProfitAndLossData}:${uniqueDateTime}`, 60 * 10, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
}
exports.PlatformProfitAndLossDataRedisDao = PlatformProfitAndLossDataRedisDao;
exports.default = new PlatformProfitAndLossDataRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Qcm9maXRBbmRMb3NzRGF0YS5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9QbGF0Zm9ybVByb2ZpdEFuZExvc3NEYXRhLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRkFBdUU7QUFDdkUsd0RBQStDO0FBQy9DLG9EQUE4QztBQUM5Qyw2REFBa0Q7QUFFbEQsTUFBYSxpQ0FBa0MsU0FBUSx1Q0FBYTtJQUNoRSxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQXNCO1FBQzlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBQ0EsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsZUFBRyxDQUFDLHlCQUF5QixJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7U0FDcEY7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBc0I7UUFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMseUJBQXlCLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQztZQUVsRixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMzQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLGNBQXNCLEVBQUUsU0FBUztRQUM3QyxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUcsQ0FBQyx5QkFBeUIsSUFBSSxjQUFjLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUV4SCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDakI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBL0JELDhFQStCQztBQUVELGtCQUFlLElBQUksaUNBQWlDLEVBQUUsQ0FBQyJ9