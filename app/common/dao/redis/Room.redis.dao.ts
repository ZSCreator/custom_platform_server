import { DB3 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { RoomInRedis } from "./entity/Room.entity";
import redisManager from "./lib/BaseRedisManager";

interface RoomRedisDTO {
    id?: number;
    serverId?: string;
    nid?: string;
    sceneId?: number;
    roomId?: string;
    jackpot?: number;
    runningPool?: number;
    profitPool?: number;
    open?: boolean;
    jackpotShow?: any;
    betUpperLimit?: any;
    createTime?: Date;
    updateTime?: Date;
    kind?: number;
}

export class RoomRedisDao implements AbstractDao<RoomInRedis>{
    async findList(parameter: RoomRedisDTO): Promise<RoomInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const list = await conn.hgetall(`${DB3.room}:${parameter.serverId}`);

            const dataList = [];
            if(list.length == 0){
                return [];
            }
            for (let key in list) {
                dataList.push(JSON.parse(list[key]));
            }
            return dataList ? dataList : [];
        } catch (e) {
            console.error(`Redis | DB3 | 查询房间信息列表出错: ${e.stack}`);
            return [];
        }
    }

    async findOne(parameter: RoomRedisDTO): Promise<RoomInRedis> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const roomInfoWithStr = await conn.hget(`${DB3.room}:${parameter.serverId}`, parameter.roomId);

            return !!roomInfoWithStr ? JSON.parse(roomInfoWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB3 | 查询房间信息出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: RoomRedisDTO, partialEntity: RoomRedisDTO): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);

        try {

            const room = await conn.hset(`${DB3.room}:${parameter.serverId}`, parameter.roomId, JSON.stringify(partialEntity));

            return !!room;
        } catch (e) {
            console.error(`Redis | DB3 | 修改房间信息出错: ${e.stack}`);
            return null;
        }
    }

    async insertOne(parameter: RoomRedisDTO): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(`${DB3.room}:${parameter.serverId}`, parameter.roomId, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { serverId: string; roomId: string; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            await conn.hdel(`${DB3.room}:${parameter.serverId}`, parameter.roomId);

            return true;
        } catch (e) {
            return false;
        }
    }

}

export default new RoomRedisDao();
