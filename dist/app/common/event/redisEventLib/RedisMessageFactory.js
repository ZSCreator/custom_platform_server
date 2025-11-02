"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMessageFactory = void 0;
const OnlinePlayer_redis_dao_1 = require("../../dao/redis/OnlinePlayer.redis.dao");
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const RedisMessageEnum_1 = require("../../constant/hall/RedisMessageEnum");
const GameNidEnum_1 = require("../../constant/game/GameNidEnum");
class RedisMessageFactory {
    constructor(nid, channelName) {
        this.onlinePlayerList = [];
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.serverId = pinus_1.pinus.app.getServerId();
        this.channelName = channelName;
        this.nid = nid;
    }
    async getNeedMessagePlayer() {
        const realPlayerServerInfolist = await OnlinePlayer_redis_dao_1.default.findList();
        this.onlinePlayerList = realPlayerServerInfolist
            .filter(({ sceneId, roomId, hallServerId, nid }) => (sceneId === -1 || sceneId === undefined) && (roomId === "-1" || roomId === undefined) && hallServerId === this.serverId && nid === this.nid);
        return this;
    }
    sendMessage(msg = "") {
        if (this.onlinePlayerList.length === 0) {
            this.logger.info(`${this.serverId} | redisMessage | 频道 ${this.channelName} | 没有需要发送的玩家`);
            return true;
        }
        for (const { uid, frontendServerId } of this.onlinePlayerList) {
            switch (this.channelName) {
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.baijia}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.baijia}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.bairen}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.bairen}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.BenzBmw}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.BenzBmw}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.SicBo}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.SicBo}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.DragonTiger}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.DragonTiger}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.RedBlack}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.RedBlack}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.WanRenJH}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.WanRenJH}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.fishery}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.fishery}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.bairenTTZ}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.bairenTTZ}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                case `${RedisMessageEnum_1.RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum_1.GameNidEnum.up7down}`:
                    pinus_1.pinus.app.channelService.pushMessageByUids(`${GameNidEnum_1.GameNidEnum.up7down}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                default:
                    throw new Error(`${this.serverId} | redisMessage | 频道 ${this.channelName} | 没有实现对应的消息推送逻辑`);
            }
        }
    }
}
exports.RedisMessageFactory = RedisMessageFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkaXNNZXNzYWdlRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZXZlbnQvcmVkaXNFdmVudExpYi9SZWRpc01lc3NhZ2VGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1GQUFxRTtBQUVyRSxpQ0FBc0M7QUFDdEMsK0NBQXlDO0FBRXpDLDJFQUF3RTtBQUN4RSxpRUFBOEQ7QUFHOUQsTUFBYSxtQkFBbUI7SUFVNUIsWUFBWSxHQUFXLEVBQUUsV0FBbUI7UUFScEMscUJBQWdCLEdBQTJCLEVBQUUsQ0FBQztRQVNsRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFFTSxLQUFLLENBQUMsb0JBQW9CO1FBQzdCLE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxnQ0FBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBT2xFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyx3QkFBd0I7YUFDM0MsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQy9DLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLE9BQU8sS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksTUFBTSxLQUFLLFNBQVMsQ0FBRSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFFLENBQUM7UUFDeEosT0FBTyxJQUFJLENB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