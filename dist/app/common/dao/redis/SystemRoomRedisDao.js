"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOneByRoomId = exports.findListByServerId = exports.findOneByRoomId = exports.saveOneByServerId = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const redisConnection_1 = require("./lib/redisConnection");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const RedisDict_1 = require("../../constant/RedisDict");
async function saveOneByServerId(roomId, data, backendServerId = pinus_1.pinus.app.getServerId()) {
    try {
        const connection = await (0, redisConnection_1.default)();
        Object.assign(data, { users: [] });
        const insertBody = {
            data,
            updateFields: []
        };
        await connection.hset(`${RedisDict_1.DB1.SystemRooms}:${backendServerId}`, roomId, JSON.stringify(insertBody));
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 插入指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${data.roomId} | 出错: ${e.stack}`);
        return false;
    }
}
exports.saveOneByServerId = saveOneByServerId;
async function findOneByRoomId(roomId, backendServerId = pinus_1.pinus.app.getServerId()) {
    try {
        const connection = await (0, redisConnection_1.default)();
        const info = await connection.hget(`${RedisDict_1.DB1.SystemRooms}:${backendServerId}`, roomId);
        return info ? JSON.parse(info).data : null;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 查询指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${roomId} | 出错: ${e.stack}`);
        return null;
    }
}
exports.findOneByRoomId = findOneByRoomId;
async function findListByServerId(backendServerId = pinus_1.pinus.app.getServerId()) {
    try {
        const connection = await (0, redisConnection_1.default)();
        const list = await connection.hgetall(`${RedisDict_1.DB1.SystemRooms}:${backendServerId}`);
        const rList = [];
        for (let key in list) {
            rList.push(JSON.parse(list[key]));
        }
        return rList ? rList.map(info => info.data) : [];
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 查询指定游戏房间列表 | 服务器: ${backendServerId} | 出错: ${e.stack}`);
        return [];
    }
}
exports.findListByServerId = findListByServerId;
async function updateOneByRoomId(roomId, data, backendServerId = pinus_1.pinus.app.getServerId(), changedAttrs = []) {
    try {
        const connection = await (0, redisConnection_1.default)();
        await connection.hset(`${RedisDict_1.DB1.SystemRooms}:${backendServerId}`, roomId, JSON.stringify({
            data,
            updateFields: changedAttrs
        }));
        return true;
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | Redis 更新指定游戏指定房间信息 | 服务器: ${backendServerId} | 房间号: ${roomId} | 出错: ${e.stack}`);
        return false;
    }
}
exports.updateOneByRoomId = updateOneByRoomId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUm9vbVJlZGlzRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvU3lzdGVtUm9vbVJlZGlzRGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUE4QjtBQUM5QiwrQ0FBeUM7QUFDekMsMkRBQW1EO0FBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHbkQsd0RBQStDO0FBTXhDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsSUFBUyxFQUFFLGtCQUEwQixhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtJQUNoSCxJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQztRQUUxQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sVUFBVSxHQUFHO1lBQ2YsSUFBSTtZQUNKLFlBQVksRUFBRSxFQUFFO1NBQ25CLENBQUM7UUFFRixNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFHLENBQUMsV0FBVyxJQUFJLGVBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDdEc7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxnQ0FBZ0MsZUFBZSxXQUFXLElBQUksQ0FBQyxNQUFNLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDakksT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBaEJELDhDQWdCQztBQU9NLEtBQUssVUFBVSxlQUFlLENBQUMsTUFBYyxF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