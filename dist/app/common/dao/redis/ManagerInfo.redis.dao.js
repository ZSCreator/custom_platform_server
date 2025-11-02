"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerInfoRedisDao = void 0;
const IBaseRedisDao_interface_1 = require("./interface.ts/IBaseRedisDao.interface");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ManagerInfoRedisDao extends IBaseRedisDao_interface_1.IBaseRedisDao {
    async findOne(token) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.get(`${RedisDict_1.DB2.manager_info}:${token}`);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(token, parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const game = await conn.setex(`${RedisDict_1.DB2.manager_info}:${token}`, 6 * 60 * 60, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
    async deleteOne(token) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.del(`${RedisDict_1.DB2.manager_info}:${token}`);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.ManagerInfoRedisDao = ManagerInfoRedisDao;
exports.default = new ManagerInfoRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFuYWdlckluZm8ucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvTWFuYWdlckluZm8ucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9GQUF1RTtBQUN2RSx3REFBK0M7QUFDL0Msb0RBQThDO0FBQzlDLDZEQUFrRDtBQUVsRCxNQUFhLG1CQUFxQixTQUFRLHVDQUFhO0lBQ25ELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBVTtRQUVwQixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxZQUFZLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU1RCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMzQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQVUsRUFBRSxTQUE0RztRQUNwSSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUcsQ0FBQyxZQUFZLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXRHLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNqQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFVO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBQ0EsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFlBQVksSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBakNELGtEQWlDQztBQUVELGtCQUFlLElBQUksbUJBQW1CLEVBQUUsQ0FBQyJ9