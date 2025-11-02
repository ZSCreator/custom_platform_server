"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRedisManager_1 = require("../../../../app/common/dao/redis/lib/BaseRedisManager");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("RedisManager Core ", function () {
    (0, mocha_1.describe)("基础功能测试 | Hash", () => {
        (0, mocha_1.before)(async () => {
        });
        const uid = `12345678`;
        (0, mocha_1.it)("插入新记录 player ", async () => {
            const conn = await BaseRedisManager_1.default.getConnection();
            const res = await conn.setex(`Sp:robot:${uid}`, 100, uid);
            console.log(res);
            return Promise.resolve();
        });
        (0, mocha_1.it)("查询插入的 player", async () => {
            const conn = await BaseRedisManager_1.default.getConnection();
            const res = await conn.get(`Sp:robot:${uid}`);
            console.log(res);
            return Promise.resolve();
        });
        (0, mocha_1.it)("删除", async () => {
            const conn = await BaseRedisManager_1.default.getConnection();
            const res = await conn.del(`Sp:robot:${uid}`);
            console.log(res);
            return Promise.resolve();
        });
    });
    (0, mocha_1.describe)("并行多库", () => {
        (0, mocha_1.it)("同时插入4个库", async () => {
            const [conn, conn1, conn2, conn3] = await Promise.all([
                BaseRedisManager_1.default.getConnection(),
                BaseRedisManager_1.default.getConnection(1),
                BaseRedisManager_1.default.getConnection(2),
                BaseRedisManager_1.default.getConnection(3)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJlZGlzTWFuYWdlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9kYW8vcmVkaXMvbGliL0Jhc2VSZWRpc01hbmFnZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRGQUFxRjtBQUNyRixpQ0FBMkM7QUFHM0MsSUFBQSxnQkFBUSxFQUFDLG9CQUFvQixFQUFFO0lBRTNCLElBQUEsZ0JBQVEsRUFBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1FBRTNCLElBQUEsY0FBTSxFQUFDLEtBQUssSUFBSSxFQUFFO1FBSWxCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDO1FBRXZCLElBQUEsVUFBRSxFQUFDLGVBQWUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMzQixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3BELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxVQUFFLEVBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxVQUFFLEVBQUMsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLGdCQUFRLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUVsQixJQUFBLFVBQUUsRUFBQyxTQUFTLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDckIsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDbEQsMEJBQWdCLENBQUMsYUFBYSxFQUFFO2dCQUNoQywwQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNqQywwQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNqQywwQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ3BDLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2dCQUNqQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2FBQ3JDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBRVAsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9