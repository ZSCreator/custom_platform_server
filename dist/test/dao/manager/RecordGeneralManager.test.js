"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Game_redis_dao_1 = require("../../../app/common/dao/redis/Game.redis.dao");
const Player_manager_1 = require("../../../app/common/dao/daoManager/Player.manager");
const GameCommission_redis_dao_1 = require("../../../app/common/dao/redis/GameCommission.redis.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("轮子: 游戏记录测试 => ", () => {
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)(`游戏基础信息: gameManager `, async () => {
        let consoleResult = null;
        (0, mocha_1.beforeEach)(() => {
            consoleResult = null;
        });
        (0, mocha_1.afterEach)(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });
        (0, mocha_1.it)("redis: 判断游戏信息是否存在", async () => {
            const flag = await Game_redis_dao_1.default.exits("81");
            consoleResult = `是否存在 ${flag}`;
            return flag;
        });
    });
    (0, mocha_1.describe)("玩家基础信息: player", async () => {
        let consoleResult = null;
        (0, mocha_1.beforeEach)(() => {
            consoleResult = null;
        });
        (0, mocha_1.afterEach)(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });
        (0, mocha_1.it)(`玩家信息是否存在,不存在则补充`, async () => {
            const p = await Player_manager_1.default.findOne({ uid: "12345678" }, true);
            if (!p) {
                return await Player_manager_1.default.insertOne({
                    uid: "12345678",
                    thirdUid: "12345678",
                    nickname: "Andy",
                    headurl: "head8",
                    gold: 200000
                });
            }
            return p;
        });
    });
    (0, mocha_1.describe)("红包扫雷 | 测试游戏记录", async () => {
        let consoleResult = null;
        (0, mocha_1.beforeEach)(() => {
            consoleResult = null;
        });
        (0, mocha_1.afterEach)(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });
        (0, mocha_1.it)("校验是否有配套的游戏抽利设置，若有则删除", async () => {
            const exits = await GameCommission_redis_dao_1.default.exits("81");
            if (exits) {
                await GameCommission_redis_dao_1.default.delete({ nid: "81" });
            }
            return 1;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3JkR2VuZXJhbE1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvZGFvL21hbmFnZXIvUmVjb3JkR2VuZXJhbE1hbmFnZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJFQUF3RTtBQUN4RSxpRkFBd0U7QUFDeEUsc0ZBQThFO0FBQzlFLHFHQUE0RjtBQUM1RixpQ0FBa0U7QUFJbEUsSUFBQSxnQkFBUSxFQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtJQUc1QixJQUFBLGNBQU0sRUFBQyxLQUFLLElBQUksRUFBRTtRQUNkLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQTtJQUdGLElBQUEsZ0JBQVEsRUFBQyxzQkFBc0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUV4QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFekIsSUFBQSxrQkFBVSxFQUFDLEdBQUcsRUFBRTtZQUNaLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLGlCQUFTLEVBQUMsR0FBRyxFQUFFO1lBQ1gsSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzlCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLFVBQUUsRUFBQyxtQkFBbUIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMvQixNQUFNLElBQUksR0FBRyxNQUFNLHdCQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLGFBQWEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFBLGdCQUFRLEVBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDbEMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBRXpCLElBQUEsa0JBQVUsRUFBQyxHQUFHLEVBQUU7WUFDWixhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRTtZQUNYLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRTtnQkFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUM5QjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxVQUFFLEVBQUMsaUJBQWlCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFFN0IsTUFBTSxDQUFDLEdBQUcsTUFBTSx3QkFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqRSxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUVKLE9BQU8sTUFBTSx3QkFBYSxDQUFDLFNBQVMsQ0FBQztvQkFDakMsR0FBRyxFQUFFLFVBQVU7b0JBQ2YsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLFFBQVEsRUFBRSxNQUFNO29CQUNoQixPQUFPLEVBQUUsT0FBTztvQkFDaEIsSUFBSSxFQUFFLE1BQU07aUJBQ2YsQ0FBQyxDQUFDO2FBQ047WUFFRCxPQUFPLENBQUMsQ0FBQztRQUViLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLGdCQUFRLEVBQUMsZUFBZSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ2pDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQztRQUV6QixJQUFBLGtCQUFVLEVBQUMsR0FBRyxFQUFFO1lBQ1osYUFBYSxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsaUJBQVMsRUFBQyxHQUFHLEVBQUU7WUFDWCxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDOUI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsVUFBRSxFQUFDLHNCQUFzQixFQUFFLEtBQUssSUFBSSxFQUFFO1lBYWxDLE1BQU0sS0FBSyxHQUFHLE1BQU0sa0NBQXNCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZELElBQUksS0FBSyxFQUFFO2dCQUNQLE1BQU0sa0NBQXNCLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFFdEQ7WUFFRCxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUFDO0lBK0JQLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUEifQ==