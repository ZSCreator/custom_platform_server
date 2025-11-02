"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandler = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const ConnectorSessionService_1 = require("../lib/services/ConnectorSessionService");
const OnlinePlayer_redis_dao_1 = require("../../../common/dao/redis/OnlinePlayer.redis.dao");
const DayLoginPlayer_redis_dao_1 = require("../../../common/dao/redis/DayLoginPlayer.redis.dao");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const systemState_1 = require("../../../common/systemState");
const connector_state_1 = require("../../../common/systemState/connector.state");
const tokenService_1 = require("../../../services/hall/tokenService");
const langsrv = require("../../../services/common/langsrv");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const Robot_manager_1 = require("../../../common/dao/daoManager/Robot.manager");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const PlayerGameHistory_entity_1 = require("../../../common/dao/mysql/entity/PlayerGameHistory.entity");
const PositionEnum_1 = require("../../../common/constant/player/PositionEnum");
const hallConst_1 = require("../../../consts/hallConst");
const GameRemoteCallService_1 = require("../../hall/service/GameRemoteCallService");
const sessionService_1 = require("../../../services/sessionService");
const loginHelperService_1 = require("../../../services/hall/loginHelperService");
const gameController_1 = require("../../../services/hall/gameController");
const Robot_redis_dao_1 = require("../../../common/dao/redis/Robot.redis.dao");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
const RedisGoldMessageService_1 = require("../lib/services/RedisGoldMessageService");
function default_1(app) {
    return new EntryHandler(app);
}
exports.default = default_1;
class EntryHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.connectorSessionService = new ConnectorSessionService_1.ConnectorSessionService(this);
        this.redisGoldMessageService = new RedisGoldMessageService_1.RedisGoldMessageService(this);
        this.loggerPreStr = `连接服务器 ${this.app.getServerId()} | `;
    }
    async entryHall({ uid, token }, session) {
        try {
            if (!uid || !token) {
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.MISS_FIELD, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }
            const tokenAuthResult = (0, tokenService_1.auth)(token);
            if (tokenAuthResult) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | auth ${tokenAuthResult} `);
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.AUTH_TOKEN_FAIL, [], tokenAuthResult);
            }
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | uid:${uid} | 未查询到玩家信息 `);
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.CAN_NOT_FIND_PLAYER, [], langsrv.getlanguage(null, langsrv.Net_Message.id_3));
            }
            const { isSuccess, kickself } = await this.connectorSessionService.bindSessionWithRealPlayer(uid, player.language, session);
            if (!isSuccess) {
                this.logger.warn(`${this.loggerPreStr}登录大厅异常: | 真实玩家 | uid:${uid} | 绑定session失败 `);
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.BIND_SESSION_FAIL, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }
            let gameOffLine;
            let lastGame = null;
            let lastRoom = null;
            if (player.position == PositionEnum_1.PositionEnum.GAME) {
                const playerLastHistory = await connectionManager_1.default.getConnection(true)
                    .createQueryBuilder(PlayerGameHistory_entity_1.PlayerGameHistory, "history")
                    .where("history.uid = :uid", { uid })
                    .orderBy("history.createDateTime", "DESC")
                    .getOne();
                if (playerLastHistory) {
                    const { nid, sceneId, roomId } = playerLastHistory;
                    lastGame = nid;
                    lastRoom = roomId;
                    if (player.position === PositionEnum_1.PositionEnum.GAME &&
                        hallConst_1.OFF_LINE_CONNECT.includes(nid) &&
                        player.abnormalOffline && !player.kickedOutRoom) {
                        gameOffLine = { nid, sceneId, roomId };
                    }
                    if (!player.abnormalOffline && roomId === undefined) {
                        player.position = PositionEnum_1.PositionEnum.HALL;
                    }
                    let beSuccess = false;
                    if (gameOffLine && typeof nid === "string" && typeof sceneId === "number" && typeof roomId === "string") {
                        const result = await (0, GameRemoteCallService_1.reconnectBeforeEntryRoom)(nid, player.uid);
                        if (!(result instanceof ApiResult_1.ApiResult)) {
                            beSuccess = result;
                        }
                        if (!beSuccess) {
                            player.position = PositionEnum_1.PositionEnum.HALL;
                            gameOffLine = null;
                        }
                    }
                    const game = await Game_manager_1.default.findOne({ nid });
                    game && game.opened && (player.position !== PositionEnum_1.PositionEnum.HALL) && await (0, sessionService_1.sessionSet)(session, { nid });
                    gameOffLine && await (0, sessionService_1.sessionSet)(session, { sceneId });
                }
            }
            const [gameList, { list, nidList }] = await Promise.all([
                Game_manager_1.default.findList({}),
                (0, loginHelperService_1.filterGameType)(player)
            ]);
            const games = await (0, gameController_1.convertGameForClient)(gameList, nidList, player);
            const result = {
                uid,
                nickname: player.nickname,
                headurl: player.headurl,
                gold: player.gold,
                walletGold: player.walletGold,
                level: player.level,
                addRmb: player.addRmb,
                tixianBate: 0,
                language: player.language,
                lastGame: lastGame,
                lastRoom: lastRoom,
                games,
                gameTypeList: list,
                offLine: gameOffLine || {}
            };
            const asyncFunc = [];
            if (!kickself) {
                this.logger.warn(`${this.loggerPreStr}连接connector: | 真实玩家 | uid:${uid} | 设置在线玩家`);
                asyncFunc.push(OnlinePlayer_redis_dao_1.default.insertOne({ uid: player.uid, nid: '-1', sceneId: -1, isRobot: player.isRobot, entryGameTime: new Date(), roomId: '-1', frontendServerId: pinus_1.pinus.app.getServerId() }));
            }
            asyncFunc.push(DayLoginPlayer_redis_dao_1.default.insertOne({ uid: player.uid, loginTime: new Date(), loginNum: 1 }));
            asyncFunc.push(Player_manager_1.default.updateOne({ uid: player.uid }, {
                loginTime: player.loginTime,
                loginCount: player.loginCount + 1,
                sid: pinus_1.pinus.app.getServerId(),
                position: PositionEnum_1.PositionEnum.HALL
            }));
            await this.redisGoldMessageService.subMessageChannel();
            await Promise.all(asyncFunc);
            return ApiResult_1.ApiResult.SUCCESS(result, "操作成功");
        }
        catch (e) {
            this.logger.error(`${this.loggerPreStr}登录大厅出错:${e.stack} `);
            return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
        }
    }
    async entryHallForRobot({ uid, token, nid }, session) {
        try {
            if (!uid || !token) {
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.MISS_FIELD, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }
            const tokenAuthResult = (0, tokenService_1.auth)(token);
            if (tokenAuthResult) {
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.AUTH_TOKEN_FAIL, [], tokenAuthResult);
            }
            const robot = await Robot_manager_1.default.findOne({ uid }, false);
            if (!robot) {
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.CAN_NOT_FIND_PLAYER, [], langsrv.getlanguage(null, langsrv.Net_Message.id_3));
            }
            const status = await this.connectorSessionService.bindSessionWithRobot(uid, robot.language, session, nid);
            if (!status) {
                return new ApiResult_1.ApiResult(connector_state_1.connectorEnum.BIND_SESSION_FAIL, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
            }
            robot.sid = pinus_1.pinus.app.getServerId();
            robot.position = PositionEnum_1.PositionEnum.HALL;
            await Robot_redis_dao_1.default.updateOne({ uid }, {
                sid: robot.sid,
                position: robot.position,
                robotOnLine: true
            });
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(`${this.loggerPreStr}登录大厅出错:${e.stack} `);
            return new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], langsrv.getlanguage(null, langsrv.Net_Message.id_6));
        }
    }
}
exports.EntryHandler = EntryHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFvRTtBQUNwRSwrQ0FBeUM7QUFDekMscUZBQWtGO0FBQ2xGLDZGQUFvRjtBQUNwRixpR0FBd0Y7QUFDeEYsOERBQTJEO0FBQzNELDZEQUF3RDtBQUN4RCxpRkFBNEU7QUFDNUUsc0VBQTJEO0FBQzNELDREQUE2RDtBQUM3RCxrRkFBNkU7QUFDN0UsZ0ZBQTJFO0FBRTNFLDhFQUFzRTtBQUN0RSx3R0FBOEY7QUFDOUYsK0VBQTRFO0FBQzVFLHlEQUE2RDtBQUM3RCxvRkFBb0Y7QUFDcEYscUVBQThEO0FBQzlELGtGQUEyRTtBQUMzRSwwRUFBNkU7QUFDN0UsK0VBQXNFO0FBQ3RFLHVGQUFnRjtBQUNoRixxRkFBa0Y7QUFFbEYsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxZQUFZO0lBVXJCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLGlEQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLGlEQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUM7SUFDN0QsQ0FBQztJQVdELEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVB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