import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成热门游戏统计表的脚本
 */
async function run() {
    await RDSClient.demoInit();
    console.warn("开始生成热门游戏统计表的脚本")
    const createPlatformControlTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_HotGameData (
            id int(0) NOT NULL AUTO_INCREMENT,
            nid varchar(20) NOT NULL COMMENT '游戏id',
            sceneId int(0) NOT NULL COMMENT '场编号',
            playerNum int(0) NULL DEFAULT 0 COMMENT '登陆人数',
            createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(createPlatformControlTableSQL);

    console.warn("开始生成热门游戏统计表的脚本-----结束");

    process.exit();
}

run();