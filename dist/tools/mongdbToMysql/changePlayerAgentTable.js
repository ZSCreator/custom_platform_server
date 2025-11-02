"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    let addMysql = `alter table Sp_Player_Agent DROP invite_code, DROP updateDateTime`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGxheWVyQWdlbnRUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlUGxheWVyQWdlbnRUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFFakYscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsS0FBSztJQUNkLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFZbkIsSUFBSSxRQUFRLEdBQUcsbUVBQW1FLENBQUM7SUFDbkYsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFLdEMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=