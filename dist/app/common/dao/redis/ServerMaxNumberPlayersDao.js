"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertOneByServerId = exports.insertOne = exports.findOneByServerId = exports.findOneByCurrentServer = void 0;
const pinus_1 = require("pinus");
const RedisDict = require("../../constant/RedisDict");
const redisConnection_1 = require("./lib/redisConnection");
async function findOneByCurrentServer() {
    const serverId = pinus_1.pinus.app.getServerId();
    try {
        return await (await (0, redisConnection_1.default)()).get(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`);
    }
    catch (e) {
        console.error(`${serverId} | 查询当前服务器可承载最大玩家数量出错: ${e.stack}`);
        return null;
    }
}
exports.findOneByCurrentServer = findOneByCurrentServer;
async function findOneByServerId(serverId) {
    try {
        return await (await (0, redisConnection_1.default)()).get(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`);
    }
    catch (e) {
        console.error(`${serverId} | 查询 serverId:${serverId} 可承载最大玩家数量出错: ${e.stack}`);
        return null;
    }
}
exports.findOneByServerId = findOneByServerId;
async function insertOne(maxNumberPlayers) {
    const serverId = pinus_1.pinus.app.getServerId();
    try {
        const info = await (await (0, redisConnection_1.default)()).set(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`, maxNumberPlayers);
        return info === 'OK';
    }
    catch (e) {
        console.error(`${serverId} | 插入当前服务器可承载最大玩家数量出错: ${e.stack}`);
        return false;
    }
}
exports.insertOne = insertOne;
async function insertOneByServerId(maxNumberPlayers, serverId) {
    try {
        const info = await (await (0, redisConnection_1.default)()).set(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`, maxNumberPlayers);
        return info === 'OK';
    }
    catch (e) {
        console.error(`${serverId} | 插入指定服务器:${serverId}可承载最大玩家数量出错: ${e.stack}`);
        return false;
    }
}
exports.insertOneByServerId = insertOneByServerId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyTWF4TnVtYmVyUGxheWVyc0Rhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1NlcnZlck1heE51bWJlclBsYXllcnNEYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLHNEQUFzRDtBQUN0RCwyREFBbUQ7QUFFNUMsS0FBSyxVQUFVLHNCQUFzQjtJQUN4QyxNQUFNLFFBQVEsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pDLElBQUk7UUFDQSxPQUFPLE1BQU0sQ0FBQyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ3BHO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSwwQkFBMEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUQsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7QUFSRCx3REFRQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxRQUFnQjtJQUNwRCxJQUFJO1FBQ0EsT0FBTyxNQUFNLENBQUMsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztLQUNwRztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsa0JBQWtCLFFBQVEsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBUEQsOENBT0M7QUFFTSxLQUFLLFVBQVUsU0FBUyxDQUFDLGdCQUF3QjtJQUNwRCxNQUFNLFFBQVEsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pDLElBQUk7UUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLElBQUksUUFBUSxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN6SCxPQUFPLElBQUksS0FBSyxJQUFJLENBQUM7S0FDeEI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5RCxPQUFPLEtBQUssQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFURCw4QkFTQztBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxnQkFBd0IsRUFBRSxRQUFnQjtJQUNoRixJQUFJO1FBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBQSx5QkFBYyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixJQUFJLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDekgsT0FBTyxJQUFJLEtBQUssSUFBSSxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxjQUFjLFFBQVEsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQVJELGtEQVFDIn0=