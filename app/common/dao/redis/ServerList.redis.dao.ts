import {DB1} from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import {ServerListInRedis } from "./entity/ServerList.entity";
import redisConnect from "./lib/redisConnection";
import { AbstractDao } from "../ADao.abstract";
import redisManager from "./lib/BaseRedisManager";

export class ServerListRedisDao implements AbstractDao<ServerListInRedis>{

    async findList(parameter: { serverName?: string; serverHttp?: string; }): Promise<ServerListInRedis[]> {
        const conn = await redisConnect(RedisDB.Persistence_DB);
        try {
            const data = await conn.hgetall(`${DB1.ServerList}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB1 | 查询服务器列表: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter: { serverName?: string; serverHttp?: string; }): Promise<ServerListInRedis> {
        const conn = await redisConnect(RedisDB.Persistence_DB);
        try {

            if (!parameter.serverName) {
                return null;
            }
            const OnlinePLayerWithStr = await conn.hget(`${DB1.ServerList}`, parameter.serverName);
            return !!OnlinePLayerWithStr ? JSON.parse(OnlinePLayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB1 | 查询服务器列表出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: {serverName?: string; serverHttp?: string; }, partialEntity: { serverName?: string; serverHttp?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            const data = await this.findOne({ serverName: parameter.serverName });
            await conn.hset(DB1.ServerList, parameter.serverName, JSON.stringify(Object.assign(!!data ? data : {}, partialEntity)));
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 修改服务器列表出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { serverName?: string; serverHttp?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            await conn.hset(DB1.ServerList, parameter.serverName, JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 插入服务器列表出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: {serverName?: string; serverHttp?: string;}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
        try {
            if (!parameter.serverName) {
                return null;
            }
            await conn.hdel(DB1.ServerList, parameter.serverName);
            return 1;
        } catch (e) {
            console.error(`Redis | DB1 | 删除服务器列表信息: ${e.stack}`);
            return null;
        }
    }

}

export default new ServerListRedisDao();