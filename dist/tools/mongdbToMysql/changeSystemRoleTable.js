"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行 === 改变角色结构表`);
    let addMysql = `alter table Sys_SystemRole ADD roleRoute  json DEFAULT null`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sys_SystemRole`);
    console.warn(`开始执行 === 新增后台操作日志结构表`);
    const playerRebateSql = `
        CREATE TABLE IF NOT EXISTS Sp_ManagerLogs (
            id int(0) NOT NULL AUTO_INCREMENT,
            mangerUserName varchar(60) NOT NULL ,
            requestIp varchar(60)  NULL,
            requestName varchar(255)  NULL,
            requestBody varchar(255)  NULL,
            createDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(playerRebateSql);
    console.warn("新增后台操作日志结构表-----结束");
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlU3lzdGVtUm9sZVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9jaGFuZ2VTeXN0ZW1Sb2xlVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBRWpGLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRS9CLElBQUksUUFBUSxHQUFHLDZEQUE2RCxDQUFDO0lBQzdFLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztTQUN2QyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBS3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNyQyxNQUFNLGVBQWUsR0FBRzs7Ozs7Ozs7OztLQVV2QixDQUFDO0lBRUYsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbEMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUVuQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPO0FBRVgsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==