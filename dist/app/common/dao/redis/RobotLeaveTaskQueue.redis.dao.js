"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotLeaveTaskQueue = void 0;
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const RedisDict_1 = require("../../constant/RedisDict");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class RobotLeaveTaskQueue {
    async increaseRobot(uid) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            await conn.rpush(RedisDict_1.DB2.RobotLeaveTaskQueue, uid);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB2 | 添加机器人 ${uid} 离开任务队列出错: ${e.stack}`);
            return false;
        }
    }
    async findAllAndRemove() {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            const len = await conn.llen(RedisDict_1.DB2.RobotLeaveTaskQueue);
            if (len === 0) {
                return [];
            }
            const pipeline = conn.pipeline();
            for (let i = 0; i < len; i++) {
                pipeline.lpop(RedisDict_1.DB2.RobotLeaveTaskQueue);
            }
            const uidListResult = await pipeline.exec();
            const list = uidListResult.reduce((list, result) => {
                const [err, info] = result;
                if (err) {
                    return list;
                }
                list.push(info);
                return list;
            }, []);
            return list;
        }
        catch (e) {
            console.error(`Redis | DB2 | 获取所有待离开机器人信息出错: ${e.stack}`);
            return [];
        }
    }
    async clearBoforeInit() {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            await conn.del(RedisDict_1.DB2.RobotLeaveTaskQueue);
            console.info(`Redis | DB2 | 初始化机器人离开任务队列字段`);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB2 | 初始化机器人离开任务队列出错: ${e.stack}`);
            return false;
        }
    }
}
exports.RobotLeaveTaskQueue = RobotLeaveTaskQueue;
exports.default = new RobotLeaveTaskQueue();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3RMZWF2ZVRhc2tRdWV1ZS5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9Sb2JvdExlYXZlVGFza1F1ZXVlLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBOEM7QUFDOUMsd0RBQStDO0FBRS9DLDZEQUFrRDtBQUVsRCxNQUFhLG1CQUFtQjtJQUU1QixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQVc7UUFDM0IsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVuRSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBRyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEdBQUcsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNqRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRXJELElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtnQkFDWCxPQUFPLEVBQUUsQ0FBQzthQUNiO1lBR0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWpDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDMUM7WUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU1QyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMvQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztnQkFFM0IsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFaEIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRVAsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUQsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZTtRQUNqQixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUQsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUE5REQsa0RBOERDO0FBRUQsa0JBQWUsSUFBSSxtQkFBbUIsRUFBRSxDQUFDIn0=