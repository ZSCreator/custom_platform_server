"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("开始生成玩家领取返佣的记录表---开始");
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerReceiveRebateRecord (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL COMMENT 'uid',
            rebate int(0)  NOT NULL DEFAULT 0,
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn("开始生成玩家领取返佣的记录表表-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyUmVjZWl2ZVJlYmF0ZVJlY29yZFRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9hZGRQbGF5ZXJSZWNlaXZlUmViYXRlUmVjb3JkVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBTWpGLEtBQUssVUFBVSxHQUFHO0lBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtJQUNuQyxNQUFNLHdCQUF3QixHQUFHOzs7Ozs7Ozs7S0FTaEMsQ0FBQztJQUVELE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO1NBQ25DLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBRXJDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUV2QyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELEdBQUcsRUFBRSxDQUFDIn0=