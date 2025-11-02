'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const utils = require("../../../utils");
const ttzRoomMgr_1 = require("../lib/ttzRoomMgr");
const sessionService = require("../../../services/sessionService");
const langsrv = require("../../../services/common/langsrv");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = ttzRoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到ttz_zhuang房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在ttz_zhuang房间${roomId}中找到玩家${uid}` };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
;
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
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 501, msg: error };
        }
        setTimeout(() => {
            roomInfo.playersChange();
            roomInfo.noticeZhuangInfo();
        }, 500);
        const opts = {
            code: 200,
            roomInfo: {
                status: roomInfo.status,
                lowBet: roomInfo.lowBet,
                upZhuangCond: roomInfo.upZhuangCond,
                roundId: roomInfo.roundId,
                sceneId: roomInfo.sceneId,
                situations: roomInfo.situations,
                lotterys: roomInfo.lotterys,
                countdown: roomInfo.countdown,
                ttzHistory: roomInfo.ttzHistory
            },
            pl: {
                gold: playerInfo.gold,
                nickname: playerInfo.nickname,
                headurl: playerInfo.headurl,
                bets: playerInfo.betList,
                profit: playerInfo.profit,
                isRenew: playerInfo.isCanRenew()
            },
        };
        return opts;
    }
    ;
    async upstarts({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, msg: error };
        }
        else {
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 6) };
        }
    }
    ;
    async rankingList({}, session) {
        try {
            const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
            const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
            if (error) {
                return { code: 500, msg: error };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 50) };
        }
        catch (error) {
            return { code: 500, msg: error };
        }
    }
    ;
    async userBet(msg, session) {
        try {
            const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
            const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
            if (error) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (typeof msg.bet != `number` || msg.bet <= 0) {
                log_logger.warn(`${pinus_1.pinus.app.getServerId()}|${JSON.stringify(msg)}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status !== "BETTING") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2011) };
            }
            if (msg.area == "center") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.bet == 0 && playerInfo.gold < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1105) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                let content = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: content };
            }
            let room_allBetNum = roomInfo.totalBet;
            room_allBetNum += msg.bet;
            let zj_pl = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
            if (zj_pl && room_allBetNum > zj_pl.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) };
            }
            if ((playerInfo.bet + msg.bet) > roomInfo.allinMaxNum && roomInfo.allinMaxNum != 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2002) };
            }
            if (msg.bet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            playerInfo.handler_bet(roomInfo, msg);
            const opts = {
                bet: [{ uid, area: msg.area, bet: msg.bet }],
                rankingList: roomInfo.rankingLists().slice(0, 6)
            };
            roomInfo.channelIsPlayer("TTZ_OtherBets", opts);
            return { code: 200, gold: playerInfo.gold };
        }
        catch (error) {
            return { code: 500, msg: error };
        }
    }
    async goonBet({}, session) {
        try {
            const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
            const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (error) {
                log_logger.warn(`WanRenZJH.mainHandler.goonBet==>err:${error}`);
                return { code: 500, msg: error };
            }
            if (roomInfo.status !== "BETTING") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2011) };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1215) };
            }
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1105) };
            }
            const totalBet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (totalBet == 0) {
                return { code: 200, gold: playerInfo.gold };
            }
            if (playerInfo.gold - totalBet < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                let content = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: content };
            }
            let room_allBetNum = roomInfo.totalBet;
            room_allBetNum += totalBet;
            let zj_pl = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
            if (zj_pl && room_allBetNum > zj_pl.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) };
            }
            if (totalBet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            let opts = [];
            for (const lastBets of playerInfo.lastBets) {
                playerInfo.handler_bet(roomInfo, lastBets);
                opts.push({ uid: playerInfo.uid, area: lastBets.area, bet: lastBets.bet });
            }
            roomInfo.channelIsPlayer('TTZ_OtherBets', {
                bet: opts,
                rankingList: roomInfo.rankingLists().slice(0, 6)
            });
            let optss = {
                code: 200,
                gold: playerInfo.gold
            };
            return optss;
        }
        catch (error) {
            log_logger.warn("WanRenZJH.mainHandler.goonBet==>", error);
            return { code: 500, msg: error };
        }
    }
    async applyZhuang(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, msg: error };
        }
        if (msg.apply) {
            if (roomInfo.upZhuangCond > playerInfo.gold) {
                return { code: 400, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1026, roomInfo.upZhuangCond / 100) };
            }
            if (roomInfo.zj_queues.find(m => m.uid == playerInfo.uid)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) };
            }
            if (playerInfo.isRobot == 2 && roomInfo.zj_queues.length >= 3) {
                return { code: 500, msg: "msg" };
            }
            roomInfo.zj_queues.push(playerInfo);
        }
        else {
            utils.remove(roomInfo.zj_queues, 'uid', uid);
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == playerInfo.uid) {
                roomInfo.xiaZhuangUid = playerInfo.uid;
            }
        }
        roomInfo.noticeZhuangInfo();
        return { code: 200 };
    }
    async ZhuangList({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, msg: error };
        }
        let ZhuangList = [];
        return { code: 200, list: ZhuangList };
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW5UVFovaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUNaLGlDQUF5RjtBQUN6Rix3Q0FBd0M7QUFFeEMsa0RBQTRDO0FBQzVDLG1FQUFvRTtBQUNwRSw0REFBNkQ7QUFFN0QsNkVBQXFFO0FBQ3JFLCtDQUF5QztBQUN6QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVztJQUN2RCxNQUFNLFFBQVEsR0FBRyxvQkFBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxLQUFLLEVBQUUsa0JBQWtCLE1BQU0sRUFBRSxFQUFFLENBQUM7S0FDaEQ7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixNQUFNLFFBQVEsR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUMxRDtJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFBQSxDQUFDO0FBRUYsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUNGLE1BQWEsV0FBVztJQUNwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FB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