"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const SystemConfig_manager_1 = require("../../../app/common/dao/daoManager/SystemConfig.manager");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试系统配置信息表 => Sys_systemConfig ", function () {
    this.timeout(50000);
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("Mysql 测试用例", () => {
        (0, mocha_1.it)("删除nid:2,并打印列表", async () => {
            const ss = await SystemConfig_manager_1.default.findOne({});
            console.warn("ss", ss);
            return true;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtQ29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L2Rhby9teXNxbC9zeXN0ZW1Db25maWcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJFQUFzRTtBQUN0RSxrR0FBMEY7QUFDMUYsaUNBQTJDO0FBRzNDLElBQUEsZ0JBQVEsRUFBQyxnQ0FBZ0MsRUFBRTtJQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXBCLElBQUEsY0FBTSxFQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN4QixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLGdCQUFRLEVBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtRQUV4QixJQUFBLFVBQUUsRUFBQyxlQUFlLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDNUIsTUFBTSxFQUFFLEdBQUcsTUFBTSw4QkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==