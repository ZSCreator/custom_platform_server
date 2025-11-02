import { RedisDB } from "./config/DBCfg.enum";
import { DB2 } from "../../constant/RedisDict";

import redisManager from "./lib/BaseRedisManager";

export class RobotLeaveTaskQueue {

    async increaseRobot(uid: string) {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);

            await conn.rpush(DB2.RobotLeaveTaskQueue, uid);
            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 添加机器人 ${uid} 离开任务队列出错: ${e.stack}`);
            return false;
        }
    }

    async findAllAndRemove() {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);
            const len = await conn.llen(DB2.RobotLeaveTaskQueue);

            if (len === 0) {
                return [];
            }
            
            // redis 批量操作集群
            const pipeline = conn.pipeline();

            for (let i = 0; i < len; i++) {
                pipeline.lpop(DB2.RobotLeaveTaskQueue);
            }

            const uidListResult = await pipeline.exec();
            // 清洗查询结果
            const list = uidListResult.reduce((list, result) => {
                const [err, info] = result;

                if (err) {
                    return list;
                }

                list.push(info);

                return list;
            }, []);

            return list;
        } catch (e) {
            console.error(`Redis | DB2 | 获取所有待离开机器人信息出错: ${e.stack}`);
            return [];
        }
    }

    async clearBoforeInit() {
        try {
            const conn = await redisManager.getConnection(RedisDB.RuntimeData);
            await conn.del(DB2.RobotLeaveTaskQueue);
            console.info(`Redis | DB2 | 初始化机器人离开任务队列字段`);
            return true;
        } catch (e) {
            console.error(`Redis | DB2 | 初始化机器人离开任务队列出错: ${e.stack}`);
            return false;
        }
    }
}

export default new RobotLeaveTaskQueue();
