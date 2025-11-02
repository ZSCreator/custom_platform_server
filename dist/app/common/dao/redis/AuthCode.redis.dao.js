"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCodeRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const AuthCode_entity_1 = require("./entity/AuthCode.entity");
const redisConnection_1 = require("./lib/redisConnection");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class AuthCodeRedisDao {
    async findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const AuthCodeStr = await conn.get(`${RedisDict_1.DB2.AUTH_CODE}:${parameter.phone}`);
            return !!AuthCodeStr ? JSON.parse(AuthCodeStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 查询短信验证码出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 5 * 60;
            const AuthCodeStr = await conn.get(`${RedisDict_1.DB2.AUTH_CODE}:${parameter.phone}`);
            await conn.setex(`${RedisDict_1.DB2.AUTH_CODE}:${parameter.phone}`, seconds, JSON.stringify(new AuthCode_entity_1.AuthCodeInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 修改短信验证码出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 5 * 60;
            await conn.setex(`${RedisDict_1.DB2.AUTH_CODE}:${parameter.phone}`, seconds, JSON.stringify(parameter));
            return seconds;
        }
        catch (e) {
            console.error(`Redis | DB2 | 插入游短信验证码出错: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.del(`${RedisDict_1.DB2.AUTH_CODE}:${parameter.phone}`);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB1 | 删除真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }
}
exports.AuthCodeRedisDao = AuthCodeRedisDao;
exports.default = new AuthCodeRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aENvZGUucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvQXV0aENvZGUucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUMvQyxvREFBOEM7QUFDOUMsOERBQTJEO0FBQzNELDJEQUFpRDtBQUdqRCw2REFBa0Q7QUFFbEQsTUFBYSxnQkFBZ0I7SUFFekIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFzRjtRQUNqRyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBc0Y7UUFDaEcsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEVBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxRSxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUN6RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXNGLEVBQUUsYUFBMEY7UUFDOUwsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEVBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJO1lBQ0EsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN2QixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUcsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksaUNBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0osT0FBTyxDQUFDLENBQUM7U0FDWjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXNGO1FBQ2xHLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxFQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsSUFBSTtZQUNBLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1RixPQUFPLE9BQU8sQ0FBQztTQUNsQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQStCO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBRUEsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztDQUVKO0FBckRELDRDQXFEQztBQUVELGtCQUFlLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyJ9