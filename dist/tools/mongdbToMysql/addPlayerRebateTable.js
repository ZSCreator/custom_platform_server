"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("首先现删除玩家返佣表");
    const deleSql = `DROP TABLE Sp_PlayerRebate`;
    await connectionManager_1.default.getConnection()
        .query(deleSql);
    console.warn("首先现删除玩家返佣表-----删除完成");
    console.warn("开始生成玩家返佣表的脚本---开始");
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
    await connectionManager_1.default.getConnection()
        .query(playerRebateSql);
    console.warn("开始生成玩家返佣表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyUmViYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2FkZFBsYXllclJlYmF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQU1qRixLQUFLLFVBQVUsR0FBRztJQUNkLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQzFCLE1BQU0sT0FBTyxHQUFHLDRCQUE0QixDQUFDO0lBRTdDLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO1NBQ2xDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFHbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQ2pDLE1BQU0sZUFBZSxHQUFHOzs7Ozs7Ozs7Ozs7S0FZdkIsQ0FBQztJQUVELE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO1NBQ25DLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUU1QixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUE2RXBDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==