import {RDSClient} from "../../../app/common/dao/mysql/lib/RDSClient";
import Dao from "../../../app/common/dao/mysql/SystemGameType.mysql.dao";
import {describe, before, it} from "mocha";



describe("测试游戏分类信息表 => Sys_systemGameType ", function () {
    this.timeout(50000);
    before("初始化连接池", async () => {
         await RDSClient.demoInit();
    });


    it("插入系统配置 新记录", async () => {
        const info = {nidList: ''};
        await Dao.updateOne({ id: 1,typeId:1,open:true},info);
        return true;
        // return await SystemGameTypeManager.findList({});
    });


    // describe("Mysql 测试用例", () => {
    //
    //     it("删除nid:2,并打印列表", async () => {
    //         const ss = await SystemGameTypeManager.findList({});
    //         console.warn("ss",ss);
    //         return true;
    //     });
    // });


});
