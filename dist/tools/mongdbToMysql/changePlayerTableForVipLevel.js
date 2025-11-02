"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function run() {
    let addMysql = `ALTER TABLE Sp_Player ADD COLUMN level int(0) DEFAULT 0 COMMENT 'vip等级'`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构: Sp_Player`);
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGxheWVyVGFibGVGb3JWaXBMZXZlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlUGxheWVyVGFibGVGb3JWaXBMZXZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFFakYscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsR0FBRztJQUVWLElBQUksUUFBUSxHQUFHLHlFQUF5RSxDQUFDO0lBQ3pGLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztTQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBR3ZDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==