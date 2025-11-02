"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmEventThingRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class AlarmEventThingRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${RedisDict_1.DB1.AlarmEvent_Thing}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取所有游戏预警记录: ${e.stack}`);
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${RedisDict_1.DB1.AlarmEvent_Thing}`, parameter.id.toString());
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取所有游戏预警记录: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const data = await this.findOne({ id: parameter.id });
            await conn.hset(RedisDict_1.DB1.AlarmEvent_Thing, parameter.uid, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 更新在游戏预警记录: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(RedisDict_1.DB1.AlarmEvent_Thing, parameter.uid, JSON.stringify(parameter));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 新增游戏预警记录: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            await conn.del(RedisDict_1.DB1.AlarmEvent_Thing);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除所有游戏预警记录: ${e.stack}`);
            return null;
        }
    }
    async deleteOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.id) {
                return null;
            }
            await conn.hdel(RedisDict_1.DB1.AlarmEvent_Thing, parameter.id);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除单个游戏预警记录: ${e.stack}`);
            return null;
        }
    }
    async getPlayerLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const length = await conn.get(`${RedisDict_1.DB1.AlarmEvent_Thing_Length}`);
            return length;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取游戏预警记录个数: ${e.stack}`);
            return 0;
        }
    }
    async addLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${RedisDict_1.DB1.AlarmEvent_Thing_Length}`);
            let num = 0;
            if (!length) {
                num = parameter.length;
            }
            else {
                num = parameter.length + Number(length);
            }
            await conn.set(RedisDict_1.DB1.AlarmEvent_Thing_Length, JSON.stringify(num));
            return num;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取游戏预警记录个数: ${e.stack}`);
            return 0;
        }
    }
    async delLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${RedisDict_1.DB1.AlarmEvent_Thing_Length}`);
            let num = 0;
            if (!length) {
                num = 0;
            }
            else {
                num = Number(length) - parameter.length;
            }
            if (num < 0) {
                num = 0;
            }
            await conn.set(RedisDict_1.DB1.AlarmEvent_Thing_Length, JSON.stringify(num));
            return num;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取游戏预警记录个数: ${e.stack}`);
            return 0;
        }
    }
    async init(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            await conn.set(RedisDict_1.DB1.AlarmEvent_Thing_Length, JSON.stringify(parameter.length));
            return true;
        }
        catch (e) {
            console.error(`Redis | DB1 | 重置新的在线人数: ${e.stack}`);
            return 0;
        }
    }
}
exports.AlarmEventThingRedisDao = AlarmEventThingRedisDao;
exports.default = new AlarmEventThingRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxhcm1FdmVudFRoaW5nLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL0FsYXJtRXZlbnRUaGluZy5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLG9EQUE4QztBQUU5Qyw2REFBa0Q7QUFHbEQsTUFBYSx1QkFBdUI7SUFNaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUEyUTtRQUN0UixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDM0QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2QsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFNRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTJRO1FBQ3JSLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RSxJQUFJO1lBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7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