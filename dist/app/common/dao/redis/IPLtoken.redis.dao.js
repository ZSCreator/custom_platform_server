"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPLtokenRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class IPLtokenRedisDao {
    async findOne() {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const token = await conn.get(RedisDict_1.DB2.IPL_token);
            return !!token ? token : null;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(token) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.set(RedisDict_1.DB2.IPL_token, token);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.IPLtokenRedisDao = IPLtokenRedisDao;
exports.default = new IPLtokenRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBMdG9rZW4ucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvSVBMdG9rZW4ucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUMvQyxvREFBOEM7QUFDOUMsNkRBQWtEO0FBRWxELE1BQWEsZ0JBQWdCO0lBQ3pCLEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDakM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFhO1FBQ3pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBRUEsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUF0QkQsNENBc0JDO0FBRUQsa0JBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=