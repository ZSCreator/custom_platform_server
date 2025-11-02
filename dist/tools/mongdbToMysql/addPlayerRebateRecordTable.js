"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("开始生成玩家返佣记录表的脚本---开始");
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerRebateRecord (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL COMMENT 'uid',
            rebateUid varchar(20) NOT NULL COMMENT 'uid',
            rebate int(0)  NOT NULL DEFAULT 0,
            level int(0)  NOT NULL DEFAULT 0,
            rebateProportion double  NOT NULL DEFAULT 0,
            commission int(0) NOT NULL DEFAULT 0,
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn("开始生成玩家返佣记录表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyUmViYXRlUmVjb3JkVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2FkZFBsYXllclJlYmF0ZVJlY29yZFRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQU1qRixLQUFLLFVBQVUsR0FBRztJQUNkLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUczQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFDbkMsTUFBTSx3QkFBd0IsR0FBRzs7Ozs7Ozs7Ozs7OztLQWFoQyxDQUFDO0lBRUQsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbkMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFFckMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRXRDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==