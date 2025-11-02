'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const utils = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const fisheryConst = require("../lib/fisheryConst");
const RedisManager = require("../../../common/dao/redis/lib/redisManager");
const FisheryRoomManagerImpl_1 = require("../lib/FisheryRoomManagerImpl");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const langsrv_1 = require("../../../services/common/langsrv");
const fisheryErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
    }
    async intoFishery({}, session) {
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fisheryErrorLogger.warn(`fishery.mainHandler.intoFishery==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1201) };
            }
            setTimeout(() => {
                roomInfo.channelIsPlayer('changeFishery', {
                    playerNum: roomInfo.players.length,
                    list: roomInfo.rankingLists().slice(6),
                    entryPlayer: playerInfo.basicsStrip()
                });
            }, 500);
            return {
                code: 200,
                countDown: roomInfo.countTime(),
                fisheryRoom: roomInfo.stipRoom(),
                sceneId: roomInfo.sceneId,
                lastResult: roomInfo.fisheryHistory.slice(-1).length > 0 ? roomInfo.fisheryHistory.slice(-1)[0].fishType : null,
                gold: playerInfo.gold - playerInfo.bet,
                lotteryResult: roomInfo.result,
                roundId: roomInfo.roundId,
                state: roomInfo.roomStatus
            };
        }
        catch (error) {
            fisheryErrorLogger.warn('fishery.mainHandler.intoFishery==>', error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1201) };
        }
    }
    async fisheryBet({ gold, seat }, session) {
        let tempLock;
        const { uid, roomId, sceneId, nid } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fisheryErrorLogger.warn(`fishery.mainHandler.fisheryBet==>err:${err}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_204) };
            }
            if (roomInfo.roomStatus !== 'BETTING') {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1011) };
            }
            if (typeof gold !== 'number' || gold <= 0 || fisheryConst.SEAT[seat] === undefined) {
                fisheryErrorLogger.warn(`fishery.mainHandler.fisheryBet==>gold:${gold}|seat:${seat}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_204) };
            }
            if (gold > utils.sum(playerInfo.gold - playerInfo.bet)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1015) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                await RedisManager.unlock(tempLock);
                const mes = (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, error: mes };
            }
            if (playerInfo.betCheck(gold)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1013) };
            }
            if (playerInfo.isBet == false && playerInfo.isContinue == false) {
                playerInfo.allSeat = {};
            }
            playerInfo.playerFisheryBet(gold, roomInfo, fisheryConst.SEAT[seat], seat);
            playerInfo.isBet = true;
            playerInfo.recordBetSeat(gold, seat);
            roomInfo.fisheryBet_(gold, seat, playerInfo);
            return { code: 200, gold: playerInfo.gold - playerInfo.bet };
        }
        catch (error) {
            fisheryErrorLogger.warn('fishery.mainHandler.fisheryBet==>', error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_204) };
        }
    }
    async getRecord({}, session) {
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fisheryErrorLogger.warn(`fishery.mainHandler.getRecord==>err:${err}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3053) };
            }
            return { code: 200, result: roomInfo.fisheryHistory };
        }
        catch (error) {
            fisheryErrorLogger.warn('fishery.mainHandler.getRecord==>', error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3053) };
        }
    }
    async getPlayerList({}, session) {
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fisheryErrorLogger.warn(`fishery.mainHandler.getPlayerList==>err:${err}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3051) };
            }
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 50) };
        }
        catch (error) {
            fisheryErrorLogger.warn('fishery.mainHandler.getPlayerList==>', error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3051) };
        }
    }
    async continueBet({}, session) {
        const { uid, roomId, sceneId, nid } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fisheryErrorLogger.warn(`fishery.mainHandler.continueBet==>err:${err}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3250) };
            }
            if (roomInfo.roomStatus != 'BETTING') {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1011) };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1039) };
            }
            const continueGold = utils.sum(playerInfo.allSeat);
            if (continueGold <= 0) {
                fisheryErrorLogger.warn(`fishery.mainHandler.continueBet==>continueGold:${continueGold}`);
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3250) };
            }
            if (continueGold > utils.sum(playerInfo.gold - playerInfo.bet)) {
                return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1015) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, error: mes };
            }
            playerInfo.continueGolds(roomInfo);
            roomInfo.continueBets_(playerInfo);
            return { code: 200, gold: playerInfo.gold - playerInfo.bet };
        }
        catch (error) {
            fisheryErrorLogger.warn('fishery.mainHandler.continueBet==>', error);
            return { code: 500, error: (0, langsrv_1.getlanguage)(playerInfo.language, langsrv_1.Net_Message.id_3250) };
        }
    }
}
exports.MainHandler = MainHandler;
function check(sceneId, roomId, uid) {
    const roomInfo = FisheryRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: '没有找到渔场' };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: '渔场里面没有玩家' };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9maXNoZXJ5L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYix3Q0FBeUM7QUFDekMsbUVBQW9FO0FBQ3BFLG9EQUFxRDtBQUNyRCwyRUFBNEU7QUFDNUUsMEVBQTJEO0FBQzNELDZFQUFxRTtBQUNyRSwrQ0FBeUM7QUFDekMsOERBQTRFO0FBQzVFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUUvRCxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFFdEIsWUFBWSxHQUFnQjtJQUU1QixDQUFDO0lBUUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDNUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFJO1lBQ0YsSUFBSSxHQUFHLEVBQUU7Z0JBQ1Asa0JBQWtCLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxHQUFHLFlBQVksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHFCQUFXLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7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