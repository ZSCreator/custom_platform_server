import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成每日统计玩家当日获得返佣表
 */
async function run() {
    await RDSClient.demoInit();


    console.warn("开始生成每日统计玩家当日获得返佣表---开始")
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_DayPlayerRebateRecord (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL COMMENT 'uid',
            rebateUid varchar(20) NOT NULL COMMENT 'uid',
            dayRebate int(0)  NOT NULL DEFAULT 0,
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(createPlayerBankTableSQL);

    console.warn("开始生成每日统计玩家当日获得返佣表-----结束");

    process.exit();
}

run();