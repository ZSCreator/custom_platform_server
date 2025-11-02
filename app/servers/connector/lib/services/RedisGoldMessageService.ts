import { EntryHandler } from "../../handler/entryHandler";
import { RedisMessageEnum } from "../../../../common/constant/hall/RedisMessageEnum";
import { receiveRedisGoldMessage } from "../../../../common/event/redisGoldEvent";
import { createRedisConnection } from "../../../../services/databaseService";
import IORedis = require("ioredis");

export class RedisGoldMessageService {
    private handler: EntryHandler;
    private conn: IORedis.Redis = null;
    private hadSubscribed: boolean = false;

    constructor(handler: EntryHandler) {
        this.handler = handler;
    }

    /**
     * 订阅消息推送
     */
    public async subMessageChannel() {

        /** 是否创建Redis连接 */
        if (!this.conn) {
            this.conn = await createRedisConnection();

            this.conn.on("message", receiveRedisGoldMessage);
        }

        if (!this.hadSubscribed) {
            this.hadSubscribed = true;

            const channelName = `${RedisMessageEnum.GameGoldUpdate}`;

            this.conn.subscribe(channelName);

            this.handler.logger.info(`${this.handler.loggerPreStr} | 订阅消息通道 ${channelName} | 成功`);
        }

        return false;
    }
}
