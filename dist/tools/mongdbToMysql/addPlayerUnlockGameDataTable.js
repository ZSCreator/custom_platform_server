"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    let addMysql = `alter table Sp_Player ADD alms   int DEFAULT 0`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);
    console.warn("开始生成玩家解锁游戏的脚本---开始");
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerUnlockGameData (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL unique,
            unlockGames varchar(255)  NULL COMMENT '解锁游戏',
            createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn("开始生成玩家解锁游戏表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyVW5sb2NrR2FtZURhdGFUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvYWRkUGxheWVyVW5sb2NrR2FtZURhdGFUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFNakYsS0FBSyxVQUFVLEdBQUc7SUFDZCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFRM0IsSUFBSSxRQUFRLEdBQUcsZ0RBQWdELENBQUM7SUFDaEUsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFHbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ2xDLE1BQU0sd0JBQXdCLEdBQUc7Ozs7Ozs7O0tBUWhDLENBQUM7SUFFRCxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUNuQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUVyQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFdEMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxHQUFHLEVBQUUsQ0FBQyJ9