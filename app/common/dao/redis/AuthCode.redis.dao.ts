import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { AuthCodeInRedis } from "./entity/AuthCode.entity";
import redisConnect from "./lib/redisConnection";
import { AbstractDao } from "../ADao.abstract";
import { PlayerInRedis } from "./entity/player.entity";
import redisManager from "./lib/BaseRedisManager";

export class AuthCodeRedisDao implements AbstractDao<AuthCodeInRedis>{

    async findList(parameter: { auth_code?: string; createTime?: Date; status?: number; phone?: string; }): Promise<AuthCodeInRedis[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter: { auth_code?: string; createTime?: Date; status?: number; phone?: string; }): Promise<AuthCodeInRedis> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const AuthCodeStr = await conn.get(`${DB2.AUTH_CODE}:${parameter.phone}`);
            return !!AuthCodeStr ? JSON.parse(AuthCodeStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 查询短信验证码出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { auth_code?: string; createTime?: Date; status?: number; phone?: string; }, partialEntity: { auth_code?: string; createTime?: Date; status?: number; phone?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const seconds = 5 * 60; //5分钟
            const AuthCodeStr = await conn.get(`${DB2.AUTH_CODE}:${parameter.phone}`);
            await conn.setex(`${DB2.AUTH_CODE}:${parameter.phone}`, seconds, JSON.stringify(new AuthCodeInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 修改短信验证码出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { auth_code?: string; createTime?: Date; status?: number; phone?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const seconds = 5 * 60; //5分钟
            await conn.setex(`${DB2.AUTH_CODE}:${parameter.phone}`, seconds, JSON.stringify(parameter));
            return seconds;
        } catch (e) {
            console.error(`Redis | DB2 | 插入游短信验证码出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: { phone? : string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {

            await conn.del(`${DB2.AUTH_CODE}:${parameter.phone}`);
            return true;
        } catch (e) {
            console.error(`Redis | DB1 | 删除真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

}

export default new AuthCodeRedisDao();