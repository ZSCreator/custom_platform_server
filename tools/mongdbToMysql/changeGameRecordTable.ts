import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    let sql = "show tables like '%Sp_GameRecord%'";
    const allGameTables = await   ConnectionManager.getConnection(false)
        .query(sql);
    for(let table of allGameTables){
        let tableName = table['Tables_in_game_backend (%Sp_GameRecord%)'];
        console.warn(`执行表结构：${tableName}`);
        if(tableName == 'Sp_GameRecord' || tableName == 'Sp_GameRecord_202106' || tableName == 'Sp_GameRecord_202107' || tableName == 'Sp_GameRecord_202108'){
            continue;
        }
        let deleteSql= `alter table ${tableName} drop targetCharacter,drop way ,drop seat_num ,drop player_count_in_room, ADD COLUMN gameType INT NULL`;
        await   ConnectionManager.getConnection(false)
         .query(deleteSql);
        console.warn(`执行完成表结构：${tableName}`);
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);