import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import GameManagerDao from "../../app/common/dao/daoManager/Game.manager";
import SceneManagerDao from "../../app/common/dao/daoManager/Scene.manager";
import RoomManagerDao from "../../app/common/dao/daoManager/Room.manager";
import BaseRedisManager from "../../app/common/dao/redis/lib/BaseRedisManager";

process.nextTick(run);

async function run() {
    await RDSClient.demoInit();

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




/**
 * 删除所有游戏场房间信息
 */
async function clearAllGameInfo() {
    console.warn('开始清空所有游戏数据');
    let gamesList = await GameManagerDao.findList({}, true);
    console.warn(gamesList.map(c => c.nid));
    for (const game of gamesList) {
        const nid = game.nid;
        await GameManagerDao.delete({ nid });

        const sceneList = await SceneManagerDao.findList({ nid }, true);
        for (const sceneInfo of sceneList) {
            await SceneManagerDao.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
        }
        const roomList = await RoomManagerDao.findList({ nid }, true);
        for (const roomInfo of roomList) {
            await RoomManagerDao.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
        }
        console.log("删除游戏完成", nid);
    }

    console.warn('清空游戏完成');
}

/**
 * 清空redis
 */
async function clearRedis() {
    console.warn('清空redis');
    const conn = await BaseRedisManager.getConnection();
    await conn.flushall();
    console.warn('清理完成');
}

/**
 * 清空mail表
 */
async function clearMailTable() {
    console.warn('清空mail表');
    const sql = `delete from Sp_MailRecord`;
    await ConnectionManager.getConnection().query(sql);
    console.warn('清空mail完成');
}




/**
 * 新增Player的 userId
 */
async function changePlayerTable() {
    console.warn(`开始执行changePlayerTable`);
    let addMysql = `alter table Sp_Player DROP alms `;
    await ConnectionManager.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);
}


/**
 * 新增Player的 userId
 */
async function changePlayerAgentTable() {
    console.warn(`changePlayerAgentTable`);
    let addMysql = `alter table Sp_Player_Agent DROP invite_code, DROP updateDateTime, ADD closeGameList  VARCHAR(255) DEFAULT NULL`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player_Agent`);
}

/**
 * 修改系统设置表，删除三个废弃字段，新增 H5默认语言，客服通道，银行列表字段
 */
async function changeSystemConfigTable() {
    console.warn(`开始执行changeSystemConfigTable`);
    let addMysql = `alter table Sys_SystemConfig  drop vipGiveGold, ADD COLUMN tixianRabate  int DEFAULT 0`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sys_SystemConfig`);
}




/**
 * 清空调控数据
 */
async function clearControlData() {
    console.warn('清空场控、个控、奖池数据');

    const sql = `delete from Sp_PersonalControl`;
    const sql_two = `delete from Sp_SceneControl`;
    const sql_three = `delete from Sp_BonusPool`;
    const sql_four = `delete from Sp_BonusPoolHistory`;

    await ConnectionManager.getConnection().query(sql);
    await ConnectionManager.getConnection().query(sql_two);
    await ConnectionManager.getConnection().query(sql_three);
    await ConnectionManager.getConnection().query(sql_four);


    console.warn('清空场控、个控、奖池数据完成');
}

async function changePlatformTable() {
    console.warn(`开始执行修改平台表`);

    console.warn(`Sp_PlatformControlState 新增字段 tenantId | 开始`);
    let addMysql = `alter table Sp_PlatformControlState ADD COLUMN tenantId VARCHAR(10) DEFAULT '' COMMENT '租户id'`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);

    console.warn(`Sp_PlatformControl 新增字段 tenantId | 开始`);
    addMysql = `alter table Sp_PlatformControl ADD COLUMN tenantId VARCHAR(10) DEFAULT '' COMMENT '租户id'`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);

    console.warn(`Sp_PayInfo 新增字段 groupRemark | 成功`);


    process.exit();
}
