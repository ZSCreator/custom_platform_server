import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";
import * as moment from "moment";

/**
 * @name 清码
 * @description Set
 */
export class RestPlayerRedisDao {

    public async inertOne(uid: string) {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            // 插入当前时间戳
            await conn.hset(DB2.RestPlayerTaskQueue, uid, moment().valueOf());
            // 统计
            await this.increaseCount();

            return true;
        } catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 插入在线玩家 uid ${uid} 出错: ${e.stack}`);
            return false;
        }
    }

    public async delByUid(uid: string) {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            // 删除
            await conn.hdel(DB2.RestPlayerTaskQueue, uid);
            
            // 统计
            await this.decreaseCount();

            return true;
        } catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 删除在线玩家 uid ${uid} 出错: ${e.stack}`);
            return false;
        }
    }

    public async exitsByUid(uid: string) {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            const res = await conn.hexists(DB2.RestPlayerTaskQueue, uid);

            return !!res;
        } catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 判断指定字段 ${uid} 是否存在出错: ${e.stack}`);
            return false;
        }
    }

    /**
     * 增加
     * @description 统计
     */
    private async increaseCount() {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            const res = await this.exitsByUid("count");

            if (res) {
                await conn.hincrby(DB2.RestPlayerTaskQueue, "count", 1);
                return true;
            }

            await conn.hset(DB2.RestPlayerTaskQueue, "count", 1);
            return true;
        } catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 新增统计数字出错: ${e.stack}`);
            return false;
        }
    }

    /**
     * 减少
     * @description 统计
     */
    private async decreaseCount() {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            const res = await this.exitsByUid("count");

            if (res) {
                await conn.hincrby(DB2.RestPlayerTaskQueue, "count", -1);
                return true;
            }

            await conn.hset(DB2.RestPlayerTaskQueue, "count", 0);
            return true;
        } catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 减少统计数字出错: ${e.stack}`);
            return false;
        }
    }

}

export default new RestPlayerRedisDao();
