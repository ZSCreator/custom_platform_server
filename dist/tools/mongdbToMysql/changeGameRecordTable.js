"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    let sql = "show tables like '%Sp_GameRecord%'";
    const allGameTables = await connectionManager_1.default.getConnection(false)
        .query(sql);
    for (let table of allGameTables) {
        let tableName = table['Tables_in_game_backend (%Sp_GameRecord%)'];
        console.warn(`执行表结构：${tableName}`);
        if (tableName == 'Sp_GameRecord' || tableName == 'Sp_GameRecord_202106' || tableName == 'Sp_GameRecord_202107' || tableName == 'Sp_GameRecord_202108') {
            continue;
        }
        let deleteSql = `alter table ${tableName} drop targetCharacter,drop way ,drop seat_num ,drop player_count_in_room, ADD COLUMN gameType INT NULL`;
        await connectionManager_1.default.getConnection(false)
            .query(deleteSql);
        console.warn(`执行完成表结构：${tableName}`);
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlR2FtZVJlY29yZFRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9jaGFuZ2VHYW1lUmVjb3JkVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBRWpGLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxvQ0FBb0MsQ0FBQztJQUMvQyxNQUFNLGFBQWEsR0FBRyxNQUFRLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7U0FDL0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEtBQUksSUFBSSxLQUFLLElBQUksYUFBYSxFQUFDO1FBQzNCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLElBQUcsU0FBUyxJQUFJLGVBQWUsSUFBSSxTQUFTLElBQUksc0JBQXNCLElBQUksU0FBUyxJQUFJLHNCQUFzQixJQUFJLFNBQVMsSUFBSSxzQkFBc0IsRUFBQztZQUNqSixTQUFTO1NBQ1o7UUFDRCxJQUFJLFNBQVMsR0FBRSxlQUFlLFNBQVMsd0dBQXdHLENBQUM7UUFDaEosTUFBUSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2FBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsU0FBUyxFQUFFLENBQUMsQ0FBQztLQUN4QztJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=