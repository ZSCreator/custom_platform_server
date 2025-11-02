"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const Player_mysql_dao_1 = require("../../app/common/dao/mysql/Player.mysql.dao");
const AiAutoCreat_1 = require("../../app/servers/robot/lib/AiAutoCreat");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    return;
}
async function ss() {
    const { uid } = await (0, AiAutoCreat_1.createPlateform)("tom");
    const { agentUid, agentName } = await (0, AiAutoCreat_1.createAgent)("tom", uid, "MeIsTom_1");
    const sql = `SELECT COUNT(Sp_Player.id) as playerLength FROM  Sp_Player  WHERE Sp_Player.groupRemark = "${agentName}"`;
    const res = await connectionManager_1.default
        .getConnection(true)
        .query(sql);
    let playerNum = 5;
    let lastNum = playerNum - res[0].playerLength;
    for (let i = lastNum; i < playerNum; i++) {
        await (0, AiAutoCreat_1.createPlayer)(uid, agentUid, agentName);
    }
    const list = await Player_mysql_dao_1.default.findList({ group_id: uid });
    let lists = list.map(c => c.group_id);
    console.warn("流程完成");
    process.exit();
    return;
}
setTimeout(ss, 5000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJvb21EZXN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9UZXN0Um9vbURlc3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBR2pGLGtGQUF5RTtBQU96RSx5RUFBcUc7QUFFckcscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsS0FBSztJQUNoQixPQUFPO0FBQ1gsQ0FBQztBQUlELEtBQUssVUFBVSxFQUFFO0lBQ2IsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBQSw2QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUczRSxNQUFNLEdBQUcsR0FBRyw4RkFBOEYsU0FBUyxHQUFHLENBQUM7SUFDdkgsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUI7U0FDOUIsYUFBYSxDQUFDLElBQUksQ0FBQztTQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFaEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksT0FBTyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO0lBRTlDLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsTUFBTSxJQUFBLDBCQUFZLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNoRDtJQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM5RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFFRCxVQUFVLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDIn0=