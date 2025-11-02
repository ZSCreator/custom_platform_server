"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareTenantRoomSituationRedisDao = void 0;
const ramda_1 = require("ramda");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ShareTenantRoomSituationRedisDao {
    async findAll() {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        if (!conn) {
            return false;
        }
        try {
            const result = await conn.hgetall(RedisDict_1.DB2.SHARE_TENANT_ROOM_SITUATION_KEY);
            (0, ramda_1.keys)(result).forEach(k => {
                result[k] = JSON.parse(result[k]);
            });
            return result;
        }
        catch (e) {
            console.error(`Redis | DB2 | 获取所有运行租户组、闲置租户组、内存、空闲房间号信息出错: ${e.stack}`);
            return false;
        }
    }
    async insertOne(nid, parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (!conn) {
                return false;
            }
            await conn.hset(RedisDict_1.DB2.SHARE_TENANT_ROOM_SITUATION_KEY, nid, parameter);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB2 | 插入运行租户组、闲置租户组、内存、空闲房间号信息出错: ${e.stack}`);
            return false;
        }
    }
}
exports.ShareTenantRoomSituationRedisDao = ShareTenantRoomSituationRedisDao;
exports.default = new ShareTenantRoomSituationRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcmVUZW5hbnRSb29tU2l0dWF0aW9uLnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1NoYXJlVGVuYW50Um9vbVNpdHVhdGlvbi5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQTZCO0FBQzdCLHdEQUErQztBQUMvQyxvREFBOEM7QUFDOUMsNkRBQWtEO0FBRWxELE1BQWEsZ0NBQWdDO0lBRXpDLEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELElBQUk7WUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDdkUsSUFBQSxZQUFJLEVBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN4RSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQVcsRUFBRSxTQUFTO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRSxJQUFJO1lBQ0EsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFHLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXJFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBcENELDRFQW9DQztBQUVELGtCQUFlLElBQUksZ0NBQWdDLEVBQUUsQ0FBQyJ9