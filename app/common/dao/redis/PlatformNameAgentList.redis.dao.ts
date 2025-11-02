import {DB1} from "../../constant/RedisDict";
import { getLogger } from 'pinus-logger';
import redisManager from "./lib/BaseRedisManager";
import PlayerAgentMysqlDao from "../mysql/PlayerAgent.mysql.dao";
import {RedisDB} from "./config/DBCfg.enum";
const logger = getLogger('server_out', __filename);

export class PlatformNameAgentListRedisDao   {

    /**
     * 添加某个平台下面所有代理
     * @param parameter
     */
    async  insert(parameter: { platformName?: string, agentList?: string [] }): Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }

            await  conn.hset(`${DB1.platformNameAgentList}`, parameter.platformName, JSON.stringify(parameter.agentList));

            return true;
        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    /**
     *  添加平台号对应的uid
     * @param parameter
     */
    async  insertPlatformUid(parameter: { platformName?: string, platformUid?: string  }): Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }

            await  conn.hset(`${DB1.platformAgentUid}`, parameter.platformName, JSON.stringify(parameter.platformUid));

            return true;
        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }


    /**
     *  添加平台号下面所有关闭的游戏
     * @param parameter
     */
    async  insertPlatformCloseGame(parameter: { platformName : string, closeGameList : string []  }): Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }

            await  conn.hset(`${DB1.platformCloseGame}`, parameter.platformName, JSON.stringify(parameter.closeGameList));



            return true;
        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }


    /**
     *  获取平台号下面所有关闭的游戏
     * @param parameter
     */
    async  getPlatformCloseGame(parameter: { platformName : string  }): Promise<any> {
        try {
            if(!parameter.platformName){
                return [];
            }

            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return [];
            }

            const playerCloseGameListWithStr = await conn.hget(`${DB1.platformCloseGame}`, parameter.platformName);

            if (!!playerCloseGameListWithStr) {
                return JSON.parse(playerCloseGameListWithStr);
            }

            //从数据库里面获取
            const platform = await PlayerAgentMysqlDao.findOne({platformName : parameter.platformName});
            if(!platform){
                return [];
            }
            
            if(!platform.closeGameList){
                return [];
            }

            const closeGameList = platform.closeGameList.split(',');
            if(closeGameList && closeGameList.length > 0){
                await  conn.hset(`${DB1.platformCloseGame}`, parameter.platformName, JSON.stringify(closeGameList));
                return closeGameList;
            }else {
                return [];
            }

        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return [];
        }
    }


    /**
     * 查找平台号对应的uid
     * @param parameter
     */
    async  findPlatformUid(parameter: { platformName?: string  }): Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);

            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.hget(`${DB1.platformAgentUid}`, parameter.platformName);

            if (!!playerAgentWithStr) {
                return JSON.parse(playerAgentWithStr);
            }

            const platform = await PlayerAgentMysqlDao.findOne({platformName: parameter.platformName});

            if(!platform){
                return null;
            }

            if(platform.roleType == 2 && platform.uid){
                await this.insertPlatformUid({platformName: platform.platformName, platformUid: platform.uid});
                return platform.uid ;
            }

            return null ;
        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }


    /**
     * 获取所有的平台的uid和平台号
     * @param isAgain
     */
    async findAllPlatformUidList(isAgain : boolean = false): Promise<any[]> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);

            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return [];
            }

            if (!isAgain) {
                const data = await conn.hgetall(`${DB1.platformAgentUid}`);
                let list = [];

                for (let key in data) {
                    list.push({platformName : key , platformUid : JSON.parse(data[key]) });
                }

                return list;
            }

            const list = await PlayerAgentMysqlDao.findList({ roleType: 2 });
            let platformNameList: any = [];

            if (list.length != 0) {
                for (let platform of list) {
                    await this.insertPlatformUid({platformName: platform.platformName, platformUid: platform.uid});
                    let info = { platformName : platform.platformName , platformUid : platform.uid };
                    platformNameList.push(info);
                }
            }

            return platformNameList;
        } catch (e) {
            logger.error(`Redis | 插入第三方接口 token | 出错: ${e.stack || e.message || e}`);
            return [];
        }
    }

    /**
     * 获取所有的平台的平台号和对应平台号下面所有的分代
     * @param isAgain
     */
    async findList(isAgain : boolean = false) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            if (!isAgain) {
                const data = await conn.hgetall(`${DB1.platformNameAgentList}`);
                let list = [];
                for (let key in data) {
                    list.push({platformName : key , list : JSON.parse(data[key]) });
                }
                return list;
            } else {
                const list = await PlayerAgentMysqlDao.findList({ roleType: 2 });
                let platformNameList: any = [];
                if (list.length != 0) {
                    for (let agent of list) {
                        const list = await PlayerAgentMysqlDao.findList({parentUid: agent.uid, roleType: 3});
                        let agentList: any = [];
                        if (list.length != 0) {
                            for (let agent of list) {
                                agentList.push(agent.platformName);
                            }
                            await this.insert({platformName: agent.platformName, agentList: agentList});
                        }
                        let info = { platformName : agent.platformName , list : agentList };
                        platformNameList.push(info);
                    }
                }
                return platformNameList;
            }

        } catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    /**
     *  给某个平台号下面加新的分代号
     * @param platformName
     * @param platformUid
     */
    async addAgent(platformName : string , platformUid : string) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }

            const list = await PlayerAgentMysqlDao.findList({parentUid: platformUid, roleType: 3});
            let agentList: any = [];
            if (list.length != 0) {
                for (let agent of list) {
                    agentList.push(agent.platformName);
                }
                await this.insert({platformName: platformName, agentList: agentList});
            }else{
                await this.insert({platformName: platformName, agentList: agentList});
            }
            return true;

        } catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    /**
     * 查找某一个平台号下面有哪些分代号
     * @param parameter
     * @param isMysql
     */
    async findOne(parameter: { platformName?: string } , isMysql : boolean = true ) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.hget(`${DB1.platformNameAgentList}`, parameter.platformName);
            let agentList: any = [];
            if (!!playerAgentWithStr) {
                agentList = JSON.parse(playerAgentWithStr);
                return agentList;
            } else if(isMysql){
                const platform = await PlayerAgentMysqlDao.findOne({platformName: parameter.platformName});
                if(!platform){
                    return agentList;
                }
                const list = await PlayerAgentMysqlDao.findList({parentUid: platform.uid, roleType: 3});
                if (list.length != 0) {
                    for (let agent of list) {
                        agentList.push(agent.platformName);
                    }
                    await this.insert({platformName: platform.platformName, agentList: agentList});
                }else if(platform.roleType == 2){
                    await this.insert({platformName: platform.platformName, agentList: agentList});
                }
                return agentList;
            }else{
                return agentList;
            }
        } catch (e) {
            logger.error(`Redis | 查询第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    /**
     *  根据代理号查找平台号的uid
     * @param parameter
     */
    async findPlatformUidForAgent(parameter: { agent?: string }) : Promise<any> {
        try {
            const list = await this.findList(false);
            let platformUid = null;
            if(list.length == 0){
                return platformUid;
            }
            let platformName = null;
            for(let key of list){
                const agentList = key.list;
                const item = agentList.find(x=>x == parameter.agent);
                if(item){
                    platformName =  key.platformName;
                    platformUid = await this.findPlatformUid({platformName:platformName});
                    return platformUid;
                }
            }
            return platformUid;
        } catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }


    /**
     *  根据代理号查找平台号的名称
     * @param parameter
     */
    async findPlatformNameForAgent(parameter: { agent?: string }) : Promise<string> {
        try {
            const list = await this.findList(false);
            let platformName = null;
            if(list.length == 0){
                return platformName;
            }
            for(let key of list){
                const agentList = key.list;
                const item = agentList.find(x=>x == parameter.agent);
                if(item){
                    platformName =  key.platformName;
                    return platformName;
                }
            }
            return platformName;
        } catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return null;
        }
    }


    /**
     *  删除一个平台号 和uid
     * @param parameter
     */
   async deletePlatformUidOne(parameter: { platformName?: string }) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hdel(DB1.platformAgentUid, parameter.platformName);
            return true;
        } catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    /**
     *  删除一个平台号和平台号下面的分代号列表
     * @param parameter
     */
    async deleteOne(parameter: { platformName?: string }) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.hdel(DB1.platformNameAgentList, parameter.platformName);
            return true;
        } catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }

    async deleteAll(parameter: {}) : Promise<any> {
        try {
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.del(DB1.platformNameAgentList);
            await conn.del(DB1.platformAgentUid);
            return true;
        } catch (e) {
            logger.error(`Redis | 删除第三方接口 token 信息 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }


}

export default new PlatformNameAgentListRedisDao();