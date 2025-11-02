"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const utils_1 = require("../../app/utils");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行修改后台账号密码得脚本`);
    let sql = `select Sp_ManagerInfo.id ,Sp_ManagerInfo.userName, Sp_ManagerInfo.passWord  FROM  Sp_ManagerInfo `;
    const result = await connectionManager_1.default.getConnection(false)
        .query(sql);
    for (let managerinfo of result) {
        let passWord = managerinfo.passWord;
        passWord = (0, utils_1.signature)(passWord, false, false);
        let sql = `update Sp_ManagerInfo SET Sp_ManagerInfo.passWord = "${passWord}" WHERE Sp_ManagerInfo.id = ${managerinfo.id}`;
        await connectionManager_1.default.getConnection(false)
            .query(sql);
        console.warn(`修改用户名${managerinfo.userName}完成`);
    }
    console.warn(`执行修改后台账号密码得脚本===========完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlTWFuYWdlckluZm9QYXNzd29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlTWFuYWdlckluZm9QYXNzd29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFDakYsMkNBQTBDO0FBRTFDLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDZCxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFOUIsSUFBSSxHQUFHLEdBQUcsbUdBQW1HLENBQUM7SUFDOUcsTUFBTSxNQUFNLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3RELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQixLQUFJLElBQUksV0FBVyxJQUFJLE1BQU0sRUFBQztRQUMxQixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3BDLFFBQVEsR0FBRyxJQUFBLGlCQUFTLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLEdBQUcsR0FBRyx3REFBd0QsUUFBUSwrQkFBK0IsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3pILE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQzthQUN4QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLFdBQVcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBRy9DLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLE9BQU87QUFDWCxDQUFDO0FBQ0QsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9