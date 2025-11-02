"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_entity_1 = require("../mysql/entity/Room.entity");
const Room_mysql_dao_1 = require("../mysql/Room.mysql.dao");
const Room_redis_dao_1 = require("../redis/Room.redis.dao");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class RoomManager {
    async findList(params, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const list = await Room_redis_dao_1.default.findList(params);
                if (list.length != 0) {
                    return list;
                }
            }
            const listInRedis = await Room_redis_dao_1.default.findList(params);
            const listOnMysql = await Room_mysql_dao_1.default.findList(params);
            if (listInRedis.length !== listOnMysql.length) {
                if (listOnMysql.length > 0) {
                    for (let i = 0; i < listOnMysql.length; i++) {
                        const roomInfo = listOnMysql[i];
                        await Room_redis_dao_1.default.insertOne(roomInfo);
                    }
                    return listOnMysql;
                }
            }
            return listOnMysql;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(params, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const room = await Room_redis_dao_1.default.findOne(params);
                if (room) {
                    return room;
                }
                const gameInMysql = await Room_mysql_dao_1.default.findOne(params);
                if (gameInMysql) {
                    await Room_redis_dao_1.default.insertOne(gameInMysql);
                }
                return gameInMysql;
            }
            return await Room_mysql_dao_1.default.findOne(params);
        }
        catch (e) {
            return null;
        }
    }
    async updateOneRoom(room, updateAttrList) {
        if (!updateAttrList.length || !room.serverId || !room.roomId) {
            throw new Error('房间更新列表不可为空');
        }
        try {
            const partial = {};
            updateAttrList.forEach(propertyName => {
                if (room[propertyName] === undefined) {
                    throw new Error(`${room.serverId}|${room.roomId}: 房间更新参数不合法`);
                }
                partial[propertyName] = room[propertyName];
            });
            await connectionManager_1.default.getManager().transaction(async (manager) => {
                await manager.update(Room_entity_1.Room, { serverId: room.serverId, roomId: room.roomId }, partial);
            });
            await Room_redis_dao_1.default.delete({ roomId: room.roomId, serverId: room.serverId });
            return true;
        }
        catch (e) {
            console.warn('更新房间出错', e.message, e.stack);
            return false;
        }
    }
    async insertOne(params) {
        try {
            const [, game] = await Promise.all([
                Room_redis_dao_1.default.insertOne(params),
                Room_mysql_dao_1.default.insertOne(params)
            ]);
            return game;
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            await Room_mysql_dao_1.default.delete(parameter);
            await Room_redis_dao_1.default.delete(parameter);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.RoomManager = RoomManager;
exports.default = new RoomManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vZGFvTWFuYWdlci9Sb29tLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQW1EO0FBQ25ELDREQUFtRDtBQUNuRCw0REFBbUQ7QUFFbkQsc0VBQStEO0FBTS9ELE1BQWEsV0FBVztJQUNwQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQXVCLEVBQUUsU0FBUyxHQUFHLEtBQUs7UUFDckQsSUFBSTtZQUNBLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLEdBQUcsTUFBTSx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7YUFDSjtZQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sd0JBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsTUFBTSxXQUFXLEdBQUcsTUFBTSx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV4RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDM0MsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3pDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEMsTUFBTSx3QkFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDMUM7b0JBQ0QsT0FBTyxXQUFXLENBQUM7aUJBQ3RCO2FBQ0o7WUFFRCxPQUFPLFdBQVcsQ0FBQztTQUN0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