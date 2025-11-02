import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成玩家解锁游戏的脚本
 */
async function run() {
    await RDSClient.demoInit();
    // console.warn("开始删除玩家解锁游戏的脚本")
    // const deleSql = `DROP TABLE Sp_PlayerUnlockGameData`;
    //
    // await ConnectionManager.getConnection()
    //     .query(deleSql);
    // console.warn("开始删除玩家解锁游戏的脚本-----删除完成")

    let addMysql = `alter table Sp_Player ADD alms   int DEFAULT 0`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);


    console.warn("开始生成玩家解锁游戏的脚本---开始")
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerUnlockGameData (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL unique,
            unlockGames varchar(255)  NULL COMMENT '解锁游戏',
            createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(createPlayerBankTableSQL);

    console.warn("开始生成玩家解锁游戏表的脚本-----结束");

    process.exit();
}

run();