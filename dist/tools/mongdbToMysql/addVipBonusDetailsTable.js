"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    const sql = `
    CREATE TABLE Sp_VipBonusDetails  (
        id int(0) NOT NULL AUTO_INCREMENT,
        uid varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '玩家编号',
        level int(0) NULL DEFAULT 0 COMMENT 'vip等级',
        bonus int(0) NULL DEFAULT 0 COMMENT 'vip等级奖励',
        whetherToReceiveLeverBonus int(0) NULL DEFAULT 0 COMMENT '是否领取vip等级奖励 0 否 1 是',
        bonusForWeeks int(0) NULL DEFAULT 0 COMMENT '周签到奖励',
        bonusForWeeksLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次周签到奖励时间',
        bonusForMonth int(0) NULL DEFAULT 0 COMMENT '月签到奖励',
        bonusForMonthLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次月签到奖励时间',
        createDateTime datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
        updateDateTime datetime(0) NULL DEFAULT NULL COMMENT '最近更新时间',
        PRIMARY KEY (id) USING BTREE
      ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;
          `;
    const res = await connectionManager_1.default.getConnection()
        .query(sql);
    console.warn('结果', res);
    process.exit();
}
exports.run = run;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVmlwQm9udXNEZXRhaWxzVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2FkZFZpcEJvbnVzRGV0YWlsc1RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFFMUUsS0FBSyxVQUFVLEdBQUc7SUFDckIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLE1BQU0sR0FBRyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7V0FlTCxDQUFBO0lBRVAsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXhCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBekJELGtCQXlCQyJ9