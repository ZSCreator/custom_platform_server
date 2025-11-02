import {RedisDB} from "./config/DBCfg.enum";
import {DB2} from "../../constant/RedisDict";
import redisManager from "./lib/BaseRedisManager";

/**
 * 改变金币
 * @date 2021/8/9
 */

export class ChangePlayerMoneyRedisDao {
    /**
     * 玩家加入上下分队列集合
     * @param agent 代理
     * @param account 第三方账号
     */
    public async changePlayerMoneySAdd(agent: string, account: string): Promise<boolean> {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);
            const res = await conn.sadd(`${DB2.ChangePlayerMoney}:${agent}:${account}`, account);

            if (res === 1) {
                await conn.expire(`${DB2.ChangePlayerMoney}:${agent}:${account}`, 30);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error(`Redis | DB2 | 判断玩家 agent: ${agent}, account: ${account} 是否存在下分任务队列出错: ${e.stack}`);
            return false;
        }
    }


    /**
     * 删除key
     * @param agent
     * @param account
     */
    public async del(agent: string, account: string) {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            await conn.del(`${DB2.ChangePlayerMoney}:${agent}:${account}`);

            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 删除玩家 agent: ${agent}, account: ${account}  下分任务队列出错: ${e.stack}`);
            return false;
        }
    }

}

export default new ChangePlayerMoneyRedisDao();
