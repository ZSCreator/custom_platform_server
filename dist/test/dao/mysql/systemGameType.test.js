"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const SystemGameType_mysql_dao_1 = require("../../../app/common/dao/mysql/SystemGameType.mysql.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试游戏分类信息表 => Sys_systemGameType ", function () {
    this.timeout(50000);
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.it)("插入系统配置 新记录", async () => {
        const info = { nidList: '' };
        await SystemGameType_mysql_dao_1.default.updateOne({ id: 1, typeId: 1, open: true }, info);
        return true;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtR2FtZVR5cGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvZGFvL215c3FsL3N5c3RlbUdhbWVUeXBlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyRUFBc0U7QUFDdEUscUdBQXlFO0FBQ3pFLGlDQUEyQztBQUkzQyxJQUFBLGdCQUFRLEVBQUMsa0NBQWtDLEVBQUU7SUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQixJQUFBLGNBQU0sRUFBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBR0gsSUFBQSxVQUFFLEVBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBQzNCLE1BQU0sa0NBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0lBRWhCLENBQUMsQ0FBQyxDQUFDO0FBYVAsQ0FBQyxDQUFDLENBQUMifQ==