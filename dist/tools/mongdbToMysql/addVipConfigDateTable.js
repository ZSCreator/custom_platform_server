"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    const sql = `
        CREATE TABLE Sp_VipConfig  (
            id int(0) NOT NULL AUTO_INCREMENT,
            level int(0) NULL DEFAULT NULL COMMENT 'vip等级',
            des varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '中文说明',
            levelScore int(0) NULL DEFAULT NULL COMMENT '达到当前vip等级的充值要求',
            bonus int(0) NULL DEFAULT NULL COMMENT 'vip等级奖励',
            bonusForWeeks int(0) NULL DEFAULT NULL COMMENT '当前vip等级每周签到奖励',
            bonusForMonth int(0) NULL DEFAULT NULL COMMENT '当前vip等级每月签到奖励',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVmlwQ29uZmlnRGF0ZVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9hZGRWaXBDb25maWdEYXRlVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQUUxRSxLQUFLLFVBQVUsR0FBRztJQUNyQixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7V0FhTCxDQUFBO0lBRVAsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXhCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBdkJELGtCQXVCQyJ9