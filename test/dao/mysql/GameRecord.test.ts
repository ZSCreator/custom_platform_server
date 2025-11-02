import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import Dao from "../../../app/common/dao/mysql/GameRecord.mysql.dao";
import {describe, before, it} from "mocha";

describe("测试游戏记录表 => Sp_GameRecord", function () {
    this.timeout(500000000);
    before(async () => {
        await RDSClient.demoInit();
    });
    
    describe("2021年8月份 耗时测试", () => {
        it("findListForGameScene | 最近的牌局记录", async () => {
            console.time("findListForGameScene 查询耗时");
            const list = await Dao.findListForGameScene("", "1", "31039628");
            console.timeEnd("findListForGameScene 查询耗时");
            console.log(list)
            return true
        });

        it("findForGameOrder | 作用于管理后台根据 gameOrder 来进行搜索", async () => {
            console.time("findForGameOrder 查询耗时");
            const list = await Dao.findForGameOrder("Sp_GameRecord", "4677007216254095598783162", "2021-07-04 00:00:00", "2021-07-04 23:59:59");
            console.timeEnd("findForGameOrder 查询耗时");
            console.log(list)

            return true
        });
    });
});
