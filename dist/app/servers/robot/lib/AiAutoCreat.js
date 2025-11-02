"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestPlayer = exports.GetAllSpPl = exports.createPlayer = exports.createAgent = exports.createPlateform = void 0;
const PlayerAgent_mysql_dao_1 = require("../../../common/dao/mysql/PlayerAgent.mysql.dao");
const GatePlayerService_1 = require("../../../servers/gate/lib/services/GatePlayerService");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
const PlayerAgent_entity_1 = require("../../../common/dao/mysql/entity/PlayerAgent.entity");
const PlatformNameAgentList_redis_dao_1 = require("../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const moment = require("moment");
const GameRecordDateTable_mysql_dao_1 = require("../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
async function createPlateform(platform) {
    const platformData = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
    if (platformData) {
        return { uid: platformData.uid };
    }
    const { uid } = await GatePlayerService_1.default.createPlayer();
    const agentInfo = connectionManager_1.default.getRepository(PlayerAgent_entity_1.PlayerAgent).create({
        uid,
        rootUid: uid,
        parentUid: uid,
        inviteCode: '',
        platformName: platform,
        platformGold: 100000000,
        deepLevel: 1,
        roleType: 2,
        status: 1,
        language: 'chinese_zh'
    });
    await PlayerAgent_mysql_dao_1.default.insertOne(agentInfo);
    await PlatformNameAgentList_redis_dao_1.default.insertPlatformUid({ platformName: platform, platformUid: uid });
    await PlatformNameAgentList_redis_dao_1.default.addAgent(platform, uid);
    const timeTableName = moment().format("YYYYMM");
    let tableName = `${uid}_${timeTableName}`;
    const isExists = await GameRecordDateTable_mysql_dao_1.default.tableBeExists(tableName);
    if (!isExists) {
        await GameRecordDateTable_mysql_dao_1.default.createTable(tableName);
    }
    console.warn("创建平台成功", uid, platform);
    return { uid };
}
exports.createPlateform = createPlateform;
async function createAgent(platform, platformUid, agentName) {
    const agentData = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: agentName });
    if (agentData) {
        return { agentUid: agentData.uid, agentName: agentData.platformName };
    }
    const { uid } = await GatePlayerService_1.default.createPlayer(null, platformUid, platformUid, null, null, null, null, null);
    const playerAgentInfo = {
        uid,
        parentUid: platformUid,
        rootUid: platformUid,
        inviteCode: '',
        platformName: agentName,
        platformGold: 100000000,
        deepLevel: 2,
        roleType: 3,
        status: 1,
        language: 'chinese_zh'
    };
    await PlayerAgent_mysql_dao_1.default.insertOne(playerAgentInfo);
    await PlatformNameAgentList_redis_dao_1.default.addAgent(platform, platformUid);
    console.warn("创建租户成功", uid, agentName);
    return { agentUid: uid, agentName };
}
exports.createAgent = createAgent;
async function createPlayer(platformUid, agentUid, agentName) {
    let player = await GatePlayerService_1.default.createPlayer(null, agentUid, platformUid, null, agentName, "chinese_zh", null, agentName);
    let pl = await PlayerAgent_mysql_dao_1.default.insertOne({
        uid: player.uid,
        parentUid: agentUid,
        rootUid: platformUid,
        platformName: player.uid,
        platformGold: 0,
        deepLevel: 3,
        roleType: 1,
        status: 1,
        language: "chinese_zh",
    });
    console.warn("创建玩家成功", player.uid);
}
exports.createPlayer = createPlayer;
async function GetAllSpPl() {
    const { uid } = await createPlateform("tom");
    const agentList = await PlayerAgent_mysql_dao_1.default.findList({ rootUid: uid, roleType: 3 });
    const agentNameList = agentList.map(c => `"${c.platformName}"`);
    if (agentNameList.length > 0) {
        const sql = `SELECT Sp_Player.guestid FROM  Sp_Player  WHERE Sp_Player.groupRemark  in (${agentNameList.join(",")})`;
        const res = await connectionManager_1.default
            .getConnection(true)
            .query(sql);
        return res.map(c => c.guestid);
    }
}
exports.GetAllSpPl = GetAllSpPl;
async function createTestPlayer() {
    const { uid } = await createPlateform("tom");
    for (let i = 0; i < 1000; i++) {
        const { agentUid, agentName } = await createAgent("tom", uid, `MeIsTom_${i}`);
        const sql = `SELECT COUNT(Sp_Player.id) as playerLength FROM  Sp_Player  WHERE Sp_Player.groupRemark = "${agentName}"`;
        const res = await connectionManager_1.default
            .getConnection(true)
            .query(sql);
        let playerNum = 5;
        let lastNum = playerNum - res[0].playerLength;
        for (let i = 0; i < lastNum; i++) {
            await createPlayer(uid, agentUid, agentName);
        }
    }
}
exports.createTestPlayer = createTestPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWlBdXRvQ3JlYXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yb2JvdC9saWIvQWlBdXRvQ3JlYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkZBQWtGO0FBQ2xGLDRGQUFxRjtBQUNyRix1RkFBZ0Y7QUFDaEYsNEZBQWtGO0FBQ2xGLCtHQUFzRztBQUN0RyxpQ0FBaUM7QUFDakMsMkdBQTZGO0FBTXRGLEtBQUssVUFBVSxlQUFlLENBQUMsUUFBZ0I7SUFFbEQsTUFBTSxZQUFZLEdBQUcsTUFBTSwrQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNuRixJQUFJLFlBQVksRUFBRTtRQUVkLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ3BDO0lBRUQsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFHdkQsTUFBTSxTQUFTLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxDQUFDLGdDQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDbEUsR0FBRztRQUNILE9BQU8sRUFBRSxHQUFHO1FBQ1osU0FBUyxFQUFFLEdBQUc7UUFDZCxVQUFVLEVBQUUsRUFBRTtRQUNkLFlBQVksRUFBRSxRQUFRO1FBQ3RCLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLENBQUM7UUFDWCxNQUFNLEVBQUUsQ0FBQztRQUNULFFBQVEsRUFBRSxZQUFZO0tBQ3pCLENBQUMsQ0FBQztJQUVILE1BQU0sK0JBQW1CLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBSS9DLE1BQU0seUNBQTZCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxD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