"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedisDict = require("../../constant/RedisDict");
const redisConnection_1 = require("./lib/redisConnection");
class IsolationRoomPoolRedisDao {
    async increaseByRootUidAndParantUid(rootUid, parantUid, serverId) {
        try {
            await (await (0, redisConnection_1.default)()).incr(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);
        }
        catch (e) {
            console.error(e.stack);
        }
    }
    async decreaseByRootUidAndParantUid(rootUid, parantUid, serverId) {
        try {
            await (await (0, redisConnection_1.default)()).decr(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);
        }
        catch (e) {
            console.error(e.stack);
        }
    }
    async findOneByRootUidAndParantUid(rootUid, parantUid, serverId) {
        try {
            const num = await (await (0, redisConnection_1.default)()).get(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);
            return !!num ? Number(num) : 0;
        }
        catch (e) {
            console.error(e.stack);
            return 0;
        }
    }
    async reset() {
        const conn = await (0, redisConnection_1.default)();
        const l = await conn.keys(`${RedisDict.DB1.IsolationRoomPool}*`);
        if (l.length != 0) {
            await conn.del(...l);
        }
    }
}
exports.default = new IsolationRoomPoolRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXNvbGF0aW9uUm9vbVBvb2wucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvSXNvbGF0aW9uUm9vbVBvb2wucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0RBQXNEO0FBQ3RELDJEQUFtRDtBQUVuRCxNQUFNLHlCQUF5QjtJQUkzQixLQUFLLENBQUMsNkJBQTZCLENBQUMsT0FBZSxFQUFFLFNBQWlCLEVBQUUsUUFBZ0I7UUFDcEYsSUFBSTtZQUNBLE1BQU0sQ0FBQyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDakg7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUtELEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxPQUFlLEVBQUUsU0FBaUIsRUFBRSxRQUFnQjtRQUNwRixJQUFJO1lBR0ksTUFBTSxDQUFDLE1BQU0sSUFBQSx5QkFBYyxHQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQztTQUlySDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLDRCQUE0QixDQUFDLE9BQWUsRUFBRSxTQUFpQixFQUFFLFFBQWdCO1FBQ25GLElBQUk7WUFDQSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksUUFBUSxJQUFJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRXpILE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFDUCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDZixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN4QjtJQUVMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUkseUJBQXlCLEVBQUUsQ0FBQyJ9