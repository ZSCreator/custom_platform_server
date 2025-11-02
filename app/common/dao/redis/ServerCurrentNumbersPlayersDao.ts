import * as RedisDict from '../../constant/RedisDict';
import getRedisClinet from './lib/redisConnection';



/**
 * 指定服务器人数增1
 */
export async function increaseByServerId(serverId: string) {
    await (await getRedisClinet()).incr(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
}



/**
 * 指定服务器人数减1
 */
export async function decreaseByServerId(serverId: string) {
    const num =  await  findByServerId(serverId);
    //如果执行服务器人数不够减设置成0
    if(Number(num) <= 1){
        await (await getRedisClinet()).set(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}` ,0);
    }else{
        await (await getRedisClinet()).decr(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
    }

}



/**
 * 查询指定服务器的在线人数
 * @param serverId 服务器编号
 */
export async function findByServerId(serverId: string) {
    return await (await getRedisClinet()).get(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`);
}



export async function resetByServerId(serverId: string) {
    await (await getRedisClinet()).set(`${RedisDict.DB1.ServerCurrentNumbersPlayers}:${serverId}`, 0);
}