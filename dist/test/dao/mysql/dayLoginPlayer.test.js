"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DayLoginPlayer_redis_dao_1 = require("../../../app/common/dao/redis/DayLoginPlayer.redis.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试当日登陆玩家信息 => Sys_dayLoginPlayer ", async function () {
    (0, mocha_1.describe)("Redis 测试用例", () => {
        let consoleResult;
        (0, mocha_1.it)("插入", async () => {
            const flag = await DayLoginPlayer_redis_dao_1.default.insertOne({ uid: '22222', loginTime: new Date(), loginNum: 1 });
            console.warn("flag", flag);
            consoleResult = flag;
            return flag;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5TG9naW5QbGF5ZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvZGFvL215c3FsL2RheUxvZ2luUGxheWVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxR0FBeUU7QUFDekUsaUNBQW1DO0FBRW5DLElBQUEsZ0JBQVEsRUFBQyxtQ0FBbUMsRUFBRSxLQUFLO0lBRS9DLElBQUEsZ0JBQVEsRUFBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBQ3hCLElBQUksYUFBYSxDQUFDO1FBRWxCLElBQUEsVUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLGtDQUFHLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxTQUFTLEVBQUcsSUFBSSxJQUFJLEVBQUUsRUFBRyxRQUFRLEVBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUN0RixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQTtZQUN6QixhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9