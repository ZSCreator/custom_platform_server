"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const Game_manager_1 = require("../../app/common/dao/daoManager/Game.manager");
const Scene_manager_1 = require("../../app/common/dao/daoManager/Scene.manager");
const Room_manager_1 = require("../../app/common/dao/daoManager/Room.manager");
const BaseRedisManager_1 = require("../../app/common/dao/redis/lib/BaseRedisManager");
process.nextTick(run);
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn('开始执行');
    await clearAllGameInfo();
    await clearRedis();
    await clearMailTable();
    await clearControlData();
    await changePlatformTable();
    await changePlayerTable();
    await changePlayerAgentTable();
    console.warn('所有操作执行完成');
    process.exit();
}
async function clearAllGameInfo() {
    console.warn('开始清空所有游戏数据');
    let gamesList = await Game_manager_1.default.findList({}, true);
    console.warn(gamesList.map(c => c.nid));
    for (const game of gamesList) {
        const nid = game.nid;
        await Game_manager_1.default.delete({ nid });
        const sceneList = await Scene_manager_1.default.findList({ nid }, true);
        for (const sceneInfo of sceneList) {
            await Scene_manager_1.default.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
        }
        const roomList = await Room_manager_1.default.findList({ nid }, true);
        for (const roomInfo of roomList) {
            await Room_manager_1.default.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
        }
        console.log("删除游戏完成", nid);
    }
    console.warn('清空游戏完成');
}
async function clearRedis() {
    console.warn('清空redis');
    const conn = await BaseRedisManager_1.default.getConnection();
    await conn.flushall();
    console.warn('清理完成');
}
async function clearMailTable() {
    console.warn('清空mail表');
    const sql = `delete from Sp_MailRecord`;
    await connectionManager_1.default.getConnection().query(sql);
    console.warn('清空mail完成');
}
async function changePlayerTable() {
    console.warn(`开始执行changePlayerTable`);
    let addMysql = `alter table Sp_Player DROP alms `;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);
}
async function changePlayerAgentTable() {
    console.warn(`changePlayerAgentTable`);
    let addMysql = `alter table Sp_Player_Agent DROP invite_code, DROP updateDateTime, ADD closeGameList  VARCHAR(255) DEFAULT NULL`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player_Agent`);
}
async function changeSystemConfigTable() {
    console.warn(`开始执行changeSystemConfigTable`);
    let addMysql = `alter table Sys_SystemConfig  drop vipGiveGold, ADD COLUMN tixianRabate  int DEFAULT 0`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sys_SystemConfig`);
}
async function clearControlData() {
    console.warn('清空场控、个控、奖池数据');
    const sql = `delete from Sp_PersonalControl`;
    const sql_two = `delete from Sp_SceneControl`;
    const sql_three = `delete from Sp_BonusPool`;
    const sql_four = `delete from Sp_BonusPoolHistory`;
    await connectionManager_1.default.getConnection().query(sql);
    await connectionManager_1.default.getConnection().query(sql_two);
    await connectionManager_1.default.getConnection().query(sql_three);
    await connectionManager_1.default.getConnection().query(sql_four);
    console.warn('清空场控、个控、奖池数据完成');
}
async function changePlatformTable() {
    console.warn(`开始执行修改平台表`);
    console.warn(`Sp_PlatformControlState 新增字段 tenantId | 开始`);
    let addMysql = `alter table Sp_PlatformControlState ADD COLUMN tenantId VARCHAR(10) DEFAULT '' COMMENT '租户id'`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`Sp_PlatformControl 新增字段 tenantId | 开始`);
    addMysql = `alter table Sp_PlatformControl ADD COLUMN tenantId VARCHAR(10) DEFAULT '' COMMENT '租户id'`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`Sp_PayInfo 新增字段 groupRemark | 成功`);
    process.exit();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdXBkYXRlL3VwZGF0ZVNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFDakYsK0VBQTBFO0FBQzFFLGlGQUE0RTtBQUM1RSwrRUFBMEU7QUFDMUUsc0ZBQStFO0FBRS9FLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdEIsS0FBSyxVQUFVLEdBQUc7SUFDZCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQixNQUFNLGdCQUFnQixFQUFFLENBQUM7SUFDekIsTUFBTSxVQUFVLEVBQUUsQ0FBQztJQUNuQixNQUFNLGNBQWMsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sZ0JBQWdCLEVBQUUsQ0FBQztJQUN6QixNQUFNLG1CQUFtQixFQUFFLENBQUM7SUFDNUIsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO0lBQzFCLE1BQU0sc0JBQXNCLEVBQUUsQ0FBQztJQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBUUQsS0FBSyxVQUFVLGdCQUFnQjtJQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNCLElBQUksU0FBUyxHQUFHLE1BQU0sc0JBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFO1FBQzFCLE1BQU0s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