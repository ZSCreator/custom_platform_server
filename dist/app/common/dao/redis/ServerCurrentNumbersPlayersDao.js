"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetByServerId = exports.findByServerId = exports.decreaseByServerId = exports.increaseByServerId = void 0;
const RedisDict = require("../../constant/RedisDict");
const redisConnection_1 = require("./lib/redisConnection");
async function increaseByServerId(serverId) {
    await (await (0, redisConnection_1.default)()).incr(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
}
exports.increaseByServerId = increaseByServerId;
async function decreaseByServerId(serverId) {
    const num = await findByServerId(serverId);
    if (Number(num) <= 1) {
        await (await (0, redisConnection_1.default)()).set(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`, 0);
    }
    else {
        await (await (0, redisConnection_1.default)()).decr(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
    }
}
exports.decreaseByServerId = decreaseByServerId;
async function findByServerId(serverId) {
    return await (await (0, redisConnection_1.default)()).get(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
}
exports.findByServerId = findByServerId;
async function resetByServerId(serverId) {
    await (await (0, redisConnection_1.default)()).set(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`, 0);
}
exports.resetByServerId = resetByServerId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyQ3VycmVudE51bWJlcnNQbGF5ZXJzRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvU2VydmVyQ3VycmVudE51bWJlcnNQbGF5ZXJzRGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFzRDtBQUN0RCwyREFBbUQ7QUFPNUMsS0FBSyxVQUFVLGtCQUFrQixDQUFDLFFBQWdCO0lBQ3JELE1BQU0sQ0FBQyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3BHLENBQUM7QUFGRCxnREFFQztBQU9NLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxRQUFnQjtJQUNyRCxNQUFNLEdBQUcsR0FBSSxNQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU3QyxJQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUM7UUFDaEIsTUFBTSxDQUFDLE1BQU0sSUFBQSx5QkFBYyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixJQUFJLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3JHO1NBQUk7UUFDRCxNQUFNLENBQUMsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztLQUNuRztBQUVMLENBQUM7QUFURCxnREFTQztBQVFNLEtBQUssVUFBVSxjQUFjLENBQUMsUUFBZ0I7SUFDakQsT0FBTyxNQUFNLENBQUMsTUFBTSxJQUFBLHlCQUFjLEdBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMxRyxDQUFDO0FBRkQsd0NBRUM7QUFJTSxLQUFLLFVBQVUsZUFBZSxDQUFDLFFBQWdCO0lBQ2xELE1BQU0sQ0FBQyxNQUFNLElBQUEseUJBQWMsR0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRkQsMENBRUMifQ==