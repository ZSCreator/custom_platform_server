import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import Dao from "../../../app/common/dao/mysql/Game.mysql.dao";
import {describe, before, it, afterEach} from "mocha";


describe("测试游戏配置信息表 => Sys_Game ", function () {
    before(async () => {
        await RDSClient.demoInit();
    });

    describe("Mysql 测试用例", () => {
        let consoleResult;

        afterEach(() => {

            if (!!consoleResult)
                console.log(consoleResult);
        });


        it("'单'查询并打印编号和中文名", async () => {
            const gameInfo = await Dao.findOne({ nid: "1" });

            console.log(`游戏编号: ${gameInfo.nid} | 名称: ${gameInfo.zname}`);

            return gameInfo;
        });

        it("修改游戏名称为幸运星，打印修改后的编号和中文名", async () => {
            await Dao.updateOne({ nid: "1" }, { zname: "幸运星" });

            const gameInfo = await Dao.findOne({ nid: "1" });

            consoleResult = `游戏编号: ${gameInfo.nid} | 名称: ${gameInfo.zname}`;

            return gameInfo;
        });
    });

});
