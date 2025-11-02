"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
async function changePlayerHistoryField() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn(`开始修改Sp_PlayerGameHistory表结构`);
    const sql = `alter table Sp_PlayerGameHistory MODIFY column nid VARCHAR(3) NOT NULL DEFAULT '' COMMENT '游戏id'`;
    await connectionManager_1.default.getConnection(false)
        .query(sql);
    console.warn(`修改Sp_PlayerGameHistory表结构完成`);
    process.exit();
}
process.nextTick(changePlayerHistoryField);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlR2FtZUhpc3RvcnlGaWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlR2FtZUhpc3RvcnlGaWVsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdGQUFpRjtBQUNqRix3RUFBbUU7QUFLbkUsS0FBSyxVQUFVLHdCQUF3QjtJQUNuQyxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sR0FBRyxHQUFHLGtHQUFrRyxDQUFDO0lBQy9HLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztTQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDIn0=