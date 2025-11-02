import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { WhiteIpRecordInRedis } from "./entity/WhiteIpRecord.entity";
import WhiteIpRecordMysqlDao from "../mysql/WhiteIpRecord.mysql.dao";
import redisConnect from "./lib/redisConnection";
import { AbstractDao } from "../ADao.abstract";
import { PlayerInRedis } from "./entity/player.entity";

export class WhiteIpRecordRedisDao implements AbstractDao<WhiteIpRecordInRedis>{

    async findList(parameter: { id?: number; createTime?: Date; ip?: string; account?: string; message?: string; createUser?: string; }): Promise<WhiteIpRecordInRedis[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter: { id?: number; createTime?: Date; ip?: string; account?: string; }): Promise<WhiteIpRecordInRedis> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const WhiteIpRecordStr = await conn.get(`${DB2.white_ip}:${parameter.ip}`);
            if(!WhiteIpRecordStr){
                const whiteIp = await WhiteIpRecordMysqlDao.findOne({ ip:parameter.ip });
                if(whiteIp){
                    await this.insertOne(whiteIp);
                    return whiteIp;
                }
            }
            return !!WhiteIpRecordStr ? JSON.parse(WhiteIpRecordStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 查询白名单出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { id?: number; createTime?: Date; ip?: string; account?: string;  message?: string; createUser?: string;}, partialEntity: { id?: number; createTime?: Date; ip?: string; account?: string; message?: string; createUser?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const seconds = 24 * 60 * 60; //24小时
            const AuthCodeStr = await conn.get(`${DB2.white_ip}:${parameter.ip}`);
            await conn.setex(`${DB2.white_ip}:${parameter.ip}`, seconds, JSON.stringify(new WhiteIpRecordInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 修改白名单出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: { id?: number; createTime?: Date; ip?: string; account?: string; message?: string; createUser?: string; }): Promise<any> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            const seconds = 24 * 60 * 60; //15分钟
            await conn.setex(`${DB2.white_ip}:${parameter.ip}`, seconds, JSON.stringify(new WhiteIpRecordInRedis(parameter)));
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 插入白名单出错: ${e.stack}`);
            return null;
        }
    }

    async delete(parameter: { id?: number; createTime?: Date; ip?: string; account?: string; message?: string; createUser?: string;}): Promise<any> {
        const conn = await redisConnect(RedisDB.RuntimeData);
        try {
            await conn.del(`${DB2.white_ip}:${parameter.ip}`);
            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 删除白名单出错: ${e.stack}`);
            return null;
        }
    }

}

export default new WhiteIpRecordRedisDao();