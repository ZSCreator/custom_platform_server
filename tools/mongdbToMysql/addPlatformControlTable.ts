import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成平台调控表脚本
 */
async function run() {
    await RDSClient.demoInit();

    const createPlatformControlTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlatformControl (
            id int(0) NOT NULL AUTO_INCREMENT,
            record_type varchar(5) NOT NULL COMMENT '数据类型',
            platformId varchar(30)  NOT NULL DEFAULT '' COMMENT '平台id',
            nid varchar(3) NULL DEFAULT NULL COMMENT '游戏id',
            sceneId int(0) NULL DEFAULT NULL COMMENT '场id',
            profit bigint(0) NOT NULL COMMENT '收益单位为分',
            betGoldAmount bigint(0) NOT NULL COMMENT '下注金币',
            betRoundCount int(0) NOT NULL COMMENT '玩家总投注次数统计',
            serviceCharge bigint(0) NOT NULL COMMENT '抽水费',
            controlLossCount int(0) NOT NULL COMMENT '被调控系统输的单',
            controlWinCount int(0) NOT NULL COMMENT '被调控系统赢的单',
            controlEquality int(0) NOT NULL COMMENT '受调控影响不输不赢的单',
            killRate float (0) NOT NULL COMMENT '系统杀率',
            systemWinRate float(0) NOT NULL COMMENT '系统胜率',
            playerWinCount int(0) NOT NULL COMMENT '玩家盈利的次数',
            systemWinCount int(0) NOT NULL COMMENT '系统盈利次数',
            equalityCount int(0) NOT NULL COMMENT '系统和玩家平局的情况',
            controlStateStatistical json NOT NULL COMMENT '调控单类型统计',
            betPlayersSet json NOT NULL COMMENT '下注玩家uid集合',
            createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            updateTime datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '最近修改时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_paltformId(platformId) USING BTREE,
            INDEX idx_uid_createTimeDate_game_id_groupRemark(createTime, platformId) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

    const creatTablePlatformStateSQL = `CREATE TABLE IF NOT EXISTS Sp_PlatformControlState (
        id int(0) NOT NULL AUTO_INCREMENT,
        state_type varchar(3) NOT NULL COMMENT '数据类型',
        createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        updateTime datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '最近修改时间',
        platformId varchar(30) NOT NULL DEFAULT '' COMMENT '平台id',
        nid varchar(3) NULL COMMENT '游戏id',
        killRate float(0) NOT NULL DEFAULT 0 COMMENT '系统杀率',
        PRIMARY KEY (id) USING BTREE,
        INDEX idx_paltformId(platformId) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `

    const one = await ConnectionManager.getConnection()
        .query(createPlatformControlTableSQL);

    const two = await ConnectionManager.getConnection()
        .query(creatTablePlatformStateSQL);

    console.warn('结果', one, two);

    process.exit();
}

run();