import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

export async function run() {
    await RDSClient.demoInit();
    const sql = `
    CREATE TABLE Sp_VipBonusDetails  (
        id int(0) NOT NULL AUTO_INCREMENT,
        uid varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '玩家编号',
        level int(0) NULL DEFAULT 0 COMMENT 'vip等级',
        bonus int(0) NULL DEFAULT 0 COMMENT 'vip等级奖励',
        whetherToReceiveLeverBonus int(0) NULL DEFAULT 0 COMMENT '是否领取vip等级奖励 0 否 1 是',
        bonusForWeeks int(0) NULL DEFAULT 0 COMMENT '周签到奖励',
        bonusForWeeksLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次周签到奖励时间',
        bonusForMonth int(0) NULL DEFAULT 0 COMMENT '月签到奖励',
        bonusForMonthLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次月签到奖励时间',
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