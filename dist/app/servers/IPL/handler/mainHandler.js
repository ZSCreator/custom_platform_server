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
const logger = (0, pinus_1.getLogger)("server_out", __filename);
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const systemState_1 = require("../../../common/systemState");
const JsonConfig_1 = require("../../../pojo/JsonConfig");
const langsrv = require("../../../services/common/langsrv");
const ServerCurrentNumbersPlayersDao = require("../../../common/dao/redis/ServerCurrentNumbersPlayersDao");
const PositionEnum_1 = require("../../../common/constant/player/PositionEnum");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
const PlayerGameHistory_entity_1 = require("../../../common/dao/mysql/entity/PlayerGameHistory.entity");
const PlayerGameHistoryStatus_enum_1 = require("../../../common/dao/mysql/entity/enum/PlayerGameHistoryStatus.enum");
const sessionService = require("../../../services/sessionService");
const OnlinePlayer_redis_dao_1 = require("../../../common/dao/redis/OnlinePlayer.redis.dao");
const GameLoginStatistics = require("../../../services/hall/GameLoginStatistics");
const PlayersInRoom_redis_dao_1 = require("../../../common/dao/redis/PlayersInRoom.redis.dao");
const IPLHttp_utill_1 = require("../lib/utils/IPLHttp.utill");
const IPLRecord_mysql_dao_1 = require("../../../common/dao/mysql/IPLRecord.mysql.dao");
const moment = require("moment");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const GameRecordStatus_enum_1 = require("../../../common/dao/mysql/enum/GameRecordStatus.enum");
const GameRecordDateTable_mysql_dao_1 = require("../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const loggerPreStr = `板球服务器服务器 ${pinus_1.pinus.app.getServerId()} | `;
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
    }
    async enterGame({ nid }, session) {
        let language = null;
        const { uid } = session;
        try {
            const sceneId = 0;
            const roomId = "1";
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            let { userId } = player;
            language = "en";
            if (userId === null) {
                const res = await IPLHttp_utill_1.default.accountMember(uid);
                userId = res.data.User.user_id;
                await Player_manager_1.default.updateOne({
                    uid
                }, {
                    userId
                });
            }
            let _updateGold = null;
            if (player.gold >= 10000) {
                const updateGold = Math.floor(player.gold / 100);
                const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;
                const recordRes = await IPLHttp_utill_1.default.userTransferApi(updateGold, walletOrderId, uid);
                const _a = recordRes.data, { create_at: createTime, code, user_id: userId } = _a, rest = __rest(_a, ["create_at", "code", "user_id"]);
                const insertParams = Object.assign({ uid: uid, userId,
                    createTime }, rest);
                await IPLRecord_mysql_dao_1.default.insertOne(insertParams);
                const afterUpdateGold = player.gold - (updateGold * 100);
                await Player_manager_1.default.updateOne({
                    uid
                }, {
                    gold: afterUpdateGold
                });
                _updateGold = afterUpdateGold;
            }
            const { data } = await IPLHttp_utill_1.default.userLogin(language, uid);
            const loginUrl = data.login_url;
            const { name } = (0, JsonConfig_1.get_games)(nid);
            const serverId = await selectServerId(name);
            await ServerCurrentNumbersPlayersDao.increaseByServerId(serverId);
            await recordPlayGameLog(player, nid, sceneId, roomId);
            await sessionService.sessionSet(session, { nid, sceneId, roomId, backendServerId: serverId });
            logger.debug(`${loggerPreStr} | 更新在线玩家redis | uid: ${uid} | tag 3`);
            await updateOnlinePlayer(player, serverId, nid, sceneId, roomId);
            await GameLoginStatistics.increase_to_db(nid, sceneId, uid);
            await PlayersInRoom_redis_dao_1.default.insertOne(serverId, roomId, uid, player.isRobot);
            return new ApiResult_1.ApiResult(200, { loginUrl, gold: typeof _updateGold === "number" ? _updateGold : player.gold });
        }
        catch (e) {
            if (e instanceof ApiResult_1.ApiResult) {
                return e;
            }
            logger.error(`${loggerPreStr}进入游戏出错：${e.stack || e.message || e}`);
            return new ApiResult_1.ApiResult(500, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226));
        }
    }
    async recoveryGold({}, session) {
        const { uid } = session;
        let language = null;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                logger.warn(`${loggerPreStr}查询不到玩家`);
                return new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_Player, [], langsrv.getlanguage(language, langsrv.Net_Message.id_3));
            }
            let gold = 0;
            if (player.gold < 10000) {
                const res = await IPLHttp_utill_1.default.userfunds(uid);
                gold = res.data.result[0].balance;
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
                        gold = (gold - new_balance) * 100;
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
                            profit: gold,
                            status: GameRecordStatus_enum_1.GameRecordStatusEnum.Success,
                            createTimeDate: new Date()
                        };
                        await GameRecordDateTable_mysql_dao_1.default.insertOne(gameRecord);
                    }
                    await Player_manager_1.default.updateOne({ uid }, { gold: player.gold + (res.data.result[0].balance * 100) });
                }
            }
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            logger.error(`${loggerPreStr}uid:${uid} | 从 nid: ${uid} 游戏信息列表(盘路) | 返回大厅出错：${e.stack || e.message || e}`);
            return ApiResult_1.ApiResult.ERROR([], langsrv.getlanguage(language, langsrv.Net_Message.id_231));
        }
    }
}
exports.MainHandler = MainHandler;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9JUEwvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFzRTtBQUN0RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELGtGQUE2RTtBQUU3RSw4REFBMkQ7QUFDM0QsNkRBQXdEO0FBQ3hELHlEQUFxRDtBQUNyRCw0REFBNkQ7QUFDN0QsMkdBQTJHO0FBQzNHLCtFQUE0RTtBQUM1RSx1RkFBZ0Y7QUFDaEYsd0dBQThGO0FBQzlGLHFIQUE2RztBQUM3RyxtRUFBbUU7QUFDbkUsNkZBQW9GO0FBQ3BGLGtGQUFtRjtBQUNuRiwrRkFBaUY7QUFDakYsOERBQXNEO0FBQ3RELHVGQUE4RTtBQUM5RSxpQ0FBaUM7QUFDakMsMkVBQXdFO0FBQ3hFLGdHQUE0RjtBQUM1RiwyR0FBa0c7QUFFbEcsTUFBTSxZQUFZLEdBQVcsWUFBWSxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUM7QUFFdEUsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxPQUF1QjtRQUM1QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJO1lBQ0EsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sTUFBTSxHQUFHLEdBQUcs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