import Dao from "../../../app/common/dao/redis/DayLoginPlayer.redis.dao";
import {describe, it} from "mocha";

describe("测试当日登陆玩家信息 => Sys_dayLoginPlayer ", async function () {

    describe("Redis 测试用例", () => {
        let consoleResult;

        it("插入", async () => {
            const flag = await Dao.insertOne({uid:'22222',loginTime:  new Date() , loginNum : 1});
            console.warn("flag",flag)
            consoleResult = flag;
            return flag;
        });
    });

});
