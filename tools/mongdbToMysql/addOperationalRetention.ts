import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成渠道运营留存表
 */
async function run() {
    await RDSClient.demoInit();
    console.warn("开始生成生成渠道运营留存表的脚本")
    const sql = `
        CREATE TABLE IF NOT EXISTS Sp_OperationalRetention (
            id int(0) NOT NULL AUTO_INCREMENT,
            agentName varchar(50) NOT NULL COMMENT '代理的名称',
            betPlayer json DEFAULT NULL COMMENT '活跃会员',
            addPlayer  json DEFAULT NULL COMMENT '新增人数',
            AddRmbPlayer json DEFAULT NULL COMMENT '充值玩家人数',
            allAddRmb int NOT NULL DEFAULT 0 COMMENT '总收入',
            secondNum  int NOT NULL DEFAULT 0 COMMENT '次日留存率',
            threeNum  int NOT NULL DEFAULT 0 COMMENT '3日抽水',
            sevenNum  int NOT NULL DEFAULT 0 COMMENT '7日抽水',
            fifteenNum  int NOT NULL DEFAULT 0 COMMENT '15日抽水',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_createDate_agentName(createDate,agentName) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(sql);


    console.warn("开始生成生成渠道运营留存表-----结束");

    process.exit();
}

run();