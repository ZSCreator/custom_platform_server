"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformNameAgentListRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const pinus_logger_1 = require("pinus-logger");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const PlayerAgent_mysql_dao_1 = require("../mysql/PlayerAgent.mysql.dao");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class PlatformNameAgentListRedisDao {
    async insert(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hset(`${RedisDict_1.DB1.platformNameAgentList}`, parameter.platformName, JSON.stringify(parameter.agentList));
            return true;
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async insertPlatformUid(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hset(`${RedisDict_1.DB1.platformAgentUid}`, parameter.platformName, JSON.stringify(parameter.platformUid));
            return true;
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async insertPlatformCloseGame(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hset(`${RedisDict_1.DB1.platformCloseGame}`, parameter.platformName, JSON.stringify(parameter.closeGameList));
            return true;
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async getPlatformCloseGame(parameter) {
        try {
            if (!parameter.platformName) {
                return [];
            }
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return [];
            }
            const playerCloseGameListWithStr = await conn.hget(`${RedisDict_1.DB1.platformCloseGame}`, parameter.platformName);
            if (!!playerCloseGameListWithStr) {
                return JSON.parse(playerCloseGameListWithStr);
            }
            const platform = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: parameter.platformName });
            if (!platform) {
                return [];
            }
            if (!platform.closeGameList) {
                return [];
            }
            const closeGameList = platform.closeGameList.split(',');
            if (closeGameList && closeGameList.length > 0) {
                await conn.hset(`${RedisDict_1.DB1.platformCloseGame}`, parameter.platformName, JSON.stringify(closeGameList));
                return closeGameList;
            }
            else {
                return [];
            }
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return [];
        }
    }
    async findPlatformUid(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.hget(`${RedisDict_1.DB1.platformAgentUid}`, parameter.platformName);
            if (!!playerAgentWithStr) {
                return JSON.parse(playerAgentWithStr);
            }
            const platform = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: parameter.platformName });
            if (!platform) {
                return null;
            }
            if (platform.roleType == 2 && platform.uid) {
                await this.insertPlatformUid({ platformName: platform.platformName, platformUid: platform.uid });
                return platform.uid;
            }
            return null;
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async findAllPlatformUidList(isAgain = false) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return [];
            }
            if (!isAgain) {
                const data = await conn.hgetall(`${RedisDict_1.DB1.platformAgentUid}`);
                let list = [];
                for (let key in data) {
                    list.push({ platformName: key, platformUid: JSON.parse(data[key]) });
                }
                return list;
            }
            const list = await PlayerAgent_mysql_dao_1.default.findList({ roleType: 2 });
            let platformNameList = [];
            if (list.length != 0) {
                for (let platform of list) {
                    await this.insertPlatformUid({ platformName: platform.platformName, platformUid: platform.uid });
                    let info = { platformName: platform.platformName, platformUid: platform.uid };
                    platformNameList.push(info);
                }
            }
            return platformNameList;
        }
        catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return [];
        }
    }
    async findList(isAgain = false) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            if (!isAgain) {
                const data = await conn.hgetall(`${RedisDict_1.DB1.platformNameAgentList}`);
                let list = [];
                for (let key in data) {
                    list.push({ platformName: key, list: JSON.parse(data[key]) });
                }
                return list;
            }
            else {
                const list = await PlayerAgent_mysql_dao_1.default.findList({ roleType: 2 });
                let platformNameList = [];
                if (list.length != 0) {
                    for (let agent of list) {
                        const list = await PlayerAgent_mysql_dao_1.default.findList({ parentUid: agent.uid, roleType: 3 });
                        let agentList = [];
                        if (list.length != 0) {
                            for (let agent of list) {
                                agentList.push(agent.platformName);
                            }
                            await this.insert({ platformName: agent.platformName, agentList: agentList });
                        }
                        let info = { platformName: agent.platformName, list: agentList };
                        platformNameList.push(info);
                    }
                }
                return platformNameList;
            }
        }
        catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async addAgent(platformName, platformUid) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const list = await PlayerAgent_mysql_dao_1.default.findList({ parentUid: platformUid, roleType: 3 });
            let agentList = [];
            if (list.length != 0) {
                for (let agent of list) {
                    agentList.push(agent.platformName);
                }
                await this.insert({ platformName: platformName, agentList: agentList });
            }
            else {
                await this.insert({ platformName: platformName, agentList: agentList });
            }
            return true;
        }
        catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async findOne(parameter, isMysql = true) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.hget(`${RedisDict_1.DB1.platformNameAgentList}`, parameter.platformName);
            let agentList = [];
            if (!!playerAgentWithStr) {
                agentList = JSON.parse(playerAgentWithStr);
                return agentList;
            }
            else if (isMysql) {
                const platform = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: parameter.platformName });
                if (!platform) {
                    return agentList;
                }
                const list = await PlayerAgent_mysql_dao_1.default.findList({ parentUid: platform.uid, roleType: 3 });
                if (list.length != 0) {
                    for (let agent of list) {
                        agentList.push(agent.platformName);
                    }
                    await this.insert({ platformName: platform.platformName, agentList: agentList });
                }
                else if (platform.roleType == 2) {
                    await this.insert({ platformName: platform.platformName, agentList: agentList });
                }
                return agentList;
            }
            else {
                return agentList;
            }
        }
        catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async findPlatformUidForAgent(parameter) {
        try {
            const list = await this.findList(false);
            let platformUid = null;
            if (list.length == 0) {
                return platformUid;
            }
            let platformName = null;
            for (let key of list) {
                const agentList = key.list;
                const item = agentList.find(x => x == parameter.agent);
                if (item) {
                    platformName = key.platformName;
                    platformUid = await this.findPlatformUid({ platformName: platformName });
                    return platformUid;
                }
            }
            return platformUid;
        }
        catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async findPlatformNameForAgent(parameter) {
        try {
            const list = await this.findList(false);
            let platformName = null;
            if (list.length == 0) {
                return platformName;
            }
            for (let key of list) {
                const agentList = key.list;
                const item = agentList.find(x => x == parameter.agent);
                if (item) {
                    platformName = key.platformName;
                    return platformName;
                }
            }
            return platformName;
        }
        catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return null;
        }
    }
    async deletePlatformUidOne(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hdel(RedisDict_1.DB1.platformAgentUid, parameter.platformName);
            return true;
        }
        catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async deleteOne(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hdel(RedisDict_1.DB1.platformNameAgentList, parameter.platformName);
            return true;
        }
        catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async deleteAll(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.del(RedisDict_1.DB1.platformNameAgentList);
            await conn.del(RedisDict_1.DB1.platformAgentUid);
            return true;
        }
        catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
}
exports.PlatformNameAgentListRedisDao = PlatformNameAgentListRedisDao;
exports.default = new PlatformNameAgentListRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1OYW1lQWdlbnRMaXN0LnJlZGlzLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1BsYXRmb3JtTmFtZUFnZW50TGlzdC5yZWRpcy5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQTZDO0FBQzdDLCtDQUF5QztBQUN6Qyw2REFBa0Q7QUFDbEQsMEVBQWlFO0FBQ2pFLG9EQUE0QztBQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRW5ELE1BQWEsNkJBQTZCO0lBTXRDLEtBQUssQ0FBRSxNQUFNLENBQUMsU0FBMkQ7UUFDckUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzdCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsTUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRTlHLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQU1ELEtBQUssQ0FBRSxpQkFBaUIsQ0FBQyxTQUEyRDtRQUNoRixJQUFJO1lBQ0EsTUFBTSxJ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