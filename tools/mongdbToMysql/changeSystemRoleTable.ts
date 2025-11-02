import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

RDSClient.demoInit();
async function clean() {
  console.warn(`开始执行 === 改变角色结构表`);

    let addMysql = `alter table Sys_SystemRole ADD roleRoute  json DEFAULT null`;
    await ConnectionManager.getConnection(false)
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

    await ConnectionManager.getConnection()
        .query(playerRebateSql);

    console.warn("新增后台操作日志结构表-----结束");

    process.exit();
    return;

}
setTimeout(clean, 2000);