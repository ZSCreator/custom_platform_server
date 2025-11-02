"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const playerAgent_entity_1 = require("./entity/playerAgent.entity");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const PlayerAgent_mysql_dao_1 = require("../mysql/PlayerAgent.mysql.dao");
class PlayerRedisDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const playerAgentWithStr = await conn.get(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`);
            if (!!playerAgentWithStr) {
                return JSON.parse(playerAgentWithStr);
            }
            else {
                const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: parameter.platformName });
                if (playerAgent) {
                    await this.insertOne(new playerAgent_entity_1.playerAgentInRedis(playerAgent));
                    return playerAgent;
                }
                else {
                    return null;
                }
            }
        }
        catch (e) {
            console.error(`Redis | DB1 | 查询真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }
    async findOneInRedis(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const playerAgentWithStr = await conn.get(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`);
            if (!!playerAgentWithStr) {
                return JSON.parse(playerAgentWithStr);
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.error(`Redis | DB1 | 查询真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 7 * 24 * 3600;
            const playerAgentWithStr = await conn.get(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`);
            if (playerAgentWithStr) {
                await conn.setex(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(new playerAgent_entity_1.playerAgentInRedis(Object.assign(JSON.parse(playerAgentWithStr), partialEntity))));
            }
            else {
                const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ uid: parameter.uid });
                if (playerAgent) {
                    await conn.setex(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(new playerAgent_entity_1.playerAgentInRedis(Object.assign(playerAgent, partialEntity))));
                }
            }
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB1 | 修改真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 7 * 24 * 3600;
            await conn.setex(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`, seconds, JSON.stringify(parameter));
            return seconds;
        }
        catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.del(`${RedisDict_1.DB2.playerAgent}:${parameter.platformName}`);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB1 | 插入真实玩家代理信息出错: ${e.stack}`);
            return null;
        }
    }
}
exports.PlayerRedisDao = PlayerRedisDao;
exports.default = new PlayerRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQWdlbnQucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvUGxheWVyQWdlbnQucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUUvQyxvREFBOEM7QUFDOUMsb0VBQWlFO0FBQ2pFLDZEQUFrRDtBQUNsRCwwRUFBaUU7QUFFakUsTUFBYSxjQUFjO0lBQ3ZCLFFBQVEsQ0FBQyxTQUFhO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFnRztRQUMxRyxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMxRixJQUFHLENBQUMsQ0FBQyxrQkFBa0IsRUFBQztnQkFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDekM7aUJBQUk7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSwrQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQ2hHLElBQUcsV0FBVyxFQUFDO29CQUNYLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHVDQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQzFELE9BQU8sV0FBVyxDQUFDO2lCQUN0QjtxQkFBSTtvQkFDRCxPQUFPLElBQUksQ0FBRTtpQkFDaEI7YUFDSjtTQUNKO1FBQUMsT0FBTyxDQUFD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