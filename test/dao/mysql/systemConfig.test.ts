import {RDSClient} from "../../../app/common/dao/mysql/lib/RDSClient";
import SystemConfigManager from "../../../app/common/dao/daoManager/SystemConfig.manager";
import {describe, before, it} from "mocha";


describe("测试系统配置信息表 => Sys_systemConfig ", function () {
    this.timeout(50000);

    before("初始化连接池", async () => {
        await RDSClient.demoInit();
    });

    describe("Mysql 测试用例", () => {

        it("删除nid:2,并打印列表", async () => {
           const ss = await SystemConfigManager.findOne({});
           console.warn("ss",ss);
           return true;
        });
    });
});
