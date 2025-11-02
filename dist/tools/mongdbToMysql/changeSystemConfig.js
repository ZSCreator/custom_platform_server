"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行:Sys_SystemConfig`);
    let deleteSql = `alter table  Sys_SystemConfig  ADD  gameResultUrl varchar(100) NULL ,  ADD  backButton json NULL ,  ADD  hotGameButton json NULL`;
    await connectionManager_1.default.getConnection(false)
        .query(deleteSql);
    console.warn(`执行完成表结构：Sys_SystemConfig`);
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlU3lzdGVtQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9jaGFuZ2VTeXN0ZW1Db25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBRWpGLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDdEMsSUFBSSxTQUFTLEdBQUUsaUlBQWlJLENBQUM7SUFDakosTUFBUSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPO0FBQ1gsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==