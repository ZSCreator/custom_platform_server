"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePlayerMoneyRedisDao = void 0;
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const RedisDict_1 = require("../../constant/RedisDict");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ChangePlayerMoneyRedisDao {
    async changePlayerMoneySAdd(agent, account) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            const res = await conn.sadd(`${RedisDict_1.DB2.ChangePlayerMoney}:${agent}:${account}`, account);
            if (res === 1) {
                await conn.expire(`${RedisDict_1.DB2.ChangePlayerMoney}:${agent}:${account}`, 30);
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            console.error(`Redis | DB2 | 判断玩家 agent: ${agent}, account: ${account} 是否存在下分任务队列出错: ${e.stack}`);
            return false;
        }
    }
    async del(agent, account) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            await conn.del(`${RedisDict_1.DB2.ChangePlayerMoney}:${agent}:${account}`);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB2 | 删除玩家 agent: ${agent}, account: ${account}  下分任务队列出错: ${e.stack}`);
            return false;
        }
    }
}
exports.ChangePlayerMoneyRedisDao = ChangePlayerMoneyRedisDao;
exports.default = new ChangePlayerMoneyRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGxheWVyTW9uZXkucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvY2hhbmdlUGxheWVyTW9uZXkucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9EQUE0QztBQUM1Qyx3REFBNkM7QUFDN0MsNkRBQWtEO0FBT2xELE1BQWEseUJBQXlCO0lBTTNCLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUM3RCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFckYsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0gsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsS0FBSyxjQUFjLE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2xHLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQVFNLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWU7UUFDM0MsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVuRSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMsaUJBQWlCLElBQUksS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFL0QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsS0FBSyxjQUFjLE9BQU8sZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvRixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQTFDRCw4REEwQ0M7QUFFRCxrQkFBZSxJQUFJLHlCQUF5QixFQUFFLENBQUMifQ==