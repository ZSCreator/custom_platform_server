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
exports.robotCloseSessionByMysql = exports.playerCloseSessionByMysql = void 0;
const pinus_1 = require("pinus");
const sessionService_1 = require("../../services/sessionService");
const commonUtil_1 = require("../../utils/lottery/commonUtil");
const utils = require("../../utils");
const pinus_logger_1 = require("pinus-logger");
const backendControlService_1 = require("../../services/newControl/backendControlService");
const Player_manager_1 = require("../../common/dao/daoManager/Player.manager");
const SessionService_1 = require("./service/SessionService");
const OnlinePlayer_redis_dao_1 = require("../dao/redis/OnlinePlayer.redis.dao");
const Robot_manager_1 = require("../dao/daoManager/Robot.manager");
const RobotLeaveTaskQueue_redis_dao_1 = require("../dao/redis/RobotLeaveTaskQueue.redis.dao");
const PositionEnum_1 = require("../constant/player/PositionEnum");
const Game_manager_1 = require("../dao/daoManager/Game.manager");
const hallConst_1 = require("../../consts/hallConst");
const PlayersInRoom_redis_dao_1 = require("../../common/dao/redis/PlayersInRoom.redis.dao");
const IPLHttp_utill_1 = require("../../servers/IPL/lib/utils/IPLHttp.utill");
const IPLRecord_mysql_dao_1 = require("../dao/mysql/IPLRecord.mysql.dao");
const moment = require("moment");
const GameNidEnum_1 = require("../constant/game/GameNidEnum");
const GameRecordStatus_enum_1 = require("../dao/mysql/enum/GameRecordStatus.enum");
const GameRecordDateTable_mysql_dao_1 = require("../dao/mysql/GameRecordDateTable.mysql.dao");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function playerCloseSessionByMysql(app, session) {
    if (!session || !session.uid) {
        logger.warn(`session 不存在 bug`);
        return;
    }
    const { uid, nid, roomId, sceneId, backendServerId } = (0, sessionService_1.sessionInfo)(session);
    let kickself = false;
    let position = null;
    try {
        const player = await Player_manager_1.default.findOne({ uid }, false);
        if (!player) {
            logger.warn(`RPC 玩家离线 未查询到玩家`);
            return;
        }
        const { language, isRobot, kickself: k } = player;
        kickself = k;
        if (!(0, commonUtil_1.isNullOrUndefined)(roomId) && nid !== '-1') {
            if (nid !== "86") {
                await (0, SessionService_1.closeSession)(backendServerId, nid, sceneId, roomId, player);
            }
            else {
                if (backendServerId !== undefined)
                    await PlayersInRoom_redis_dao_1.default.delete(backendServerId, roomId, uid, isRobot);
                const updateParams = {
                    position: PositionEnum_1.PositionEnum.HALL,
                    kickself: false,
                    abnormalOffline: false,
                    lastLogoutTime: new Date(),
                };
                let gold = 0;
                try {
                    const res = await IPLHttp_utill_1.default.userfunds(uid);
                    gold = res.data.result[0].balance;
                    if (gold > 0) {
                        const walletOrderId = `IPL${moment().format("YYYYMMDDHHmmssSSS")}${uid}`;
                        const recordRes = await IPLHttp_utill_1.default.userTransferApi(-gold, walletOrderId, uid);
                        updateParams["gold"] = player.gold + gold * 100;
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
                    }
                }
                catch (e) {
                    logger.error(`连接服务器 ${app.getServerId()} | 玩家离线 | uid:${player.uid} | 昵称:${player.nickname} | ip:${player.ip} | 离开时金额 ${utils.sum(player.gold, true)} | 身份:${player.isRobot} | 板球通信出错`);
                }
                await Player_manager_1.default.updateOne({ uid }, updateParams);
            }
        }
        else if (player.position === PositionEnum_1.PositionEnum.BEFORE_ENTER_Game && !hallConst_1.SLOTS_GAME.includes(nid) && nid !== '-1') {
            const { name } = await Game_manager_1.default.findOne({ nid });
            await pinus_1.pinus.app.rpc[name].mainRemote.leaveGameAndBackToHall.toServer('*', {
                group_id: player.group_id, lineCode: player.lineCode, uid: player.uid
            });
        }
        else if (nid === '-1' || (0, commonUtil_1.isNullOrUndefined)(roomId)) {
            await Player_manager_1.default.updateOne({ uid }, { kickself: false });
        }
        if (kickself) {
            position = player.position;
        }
        await (0, sessionService_1.sessionSet)(session, { roomId: null, backendServerId: null });
        logger.warn(`连接服务器 ${app.getServerId()} | 玩家离线 | uid:${player.uid} | 昵称:${player.nickname} | ip:${player.ip} | 离开时金额 ${utils.sum(player.gold, true)} | 身份:${player.isRobot} `);
        return;
    }
    catch (e) {
        logger.error(`连接服务器 ${app.getServerId()} | 玩家离线 异常 ==> uid: ${uid}, nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}，错误：${e.stack || e.message || e}`);
        return;
    }
    finally {
        if (!kickself) {
            await OnlinePlayer_redis_dao_1.default.deleteOne({ uid });
            await deleteOnlineTotalControl(uid);
        }
    }
}
exports.playerCloseSessionByMysql = playerCloseSessionByMysql;
async function robotCloseSessionByMysql(app, session) {
    if (!session || !session.uid) {
        logger.warn(`session 不存在 bug`);
        return;
    }
    const { uid, nid, roomId, sceneId, backendServerId } = (0, sessionService_1.sessionInfo)(session);
    try {
        const robot = await Robot_manager_1.default.findOne({ uid }, false);
        if (!robot) {
            logger.warn(`RPC 机器人离线 未查询到玩家`);
            return;
        }
        if (!(0, commonUtil_1.isNullOrUndefined)(roomId)) {
            await (0, SessionService_1.closeSession)(backendServerId, nid, sceneId, roomId, robot);
        }
        await RobotLeaveTaskQueue_redis_dao_1.default.increaseRobot(uid);
        await (0, sessionService_1.sessionSet)(session, { roomId: null, backendServerId: null });
        return;
    }
    catch (e) {
        logger.error(`连接服务器 ${app.getServerId()} | 机器人离线 异常 ==> uid: ${uid}, nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}，错误：${e.stack || e.message || e}`);
        return;
    }
}
exports.robotCloseSessionByMysql = robotCloseSessionByMysql;
async function deleteOnlineTotalControl(uid) {
    if (await backendControlService_1.BackendControlService.isTotalControlPlayer(uid)) {
        await backendControlService_1.BackendControlService.removeOnlineControlPlayer(uid);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9ldmVudC9zZXNzaW9uRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBMkQ7QUFDM0Qsa0VBQXdFO0FBQ3hFLCtEQUFtRTtBQUNuRSxxQ0FBcUM7QUFDckMsK0NBQXlDO0FBQ3pDLDJGQUF3RjtBQUV4RiwrRUFBMEU7QUFDMUUsNkRBQXdEO0FBRXhELGdGQUF1RTtBQUV2RSxtRUFBOEQ7QUFDOUQsOEZBQTZFO0FBQzdFLGtFQUErRDtBQUMvRCxpRUFBeUQ7QUFDekQsc0RBQW9EO0FBQ3BELDRGQUE4RTtBQUM5RSw2RUFBcUU7QUFDckUsMEVBQWlFO0FBQ2pFLGlDQUFpQztBQUNqQyw4REFBMkQ7QUFDM0QsbUZBQStFO0FBQy9FLDhGQUFxRjtBQUVyRixNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBTzVDLEtBQUssVUFBVSx5QkFBeUIsQ0FBQyxHQUFnQixFQUFFLE9BQXVCO0lBRXJGLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUM5QixPQUFPO0tBQ1Y7SUFFRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUEsNEJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUU1RSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLElBQUk7UUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTlE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