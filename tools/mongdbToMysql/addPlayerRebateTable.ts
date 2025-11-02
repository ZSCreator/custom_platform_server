import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成玩家返佣表
 */
async function run() {
    await RDSClient.demoInit();
    console.warn("首先现删除玩家返佣表")
    const deleSql = `DROP TABLE Sp_PlayerRebate`;

    await ConnectionManager.getConnection()
        .query(deleSql);
    console.warn("首先现删除玩家返佣表-----删除完成")


    console.warn("开始生成玩家返佣表的脚本---开始")
    const playerRebateSql = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerRebate (
            uid varchar(20) NOT NULL ,
            allRebate int(0)  NOT NULL DEFAULT 0,
            todayRebate int(0)  NOT NULL DEFAULT 0,
            yesterdayRebate int(0)  NOT NULL DEFAULT 0,
            sharePeople int(0) NOT NULL DEFAULT 0,
            dayPeople int(0) NOT NULL DEFAULT 0,
            iplRebate int(0) NOT NULL DEFAULT 0,
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(playerRebateSql);

    console.warn("开始生成玩家返佣表的脚本-----结束");
    //


    // console.warn("开始生成玩家返佣记录表的脚本---开始")
    // const playerRebateRecordSql = `
    //     CREATE TABLE IF NOT EXISTS Sp_PlayerRebateRecord (
    //         id int(0) NOT NULL AUTO_INCREMENT,
    //         uid varchar(20) NOT NULL COMMENT 'uid',
    //         rebateUid varchar(20) NOT NULL COMMENT 'uid',
    //         rebate int(0)  NOT NULL DEFAULT 0,
    //         rebateProportion double  NOT NULL DEFAULT 0,
    //         commission int(0) NOT NULL DEFAULT 0,
    //         level int(0) NOT NULL DEFAULT 0,
    //         createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
    //         PRIMARY KEY (id) USING BTREE,
    //         INDEX idx_uid(uid) USING BTREE
    // ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    // `;
    //
    // await ConnectionManager.getConnection()
    //     .query(playerRebateRecordSql);
    //
    // console.warn("开始生成玩家返佣记录表的脚本-----结束");
    //
    // console.warn("开始生成玩家领取返佣的记录表---开始")
    // const PlayerReceiveRebateRecordSql = `
    //     CREATE TABLE IF NOT EXISTS Sp_PlayerReceiveRebateRecord (
    //         id int(0) NOT NULL AUTO_INCREMENT,
    //         uid varchar(20) NOT NULL COMMENT 'uid',
    //         rebate int(0)  NOT NULL DEFAULT 0,
    //         createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
    //         PRIMARY KEY (id) USING BTREE,
    //         INDEX idx_uid(uid) USING BTREE
    // ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    // `;
    //
    // await ConnectionManager.getConnection()
    //     .query(PlayerReceiveRebateRecordSql);
    //
    // console.warn("开始生成玩家领取返佣的记录表表-----结束");
    //
    //
    //
    //
    // console.warn("开始生成每日统计玩家当日获得返佣表---开始")
    // const dayPlayerRebateRecordSQL = `
    //     CREATE TABLE IF NOT EXISTS Sp_DayPlayerRebateRecord (
    //         id int(0) NOT NULL AUTO_INCREMENT,
    //         uid varchar(20) NOT NULL COMMENT 'uid',
    //         rebateUid varchar(20) NOT NULL COMMENT 'uid',
    //         dayRebate int(0)  NOT NULL DEFAULT 0,
    //         createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
    //         PRIMARY KEY (id) USING BTREE,
    //         INDEX idx_uid(uid) USING BTREE
    // ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    // `;
    //
    // await ConnectionManager.getConnection()
    //     .query(dayPlayerRebateRecordSQL);
    //
    // console.warn("开始生成每日统计玩家当日获得返佣表-----结束");
    //
    //
    // console.warn(`开始执行 Sys_SystemConfig`);
    // let addSystemConfig = `alter table Sys_SystemConfig ADD COLUMN iplRebate int DEFAULT 0 , ADD COLUMN unlimitedList  json DEFAULT NULL,ADD COLUMN defaultChannelCode VARCHAR(50) DEFAULT NULL,  ADD COLUMN openUnlimited  int DEFAULT 0`;
    // await ConnectionManager.getConnection(false)
    //     .query(addSystemConfig);
    // console.warn(`执行完成表结构：Sys_SystemConfig`);
    //
    // console.warn(`开始执行 Sp_Player`);
    // let addMysql = `alter table Sp_Player drop vipScore, ADD COLUMN shareUid  VARCHAR(20) DEFAULT NULL`;
    // await ConnectionManager.getConnection(false)
    //     .query(addMysql);
    // console.warn(`执行完成表结构：Sp_Player`);


    process.exit();
}

run();