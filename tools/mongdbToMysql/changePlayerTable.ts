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

        let addMysql = `alter table Sp_Player ADD withdrawalChips  double DEFAULT 0`;
        await ConnectionManager.getConnection(false)
            .query(addMysql);
        console.warn(`执行完成表结构：Sp_Player`);

    // let addMysql = `alter table Sp_Player ADD withdrawalChips  int DEFAULT 0`;
    // await ConnectionManager.getConnection(false)
    //     .query(addMysql);
    // console.warn(`执行完成表结构：Sp_Player`);

    // let setMysql = `update  Sp_Player set lineCode = groupRemark`;
    // await ConnectionManager.getConnection(false)
    //     .query(setMysql);
    // console.warn(`将player的groupRemark赋值到lineCode ：Sp_Player`);
    //
    // console.warn(`执行完成`);

    // console.warn(`开始执行`);
    // let deleteMysql = `alter table Sp_Player drop lastChips,drop totalBonus ,drop daily_remain_relief_times , drop todayVipPlayFlowCount ,drop yesterdayVipPlayFlowCount, ADD COLUMN myGames VARCHAR(100) DEFAULT NULL`;
    // await ConnectionManager.getConnection(false)
    //     .query(deleteMysql);
    // console.warn(`删除没用的字段表结构：Sp_Player`);
    //
    // console.warn(`开始执行`);
    // let deleteMysql = `alter table Sp_Player drop nicknameChanged`;
    // await ConnectionManager.getConnection(false)
    //     .query(deleteMysql);
    // console.warn(`删除没用的字段表结构：Sp_Player`);


    process.exit();
    return;
}
setTimeout(clean, 2000);