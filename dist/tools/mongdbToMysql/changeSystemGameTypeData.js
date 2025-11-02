"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行:Sys_SystemConfig`);
    let deleteSql = `alter table  Sys_SystemConfig  ADD  gameResultUrl varchar(50) NULL ,  ADD  backButton json NULL ,  ADD  hotGameButton json NULL`;
    await ConnectionManager.getConnection(false)
        .query(deleteSql);
    console.warn(`执行完成表结构：Sys_SystemConfig`);
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlU3lzdGVtR2FtZVR5cGVEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9jaGFuZ2VTeXN0ZW1HYW1lVHlwZURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFHckUscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsS0FBSztJQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMxQyxJQUFJLFNBQVMsR0FBRSxpSUFBaUksQ0FBQztJQUNqSixNQUFRLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7U0FDekMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLE9BQU87QUFDWCxDQUFDO0FBQ0QsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9