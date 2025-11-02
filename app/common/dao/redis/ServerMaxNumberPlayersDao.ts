import { pinus } from "pinus";
import * as RedisDict from '../../constant/RedisDict';
import getRedisClinet from './lib/redisConnection';

export async function findOneByCurrentServer() {
    const serverId = pinus.app.getServerId();
    try {
        return await (await getRedisClinet()).get(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`);
    } catch (e) {
        console.error(`${serverId} | 查询当前服务器可承载最大玩家数量出错: ${e.stack}`);
        return null;
    }
}

export async function findOneByServerId(serverId: string) {
    try {
        return await (await getRedisClinet()).get(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`);
    } catch (e) {
        console.error(`${serverId} | 查询 serverId:${serverId} 可承载最大玩家数量出错: ${e.stack}`);
        return null;
    }
}

export async function insertOne(maxNumberPlayers: number) {
    const serverId = pinus.app.getServerId();
    try {
        const info = await (await getRedisClinet()).set(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`, maxNumberPlayers);
        return info === 'OK';
    } catch (e) {
        console.error(`${serverId} | 插入当前服务器可承载最大玩家数量出错: ${e.stack}`);
        return false;
    }
}

export async function insertOneByServerId(maxNumberPlayers: number, serverId: string) {
    try {
        const info = await (await getRedisClinet()).set(`${RedisDict.DB1.ServerMaxNumberPlayers}:${serverId}`, maxNumberPlayers);
        return info === 'OK';
    } catch (e) {
        console.error(`${serverId} | 插入指定服务器:${serverId}可承载最大玩家数量出错: ${e.stack}`);
        return false;
    }
}