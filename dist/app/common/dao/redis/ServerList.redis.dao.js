"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerListRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const redisConnection_1 = require("./lib/redisConnection");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ServerListRedisDao {
    async findList(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${RedisDict_1.DB1.ServerList}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        }
        catch (e) {
            console.error(`Redis | DB1 | 查询服务器列表: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${RedisDict_1.DB1.ServerList}`, parameter.serverName);
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB1 | 查询服务器列表出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            const data = await this.findOne({ serverName: parameter.serverName });
            await conn.hset(RedisDict_1.DB1.ServerList, parameter.serverName, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 修改服务器列表出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            await conn.hset(RedisDict_1.DB1.ServerList, parameter.serverName, JSON.stringify(parameter));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 插入服务器列表出错: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            await conn.hdel(RedisDict_1.DB1.ServerList, parameter.serverName);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除服务器列表信息: ${e.stack}`);
            return null;
        }
    }
}
exports.ServerListRedisDao = ServerListRedisDao;
exports.default = new ServerListRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyTGlzdC5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9TZXJ2ZXJMaXN0LnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBNkM7QUFDN0Msb0RBQThDO0FBRTlDLDJEQUFpRDtBQUVqRCw2REFBa0Q7QUFFbEQsTUFBYSxrQkFBa0I7SUFFM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUF3RDtRQUNuRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQVksRUFBQyxvQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxlQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZCxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBd0Q7UUFDbEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEVBQUMsb0JBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4RCxJQUFJO1lBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxNQUFN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