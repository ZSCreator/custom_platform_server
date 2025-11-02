"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantGameDataRedisDao = void 0;
const IBaseRedisDao_interface_1 = require("./interface.ts/IBaseRedisDao.interface");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class TenantGameDataRedisDao extends IBaseRedisDao_interface_1.IBaseRedisDao {
    async exits(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            return !!await conn.exists(`${RedisDict_1.DB2.tenantGameData}:${uniqueDateTime}`);
        }
        catch (e) {
            return false;
        }
    }
    async findOne(uniqueDateTime) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${RedisDict_1.DB2.tenantGameData}:${uniqueDateTime}`);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(uniqueDateTime, parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${RedisDict_1.DB2.tenantGameData}:${uniqueDateTime}`, 30, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
}
exports.TenantGameDataRedisDao = TenantGameDataRedisDao;
exports.default = new TenantGameDataRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50R2FtZURhdGEucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvVGVuYW50R2FtZURhdGEucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG9GQUF1RTtBQUV2RSx3REFBK0M7QUFDL0Msb0RBQThDO0FBQzlDLDZEQUFrRDtBQUVsRCxNQUFhLHNCQUF1QixTQUFRLHVDQUFhO0lBRXJELEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBc0I7UUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxlQUFHLENBQUMsY0FBYyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7U0FDekU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBc0I7UUFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMsY0FBYyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFFdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDM0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFzQixFQUFFLFNBQVM7UUFDN0MsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFHLENBQUMsY0FBYyxJQUFJLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFeEcsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQWpDRCx3REFpQ0M7QUFFRCxrQkFBZSxJQUFJLHNCQUFzQixFQUFFLENBQUMifQ==