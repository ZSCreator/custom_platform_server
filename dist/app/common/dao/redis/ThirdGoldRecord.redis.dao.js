"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdGoldRecordRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ThirdGoldRecordRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${RedisDict_1.DB1.ThirdGold}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取所有下分预警记录: ${e.stack}`);
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${RedisDict_1.DB1.ThirdGold}`, parameter.uid);
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取一个下分预警记录: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            const data = await this.findOne({ uid: parameter.uid });
            await conn.hset(RedisDict_1.DB1.ThirdGold, parameter.uid, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 更新在下分预警记录: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hset(RedisDict_1.DB1.ThirdGold, parameter.uid, JSON.stringify(parameter));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 新增下分预警记录: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            await conn.del(RedisDict_1.DB1.ThirdGold);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除所有下分预警记录: ${e.stack}`);
            return null;
        }
    }
    async deleteOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.uid) {
                return null;
            }
            await conn.hdel(RedisDict_1.DB1.ThirdGold, parameter.uid);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除单个下分预警记录: ${e.stack}`);
            return null;
        }
    }
    async getPlayerLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const length = await conn.get(`${RedisDict_1.DB1.ThirdGold_Length}`);
            return length;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取下分预警记录: ${e.stack}`);
            return 0;
        }
    }
    async addLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${RedisDict_1.DB1.ThirdGold_Length}`);
            let num = 0;
            if (!length) {
                num = parameter.length;
            }
            else {
                num = parameter.length + Number(length);
            }
            await conn.set(RedisDict_1.DB1.ThirdGold_Length, JSON.stringify(num));
            return num;
        }
        catch (e) {
            console.error(`Redis | DB1 | 获取下分预警个数: ${e.stack}`);
            return 0;
        }
    }
    async delLength(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            let length = await conn.get(`${RedisDict_1.DB1.ThirdGold_Length}`);
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
            await conn.set(RedisDict_1.DB1.ThirdGold_Length, JSON.stringify(num));
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
            await conn.set(RedisDict_1.DB1.ThirdGold_Length, JSON.stringify(parameter.length));
            return true;
        }
        catch (e) {
            console.error(`Redis | DB1 | 重置下分预警记录人数: ${e.stack}`);
            return 0;
        }
    }
}
exports.ThirdGoldRecordRedisDao = ThirdGoldRecordRedisDao;
exports.default = new ThirdGoldRecordRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRHb2xkUmVjb3JkLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1RoaXJkR29sZFJlY29yZC5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLG9EQUE4QztBQUU5Qyw2REFBa0Q7QUFHbEQsTUFBYSx1QkFBdUI7SUFNaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUEwTjtRQUNyTyxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBTUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUF5TjtRQUNuTyxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQzthQUNmO1lB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