"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayCreatePlayerRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class DayCreatePlayerRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const data = await conn.hgetall(`${RedisDict_1.DB2.DayCreatePlayer}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        }
        catch (e) {
            console.error(`Redis | DB2 | 获取今日玩家创建以及时间: ${e.stack}`);
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            const DayCreatePayerWithStr = await conn.hget(`${RedisDict_1.DB2.DayCreatePlayer}`, parameter.uid);
            return !!DayCreatePayerWithStr ? JSON.parse(DayCreatePayerWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 获取一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(RedisDict_1.DB2.DayCreatePlayer, parameter.uid, JSON.stringify(partialEntity));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 更新一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            const DayLoginPLayerWithStr = await this.findOne({ uid: parameter.uid });
            if (DayLoginPLayerWithStr) {
                DayLoginPLayerWithStr.loginNum += 1;
                await this.updateOne(DayLoginPLayerWithStr, DayLoginPLayerWithStr);
            }
            else {
                await conn.hset(RedisDict_1.DB2.DayCreatePlayer, parameter.uid, JSON.stringify(parameter));
            }
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 新增一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    async getPlayerLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const length = await conn.hlen(`${RedisDict_1.DB2.DayCreatePlayer}`);
            return length;
        }
        catch (e) {
            console.error(`Redis | DB2 | 获取玩家当日创建信息玩家个数: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.del(RedisDict_1.DB2.DayCreatePlayer);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 删除玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
    async deleteOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(RedisDict_1.DB2.DayCreatePlayer, parameter.uid);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 删除一个玩家当日创建信息: ${e.stack}`);
            return null;
        }
    }
}
exports.DayCreatePlayerRedisDao = DayCreatePlayerRedisDao;
exports.default = new DayCreatePlayerRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5Q3JlYXRlUGxheWVyLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL0RheUNyZWF0ZVBsYXllci5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLG9EQUE4QztBQUU5Qyw2REFBa0Q7QUFHbEQsTUFBYSx1QkFBdUI7SUFNaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFpRDtRQUM1RCxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQzFELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBTUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpRDtRQUMzRCxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQzthQUNmO1lB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