import { DB1 } from "../../constant/RedisDict";
import { getLogger } from 'pinus-logger';
const logger = getLogger('server_out', __filename);
import * as redisManager from "./lib/redisManager";

export async function findWarnGoldCfg() {
    try {
        const cfg = await redisManager.getFromHashTable(DB1.warnGoldConfig, "config")

        return cfg ? cfg : [];
    } catch (e) {
        logger.error(`第三方接口 | 查询预警金币配置项出错: ${e.stack}`)
        return [];
    }
}

export async function updateWarnGoldCfg(data) {
    try {
        await redisManager.storeFieldIntoHashTable(DB1.warnGoldConfig, "config", data);

        return true;
    } catch (e) {
        logger.error(`第三方接口 | 修改预警金币配置项出错: ${e.stack}`);

        return false;
    }
}
