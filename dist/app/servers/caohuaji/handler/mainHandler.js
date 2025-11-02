'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const utils = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const langsrv = require("../../../services/common/langsrv");
const CHJRoomManagerImpl_1 = require("../lib/CHJRoomManagerImpl");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const caohuajiLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = CHJRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "草花机房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "草花机玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.loaded==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3050) };
            }
            roomInfo.channelIsPlayer('onEntry', {
                players: roomInfo.rankingLists(),
                playerRankingList: roomInfo.rankingLists(),
                entryPlayer: playerInfo.basicsStrip()
            });
            return {
                code: 200,
                countdown: roomInfo.countdown,
                roundId: roomInfo.roundId,
                areaNum: roomInfo.areaNum,
                historys: roomInfo.historys,
                area: roomInfo.area,
                gold: utils.sum(playerInfo.gold),
                allCount: roomInfo.roundCount
            };
        }
        catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.loaded==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3050) };
        }
    }
    async bet({ index, bet }, session) {
        const { uid, nid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.warn(`caohuaji.mainHandler.bet==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) };
            }
            if (err || typeof bet !== 'number' || !roomInfo.area[index] || bet <= 0) {
                caohuajiLogger.warn(`caohuaji.mainHandler.bet==>err:${err}|bet:${bet}|index:${index}|room.status:${roomInfo.status}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) };
            }
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2011) };
            }
            if (bet > (utils.sum(playerInfo.gold))) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, error: mes };
            }
            const areaBet = roomInfo.area[index].arr.find(betInfo => betInfo.uid === uid);
            const indexBetGold = areaBet ? areaBet.bet : 0;
            if (bet + indexBetGold > roomInfo.maxBetNum) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1104) };
            }
            playerInfo.gold -= bet;
            roomInfo.addJackpot(playerInfo, index, bet);
            playerInfo.bets(roomInfo, index, bet);
            return {
                code: 200,
                area: roomInfo.area,
                gold: utils.sum(playerInfo.gold),
                areaIndex: index,
                uid,
                allBet: playerInfo.betArea[index],
            };
        }
        catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.bet==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_204) };
        }
    }
    async getPlayerList({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getPlayerList==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3051) };
            }
            return { code: 200, upstarts: roomInfo.rankingLists() };
        }
        catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getPlayerList==>', error);
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3051) };
        }
    }
    async getJackpot({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getJackpot==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3052) };
            }
            return { code: 200, jackpot: roomInfo.jackpot };
        }
        catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getJackpot==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3052) };
        }
    }
    async getHistory({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                caohuajiLogger.error(`caohuaji.mainHandler.getHistory==>err:${err}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3053) };
            }
            return { code: 200, history: roomInfo.historys };
        }
        catch (error) {
            caohuajiLogger.error('caohuaji.mainHandler.getHistory==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3053) };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jYW9odWFqaS9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsd0NBQXdDO0FBQ3hDLG1FQUFvRTtBQUVwRSw0REFBNEQ7QUFDNUQsa0VBQW9EO0FBRXBELDZFQUFxRTtBQUNyRSwrQ0FBeUM7QUFDekMsTUFBTSxjQUFjLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUUzRCxTQUFTLEtBQUssQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLEdBQVc7SUFDdkQsTUFBTSxRQUFRLEdBQUcsNEJBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDO0tBQzlCO0lBQ0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsT0FBTyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQztLQUM5QjtJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFHRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQUlELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRyxFQUFFLE9BQXVC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