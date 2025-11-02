"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const pinus_1 = require("pinus");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const MainHandlerValidationRulesService_1 = require("../service/MainHandlerValidationRulesService");
const systemState_1 = require("../../../common/systemState");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const sessionService = require("../../../services/sessionService");
const PositionEnum_1 = require("../../../common/constant/player/PositionEnum");
const ServerCurrentNumbersPlayersDao = require("../../../common/dao/redis/ServerCurrentNumbersPlayersDao");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const Scene_manager_1 = require("../../../common/dao/daoManager/Scene.manager");
const PlayerGameHistory_entity_1 = require("../../../common/dao/mysql/entity/PlayerGameHistory.entity");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const PlayersInRoom_redis_dao_1 = require("../../../common/dao/redis/PlayersInRoom.redis.dao");
const SystemGameType_manager_1 = require("../../../common/dao/daoManager/SystemGameType.manager");
const OnlinePlayer_redis_dao_1 = require("../../../common/dao/redis/OnlinePlayer.redis.dao");
const PlayerGameHistoryStatus_enum_1 = require("../../../common/dao/mysql/entity/enum/PlayerGameHistoryStatus.enum");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
const hallConst_1 = require("../../../consts/hallConst");
const JsonConfig_1 = require("../../../pojo/JsonConfig");
const IPLHttp_utill_1 = require("../../IPL/lib/utils/IPLHttp.utill");
const moment = require("moment");
const IPLRecord_mysql_dao_1 = require("../../../common/dao/mysql/IPLRecord.mysql.dao");
const GameLoginStatistics = require("../../../services/hall/GameLoginStatistics");
const langsrv = require("../../../services/common/langsrv");
const hallConst = require("../../../consts/hallConst");
const gamesScenePointValue_1 = require("../../../../config/data/gamesScenePointValue");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameRecordStatus_enum_1 = require("../../../common/dao/mysql/enum/GameRecordStatus.enum");
const GameRecordDateTable_mysql_dao_1 = require("../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
const loggerPreStr = `大厅服务器 ${pinus_1.pinus.app.getServerId()} | `;
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.validationRulesService = new MainHandlerValidationRulesService_1.MainHandlerValidationRulesService(this);
    }
    async getGameTypeListForTypeId({ typeId }, session) {
        const uid = session.uid;
        try {
            if (!uid) {
                return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], `请求错误`);
            }
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], `请求错误`);
            }
            let nidList = [];
            if (typeId == 5) {
                let player = await Player_manager_1.default.findOne({ uid: uid }, false);
                if (player && player.myGames) {
                    let myGamesNidList = player.myGames.split(',');
                    for (let m of myGamesNidList) {
                        nidList.push({ nid: m });
                    }
                    nidList.reverse();
                }
            }
            else {
                if (!typeId.toString()) {
                    return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], null);
                }
                const game = await SystemGameType_manager_1.default.findOne({ typeId });
                if (!game) {
                    return new ApiResult_1.ApiResult(systemState_1.httpState.SUCCESS, []);
                }
                nidList = game.nidList;
            }
            const games = await Game_manager_1.default.findList({});
            const resultList = [];
            let closeGameList = [];
            if (player && player.groupRemark) {
                const platformName = await PlatformNameAgentList_redis_dao_1.default.findPlatformNameForAgent({ agent: player.groupRemark });
                if (platformName) {
                    closeGameList = await PlatformNameAgentList_redis_dao_1.default.getPlatformCloseGame({ platformName: platformName });
                }
            }
            for (const m of nidList) {
                if (closeGameList.length > 0) {
                    if (closeGameList.includes(m.nid)) {
                        continue;
                    }
                }
                const game = await games.find(x => x.nid == m.nid);
                if (game) {
                    resultList.push({
                        nid: m.nid,
                        sort: m.sort,
                        whetherToShowScene: game.whetherToShowScene,
                        whetherToShowRoom: game.whetherToShowRoom,
                        whetherToShowGamingInfo: game.whetherToShowGamingInfo,
                    });
                }
            }
            resultList.sort((a, b) => a.sort - b.sort);
            return new ApiResult_1.ApiResult(systemState_1.httpState.SUCCESS, resultList);
        }
        catch (e) {
            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], null);
        }
    }
    async enterGameOrSelectionList(parameter, session) {
        let { nid, whetherToShowScene, whetherToShowGamingInfo, sceneId, roomId, param } = parameter;
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            language = player.language;
            await this.validationRulesService._enterGameOrSelectionListValidate(language, parameter);
            if (whetherToShowGamingInfo || whetherToShowScene) {
                return await showGameOrSceneInfo(session, player, nid, roomId);
            }
            const { name } = (0, JsonConfig_1.get_games)(nid);
            const serverId = await selectServerId(name);
            const sceneList = await Scene_manager_1.default.findList({ nid });
            if (typeof sceneId !== 'number' && !sceneId) {
                sceneId = sceneList[0].sceneId;
            }
            if (player.gold < sceneList[sceneId].entryCond) {
                return new ApiResult_1.ApiResult(systemState_1.hallState.Gold_Not_Enough_To_Join_Game, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_2034, sceneList[sceneId].entryCond / 100));
            }
            if (!pinus_1.pinus.app.rpc[name]) {
                return new ApiResult_1.ApiResult(systemState_1.hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }
            const { code, msg, roomId: rId } = await pinus_1.pinus.app.rpc[name].mainRemote.entry.toServer(serverId, {
                nid,
                roomId,
                sceneId,
                player,
                param
            });
            if (code !== 200) {
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Get_useableRoom, [], msg);
            }
            roomId = rId;
            await ServerCurrentNumbersPlayersDao.increaseByServerId(serverId);
            await recordPlayGameLog(player, nid, sceneId, roomId);
            await sessionService.sessionSet(session, { nid, sceneId, roomId, backendServerId: serverId });
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 3`);
            noticeTenantControl(player, nid, sceneId);
            await updateOnlinePlayer(player, serverId, nid, sceneId, roomId);
            await GameLoginStatistics.increase_to_db(nid, sceneId, uid);
            await PlayersInRoom_redis_dao_1.default.insertOne(serverId, roomId, uid, player.isRobot);
            return new ApiResult_1.ApiResult(systemState_1.httpState.SUCCESS, { roomId, playerInfo: { gold: player.gold } });
        }
        catch (e) {
            if (e instanceof ApiResult_1.ApiResult) {
                return e;
            }
            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226));
        }
    }
    async backToHall({ nid }, session) {
        const { uid } = session;
        let language = null;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            if (!hallConst_1.SLOTS_GAME.includes(nid)) {
                const { name } = await Game_manager_1.default.findOne({ nid });
                await pinus_1.pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                    group_id: player.group_id, lineCode: player.lineCode, uid: player.uid, roomId: '-1'
                });
            }
            await Player_manager_1.default.updateOne({ uid }, { position: PositionEnum_1.PositionEnum.HALL });
            await sessionService.sessionSet(session, { nid: "-1", sceneId: -1, roomId: "-1", });
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 1`);
            await OnlinePlayer_redis_dao_1.default.updateOne({ uid }, {
                uid,
                nid: "-1",
                isRobot: player.isRobot,
                sceneId: -1,
                entryHallTime: new Date(),
                roomId: '-1',
                hallServerId: player.sid
            });
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | 从 nid: ${uid} 游戏信息列表(盘路) | 返回大厅出错：${e.stack || e.message || e}`);
            return ApiResult_1.ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }
    async leaveRoomAndGame({ saveProfit = false, goToHall = false }, session) {
        let language = null;
        try {
            let { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session);
            let player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            if (!nid || !roomId || typeof sceneId !== "number" || !backendServerId) {
                logger.info(`${loggerPreStr}uid:${uid} | 用户已经返回大厅`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Player_Had_Leave, { gold: player.gold }, null);
            }
            const exitParameters = { nid, sceneId, roomId, player };
            const game = await Game_manager_1.default.findOne({ nid });
            if (!game) {
                return new ApiResult_1.ApiResult(systemState_1.hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }
            const { name } = game;
            if (!pinus_1.pinus.app.rpc[name]) {
                return new ApiResult_1.ApiResult(systemState_1.hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
            }
            const result = await pinus_1.pinus.app.rpc[name].mainRemote.exit.toServer(backendServerId, exitParameters);
            if (result.code === 500)
                return ApiResult_1.ApiResult.ERROR([], result.msg);
            if (result.code !== 200)
                return new ApiResult_1.ApiResult(result.code, [], result.msg);
            let position = PositionEnum_1.PositionEnum.BEFORE_ENTER_Game;
            if (goToHall) {
                if (!hallConst_1.SLOTS_GAME.includes(nid)) {
                    await pinus_1.pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                        group_id: player.group_id, lineCode: player.lineCode, uid: player.uid, roomId: '-1'
                    });
                }
                position = PositionEnum_1.PositionEnum.HALL;
            }
            await PlayersInRoom_redis_dao_1.default.delete(backendServerId, roomId, uid, player.isRobot);
            await Player_manager_1.default.updateOne({ uid }, {
                abnormalOffline: false,
                position: position
            });
            await sessionService.sessionSet(session, { roomId: null, sceneId: null, nid: goToHall ? '-1' : nid });
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 4`);
            await OnlinePlayer_redis_dao_1.default.updateOne({ uid }, {
                uid,
                nid: nid,
                sceneId: -1,
                isRobot: player.isRobot,
                entryHallTime: new Date(),
                roomId: '-1',
                hallServerId: player.sid
            });
            await ServerCurrentNumbersPlayersDao.decreaseByServerId(backendServerId);
            if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                return ApiResult_1.ApiResult.SUCCESS();
            }
            logger.info(`${loggerPreStr}离开游戏 | 玩家:${uid} |nid: ${nid} | sceneId: ${sceneId} | roomId: ${roomId}`);
            player = await Player_manager_1.default.findOne({ uid }, false);
            return ApiResult_1.ApiResult.SUCCESS({
                gold: player.gold,
                lastRoom: roomId,
                lastGame: nid,
                mailLength: 0
            }, "操作成功");
        }
        catch (e) {
            logger.error(`${loggerPreStr}离开游戏出错：${e.stack || e.message || e}`);
            return ApiResult_1.ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }
    async reelectRoom({ param }, session) {
        let language = null;
        try {
            let { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session);
            await this.leaveRoomAndGame({}, session);
            let parameter = {
                nid: nid,
                whetherToShowScene: true,
                whetherToShowRoom: false,
                whetherToShowGamingInfo: false,
                sceneId,
                roomId: null,
                param
            };
            await this.enterGameOrSelectionList(parameter, session);
            parameter.whetherToShowScene = false;
            return await this.enterGameOrSelectionList(parameter, session);
        }
        catch (e) {
            logger.error(`${loggerPreStr}重选房间出错：${e.stack || e.message || e}`);
            return ApiResult_1.ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }
    async recoveryGold(_, session) {
        let language = null;
        const { uid, nid, roomId, sceneId, backendServerId } = sessionService.sessionInfo(session);
        try {
            let gold = 0;
            const player = await Player_manager_1.default.findOne({ uid });
            const res = await IPLHttp_utill_1.default.userfunds(uid);
            if (res.data.count !== 0) {
                gold = res.data.result[0].balance;
            }
            if (gold > 0) {
                const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;
                const recordRes = await IPLHttp_utill_1.default.userTransferApi(-gold, walletOrderId, uid);
                const _a = recordRes.data, { create_at: createTime, code, user_id: userId } = _a, rest = __rest(_a, ["create_at", "code", "user_id"]);
                const insertParams = Object.assign({ uid: uid, userId,
                    createTime }, rest);
                await IPLRecord_mysql_dao_1.default.insertOne(insertParams);
                const record = await IPLRecord_mysql_dao_1.default.findLastOneByUid(player.uid);
                if (!!record) {
                    const { uid, thirdUid, group_id } = player;
                    const { new_balance } = record;
                    let gameOrder = null;
                    if (group_id) {
                        gameOrder = `${group_id}-${uid}-${Date.now()}`;
                    }
                    else {
                        gameOrder = `888-${uid}-${Date.now()}`;
                    }
                    const gameRecord = {
                        uid,
                        thirdUid: thirdUid,
                        group_id: group_id ? group_id : null,
                        nid: GameNidEnum_1.GameNidEnum.IPL,
                        gameName: "板球",
                        sceneId: -1,
                        roomId: "-1",
                        gold: player.gold,
                        input: new_balance * 100,
                        validBet: new_balance * 100,
                        profit: (gold - new_balance) * 100,
                        status: GameRecordStatus_enum_1.GameRecordStatusEnum.Success,
                        createTimeDate: new Date(),
                        gameOrder
                    };
                    await GameRecordDateTable_mysql_dao_1.default.insertOne(gameRecord);
                }
                await Player_manager_1.default.updateOne({ uid }, { gold: player.gold + (res.data.result[0].balance * 100) });
                return ApiResult_1.ApiResult.SUCCESS({
                    gold: player.gold + (res.data.result[0].balance * 100)
                });
            }
            return ApiResult_1.ApiResult.SUCCESS({ gold: player.gold });
        }
        catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | IPL回收金币 | 出错：${e.stack || e.message || e}`);
            return ApiResult_1.ApiResult.ERROR();
        }
    }
}
exports.MainHandler = MainHandler;
async function showGameOrSceneInfo(session, player, nid, roomId) {
    let result = {};
    const { name } = await Game_manager_1.default.findOne({ nid });
    const serverInfoList = pinus_1.pinus.app.getServersByType(name);
    let serverId = serverInfoList[0].id;
    const sceneList = await Scene_manager_1.default.findList({ nid });
    result.sceneList = sceneList.sort((a, b) => (a.sceneId - b.sceneId));
    const historyRecord = await connectionManager_1.default.getConnection(true)
        .createQueryBuilder(PlayerGameHistory_entity_1.PlayerGameHistory, "history")
        .where("history.uid = :uid", { uid: player.uid })
        .orderBy("history.createDateTime", "DESC")
        .getOne();
    result.lastGame = null;
    result.lastRoom = null;
    if (historyRecord) {
        let enterTime = new Date(historyRecord.createDateTime).getTime();
        let nowData = Date.now();
        if (nowData - enterTime < 2 * 60 * 1000) {
            result.lastGame = historyRecord.nid;
            result.lastRoom = historyRecord.roomId;
        }
    }
    result.roomHistoryList = [];
    await Player_manager_1.default.updateOne({ uid: player.uid }, { position: PositionEnum_1.PositionEnum.BEFORE_ENTER_Game });
    await sessionService.sessionSet(session, { 'nid': nid });
    if (!hallConst.SLOTS_GAME.includes(nid)) {
        const res = await pinus_1.pinus.app.rpc[name].mainRemote.entryScenes.toServer(serverId, { player });
        if (res.code !== 200) {
            return ApiResult_1.ApiResult.ERROR([], langsrv.getlanguage(player.language, langsrv.Net_Message.id_6));
        }
        if (res.data && res.data.length > 0) {
            result.roomHistoryList = res.data.sort((a, b) => a.sceneId - b.sceneId);
            if (nid === "81") {
                result.sceneList = result.sceneList.map(info => {
                    info.roomId = res.data.find(_info => _info.sceneId === info.sceneId).roomId;
                    return info;
                });
            }
        }
    }
    if (gamesScenePointValue_1.ScenePointValueMap.hasOwnProperty(nid)) {
        result.sceneList.forEach(s => s.pointValue = gamesScenePointValue_1.ScenePointValueMap[nid].pointValue);
    }
    logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${player.uid} | tag 2`);
    await OnlinePlayer_redis_dao_1.default.updateOne({ uid: player.uid }, {
        nid: nid,
        uid: player.uid,
        sceneId: -1,
        isRobot: player.isRobot,
        entryGameTime: new Date(),
        roomId,
        hallServerId: pinus_1.pinus.app.getServerId(),
    });
    return new ApiResult_1.ApiResult(systemState_1.httpState.SUCCESS, result, "操作成功");
}
async function selectServerId(name) {
    const serverInfoList = pinus_1.pinus.app.getServersByType(name);
    let serverId = serverInfoList[0].id;
    if (serverInfoList.length !== 1) {
        const serverListAfterSort = await Promise.all(serverInfoList.map(async ({ id }) => {
            return { sId: id, num: parseInt(await ServerCurrentNumbersPlayersDao.findByServerId(id)) };
        }));
        serverListAfterSort.sort((a, b) => a.num - b.num);
        const { sId } = serverListAfterSort[0];
        serverId = sId;
    }
    return serverId;
}
async function recordPlayGameLog(player, nid, sceneId, roomId) {
    let myGames;
    if (player.myGames) {
        const myGamesNidList = player.myGames.split(',');
        if (!myGamesNidList.includes(nid)) {
            if (myGamesNidList.length == 10) {
                myGamesNidList.splice(0, 1);
            }
            myGamesNidList.push(nid);
            myGames = myGamesNidList.toString();
        }
        else {
            myGames = player.myGames;
        }
    }
    else {
        let myGamesNidList = [];
        myGamesNidList.push(nid);
        myGames = myGamesNidList.toString();
    }
    await Player_manager_1.default.updateOne({ uid: player.uid }, {
        position: PositionEnum_1.PositionEnum.GAME,
        kickedOutRoom: false,
        abnormalOffline: true,
        myGames: myGames
    });
    const historyRep = connectionManager_1.default.getRepository(PlayerGameHistory_entity_1.PlayerGameHistory);
    const history = historyRep.create({
        uid: player.uid,
        nid,
        sceneId,
        roomId,
        gold: player.gold,
        status: PlayerGameHistoryStatus_enum_1.PlayerGameHistoryStatus.EntryGold
    });
    await historyRep.save(history);
}
async function updateOnlinePlayer(player, serverId, nid, sceneId, roomId) {
    await OnlinePlayer_redis_dao_1.default.updateOne({ uid: player.uid }, {
        uid: player.uid,
        nid: nid,
        sceneId,
        isRobot: player.isRobot,
        entryGameTime: new Date(),
        roomId,
        hallServerId: serverId
    });
}
async function noticeTenantControl(player, nid, sceneId) {
    if (!player.group_id) {
        return;
    }
    await pinus_1.pinus.app.rpc.control.mainRemote.addTenantGameScene.toServer('*', {
        platformId: player.group_id, tenantId: player.groupRemark, nid, sceneId,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBc0U7QUFFdEUsOERBQTJEO0FBQzNELG9HQUFpRztBQUNqRyw2REFBbUU7QUFDbkUsdUVBQW9FO0FBQ3BFLG1FQUFtRTtBQUNuRSwrRUFBNEU7QUFDNUUsMkdBQTJHO0FBQzNHLGtGQUE2RTtBQUM3RSxnRkFBMkU7QUFDM0Usd0dBQThGO0FBQzlGLDhFQUFzRTtBQUV0RSwrRkFBaUY7QUFDakYsa0dBQTBGO0FBQzFGLDZGQUFvRjtBQUNwRixxSEFBNkc7QUFDN0csdUZBQWdGO0FBQ2hGLHlEQUF1RDtBQUN2RCx5REFBZ0U7QUFDaEUscUVBQTZEO0FBQzdELGlDQUFpQztBQUNqQyx1RkFBOEU7QUFDOUUsa0ZBQW1GO0FBQ25GLDREQUE2RDtBQUM3RCx1REFBd0Q7QUFDeEQsdUZBQWtGO0FBQ2xGLDJFQUF3RTtBQUN4RSxnR0FBNEY7QUFDNUYsMkdBQWtHO0FBQ2xHLCtHQUFzRztBQUd0RyxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sWUFBWSxHQUFHLFNBQVMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDO0FBRTNELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUtwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHFFQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFRRCxLQUFLLENB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