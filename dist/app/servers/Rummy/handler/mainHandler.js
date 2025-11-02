'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const sessionService = require("../../../services/sessionService");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const RummyRoomManager_1 = require("../lib/RummyRoomManager");
const RummyLaLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = RummyRoomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "Rummy房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "Rummy玩家不存在" };
    }
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
                RummyLaLogger.warn(`Rummy.mainHandler.loaded==>err:${err}|${sceneId}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo && playerInfo.language, langsrv.Net_Message.id_1201) };
            }
            if (roomInfo.isFull() == true) {
                roomInfo.channelIsPlayer('Rummy_onEntry', {
                    roomId: roomInfo.roomId,
                    player: playerInfo.result(),
                    playerNum: roomInfo.players.length,
                });
            }
            if (roomInfo.status === 'INWAIT' && roomInfo.isFull() == true) {
                roomInfo.run();
            }
            let opts = {
                code: 200,
                roomInfo: roomInfo.strip(),
                offLine: false,
                sceneId: roomInfo.sceneId,
                nid: roomInfo.nid,
                roomId: roomInfo.roomId,
                roundId: roomInfo.roundId,
                pl: playerInfo.result(),
                entryCond: roomInfo.entryCond,
            };
            return opts;
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    }
    ;
    async lostCard({ card, cardsList, point }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.bet==>err:${err}|:${sceneId}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.lostCard:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            if (playerInfo.cards.length == 13) {
                RummyLaLogger.warn(`Rummy.mainHandler.lostCard:${playerInfo.uid}你还没有要牌不能出牌cards:${playerInfo.cards}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8403) };
            }
            const lostCards = await roomInfo.lostCard(playerInfo, card, cardsList, point, false);
            return { code: 200, lostCards };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.lostCard ==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async playerGetlostCard({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard==>err:${err}|:${uid}|${sceneId}|${roomId}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            if (playerInfo.cards.length > 13 || playerInfo.getCard != null) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerGetlostCard:${playerInfo.uid}你已经要过牌cards:${playerInfo.cards},你要的牌card:${playerInfo.getCard}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8402) };
            }
            let card = await roomInfo.playerGetlostCard(playerInfo);
            return { code: 200, card };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerGetlostCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async getPokerListCard({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            if (playerInfo.cards.length > 13 || playerInfo.getCard != null) {
                RummyLaLogger.warn(`Rummy.mainHandler.getPokerListCard:${playerInfo.uid}你已经要过牌cards:${playerInfo.cards}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8402) };
            }
            let card = await roomInfo.getPokerListCard(playerInfo);
            return { code: 200, card };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.getPokerListCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async grop({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            if (playerInfo.isLose) {
                RummyLaLogger.warn(`Rummy.mainHandler.grop:${playerInfo.uid}玩家已经弃牌了`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            await roomInfo.grop(playerInfo);
            return { code: 200 };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.grop==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async shaw({ cardsList, card }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.shaw==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            if (roomInfo.whichSet != playerInfo.playerSet) {
                RummyLaLogger.warn(`Rummy.mainHandler.shaw:${playerInfo.uid}不该你发话`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_8401) };
            }
            await roomInfo.shaw(playerInfo, cardsList, card);
            return { code: 200 };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.shaw==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async playerOtherPostCardsList({ cardsList }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerOtherPostCardsList==>err:${err}|isRobot:${uid}|${sceneId}|${roomId}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_3) };
            }
            await roomInfo.playerOtherPostCardsListForRoom(playerInfo, cardsList);
            return { code: 200 };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerOtherPostCardsList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
    async start({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                RummyLaLogger.warn(`Rummy.mainHandler.playerOtherPostCardsList==>err:${err}|isRobot:${playerInfo.isRobot}|${playerInfo.nickname}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1201) };
            }
            return { code: 200 };
        }
        catch (error) {
            RummyLaLogger.warn('Rummy.mainHandler.playerOtherPostCardsList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
        }
    }
    ;
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9SdW1teS9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsbUVBQW9FO0FBQ3BFLDREQUE0RDtBQUM1RCwrQ0FBeUM7QUFDekMsOERBQXVEO0FBQ3ZELE1BQU0sYUFBYSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFMUQsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLDBCQUFnQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLENBQUM7S0FDaEM7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQztLQUMxQztJQUNELE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUVELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFDRixNQUFhLFdBQVc7SUFDcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDckMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFB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