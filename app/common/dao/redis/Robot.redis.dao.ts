import { random } from "../../../utils";
import { RoleEnum } from "../../constant/player/RoleEnum";
import { DB2 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { RobotInRedis } from "./entity/Robot.entity";
import redisManager from "./lib/BaseRedisManager";
import RobotMysqlDao from "../mysql/Robot.mysql.dao";

export class RobotRedisDao implements AbstractDao<RobotInRedis>{
    findList(parameter: { uid?: string; sid?: string; position?: number; robotOnLine?: boolean; guestid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; }): Promise<RobotInRedis[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter: { uid?: string; updatetime?: number; sid?: string; position?: number; robotOnLine?: boolean; guestid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; }): Promise<RobotInRedis> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const playerInfoWithStr = await conn.get(`${DB2.Robot}:${parameter.uid}`);

            return !!playerInfoWithStr ? JSON.parse(playerInfoWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB2 | 查询机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter: { uid?: string; updatetime?: number; sid?: string; position?: number; robotOnLine?: boolean; guestid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; kickedOutRoom?: boolean }, partialEntity: { uid?: string; updatetime?: number; sid?: string; guestid?: string; position?: number; robotOnLine?: boolean; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; kickedOutRoom?: boolean; abnormalOffline?: boolean }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {
            const seconds = random(2 * 3600, 3 * 3600);

            if (await conn.exists(`${DB2.Robot}:${parameter.uid}`)) {
                const playerInfoWithStr = await conn.get(`${DB2.Robot}:${parameter.uid}`);

                await conn.setex(`${DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(new RobotInRedis(Object.assign(playerInfoWithStr === null ? {} : JSON.parse(playerInfoWithStr), partialEntity))));
            } else {
                const robot = await RobotMysqlDao.findOne({ uid: parameter.uid });

                if (robot) {
                    await conn.setex(`${DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(new RobotInRedis(Object.assign(robot, partialEntity))));
                }
            }

            return 1;
        } catch (e) {
            console.error(`Redis | DB2 | 修改机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter: { uid?: string; updatetime?: number; sid?: string; position?: number; robotOnLine?: boolean; guestid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; kickedOutRoom?: boolean; abnormalOffline?: boolean  }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            const seconds = random(2 * 3600, 3 * 3600);

            await conn.setex(`${DB2.Robot}:${parameter.uid}`, seconds, JSON.stringify(parameter));
            return seconds;
        } catch (e) {
            console.error(`Redis | DB2 | 插入机器人信息出错: ${e.stack}`);
            return null;
        }
    }
    delete(parameter: { uid?: string; updatetime?: number; sid?: string; position?: number; robotOnLine?: boolean; guestid?: string; nickname?: string; headurl?: string; gold?: number; isRobot?: RoleEnum; language?: string; }): Promise<any> {
        throw new Error("Method not implemented.");
    }

}


export default new RobotRedisDao();