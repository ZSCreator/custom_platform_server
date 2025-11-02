"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRoom = void 0;
const pinus_1 = require("pinus");
const MessageService_1 = require("../../../services/MessageService");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../constant/game/GameNidEnum");
const PositionEnum_1 = require("../../constant/player/PositionEnum");
const ServerCurrentNumbersPlayersDao_1 = require("../../dao/redis/ServerCurrentNumbersPlayersDao");
const utils_1 = require("../../../utils/utils");
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const PlayersInRoom_redis_dao_1 = require("../../../common/dao/redis/PlayersInRoom.redis.dao");
const langsrv = require("../../../services/common/langsrv");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const redisEvent_1 = require("../../../common/event/redisEvent");
const RobotMessage_1 = require("../../constant/game/RobotMessage");
const JsonConfig_1 = require("../../../pojo/JsonConfig");
class SystemRoom {
    constructor(opts) {
        this.players = [];
        this.realPlayersNumber = 0;
        this.canBeDestroy = true;
        this.roomBeInit = false;
        this.serverId = opts.serverId || null;
        this.channel = opts.channel || null;
        this.nid = opts.nid;
        this.sceneId = opts.sceneId !== undefined ? opts.sceneId : -1;
        this.roomId = opts.roomId;
        this.createTime = Date.now();
        this.jackpot = opts.jackpot || 0;
        if ([
            GameNidEnum_1.GameNidEnum.slots777,
            GameNidEnum_1.GameNidEnum.xiyouji,
            GameNidEnum_1.GameNidEnum.att,
            GameNidEnum_1.GameNidEnum.pharaoh,
            GameNidEnum_1.GameNidEnum.BingoMoney
        ].includes(this.nid)) {
            this.runningPool = (opts.runningPool == 0 || opts.runningPool == null) ? -500000 : opts.runningPool;
        }
        else {
            this.runningPool = opts.runningPool || 0;
        }
        this.boomNum = opts.boomNum || 0;
        this.open = opts.open || true;
        this.jackpotShow = opts.jackpotShow || { otime: 0, show: 0, rand: 0, ctime: 0 };
        this.entryCond = opts.entryCond || 0;
        this.kind = opts.kind || 0;
        this.maxCount = (0, JsonConfig_1.get_games)(this.nid).roomUserLimit;
    }
    getPlayer(uid) {
        return this.players.find(m => m && m.uid == uid);
    }
    kickOutMessage(uid) {
        const member = this.channel.getMember(uid);
        member && this.channel.leave(member.uid, member.sid);
    }
    addMessage(player) {
        player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && logger.debug(`${pinus_1.pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 开始`);
        const member = this.channel.getMember(player.uid);
        try {
            if (member) {
                logger.info(`${pinus_1.pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 已经在通道里面`);
                return;
            }
            if (!player.sid) {
                logger.warn(`${pinus_1.pinus.app.getServerId()} | ${player.uid}`);
            }
            if (!this.channel.add(player.uid, player.sid)) {
                logger.warn(`${pinus_1.pinus.app.getServerId()} |${player.uid}|${JSON.stringify(player.sid)}`);
            }
        }
        catch (e) {
            logger.error(`${pinus_1.pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 出错: ${e.stack}`);
        }
    }
    isFull() {
        return this.players.filter(p => !!p).length >= this.maxCount;
    }
    channelIsPlayer(route, parameter) {
        let uids = [];
        let RobotUids = [];
        let startIdx = this.nid === "17" ? 1 : 0;
        for (const pl of this.players.slice(startIdx)) {
            if (pl) {
                if (pl.sid == "robot") {
                    RobotUids.push(pl.uid);
                }
                else {
                    uids.push({ uid: pl.uid, sid: pl.sid });
                }
            }
        }
        if (uids.length !== 0) {
            pinus_1.pinus.app.channelService.pushMessageByUids(route, parameter, uids, (err, fails) => {
                if (!!err) {
                    console.error('Push Message error! %j', err.stack);
                }
            });
        }
        for (const uid of RobotUids) {
            redisEvent_1.globalEvent.emit("doForward", uid, route, parameter);
        }
    }
    offLineRecover(player) {
        logger.info(this.sceneId, this.nid, this.roomId, '恢复断线重连', player.uid);
        player.onLine = true;
        player.isOnLine = false;
        this.addMessage(player);
    }
    addPlayerInRoom(dbplayer) { return false; }
    wait() { }
    ;
    async kickingPlayer(backendServerId, players) {
        if (!players.length)
            return Promise.resolve();
        for (const pl of players) {
            try {
                await PlayersInRoom_redis_dao_1.default.delete(backendServerId, this.roomId, pl.uid, pl.isRobot);
                if (pl.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                    await Player_manager_1.default.updateOne({ uid: pl.uid }, { position: PositionEnum_1.PositionEnum.BEFORE_ENTER_Game, kickedOutRoom: true, abnormalOffline: false });
                }
            }
            catch (err) {
                logger.warn(`${backendServerId} | 游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 检测玩家状态 ${pl.uid} 并踢出 | 出错:${err.stack}`);
            }
            finally {
                await (0, ServerCurrentNumbersPlayersDao_1.decreaseByServerId)(backendServerId);
            }
        }
        return Promise.resolve();
    }
    ;
    kickOutPlayerFromMessageChannel(uid) {
        const member = this.channel.getMember(uid);
        member && this.channel.leave(member.uid, member.sid);
    }
    updateRoundId() {
        this.roundId = (0, utils_1.genRoundId)(this.nid, this.roomId);
    }
    updateRealPlayersNumber() {
        this.realPlayersNumber = this.players.filter(pl => pl && pl.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).length;
    }
    async kickOfflinePlayerAndWarnTimeoutPlayer(players, exitUpperLimit, warnUpperLimit) {
        const { offlinePlayers, warnPlayers } = this.getOfflineAndTimeoutPlayers(players, exitUpperLimit, warnUpperLimit);
        warnPlayers.forEach(p => this.sendTimeoutWarning(p, exitUpperLimit));
        offlinePlayers.forEach(p => this.sendExitMsg(p));
        await this.kickingPlayer(pinus_1.pinus.app.getServerId(), offlinePlayers);
        return offlinePlayers;
    }
    sendRoomCloseMessage() {
        this.channelIsPlayer(RobotMessage_1.RobotMessage.ROOM_CLOSE, {});
    }
    async kickTimeoutPlayers(players) {
        players.forEach(p => this.sendExitMsg(p));
        await this.kickingPlayer(pinus_1.pinus.app.getServerId(), players);
    }
    getOfflineAndTimeoutPlayers(players, exitUpperLimit, warnUpperLimit) {
        const offlinePlayers = [], warnPlayers = [];
        players.forEach(p => {
            if (!p) {
                return;
            }
            if (!p.onLine) {
                offlinePlayers.push(p);
                return;
            }
            if (exitUpperLimit <= 0) {
                return;
            }
            if (p.standbyRounds >= warnUpperLimit) {
                p.standbyRounds >= exitUpperLimit ? offlinePlayers.push(p) : warnPlayers.push(p);
            }
        });
        return { offlinePlayers, warnPlayers };
    }
    sendTimeoutWarning(player, exitUpperLimit) {
        const warnMessage = {
            msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1005, exitUpperLimit - player.standbyRounds, exitUpperLimit)
        };
        const member = this.channel.getMember(player.uid);
        member && (0, MessageService_1.pushMessageByUids)(`${this.nid}_playerTimeOut`, warnMessage, member);
    }
    sendExitMsg(player) {
        const member = this.channel.getMember(player.uid);
        member && (0, MessageService_1.pushMessageByUids)(`${this.nid}_playerExit`, {}, member);
    }
    destroy() {
    }
    init() { }
}
exports.SystemRoom = SystemRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vcG9qby9lbnRpdHkvU3lzdGVtUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBdUM7QUFDdkMscUVBQXFFO0FBRXJFLCtDQUF5QztBQUN6QyxpRUFBOEQ7QUFDOUQscUVBQWtFO0FBQ2xFLG1HQUFvRjtBQUNwRixnREFBa0Q7QUFDbEQsNkRBQTBEO0FBQzFELGtGQUE2RTtBQUU3RSwrRkFBaUY7QUFDakYsNERBQTREO0FBQzVELE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsaUVBQStEO0FBSS9ELG1FQUFnRTtBQUNoRSx5REFBcUQ7QUFPckQsTUFBYSxVQUFVO0lBOEJuQixZQUFZLElBQVM7UUFackIsWUFBTyxHQUFRLEVBQUUsQ0FBQztRQUlsQixzQkFBaUIsR0FBVyxDQUFDLENBQUM7UUFJOUIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFHN0IsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUV4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7UUFFcEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJ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