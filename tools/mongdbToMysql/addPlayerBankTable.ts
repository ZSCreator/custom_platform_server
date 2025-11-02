import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";


/**
 * 生成玩家银行表的脚本
 */
async function run() {
    await RDSClient.demoInit();
    console.warn("首先现删除玩家银行表")
    const deleSql = `DROP TABLE Sp_PlayerBank`;

    await ConnectionManager.getConnection()
        .query(deleSql);
    console.warn("首先现删除玩家银行表-----删除完成")


    console.warn("开始生成玩家银行表的脚本---开始")
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerBank (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL unique,
            bankCardNo varchar(50)  NULL COMMENT '银行卡卡号',
            bankName varchar(50) NULL  COMMENT '开户行',
            ifscCode varchar(50) NULL COMMENT '金融系统码',
            email varchar(50)  NULL  COMMENT '邮件',
            bankUserName varchar(50) NULL  COMMENT '银行卡用户名',
            upiUserName varchar(50) NULL COMMENT 'UPI用户名',
            upiAddress varchar(50) NULL COMMENT 'UPI地址',
            upiPhone varchar(50) NULL COMMENT 'UPI手机号',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;

     await ConnectionManager.getConnection()
        .query(createPlayerBankTableSQL);

    console.warn("开始生成玩家银行表的脚本-----结束");

    process.exit();
}

run();