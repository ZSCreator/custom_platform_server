"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("首先现删除家提现记录");
    const deleSql = `DROP TABLE Sp_PlayerCashRecord`;
    await connectionManager_1.default.getConnection()
        .query(deleSql);
    console.warn("首先现删除家提现记录-----删除完成");
    console.warn("开始生成玩家提现记录表的脚本");
    const createPlayerBankTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_PlayerCashRecord (
            id int(0) NOT NULL AUTO_INCREMENT,
            uid varchar(20) NOT NULL COMMENT 'uid',
            bankCardNo varchar(50) NOT NULL COMMENT '银行卡卡号',
            bankName varchar(50) NOT NULL DEFAULT 0 COMMENT '开户行',
            ifscCode varchar(50) NOT NULL DEFAULT 0 COMMENT '金融系统码',
            email varchar(50) NOT NULL DEFAULT 0 COMMENT '邮件',
            bankUserName varchar(50) NOT NULL DEFAULT 0 COMMENT '银行卡用户名',
            allCash int(0) NOT NULL DEFAULT 0 COMMENT '累计提现',
            allAddRmb int(0) NOT NULL DEFAULT 0 COMMENT '累计充值',
            money int(0) NOT NULL DEFAULT 0 COMMENT '本次提现',
            checkName  varchar(50) NULL DEFAULT NULL COMMENT '谁通过审核',
            orderNo varchar(100) NOT NULL  DEFAULT 0 COMMENT '订单号',
            orderStatus int(0) NOT NULL DEFAULT 0 COMMENT '订单状态',
            cashStatus int(0) NOT NULL DEFAULT 0 COMMENT '汇款状态',
            remittance varchar(50)  NULL DEFAULT NULL  COMMENT '谁汇款',
            lastGold int(0) NOT NULL DEFAULT 0 COMMENT '剩余金币',
            payAccountName varchar(50)  NULL DEFAULT NULL  COMMENT '代付商家',
            groupRemark varchar(28)  NULL DEFAULT NULL  COMMENT '玩家代理',
            payFlag int(0) NOT NULL DEFAULT 0 COMMENT '是否自动代付',
            content varchar(50) NULL DEFAULT NULL  COMMENT '拒绝理由',
            flowCount int(0) NOT NULL DEFAULT 0 COMMENT '玩家总流水',
            type int(0) NOT NULL DEFAULT 0 COMMENT '提现卡类型',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE,
            INDEX idx_createDate_orderStatus_cashStatus(createDate, orderStatus, cashStatus) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    console.warn(`开始执行`);
    let addMysql = `alter table Sp_PlayerCashRecord ADD COLUMN startGold int(0) NOT NULL DEFAULT 0 `;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_PlayerCashRecord`);
    console.warn("开始生成玩家提现记录表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUHJvbW90aW9uUmVwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9yZXF1ZXN0VGVzdC9hZGRQcm9tb3Rpb25SZXBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBTWpGLEtBQUssVUFBVSxHQUFHO0lBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDMUIsTUFBTSxPQUFPLEdBQUcsZ0NBQWdDLENBQUM7SUFFakQsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtJQUVuQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDOUIsTUFBTSx3QkFBd0IsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0E2QmhDLENBQUM7SUFFRCxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUNuQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUdyQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLElBQUksUUFBUSxHQUFHLGlGQUFpRixDQUFDO0lBQ2pHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztTQUN2QyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBSTVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUV0QyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELEdBQUcsRUFBRSxDQUFDIn0=