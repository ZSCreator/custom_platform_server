import { RoleEnum } from "../../constant/player/RoleEnum";
import { DB2 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import redisManager from "./lib/BaseRedisManager";

export class PlayersInRoomRedisDao {

    findList(uid: string): Promise<String[]> {
        throw new Error("Method not implemented.");
    }

    findOne(uid: string): Promise<String> {
        throw new Error("Method not implemented.");
    }

    updateOne(uid: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async exits(backendServerId: string, roomId: string, uid: string, role: RoleEnum = RoleEnum.REAL_PLAYER) {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {

            if (role === RoleEnum.REAL_PLAYER) {
                const flag = await conn.sismember(`${DB2.player_in_room}:${backendServerId}:${roomId}`, uid);

                return !!flag;
            }

            const flag = await conn.sismember(`${DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);

            return !!flag;
        } catch (e) {

            return false;
        }
    }

    async insertOne(backendServerId: string, roomId: string, uid: string, role: RoleEnum = RoleEnum.REAL_PLAYER): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {
            if (role === RoleEnum.REAL_PLAYER) {
                await conn.sadd(`${DB2.player_in_room}:${backendServerId}:${roomId}`, uid);

                return true;
            }

            await conn.sadd(`${DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);

            return true;
        } catch (e) {
            console.error(`PlayersInRoom.redis.dao|insertOne|${JSON.stringify(e)}`);
            return false;
        }
    }

    async delete(backendServerId: string, roomId: string, uid: string, role: RoleEnum = RoleEnum.REAL_PLAYER): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            if (role === RoleEnum.REAL_PLAYER) {
                await conn.srem(`${DB2.player_in_room}:${backendServerId}:${roomId}`, uid);

                return true;
            }

            await conn.srem(`${DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);

            return true;
        } catch (e) {
            return false;
        }
    }

    async deleteAll(backendServerId: string, roomId: string) {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);
        try {
            await Promise.all([
                conn.del(`${DB2.player_in_room}:${backendServerId}:${roomId}`),
                conn.del(`${DB2.robot_in_room}:${backendServerId}:${roomId}`)
            ]);

            return true;
        } catch (e) {
            return false;
        }
    }

    async count(backendServerId: string, roomId: string): Promise<{ REAL_PLAYER: string[], ROBOT: string[] }> {
        const conn = await redisManager.getConnection(RedisDB.RuntimeData);

        try {

            const list = await Promise.all([
                conn.smembers(`${DB2.player_in_room}:${backendServerId}:${roomId}`),
                conn.smembers(`${DB2.robot_in_room}:${backendServerId}:${roomId}`)
            ]);

            // return list.reduce((res, val) => res + val);
            return { REAL_PLAYER: list[0], ROBOT: list[1] };
        } catch (e) {
            return { REAL_PLAYER: [], ROBOT: [] };
        }
    }
}

export default new PlayersInRoomRedisDao();
