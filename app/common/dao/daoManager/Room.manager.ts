import { Room } from "../mysql/entity/Room.entity";
import RoomMysqlDao from "../mysql/Room.mysql.dao";
import RoomRedisDao from "../redis/Room.redis.dao";
import { RoomInRedis } from "../redis/entity/Room.entity";
import ConnectionManager from "../mysql/lib/connectionManager";


type Parameter<T> = { [P in keyof T]?: T[P] };
type RoomCom = Room | RoomInRedis;

export class RoomManager {
    async findList(params: Parameter<Room>, onlyMysql = false): Promise<RoomCom[]> {
        try {
            if (!onlyMysql) {
                const list = await RoomRedisDao.findList(params);
                if (list.length != 0) {
                    return list;
                }
            }

            const listInRedis = await RoomRedisDao.findList(params);
            const listOnMysql = await RoomMysqlDao.findList(params);

            if (listInRedis.length !== listOnMysql.length) {
                if (listOnMysql.length > 0) {
                    for (let i = 0; i < listOnMysql.length; i++) {
                        const roomInfo = listOnMysql[i];
                        await RoomRedisDao.insertOne(roomInfo);
                    }
                    return listOnMysql;
                }
            }

            return listOnMysql;
        } catch (e) {
            return [];
        }
    }

    async findOne(params: Parameter<Room>, onlyMysql = false): Promise<Room | RoomInRedis> {
        try {

            if (!onlyMysql) {
                const room = await RoomRedisDao.findOne(params);

                if (room) {
                    return room;
                }

                const gameInMysql = await RoomMysqlDao.findOne(params);

                if (gameInMysql) {
                    await RoomRedisDao.insertOne(gameInMysql)
                }

                return gameInMysql;
            }

            return await RoomMysqlDao.findOne(params);
        } catch (e) {
            return null;
        }
    }

    /**
     * 更新房间
     * @param room
     * @param updateAttrList 更新属性列表
     */
    async updateOneRoom(room: Parameter<Room | RoomInRedis>, updateAttrList: string[]) {
        if (!updateAttrList.length || !room.serverId || !room.roomId) {
            throw new Error('房间更新列表不可为空');
        }

        try {
            // 验证锁
            // if (!await isLockValid(lock, `${DB1.SystemRooms}:${room.serverId}:${room.roomId}`)) {
            //     throw new Error('更新房间锁不合法');
            // }

            // 拆分更新属性
            const partial = {};

            updateAttrList.forEach(propertyName => {
                if (room[propertyName] === undefined) {
                    throw new Error(`${room.serverId}|${room.roomId}: 房间更新参数不合法`);
                }

                partial[propertyName] = room[propertyName];
            });

            // 创建事务
            await ConnectionManager.getManager().transaction(async manager => {
                // 更新数据库
                await manager.update(Room, { serverId: room.serverId, roomId: room.roomId }, partial);
            });
            // 删除缓存
            await RoomRedisDao.delete({ roomId: room.roomId, serverId: room.serverId });

            return true;
        } catch (e) {
            console.warn('更新房间出错', e.message, e.stack);
            return false;
        }
    }

    async insertOne(params: Parameter<Room>) {

        try {
            const [, game] = await Promise.all([
                RoomRedisDao.insertOne(params),
                RoomMysqlDao.insertOne(params)
            ]);

            return game;
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: { serverId: string; roomId: string; }): Promise<any> {
        try {
            await RoomMysqlDao.delete(parameter);
            await RoomRedisDao.delete(parameter);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default new RoomManager();