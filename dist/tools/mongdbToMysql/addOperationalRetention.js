"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("开始生成生成渠道运营留存表的脚本");
    const sql = `
        CREATE TABLE IF NOT EXISTS Sp_OperationalRetention (
            id int(0) NOT NULL AUTO_INCREMENT,
            agentName varchar(50) NOT NULL COMMENT '代理的名称',
            betPlayer json DEFAULT NULL COMMENT '活跃会员',
            addPlayer  json DEFAULT NULL COMMENT '新增人数',
            AddRmbPlayer json DEFAULT NULL COMMENT '充值玩家人数',
            allAddRmb int NOT NULL DEFAULT 0 COMMENT '总收入',
            secondNum  int NOT NULL DEFAULT 0 COMMENT '次日留存率',
            threeNum  int NOT NULL DEFAULT 0 COMMENT '3日抽水',
            sevenNum  int NOT NULL DEFAULT 0 COMMENT '7日抽水',
            fifteenNum  int NOT NULL DEFAULT 0 COMMENT '15日抽水',
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE,
            INDEX idx_createDate_agentName(createDate,agentName) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(sql);
    console.warn("开始生成生成渠道运营留存表-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkT3BlcmF0aW9uYWxSZXRlbnRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2FkZE9wZXJhdGlvbmFsUmV0ZW50aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQU1qRixLQUFLLFVBQVUsR0FBRztJQUNkLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFDaEMsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7S0FnQlgsQ0FBQztJQUVELE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO1NBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUdoQixPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFFckMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxHQUFHLEVBQUUsQ0FBQyJ9