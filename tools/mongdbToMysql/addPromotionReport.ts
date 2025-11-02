import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成玩家App版本推广报表
 */
async function run() {
    await RDSClient.demoInit();
    console.warn("开始生成生成玩家App版本推广报表的脚本")
    const sql = `
        CREATE TABLE IF NOT EXISTS Sp_PromotionReportApp (
            id int(0) NOT NULL AUTO_INCREMENT,
            agentUid varchar(20) NOT NULL COMMENT 'agentUid',
            agentName varchar(50) NOT NULL COMMENT '代理的名称',
            platformName varchar(50) NOT NULL DEFAULT 0 COMMENT '平台的名称',
            todayPlayer int NOT NULL DEFAULT 0 COMMENT '今日新增人数',
            todayAddRmb int NOT NULL DEFAULT 0 COMMENT '今日充值',
            todayTixian int NOT NULL DEFAULT 0 COMMENT '今日提现',
            todayFlow  int NOT NULL DEFAULT 0 COMMENT '今日码量',
            todayCommission  int NOT NULL DEFAULT 0 COMMENT '今日抽水',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_createDate_agentName(createDate,agentName) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(sql);


    console.warn("开始生成生成玩家App版本推广报表的脚本-----结束");

    process.exit();
}

run();