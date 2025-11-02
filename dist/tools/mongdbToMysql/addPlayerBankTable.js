"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("首先现删除玩家银行表");
    const deleSql = `DROP TABLE Sp_PlayerBank`;
    await connectionManager_1.default.getConnection()
        .query(deleSql);
    console.warn("首先现删除玩家银行表-----删除完成");
    console.warn("开始生成玩家银行表的脚本---开始");
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
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn("开始生成玩家银行表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyQmFua1RhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9hZGRQbGF5ZXJCYW5rVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBTWpGLEtBQUssVUFBVSxHQUFHO0lBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDMUIsTUFBTSxPQUFPLEdBQUcsMEJBQTBCLENBQUM7SUFFM0MsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtJQUduQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDakMsTUFBTSx3QkFBd0IsR0FBRzs7Ozs7Ozs7Ozs7Ozs7OztLQWdCaEMsQ0FBQztJQUVELE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO1NBQ25DLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBRXJDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVwQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELEdBQUcsRUFBRSxDQUFDIn0=