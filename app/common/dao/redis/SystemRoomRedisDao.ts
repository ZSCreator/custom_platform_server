import { pinus } from "pinus";
import { getLogger } from 'pinus-logger';
import getRedisClinet from "./lib/redisConnection";
const logger = getLogger('server_out', __filename);


import { DB1 } from "../../constant/RedisDict";
/**
 * 插入一条
 * @param data 房间实例
 * @param serverId 服务器编号
 */
export async function saveOneByServerId(roomId: string, data: any, backendServerId: string = pinus.app.getServerId()) {
    try {
        const connection = await getRedisClinet();

        Object.assign(data, { users: [] });

        const insertBody = {
            data,
            updateFields: []
        };

        await connection.hset(`${DB1.SystemRooms}:${backendServerId}`, roomId, JSON.stringify(insertBody));
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 插入指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${data.roomId} | 出错: ${e.stack}`);
        return false;
    }
}

/**
 * 查询房间信息 
 * @param roomId 房间编号
 * @param backendServerId 房间所属服务器编号 
 */
export async function findOneByRoomId(roomId: string, backendServerId: string = pinus.app.getServerId()) {
    try {
        const connection = await getRedisClinet();
        const info = await connection.hget(`${DB1.SystemRooms}:${backendServerId}`, roomId);
        return info ? JSON.parse(info).data : null;
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 查询指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${roomId} | 出错: ${e.stack}`);
        return null;
    }
}

/**
 * 查询房间列表
 * @param backendServerId 房间所属服务器编号
 */
export async function findListByServerId(backendServerId: string = pinus.app.getServerId()) {
    try {
        const connection = await getRedisClinet();
        const list = await connection.hgetall(`${DB1.SystemRooms}:${backendServerId}`);
        const rList = [];
        for (let key in list) {
            rList.push(JSON.parse(list[key]));
        }
        return rList ? rList.map(info => info.data) : [];
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 查询指定游戏房间列表 | 服务器: ${backendServerId} | 出错: ${e.stack}`);
        return [];
    }
}

/**
 * 
 * @param roomId 
 * @param data 
 * @param backendServerId 
 */
export async function updateOneByRoomId(roomId: string, data: any, backendServerId: string = pinus.app.getServerId(), changedAttrs = []) {
    try {
        const connection = await getRedisClinet();
        await connection.hset(
            `${DB1.SystemRooms}:${backendServerId}`,
            roomId,
            JSON.stringify({
                data,
                updateFields: changedAttrs
            })
        );
        return true;
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | Redis 更新指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${roomId} | 出错: ${e.stack}`);
        return false;
    }
}
