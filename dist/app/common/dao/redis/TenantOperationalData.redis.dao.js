"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOperationalDataRedisDao = void 0;
const IBaseRedisDao_interface_1 = require("./interface.ts/IBaseRedisDao.interface");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class TenantOperationalDataRedisDao extends IBaseRedisDao_interface_1.IBaseRedisDao {
    async exits(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            return !!await conn.exists(`${RedisDict_1.DB2.tenantOperationalData}:${uniqueDateTime}`);
        }
        catch (e) {
            return false;
        }
    }
    async findOne(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${RedisDict_1.DB2.tenantOperationalData}:${uniqueDateTime}`);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(uniqueDateTime, parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${RedisDict_1.DB2.tenantOperationalData}:${uniqueDateTime}`, 30, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
}
exports.TenantOperationalDataRedisDao = TenantOperationalDataRedisDao;
exports.default = new TenantOperationalDataRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50T3BlcmF0aW9uYWxEYXRhLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1RlbmFudE9wZXJhdGlvbmFsRGF0YS5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esb0ZBQXVFO0FBRXZFLHdEQUErQztBQUMvQyxvREFBOEM7QUFDOUMsNkRBQWtEO0FBRWxELE1BQWEsNkJBQThCLFNBQVEsdUNBQWE7SUFFNUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFzQjtRQUM5QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxxQkFBcUIsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1NBQ2hGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQXNCO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLHFCQUFxQixJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFFOUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDM0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFzQixFQUFFLFNBQVM7UUFDN0MsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFHLENBQUMscUJBQXFCLElBQUksY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUUvRyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDakI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBakNELHNFQWlDQztBQUVELGtCQUFlLElBQUksNkJBQTZCLEVBQUUsQ0FBQyJ9