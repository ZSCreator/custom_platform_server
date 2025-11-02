import OnlinePlayerDao from "../../dao/redis/OnlinePlayer.redis.dao";
import * as GameDishRoadDao from "../../dao/redis/GameDishRoadDao";
import { pinus, Logger } from "pinus";
import { getLogger } from "pinus-logger";
import { IOnlineGameHash } from "../../pojo/dao/IOnlineGameHash";
import { RedisMessageEnum } from "../../constant/hall/RedisMessageEnum";
import { GameNidEnum } from "../../constant/game/GameNidEnum";
import utils = require('../../../utils');

export class RedisMessageFactory {

    private onlinePlayerList: Array<IOnlineGameHash> = [];

    private serverId: string;

    private logger: Logger;

    private channelName: string;
    private nid: string;
    constructor(nid: string, channelName: string) {
        this.logger = getLogger('server_out', __filename);

        this.serverId = pinus.app.getServerId();
        this.channelName = channelName;
        this.nid = nid;
    }

    public async getNeedMessagePlayer() {
        const realPlayerServerInfolist = await OnlinePlayerDao.findList();

        /**
         * 取出复合条件的在线玩家
         * ① sceneId roomId 表玩家所处位置
         * ② hallServerId   表玩家所属大厅服务器，以免重复推送
         */
        this.onlinePlayerList = realPlayerServerInfolist
            .filter(({ sceneId, roomId, hallServerId, nid }) =>
                (sceneId === -1 || sceneId === undefined) && (roomId === "-1" || roomId === undefined ) && hallServerId === this.serverId && nid === this.nid );
        return this;
    }

    public sendMessage(msg: string = "") {
        if (this.onlinePlayerList.length === 0) {
            this.logger.info(`${this.serverId} | redisMessage | 频道 ${this.channelName} | 没有需要发送的玩家`);
            return true;
        }

        for (const { uid, frontendServerId } of this.onlinePlayerList) {
            switch (this.channelName) {
                /** baijia */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.baijia}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.baijia}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** bairen */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.bairen}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.bairen}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /**BenzBmw */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.BenzBmw}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.BenzBmw}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** SicBo */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.SicBo}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.SicBo}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** 龙虎 */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.DragonTiger}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.DragonTiger}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** 红黑 */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.RedBlack}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.RedBlack}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** 万人金花 */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.WanRenJH}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.WanRenJH}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** 渔场大亨 */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.fishery}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.fishery}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** bairenTTZ */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.bairenTTZ}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.bairenTTZ}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                /** up7down */
                case `${RedisMessageEnum.GameDishRoadChannel}:${GameNidEnum.up7down}`:
                    pinus.app.channelService.pushMessageByUids(`${GameNidEnum.up7down}_redisHistory`, JSON.parse(msg), [{ uid, sid: frontendServerId }]);
                    break;
                default:
                    throw new Error(`${this.serverId} | redisMessage | 频道 ${this.channelName} | 没有实现对应的消息推送逻辑`);
            }
        }
    }
}
