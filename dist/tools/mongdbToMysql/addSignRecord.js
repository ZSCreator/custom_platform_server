"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("开始生成玩家提现记录表的脚本");
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_SignRecord (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL COMMENT 'uid',
            type int(0) NOT NULL DEFAULT 0 COMMENT '签到类型',
            beginGold int(0) NOT NULL DEFAULT 0  COMMENT '领取前金币',
            lastGold int(0) NOT NULL DEFAULT 0  COMMENT '领取后金币',
            gold int(0) NOT NULL DEFAULT 0  COMMENT '领取金币',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn("开始生成玩家签到表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkU2lnblJlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvYWRkU2lnblJlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFNakYsS0FBSyxVQUFVLEdBQUc7SUFDZCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sd0JBQXdCLEdBQUc7Ozs7Ozs7Ozs7OztLQVloQyxDQUFDO0lBRUQsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbkMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFFckMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==