'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const sessionService = require("../../../services/sessionService");
const hallConst = require("../../../consts/hallConst");
const FishPrawnCrabConst = require("../lib/FishPrawnCrabConst");
const FishPrawnCrabRoomManager_1 = require("../lib/FishPrawnCrabRoomManager");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const fishPrawnCrabLaLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = FishPrawnCrabRoomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { code: 500, err: "鱼虾蟹房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "鱼虾蟹玩家不存在" };
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
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
            }
            if (roomInfo.status === 'NONE') {
                roomInfo.run();
            }
            let offline = playerInfo.onLine ? roomInfo.getOffLineData(playerInfo) : null;
            let result = null;
            if (offline) {
                result = {
                    countdown: roomInfo.countdown,
                    status: roomInfo.status,
                    result: roomInfo.result,
                    winArea: roomInfo.winArea,
                };
            }
            let opts = {
                code: 200,
                roomInfo: roomInfo.strip(),
                offLine: offline,
                sceneId: roomInfo.sceneId,
                roundId: roomInfo.roundId,
                pl: playerInfo.strip(),
                result,
            };
            return opts;
        }
        catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    }
    ;
    async bet({ type, area, bet }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.bet==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            if (typeof bet != `number` || bet <= 0 || roomInfo.lowBet > bet) {
                fishPrawnCrabLaLogger.warn(`${pinus_1.pinus.app.getServerId()}|${JSON.stringify(bet)}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            if (roomInfo.checkGold(playerInfo, bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                };
            }
            const ALL_AREA = FishPrawnCrabConst.ALL_AREA;
            const AREA_TYPE = FishPrawnCrabConst.AREA_TYPE;
            if (!AREA_TYPE.includes(type) && !ALL_AREA.includes(area)) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.bet==>area:${area}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
            }
            if (roomInfo.checkOverrunBet(type, bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) };
            }
            if (roomInfo.status != 'BETTING') {
                fishPrawnCrabLaLogger.info(`fishPrawnCrab.mainHandler.bet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            roomInfo.onBeting(playerInfo, type, area, bet);
            return { code: 200 };
        }
        catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    }
    ;
    async goonBet({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.goonBet==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
            }
            if (roomInfo.status !== 'BETTING') {
                fishPrawnCrabLaLogger.warn(`fishPrawnCrab.mainHandler.goonBet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            const betNum = playerInfo.lastSumBetNum();
            if (betNum > playerInfo.gold) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                };
            }
            roomInfo.fishPrawnCrabOnGoonBet(playerInfo);
            return { code: 200 };
        }
        catch (error) {
            fishPrawnCrabLaLogger.warn('fishPrawnCrab.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
        }
    }
    ;
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9maXNoUHJhd25DcmFiL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYixpQ0FBMkQ7QUFDM0QsbUVBQW9FO0FBQ3BFLHVEQUF1RDtBQUN2RCxnRUFBZ0U7QUFDaEUsOEVBQXVFO0FBQ3ZFLDREQUE0RDtBQUM1RCwrQ0FBeUM7QUFDekMsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRWxFLFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVztJQUN2RCxNQUFNLFFBQVEsR0FBRyxrQ0FBd0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3RFLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRyxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUM7S0FDMUM7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQztLQUN4QztJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFJRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7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