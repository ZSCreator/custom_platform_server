"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const FCSRoomMgr_1 = require("../lib/FCSRoomMgr");
const sessionService = require("../../../services/sessionService");
const pinus_1 = require("pinus");
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
                Logger.warn(`FiveCardStud.mainHandler.loaded==>err:${err}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.wait(playerInfo);
            let opts = {
                code: 200,
                room: {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    roundId: roomInfo.roundId,
                    status: roomInfo.status,
                    waitTime: roomInfo.getWaitTime(),
                    lowBet: roomInfo.lowBet,
                    curr_doing_seat: roomInfo.curr_doing_seat,
                    freedomBet: roomInfo.freedomBet,
                    roundTimes: roomInfo.roundTimes,
                    roomCurrSumBet: roomInfo.roomCurrSumBet,
                    canCarryGold: roomInfo.canCarryGold,
                },
                players: roomInfo.players.map(pl => {
                    if (pl) {
                        return {
                            seat: pl.seat,
                            uid: pl.uid,
                            nickname: pl.nickname,
                            headurl: pl.headurl,
                            gold: pl.gold,
                            currGold: pl.canUserGold(),
                            profit: pl.profit,
                            status: pl.status,
                            bet: pl.bet,
                            isFold: pl.isFold,
                            holds: (playerInfo.uid == pl.uid || roomInfo.status == "END") ? pl.holds : pl.holds.map((c, i) => i == 0 ? 0x99 : c),
                            cardType: pl.cardType
                        };
                    }
                }),
            };
            return opts;
        }
        catch (error) {
            Logger.warn('FiveCardStud.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
    }
    async cingl({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            Logger.warn(`FiveCardStud.mainHandler.cingl==>err:${err}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        try {
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            const bet = roomInfo.lastBetNum - playerInfo.bet;
            do {
                if (playerInfo.canUserGold() > bet && bet > 0) {
                    playerInfo.handler_play(roomInfo, 'cingl', bet);
                    break;
                }
                if (playerInfo.canUserGold() <= bet && bet > 0) {
                    let betNum = playerInfo.canUserGold();
                    playerInfo.handler_play(roomInfo, 'allin', betNum);
                    break;
                }
                if (bet == 0) {
                    playerInfo.handler_play(roomInfo, 'pass', bet);
                    break;
                }
            } while (true);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn(`FiveCardStud.mainHandler.cingl==>${playerInfo.nickname}`, error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async filling(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`FiveCardStud.mainHandler.filling==>err:${err}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            if (typeof msg.betNum != 'number' || msg.betNum < 0 || isNaN(msg.betNum) ||
                msg.betNum > roomInfo.freedomBet[1]) {
                Logger.warn(`FiveCardStud.mainHandler.filling==>|${playerInfo.uid}|${playerInfo.bet}|betNum:${msg.betNum}|${roomInfo.freedomBet}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.canUserGold() < msg.betNum || playerInfo.isFold == true) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            do {
                if (msg.betNum == 0) {
                    playerInfo.handler_play(roomInfo, 'pass', msg.betNum);
                    break;
                }
                if (playerInfo.canUserGold() == msg.betNum) {
                    playerInfo.handler_play(roomInfo, 'allin', msg.betNum);
                    break;
                }
                playerInfo.handler_play(roomInfo, 'filling', msg.betNum);
                break;
            } while (true);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('FiveCardStud.mainHandler.filling2==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async fold({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.warn(`FiveCardStud.mainHandler.fold==>err:${err}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            playerInfo.handler_fold(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            Logger.warn('FiveCardStud.mainHandler.fold==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}
exports.MainHandler = MainHandler;
function check(sceneId, roomId, uid) {
    const roomInfo = FCSRoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "梭哈房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "梭哈玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GaXZlQ2FyZFN0dWQvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrREFBMkM7QUFDM0MsbUVBQW9FO0FBRXBFLGlDQUFrQztBQUNsQyw0REFBNkQ7QUFFN0QsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUduRCxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFFdEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNsQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNqQixDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDdkMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0UsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEUsSUFBSTtZQUNGLElBQUksR0FBRyxFQUFFO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXlDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzVELE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7YUFDdkY7WUFF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