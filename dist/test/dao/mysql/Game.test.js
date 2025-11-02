"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Game_mysql_dao_1 = require("../../../app/common/dao/mysql/Game.mysql.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试游戏配置信息表 => Sys_Game ", function () {
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("Mysql 测试用例", () => {
        let consoleResult;
        (0, mocha_1.afterEach)(() => {
            if (!!consoleResult)
                console.log(consoleResult);
        });
        (0, mocha_1.it)("'单'查询并打印编号和中文名", async () => {
            const gameInfo = await Game_mysql_dao_1.default.findOne({ nid: "1" });
            console.log(`游戏编号: ${gameInfo.nid} | 名称: ${gameInfo.zname}`);
            return gameInfo;
        });
        (0, mocha_1.it)("修改游戏名称为幸运星，打印修改后的编号和中文名", async () => {
            await Game_mysql_dao_1.default.updateOne({ nid: "1" }, { zname: "幸运星" });
            const gameInfo = await Game_mysql_dao_1.default.findOne({ nid: "1" });
            consoleResult = `游戏编号: ${gameInfo.nid} | 名称: ${gameInfo.zname}`;
            return gameInfo;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9kYW8vbXlzcWwvR2FtZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXdFO0FBQ3hFLGlGQUErRDtBQUMvRCxpQ0FBc0Q7QUFHdEQsSUFBQSxnQkFBUSxFQUFDLHdCQUF3QixFQUFFO0lBQy9CLElBQUEsY0FBTSxFQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxnQkFBUSxFQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7UUFDeEIsSUFBSSxhQUFhLENBQUM7UUFFbEIsSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRTtZQUVYLElBQUksQ0FBQyxDQUFDLGFBQWE7Z0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUdILElBQUEsVUFBRSxFQUFDLGdCQUFnQixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzVCLE1BQU0sUUFBUSxHQUFHLE1BQU0sd0JBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUVqRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLEdBQUcsVUFBVSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU3RCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsVUFBRSxFQUFDLHlCQUF5QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3JDLE1BQU0sd0JBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUVwRCxNQUFNLFFBQVEsR0FBRyxNQUFNLHdCQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFakQsYUFBYSxHQUFHLFNBQVMsUUFBUSxDQUFDLEdBQUcsVUFBVSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFaEUsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=