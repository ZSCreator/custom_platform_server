"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Robot_manager_1 = require("../../../app/common/dao/daoManager/Robot.manager");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试预警系统信息表 => Sys_systemGameType ", function () {
    this.timeout(50000);
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("Player 测试用例", () => {
        (0, mocha_1.it)("插入系统配置 新记录", async () => {
            await Robot_manager_1.default.updateOne({ uid: '00158513' }, { gold: 3333 });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyVGVzdC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9kYW8vbXlzcWwvcGxheWVyVGVzdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXNFO0FBQ3RFLG9GQUFtRTtBQUNuRSxpQ0FBMkM7QUFHM0MsSUFBQSxnQkFBUSxFQUFDLGtDQUFrQyxFQUFFO0lBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEIsSUFBQSxjQUFNLEVBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUdDLElBQUEsZ0JBQVEsRUFBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLElBQUEsVUFBRSxFQUFDLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtZQUN4QixNQUFNLHVCQUFHLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFDLFVBQVUsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUE7UUFFckQsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDIn0=