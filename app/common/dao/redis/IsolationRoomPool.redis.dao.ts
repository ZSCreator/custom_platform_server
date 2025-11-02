import * as RedisDict from '../../constant/RedisDict';
import getRedisClinet from './lib/redisConnection';

class IsolationRoomPoolRedisDao {
    /** 
     * @name 指定平台、代理增 1
     */
    async increaseByRootUidAndParantUid(rootUid: string, parantUid: string, serverId: string) {
        try {
            await (await getRedisClinet()).incr(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);
        } catch (e) {
            console.error(e.stack);
        }
    }

    /** 
     * @name 指定平台、代理减 1
     */
    async decreaseByRootUidAndParantUid(rootUid: string, parantUid: string, serverId: string) {
        try {
            /* const num = await this.findOneByRootUidAndParantUid(rootUid, parantUid, serverId);
            if (num >= 1) { */
                await (await getRedisClinet()).decr(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);
            /* } else {
                console.warn(`平台 ${rootUid} 代理 ${parantUid} 无人，依旧在减少`)
            } */
        } catch (e) {
            console.error(e.stack);
        }
    }

    async findOneByRootUidAndParantUid(rootUid: string, parantUid: string, serverId: string) {
        try {
            const num = await (await getRedisClinet()).get(`${RedisDict.DB1.IsolationRoomPool}:${serverId}:${rootUid}:${parantUid}`);

            return !!num ? Number(num) : 0;
        } catch (e) {
            console.error(e.stack);
            return 0;
        }
    }

    async reset() {
        const conn = await getRedisClinet();
        const l = await conn.keys(`${RedisDict.DB1.IsolationRoomPool}*`);
        if (l.length != 0) {
            await conn.del(...l);
        }

    }

}

export default new IsolationRoomPoolRedisDao();