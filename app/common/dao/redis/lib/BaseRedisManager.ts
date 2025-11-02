import * as IORedis from "ioredis";
import { RedisDB } from "../config/DBCfg.enum";

const redisCfg = require("../../../../../config/db/redis.json");

/**
 * Redis 连接管理器
 */
class RedisConnectionManager {
    private static connectionMaps: Map<RedisDB, IORedis.Redis> = new Map();

    private async connect(targetDataBase: RedisDB) {
        const { password, ...rest } = redisCfg;

        const redisConnectionConfig = { ...rest };

        if (password && password.length > 0) {
            redisConnectionConfig["password"] = password;
        }

        const client = new IORedis(redisConnectionConfig);

        client.on("error", e => {
            console.error(`Redis | connection | 分库编号 ${targetDataBase} | 出错: ${e.stack}`);
        });

        client.on("connect", () => {
            console.log(`Redis | connection | 分库编号 ${targetDataBase} | 链接成功`);
        });


        await client.select(targetDataBase);

        RedisConnectionManager.connectionMaps.set(targetDataBase, client);

        return client;
    }

    public async getConnection(targetDabeBase: RedisDB = RedisDB.Persistence_DB) {
        if (RedisConnectionManager.connectionMaps.has(targetDabeBase)) {
            return RedisConnectionManager.connectionMaps.get(targetDabeBase);
        }

        return await this.connect(targetDabeBase);
    }

    /**
     * 关闭连接
     */
    public closeConnections() {
        for (let conn of RedisConnectionManager.connectionMaps.values()) {
            conn.disconnect();
        }
    }
    }

/**
 * Hash 散列
 */
/* class HashPipelineDao {

    private mng: RedisConnectionManager;

    constructor() {
        this.mng = new RedisConnectionManager();
    }

    public async init(targetDabeBase: DB_Index) {
        const conn = await this.mng.getConnection(targetDabeBase);
        const pipeline = conn.pipeline()
        return this;
    }
} */

/**
 * 业务调用Api
 */
export class BaseRedisManager {

    private mng: RedisConnectionManager;

    // private pipline: IORedis.Pipeline | null = null;

    constructor() {
        this.mng = new RedisConnectionManager();
    }

    public async getConnection(idx: RedisDB = RedisDB.Persistence_DB) {
        return this.mng.getConnection(idx);
        // if (idx === DatabaseDepots.DB1) {
        // }
    }

    closeConnection() {
        this.mng.closeConnections();
    }

    // public done() {

    // }
}

export default new BaseRedisManager();
