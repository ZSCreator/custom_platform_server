"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRedisGoldMessage = exports.receiveRedisGoldMessage = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const RedisMessageEnum_1 = require("../constant/hall/RedisMessageEnum");
const Player_manager_1 = require("../../common/dao/daoManager/Player.manager");
const redisConnection_1 = require("../dao/redis/lib/redisConnection");
const MessageService_1 = require("../../services/MessageService");
const OnlinePlayer_redis_dao_1 = require("../dao/redis/OnlinePlayer.redis.dao");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function receiveRedisGoldMessage(channelName, msg) {
    const serverId = pinus_1.pinus.app.getServerId();
    try {
        if (msg.length === 0) {
            logger.warn(`${serverId} | redisMessage | 频道 ${channelName} | 推送异常: 消息不宜为空`);
            return;
        }
        const { uid } = JSON.parse(msg);
        const onlinePlayer = await OnlinePlayer_redis_dao_1.default.findOne({ uid });
        if (!onlinePlayer) {
            return;
        }
        if (!!onlinePlayer.frontendServerId && onlinePlayer.frontendServerId !== pinus_1.pinus.app.getServerId()) {
            return;
        }
        logger.warn(`${serverId} | redisMessage | onlinePlayer ${onlinePlayer} | frontendServerId ${onlinePlayer.frontendServerId}`);
        const p = await Player_manager_1.default.findOne({ uid });
        logger.warn(`${serverId} | 金币推送 | 接收 | redisMessage | 频道 ${channelName} | uid:${uid}`);
        (0, MessageService_1.pushMessageByUids)("updateGold", {
            gold: p.gold,
            walletGold: p.walletGold,
            addRmb: p.addRmb || 0
        }, {
            uid: p.uid,
            sid: onlinePlayer.frontendServerId
        });
    }
    catch (e) {
        logger.error(`${serverId} | redisMessage | 频道 ${channelName} | 推送出错:${e.stack}`);
    }
}
exports.receiveRedisGoldMessage = receiveRedisGoldMessage;
async function sendRedisGoldMessage(msg) {
    const channelName = `${RedisMessageEnum_1.RedisMessageEnum.GameGoldUpdate}`;
    if (!msg) {
        logger.warn(`${pinus_1.pinus.app.getServerId()} | redisMessage | 频道 ${channelName} | 推送异常: 消息不宜为空`);
    }
    try {
        const conn = await (0, redisConnection_1.default)();
        await conn.publish(channelName, JSON.stringify(msg));
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | redisMessage | 频道 ${channelName} | 推送出错:${e.stack}`);
    }
}
exports.sendRedisGoldMessage = sendRedisGoldMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNHb2xkRXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvY29tbW9uL2V2ZW50L3JlZGlzR29sZEV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE4QjtBQUM5QiwrQ0FBeUM7QUFDekMsd0VBQXFFO0FBQ3JFLCtFQUEwRTtBQUMxRSxzRUFBK0Q7QUFDL0Qsa0VBQWtFO0FBQ2xFLGdGQUF1RTtBQUV2RSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBTzVDLEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxXQUFtQixFQUFFLEdBQVc7SUFDMUUsTUFBTSxRQUFRLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxJQUFJO1FBRUEsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSx3QkFBd0IsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdFLE9BQU87U0FDVjtRQUVELE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhDLE1BQU0sWUFBWSxHQUFHLE1BQU0sZ0NBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLGdCQUFnQixJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsS0FBSyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzlGLE9BQU87U0FDVjtRQUdELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLGtDQUFrQyxZQUFZLHVCQUF1QixZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBRTdILE1BQU0sQ0FBQyxHQUFHLE1BQU0sd0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxvQ0FBb0MsV0FBVyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFHdkYsSUFBQSxrQ0FBaUIsRUFBQyxZQUFZLEVBQUU7WUFDNUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1lBQ1osVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVO1lBQ3hCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7U0FDeEIsRUFBRTtZQUNDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztZQUNWLEdBQUcsRUFBRSxZQUFZLENBQUMsZ0JBQWdCO1NBQ3JDLENBQUMsQ0FBQTtLQUVMO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSx3QkFBd0IsV0FBVyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3BGO0FBQ0wsQ0FBQztBQXpDRCwwREF5Q0M7QUFNTSxLQUFLLFVBQVUsb0JBQW9CLENBQUMsR0FBUTtJQUMvQyxNQUFNLFdBQVcsR0FBRyxHQUFHLG1DQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXpELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsd0JBQXdCLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztLQUMvRjtJQUVELElBQUk7UUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQWUsR0FBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3hEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsd0JBQXdCLFdBQVcsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNuRztBQUNMLENBQUM7QUFiRCxvREFhQyJ9