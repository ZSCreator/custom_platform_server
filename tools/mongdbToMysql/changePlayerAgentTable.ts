import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

RDSClient.demoInit();
async function clean() {
      console.warn(`开始执行`);
        // let addMysql = `alter table Sp_Player ADD COLUMN userId VARCHAR(50) DEFAULT NULL`;
        // await ConnectionManager.getConnection(false)
        //  .query(addMysql);
        // console.warn(`执行完成表结构：Sp_Player`);


        // let addMysql = `alter table Sp_Player ADD COLUMN level  int DEFAULT 0`;
        // await ConnectionManager.getConnection(false)
        //  .query(addMysql);
        // console.warn(`执行完成表结构：Sp_Player`);

        let addMysql = `alter table Sp_Player_Agent DROP invite_code, DROP updateDateTime`;
        await ConnectionManager.getConnection(false)
            .query(addMysql);
        console.warn(`执行完成表结构：Sp_Player`);




    process.exit();
    return;
}
setTimeout(clean, 2000);