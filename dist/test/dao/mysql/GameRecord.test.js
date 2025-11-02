"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const GameRecord_mysql_dao_1 = require("../../../app/common/dao/mysql/GameRecord.mysql.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试游戏记录表 => Sp_GameRecord", function () {
    this.timeout(500000000);
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("2021年8月份 耗时测试", () => {
        (0, mocha_1.it)("findListForGameScene | 最近的牌局记录", async () => {
            console.time("findListForGameScene 查询耗时");
            const list = await GameRecord_mysql_dao_1.default.findListForGameScene("", "1", "31039628");
            console.timeEnd("findListForGameScene 查询耗时");
            console.log(list);
            return true;
        });
        (0, mocha_1.it)("findForGameOrder | 作用于管理后台根据 gameOrder 来进行搜索", async () => {
            console.time("findForGameOrder 查询耗时");
            const list = await GameRecord_mysql_dao_1.default.findForGameOrder("Sp_GameRecord", "4677007216254095598783162", "2021-07-04 00:00:00", "2021-07-04 23:59:59");
            console.timeEnd("findForGameOrder 查询耗时");
            console.log(list);
            return true;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9kYW8vbXlzcWwvR2FtZVJlY29yZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXdFO0FBQ3hFLDZGQUFxRTtBQUNyRSxpQ0FBMkM7QUFFM0MsSUFBQSxnQkFBUSxFQUFDLDBCQUEwQixFQUFFO0lBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEIsSUFBQSxjQUFNLEVBQUMsS0FBSyxJQUFJLEVBQUU7UUFDZCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLGdCQUFRLEVBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUMzQixJQUFBLFVBQUUsRUFBQyxnQ0FBZ0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDMUMsTUFBTSxJQUFJLEdBQUcsTUFBTSw4QkFBRyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakUsT0FBTyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDakIsT0FBTyxJQUFJLENBQUE7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsVUFBRSxFQUFDLDhDQUE4QyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLDhCQUFHLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLDJCQUEyQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDcEksT0FBTyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFFakIsT0FBTyxJQUFJLENBQUE7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==