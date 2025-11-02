import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

export async function run() {
    await RDSClient.demoInit();
    const sql = `
        CREATE TABLE Sp_VipConfig  (
            id int(0) NOT NULL AUTO_INCREMENT,
            level int(0) NULL DEFAULT NULL COMMENT 'vip等级',
            des varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '中文说明',
            levelScore int(0) NULL DEFAULT NULL COMMENT '达到当前vip等级的充值要求',
            bonus int(0) NULL DEFAULT NULL COMMENT 'vip等级奖励',
            bonusForWeeks int(0) NULL DEFAULT NULL COMMENT '当前vip等级每周签到奖励',
            bonusForMonth int(0) NULL DEFAULT NULL COMMENT '当前vip等级每月签到奖励',
            createDateTime datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
            updateDateTime datetime(0) NULL DEFAULT NULL COMMENT '最近更新时间',
            PRIMARY KEY (id) USING BTREE
          ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;
          `

    const res = await ConnectionManager.getConnection()
        .query(sql);

    console.warn('结果', res);

    process.exit();
}