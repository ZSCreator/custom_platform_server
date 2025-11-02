'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const sessionService = require("../../../services/sessionService");
const SicBoRoomMgr_1 = require("../lib/SicBoRoomMgr");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const sicboLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = SicBoRoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "骰宝房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "骰宝玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.basicInfo==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.channelIsPlayer('SicBo.userChange', {
                playerNum: roomInfo.players.length,
                rankingList: roomInfo.rankingLists(),
                entryPlayer: playerInfo.basicsStrip()
            });
            let offline = roomInfo.getOffLineData(playerInfo);
            const res = {
                code: 200,
                room: {
                    sceneId: roomInfo.sceneId,
                    roomId,
                    roundId: roomInfo.roundId,
                    roomStatus: roomInfo.status,
                    lowBet: roomInfo.lowBet,
                    countDown: roomInfo.countDown < 0 ? 0 : roomInfo.countDown,
                    players: roomInfo.players.filter(pl => pl.bet > 0).map(pl => {
                        return { uid: pl.uid, gold: pl.gold };
                    }),
                    area_bet: roomInfo.area_bet,
                },
                pl: {
                    gold: playerInfo.gold - playerInfo.bet,
                    isRenew: playerInfo.isCanRenew()
                },
                offLine: offline,
            };
            return res;
        }
        catch (error) {
            sicboLogger.error('SicBo.mainHandler.basicInfo==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async upstarts({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.upstarts==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 50) };
        }
        catch (error) {
            sicboLogger.error('SicBo.mainHandler.upstarts==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async rankingList({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.rankingList==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            return { code: 200, rankingList: roomInfo.rankingLists() };
        }
        catch (error) {
            sicboLogger.error('SicBo.mainHandler.rankingList==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    ;
    async userBet(msg, session) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            const totalBet = msg.bet;
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (typeof totalBet !== 'number' || totalBet <= 0) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>totalBet:${JSON.stringify(msg)}|`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status != 'BETTING') {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            const isBetTrue = msg && roomInfo.betTrue(msg);
            if (!isBetTrue) {
                sicboLogger.error(`SicBo.mainHandler.userBet==>bets:${JSON.stringify(msg)}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.bet == 0 && (playerInfo.gold - playerInfo.bet) < roomInfo.lowBet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            if (playerInfo.gold < totalBet + playerInfo.bet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
            }
            for (const area in playerInfo.bets) {
                if (playerInfo.bets[area].bet + msg.bet > roomInfo.tallBet) {
                    return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1108) };
                }
            }
            if (playerInfo.betCheck(msg, roomInfo)) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1013) };
            }
            playerInfo.playerBet(roomInfo, msg);
            roomInfo.channelIsPlayer('SicBo.otherBets', {
                bet: [{ uid, area: msg.area, bet: msg.bet }],
                rankingList: roomInfo.rankingLists()
            });
            let opts = {
                code: 200,
                gold: playerInfo.gold - playerInfo.bet
            };
            return opts;
        }
        catch (error) {
            sicboLogger.error('SicBo.mainHandler.userBet==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async goonBet({}, session) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.warn(`WanRenZJH.mainHandler.goonBet==>err:${err}|`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== "BETTING") {
                return {
                    code: 500,
                    error: langsrv.getlanguage(language, langsrv.Net_Message.id_1011)
                };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            const tatalbet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (tatalbet == 0) {
                return { code: 200 };
            }
            if (playerInfo.gold < roomInfo.lowBet) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            let opts = [];
            for (const lastBets of playerInfo.lastBets) {
                playerInfo.playerBet(roomInfo, lastBets);
                opts.push({ uid: playerInfo.uid, area: lastBets.area, bet: lastBets.bet });
            }
            roomInfo.channelIsPlayer('SicBo.otherBets', {
                bet: opts,
                rankingList: roomInfo.rankingLists()
            });
            let optss = {
                code: 200,
                gold: playerInfo.gold - playerInfo.bet
            };
            return optss;
        }
        catch (error) {
            sicboLogger.warn("WanRenZJH.mainHandler.goonBet==>", error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async historyRecord({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                sicboLogger.error(`SicBo.mainHandler.historyRecord==>err:${err}|`);
                return { code: 501, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            let result = roomInfo.getRecird();
            return { code: 200, result };
        }
        catch (error) {
            sicboLogger.error('SicBo.mainHandler.historyRecord==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TaWNCby9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBSWIsbUVBQW9FO0FBSXBFLHNEQUEwQztBQUUxQyw0REFBNkQ7QUFHN0QsK0NBQXlDO0FBRXpDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFLeEQsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLHNCQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztLQUM3QjtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDN0I7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBRUQsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQU9ELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRyxFQUFFLE9BQXVCO1FBQ3JDLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9B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