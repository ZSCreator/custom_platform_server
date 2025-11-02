"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Player_mysql_dao_1 = require("../../../app/common/dao/mysql/Player.mysql.dao");
const Player_manager_1 = require("../../../app/common/dao/daoManager/Player.manager");
const redisManager_1 = require("../../../app/common/dao/redis/lib/redisManager");
const BaseRedisManager_1 = require("../../../app/common/dao/redis/lib/BaseRedisManager");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("事务更新测试", function () {
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
        await (0, redisManager_1.getRedLockInstance)();
        await Promise.all([
            BaseRedisManager_1.default.getConnection(0),
            BaseRedisManager_1.default.getConnection(1),
            BaseRedisManager_1.default.getConnection(2)
        ]);
    });
    (0, mocha_1.describe)("单一事务", async () => {
        (0, mocha_1.afterEach)(async () => {
            const info = await Player_mysql_dao_1.default.findOne({ uid: "12345678" });
            if (!!info) {
                await Player_manager_1.default.delete({ uid: "12345678" });
            }
        });
    });
    (0, mocha_1.describe)("并行事务", async () => {
        (0, mocha_1.afterEach)(async () => {
            const info = await Player_mysql_dao_1.default.findOne({ uid: "12345678" });
            if (!!info) {
                await Player_manager_1.default.delete({ uid: "12345678" });
            }
        });
    });
    (0, mocha_1.describe)("连续事务: xiyouji", async () => {
        (0, mocha_1.afterEach)(async () => {
            const info = await Player_mysql_dao_1.default.findOne({ uid: "12345678" });
            if (!!info) {
                await Player_manager_1.default.delete({ uid: "12345678" });
            }
            return Promise.resolve();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3JkR2VuZXJhbE1hbmFnZXJGb3JUcmFuLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L2Rhby9tYW5hZ2VyL1JlY29yZEdlbmVyYWxNYW5hZ2VyRm9yVHJhbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXdFO0FBQ3hFLHFGQUE0RTtBQUM1RSxzRkFBOEU7QUFDOUUsaUZBQW9GO0FBQ3BGLHlGQUE2RTtBQUM3RSxpQ0FBa0Q7QUFFbEQsSUFBQSxnQkFBUSxFQUFDLFFBQVEsRUFBRTtJQUVmLElBQUEsY0FBTSxFQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNCLE1BQU0sSUFBQSxpQ0FBa0IsR0FBRSxDQUFDO1FBQzNCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNiLDBCQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM3QiwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDN0IsMEJBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2pDLENBQUMsQ0FBQTtJQUlOLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxnQkFBUSxFQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksRUFBRTtRQUN4QixJQUFBLGlCQUFTLEVBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDUixNQUFNLHdCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDbkQ7UUFFTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxnQkFBUSxFQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksRUFBRTtRQUV4QixJQUFBLGlCQUFTLEVBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDUixNQUFNLHdCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDbkQ7UUFFTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxnQkFBUSxFQUFDLGVBQWUsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNqQyxJQUFBLGlCQUFTLEVBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDUixNQUFNLHdCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDbkQ7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==