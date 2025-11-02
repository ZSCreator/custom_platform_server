"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRedisManager = void 0;
const IORedis = require("ioredis");
const DBCfg_enum_1 = require("../config/DBCfg.enum");
const redisCfg = require("../../../../../config/db/redis.json");
class RedisConnectionManager {
    async connect(targetDataBase) {
        const { password } = redisCfg, rest = __rest(redisCfg, ["password"]);
        const redisConnectionConfig = Object.assign({}, rest);
        if (password && password.length > 0) {
            redisConnectionConfig["password"] = password;
        }
        const client = new IORedis(redisConnectionConfig);
        client.on("error", e => {
            console.error(`Redis | connection | 分库编号 ${targetDataBase} | 出错: ${e.stack}`);
        });
        client.on("connect", () => {
            console.log(`Redis | connection | 分库编号 ${targetDataBase} | 链接成功`);
        });
        await client.select(targetDataBase);
        RedisConnectionManager.connectionMaps.set(targetDataBase, client);
        return client;
    }
    async getConnection(targetDabeBase = DBCfg_enum_1.RedisDB.Persistence_DB) {
        if (RedisConnectionManager.connectionMaps.has(targetDabeBase)) {
            return RedisConnectionManager.connectionMaps.get(targetDabeBase);
        }
        return await this.connect(targetDabeBase);
    }
    closeConnections() {
        for (let conn of RedisConnectionManager.connectionMaps.values()) {
            conn.disconnect();
        }
    }
}
RedisConnectionManager.connectionMaps = new Map();
class BaseRedisManager {
    constructor() {
        this.mng = new RedisConnectionManager();
    }
    async getConnection(idx = DBCfg_enum_1.RedisDB.Persistence_DB) {
        return this.mng.getConnection(idx);
    }
    closeConnection() {
        this.mng.closeConnections();
    }
}
exports.BaseRedisManager = BaseRedisManager;
exports.default = new BaseRedisManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJlZGlzTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2xpYi9CYXNlUmVkaXNNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQW1DO0FBQ25DLHFEQUErQztBQUUvQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUtoRSxNQUFNLHNCQUFzQjtJQUdoQixLQUFLLENBQUMsT0FBTyxDQUFDLGNBQXVCO1FBQ3pDLE1BQU0sRUFBRSxRQUFRLEtBQWMsUUFBUSxFQUFqQixJQUFJLFVBQUssUUFBUSxFQUFoQyxZQUFxQixDQUFXLENBQUM7UUFFdkMsTUFBTSxxQkFBcUIscUJBQVEsSUFBSSxDQUFFLENBQUM7UUFFMUMsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakMscUJBQXFCLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO1NBQ2hEO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUVsRCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixjQUFjLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7WUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsY0FBYyxTQUFTLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUdILE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVwQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVsRSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxpQkFBMEIsb0JBQU8sQ0FBQyxjQUFjO1FBQ3ZFLElBQUksc0JBQXNCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMzRCxPQUFPLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDcEU7UUFFRCxPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBS00sZ0JBQWdCO1FBQ25CLEtBQUssSUFBSSxJQUFJLElBQUksc0JBQXNCLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtJQUNMLENBQUM7O0FBNUNjLHFDQUFjLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUM7QUFvRTNFLE1BQWEsZ0JBQWdCO0lBTXpCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBZSxvQkFBTyxDQUFDLGNBQWM7UUFDNUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUd2QyxDQUFDO0lBRUQsZUFBZTtRQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0NBS0o7QUF2QkQsNENBdUJDO0FBRUQsa0JBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=