import BaseRedisManager from "../../../../app/common/dao/redis/lib/BaseRedisManager";
import {describe, before, it} from "mocha";


describe("RedisManager Core ", function () {

    describe("基础功能测试 | Hash", () => {

        before(async () => {
            /** 清除当前库所有数据 */
            // const conn = await BaseRedisManager.getConnection();
            // await conn.flushdb()
        });

        const uid = `12345678`;

        it("插入新记录 player ", async () => {
            const conn = await BaseRedisManager.getConnection();
            const res = await conn.setex(`Sp:robot:${uid}`, 100, uid);
            console.log(res);
            return Promise.resolve();
        });

        it("查询插入的 player", async () => {
            const conn = await BaseRedisManager.getConnection();
            const res = await conn.get(`Sp:robot:${uid}`);
            console.log(res);
            return Promise.resolve();
        });

        it("删除", async () => {
            const conn = await BaseRedisManager.getConnection();
            const res = await conn.del(`Sp:robot:${uid}`);
            console.log(res);
            return Promise.resolve();
        })
    });

    describe("并行多库", () => {

        it("同时插入4个库", async () => {
            const [conn, conn1, conn2, conn3] = await Promise.all([
                BaseRedisManager.getConnection(),
                BaseRedisManager.getConnection(1),
                BaseRedisManager.getConnection(2),
                BaseRedisManager.getConnection(3)
            ]);

            await Promise.all([
                conn.setex(`Sp:robot:1`, 60, "1"),
                conn1.setex(`Sp:robot:2`, 60, "2"),
                conn2.setex(`Sp:robot:3`, 60, "3"),
                conn3.setex(`Sp:robot:4`, 60, "4"),
            ]);
            return Promise.resolve();
        });

    });

});