"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = require("../../../../services/databaseService");
const DBCfg_enum_1 = require("../config/DBCfg.enum");
async function redisConnect(db = DBCfg_enum_1.RedisDB.Persistence_DB) {
    const redisClient = await (0, databaseService_1.getRedisClient)();
    if (!redisClient) {
        throw new Error('redis 客户端未连接');
    }
    await redisClient.select(db);
    return redisClient;
}
exports.default = redisConnect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvbGliL3JlZGlzQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBFQUFzRTtBQUV0RSxxREFBK0M7QUFFaEMsS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUFjLG9CQUFPLENBQUMsY0FBYztJQUMzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsZ0NBQWMsR0FBRSxDQUFDO0lBQzNDLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFQRCwrQkFPQyJ9