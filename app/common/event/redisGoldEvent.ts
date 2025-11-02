import { pinus } from "pinus";
import { getLogger } from "pinus-logger";
import { RedisMessageEnum } from "../constant/hall/RedisMessageEnum";
import PlayerManagerDao from "../../common/dao/daoManager/Player.manager";
import redisConnection from "../dao/redis/lib/redisConnection";
import { pushMessageByUids } from "../../services/MessageService";
import OnlinePlayerRedisDao from "../dao/redis/OnlinePlayer.redis.dao";

const logger = getLogger('server_out', __filename);

/**
 * 接受金币更新消息
 * @param channelName 通道名称
 * @param msg 消息内容
 */
export async function receiveRedisGoldMessage(channelName: string, msg: string) {
    const serverId = pinus.app.getServerId();
    try {

        if (msg.length === 0) {
            logger.warn(`${serverId} | redisMessage | 频道 ${channelName} | 推送异常: 消息不宜为空`);
            return;
        }

        const { uid } = JSON.parse(msg);

        const onlinePlayer = await OnlinePlayerRedisDao.findOne({ uid });

        if (!onlinePlayer) {
            return;
        }

        if (!!onlinePlayer.frontendServerId && onlinePlayer.frontendServerId !== pinus.app.getServerId()) {
            return;
        }


        logger.warn(`${serverId} | redisMessage | onlinePlayer ${onlinePlayer} | frontendServerId ${onlinePlayer.frontendServerId}`);

        const p = await PlayerManagerDao.findOne({ uid });

        logger.warn(`${serverId} | 金币推送 | 接收 | redisMessage | 频道 ${channelName} | uid:${uid}`);

        // TODO 这里frontendServerId 可能为undefined 至于原因暂时不明
        pushMessageByUids("updateGold", {
            gold: p.gold,
            walletGold: p.walletGold,
            addRmb: p.addRmb || 0
        }, {
            uid: p.uid,
            sid: onlinePlayer.frontendServerId
        })

    } catch (e) {
        logger.error(`${serverId} | redisMessage | 频道 ${channelName} | 推送出错:${e.stack}`);
    }
}

/**
 * 发送金币更新消息
 * @param msg 消息内容
 */
export async function sendRedisGoldMessage(msg: any) {
    const channelName = `${RedisMessageEnum.GameGoldUpdate}`;

    if (!msg) {
        logger.warn(`${pinus.app.getServerId()} | redisMessage | 频道 ${channelName} | 推送异常: 消息不宜为空`);
    }

    try {
        const conn = await redisConnection();
        await conn.publish(channelName, JSON.stringify(msg));
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | redisMessage | 频道 ${channelName} | 推送出错:${e.stack}`);
    }
}