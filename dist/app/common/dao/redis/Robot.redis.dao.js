"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotRedisDao = void 0;
const utils_1 = require("../../../utils");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const Robot_entity_1 = require("./entity/Robot.entity");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const Robot_mysql_dao_1 = require("../mysql/Robot.mysql.dao");
class RobotRedisDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const playerInfoWithStr = await conn.get(`${RedisDict_1.DB2.Robot}:${parameter.uid}`);
            return !!playerInfoWithStr ? JSON.parse(playerInfoWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 查询机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = (0, utils_1.random)(2 * 3600, 3 * 3600);
            if (await conn.exists(`${RedisDict_1.DB2.Robot}:${parameter.uid}`)) {
                const playerInfoWithStr = await conn.get(`${RedisDict_1.DB2.Robot}:${parameter.uid}`);
                await conn.setex(`${RedisDict_1.DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(new Robot_entity_1.RobotInRedis(Object.assign(playerInfoWithStr === null ? {} : JSON.parse(playerInfoWithStr), partialEntity))));
            }
            else {
                const robot = await Robot_mysql_dao_1.default.findOne({ uid: parameter.uid });
                if (robot) {
                    await conn.setex(`${RedisDict_1.DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(new Robot_entity_1.RobotInRedis(Object.assign(robot, partialEntity))));
                }
            }
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 修改机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = (0, utils_1.random)(2 * 3600, 3 * 3600);
            await conn.setex(`${RedisDict_1.DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(parameter));
            return seconds;
        }
        catch (e) {
            console.error(`Redis | DB2 | 插入机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    delete(parameter) {
        throw new Error("Method not implemented.");
    }
}
exports.RobotRedisDao = RobotRedisDao;
exports.default = new RobotRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3QucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvUm9ib3QucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQUF3QztBQUV4Qyx3REFBK0M7QUFFL0Msb0RBQThDO0FBQzlDLHdEQUFxRDtBQUNyRCw2REFBa0Q7QUFDbEQsOERBQXFEO0FBRXJELE1BQWEsYUFBYTtJQUN0QixRQUFRLENBQUMsU0FBaU07UUFDdE0sTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXNOO1FBQ2hPLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBQ0EsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTFFLE9BQU8sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNyRTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQThPLEVBQUUsYUFBNlE7UUFDemdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRSxJQUFJO1lBQ0EsTUFBTSxP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