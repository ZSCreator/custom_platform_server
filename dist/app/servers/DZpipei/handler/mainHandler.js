"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const dzRoomMgr_1 = require("../lib/dzRoomMgr");
const sessionService = require("../../../services/sessionService");
const pinus_1 = require("pinus");
const dzPlayer_1 = require("../lib/dzPlayer");
const langsrv = require("../../../services/common/langsrv");
const Logger = (0, pinus_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.loaded==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            playerInfo.isOnLine = false;
            let offLine = roomInfo.getOffLineData(playerInfo);
            let opts = {
                code: 200,
                room: roomInfo.strip(),
                sceneId,
                roundId: roomInfo.roundId,
                offLine
            };
            return opts;
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
    }
    async cingl({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
        if (err) {
            Logger.warn(`DZpipei.mainHandler.cingl==>err:${err}`);
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        try {
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            const bet = roomInfo.lastBetNum - playerInfo.bet;
            do {
                if (playerInfo.canUserGold() > bet && bet > 0) {
                    roomInfo.handler_oper('cingl', playerInfo, bet);
                    break;
                }
                if (playerInfo.canUserGold() <= bet && bet > 0) {
                    let betNum = playerInfo.canUserGold();
                    roomInfo.handler_oper('allin', playerInfo, betNum);
                    break;
                }
                if (bet == 0) {
                    roomInfo.handler_oper('pass', playerInfo, bet);
                    break;
                }
            } while (true);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn(`DZpipei.mainHandler.cingl==>${playerInfo.nickname}`, error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async filling1({ type }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.filling1==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            let betNum = playerInfo.recommendBet[type];
            if (!betNum || playerInfo.isFold == true || (roomInfo.lastBetNum - playerInfo.bet) > betNum) {
                Logger.warn(`DZpipei.mainHandler.filling1|${playerInfo.nickname}|betNum:${betNum}|lastBetNum:${roomInfo.lastBetNum}|bet:${playerInfo.bet}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.canUserGold() < betNum) {
                betNum = playerInfo.canUserGold();
                roomInfo.handler_oper('allin', playerInfo, betNum);
                return { code: 200 };
            }
            roomInfo.handler_oper('filling', playerInfo, betNum);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.filling1==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async filling2(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.filling2==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            if (typeof msg.betNum != 'number' || msg.betNum <= 0 || msg.betNum < roomInfo.freedomBet[0]) {
                Logger.warn(`DZpipei.mainHandler.filling2==>|${playerInfo.nickname}|${roomInfo.curr_doing_seat}|betNum:${msg.betNum}|${roomInfo.freedomBet}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.canUserGold() < msg.betNum || playerInfo.isFold == true || (roomInfo.lastBetNum - playerInfo.bet) > msg.betNum) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            do {
                if (msg.betNum == 0) {
                    roomInfo.handler_oper('pass', playerInfo, msg.betNum);
                    break;
                }
                if (playerInfo.canUserGold() == msg.betNum) {
                    roomInfo.handler_oper('allin', playerInfo, msg.betNum);
                    break;
                }
                roomInfo.handler_oper('filling', playerInfo, msg.betNum);
                break;
            } while (true);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.filling2==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async allin({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.allin==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            if (playerInfo.isFold == true) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            let betNum = playerInfo.canUserGold();
            roomInfo.handler_oper('allin', playerInfo, betNum);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.allin==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async fold({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.fold==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            playerInfo.handler_fold(roomInfo, 'fold');
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.fold==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async robotNeed({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid, true);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.robotNeed==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.isRobot != 2) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            return { code: 200, descSortAllPlayer: roomInfo.getDescSortAllPlayer() };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.robotNeed==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async ready({ option }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, playerInfo, roomInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`DZpipei.mainHandler.ready==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (option) {
                playerInfo.setStatus(dzPlayer_1.PlayerStatus.WAIT);
                roomInfo.wait(playerInfo);
            }
            else {
                playerInfo.setStatus(dzPlayer_1.PlayerStatus.NONE);
            }
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('DZpipei.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
    }
}
exports.MainHandler = MainHandler;
function check(sceneId, roomId, uid) {
    const roomInfo = dzRoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "德州房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "德州玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
function checkCanOpt(sceneId, roomId, uid, isHistory = false) {
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    if (err) {
        return { err: err };
    }
    if (roomInfo.status != 'INGAME' && !isHistory) {
        return { err: '操作错误01' };
    }
    if (playerInfo.status != 'GAME' && !isHistory) {
        return { err: '操作错误02' };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EWnBpcGVpL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsZ0RBQXVDO0FBQ3ZDLG1FQUFvRTtBQUNwRSxpQ0FBa0M7QUFFbEMsOENBQStDO0FBRS9DLDREQUE2RDtBQUU3RCxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR25ELG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUV0QixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFNRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUcsRUFBRSxPQUF1QjtRQUN2QyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFJO1lBQ0YsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzth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