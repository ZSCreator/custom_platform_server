import BaseRedisManager from "../../app/common/dao/redis/lib/BaseRedisManager";


async function clear() {
    const conn = await BaseRedisManager.getConnection();
    await conn.flushall();
    console.warn('清理完成');
    process.exit();
}

process.nextTick(clear);