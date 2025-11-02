import {RDSClient} from "../../../app/common/dao/mysql/lib/RDSClient";
import Dao from "../../../app/common/dao/daoManager/Robot.manager";
import {describe, before, it} from "mocha";


describe("测试预警系统信息表 => Sys_systemGameType ", function () {
    this.timeout(50000);
    before("初始化连接池", async () => {
         await RDSClient.demoInit();
    });


        describe("Player 测试用例", () => {
                it("插入系统配置 新记录", async () => {
                    await Dao.updateOne({uid:'00158513'},{gold:3333})

                });
        });
});
