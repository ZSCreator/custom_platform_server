"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function clean() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn(`开始执行`);
    let addMysql = `alter table Sys_SystemConfig  drop vipGiveGold, ADD COLUMN tixianRabate  int DEFAULT 0`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sys_SystemConfig`);
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
            rebateGold int(0) NOT NULL DEFAULT 0 COMMENT '提现手续费',
            type int(0) NOT NULL DEFAULT 0 COMMENT '提现卡类型',
            startGold int(0) NOT NULL DEFAULT 0 COMMENT '提现前金币',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_uid(uid) USING BTREE,
            INDEX idx_createDate_orderStatus_cashStatus(createDate, orderStatus, cashStatus) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlayerBankTableSQL);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlU3lzdGVtQ29uZmlnVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2NoYW5nZVN5c3RlbUNvbmZpZ1RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQUVqRixLQUFLLFVBQVUsS0FBSztJQUNoQixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUEwRDNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsd0ZBQXdGLENBQUM7SUFDeEcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFTekMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sd0JBQXdCLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0ErQmhDLENBQUM7SUFFRixNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUNsQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUVyQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPO0FBQ1gsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==