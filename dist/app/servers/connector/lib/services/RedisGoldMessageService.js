"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisGoldMessageService = void 0;
const RedisMessageEnum_1 = require("../../../../common/constant/hall/RedisMessageEnum");
const redisGoldEvent_1 = require("../../../../common/event/redisGoldEvent");
const databaseService_1 = require("../../../../services/databaseService");
class RedisGoldMessageService {
    constructor(handler) {
        this.conn = null;
        this.hadSubscribed = false;
        this.handler = handler;
    }
    async subMessageChannel() {
        if (!this.conn) {
            this.conn = await (0, databaseService_1.createRedisConnection)();
            this.conn.on("message", redisGoldEvent_1.receiveRedisGoldMessage);
        }
        if (!this.hadSubscribed) {
            this.hadSubscribed = true;
            const channelName = `${RedisMessageEnum_1.RedisMessageEnum.GameGoldUpdate}`;
            this.conn.subscribe(channelName);
            this.handler.logger.info(`${this.handler.loggerPreStr} | 订阅消息通道 ${channelName} | 成功`);
        }
        return false;
    }
}
exports.RedisGoldMessageService = RedisGoldMessageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkaXNHb2xkTWVzc2FnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb25uZWN0b3IvbGliL3NlcnZpY2VzL1JlZGlzR29sZE1lc3NhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdGQUFxRjtBQUNyRiw0RUFBa0Y7QUFDbEYsMEVBQTZFO0FBRzdFLE1BQWEsdUJBQXVCO0lBS2hDLFlBQVksT0FBcUI7UUFIekIsU0FBSSxHQUFrQixJQUFJLENBQUM7UUFDM0Isa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFHbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUtNLEtBQUssQ0FBQyxpQkFBaUI7UUFHMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sSUFBQSx1Q0FBcUIsR0FBRSxDQUFDO1lBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSx3Q0FBdUIsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFMUIsTUFBTSxXQUFXLEdBQUcsR0FBRyxtQ0FBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV6RCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksYUFBYSxXQUFXLE9BQU8sQ0FBQyxDQUFDO1NBQ3pGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBakNELDBEQWlDQyJ9