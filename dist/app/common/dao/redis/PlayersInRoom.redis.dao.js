"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersInRoomRedisDao = void 0;
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class PlayersInRoomRedisDao {
    findList(uid) {
        throw new Error("Method not implemented.");
    }
    findOne(uid) {
        throw new Error("Method not implemented.");
    }
    updateOne(uid) {
        throw new Error("Method not implemented.");
    }
    async exits(backendServerId, roomId, uid, role = RoleEnum_1.RoleEnum.REAL_PLAYER) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (role === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                const flag = await conn.sismember(`${RedisDict_1.DB2.player_in_room}:${backendServerId}:${roomId}`, uid);
                return !!flag;
            }
            const flag = await conn.sismember(`${RedisDict_1.DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);
            return !!flag;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(backendServerId, roomId, uid, role = RoleEnum_1.RoleEnum.REAL_PLAYER) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (role === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                await conn.sadd(`${RedisDict_1.DB2.player_in_room}:${backendServerId}:${roomId}`, uid);
                return true;
            }
            await conn.sadd(`${RedisDict_1.DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);
            return true;
        }
        catch (e) {
            console.error(`PlayersInRoom.redis.dao|insertOne|${JSON.stringify(e)}`);
            return false;
        }
    }
    async delete(backendServerId, roomId, uid, role = RoleEnum_1.RoleEnum.REAL_PLAYER) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            if (role === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                await conn.srem(`${RedisDict_1.DB2.player_in_room}:${backendServerId}:${roomId}`, uid);
                return true;
            }
            await conn.srem(`${RedisDict_1.DB2.robot_in_room}:${backendServerId}:${roomId}`, uid);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async deleteAll(backendServerId, roomId) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await Promise.all([
                conn.del(`${RedisDict_1.DB2.player_in_room}:${backendServerId}:${roomId}`),
                conn.del(`${RedisDict_1.DB2.robot_in_room}:${backendServerId}:${roomId}`)
            ]);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async count(backendServerId, roomId) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const list = await Promise.all([
                conn.smembers(`${RedisDict_1.DB2.player_in_room}:${backendServerId}:${roomId}`),
                conn.smembers(`${RedisDict_1.DB2.robot_in_room}:${backendServerId}:${roomId}`)
            ]);
            return { REAL_PLAYER: list[0], ROBOT: list[1] };
        }
        catch (e) {
            return { REAL_PLAYER: [], ROBOT: [] };
        }
    }
}
exports.PlayersInRoomRedisDao = PlayersInRoomRedisDao;
exports.default = new PlayersInRoomRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyc0luUm9vbS5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9QbGF5ZXJzSW5Sb29tLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBMEQ7QUFDMUQsd0RBQStDO0FBQy9DLG9EQUE4QztBQUM5Qyw2REFBa0Q7QUFFbEQsTUFBYSxxQkFBcUI7SUFFOUIsUUFBUSxDQUFDLEdBQVc7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBVztRQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVc7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLGVBQXVCLEVBQUUsTUFBYyxFQUFFLEdBQVcsRUFBRSxPQUFpQixtQkFBUSxDQUFDLFdBQVc7UUFDbkcsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFFQSxJQUFJLElBQUksS0FBSyxtQkFBUSxDQUFDLFdBQVcsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsZUFBRyxDQUFDLGNBQWMsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRTdGLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQzthQUNqQjtZQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxhQUFhLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRTVGLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNqQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBRVIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxlQUF1QixFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsT0FBaUIsbUJBQVEsQ0FBQyxXQUFXO1FBQ3ZHLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRSxJQUFJO1lBQ0EsSUFBSSxJQUFJLEtBQUssbUJBQVEsQ0FBQyxXQUFXLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUUzRSxPQUFPLElBQUksQ0FBQzthQUNmO1lBRUQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBRyxDQUFDLGFBQWEsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFMUUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUF1QixFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsT0FBaUIsbUJBQVEsQ0FBQyxXQUFXO1FBQ3BHLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJO1lBQ0EsSUFBSSxJQUFJLEtBQUssbUJBQVEsQ0FBQyxXQUFXLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUUzRSxPQUFPLElBQUksQ0FBQzthQUNmO1lBRUQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBRyxDQUFDLGFBQWEsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFMUUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxlQUF1QixFQUFFLE1BQWM7UUFDbkQsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUk7WUFDQSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLGFBQWEsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFLENBQUM7YUFDaEUsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUF1QixFQUFFLE1BQWM7UUFDL0MsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5FLElBQUk7WUFFQSxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxlQUFHLENBQUMsY0FBYyxJQUFJLGVBQWUsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxhQUFhLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRSxDQUFDO2FBQ3JFLENBQUMsQ0FBQztZQUdILE9BQU8sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUNuRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ3pDO0lBQ0wsQ0FBQztDQUNKO0FBbkdELHNEQW1HQztBQUVELGtCQUFlLElBQUkscUJBQXFCLEVBQUUsQ0FBQyJ9