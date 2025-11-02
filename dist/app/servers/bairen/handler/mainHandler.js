"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const utils = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const hallConst = require("../../../consts/hallConst");
const bairenConst = require("../lib/constant/bairenConst");
const BairenRoomManager_1 = require("../lib/BairenRoomManager");
const langsrv = require("../../../services/common/langsrv");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const bairenLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = BairenRoomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "百人房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "百人玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
;
class MainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.loaded==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            setTimeout(() => {
                roomInfo.noticeZhuangInfo(playerInfo);
                roomInfo.playersChange();
            }, 100);
            let offline = roomInfo.getOffLineData(playerInfo);
            let res = {
                code: 200,
                room: roomInfo.strip(),
                players: roomInfo.players.filter(pl => pl.uid == playerInfo.uid).map(pl => pl.loadedStrip()),
                offLine: offline,
                sceneId: roomInfo.sceneId,
                roundId: roomInfo.roundId,
                poundage: bairenConst.CHOU_SHUI * 100,
                pl: { bets: playerInfo.betList, isRenew: playerInfo.isCanRenew() }
            };
            return res;
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    }
    ;
    async applyBet({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyBet==>err:${err}|uid:${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) };
            }
            if (roomInfo.status == 'INBIPAI') {
                return { code: 200, status: 'INBIPAI', countdownTime: roomInfo.getCountdownTime() };
            }
            return {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: roomInfo.toBetBack(),
            };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) };
        }
    }
    ;
    async applyResult({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyResult==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
            }
            if (roomInfo.status == 'BETTING') {
                return { code: 200, status: 'BETTING', countdownTime: 1000 };
            }
            let res = roomInfo.toResultBack();
            return {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: res
            };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyResult==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
        }
    }
    ;
    async bet(msg, session) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.bet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (typeof msg.bet !== 'number' || msg.bet <= 0) {
                bairenLogger.warn(`bairen.mainHandler.bet==>betNum:${msg.bet}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            if (![0, 1, 2, 3].includes(msg.area)) {
                bairenLogger.warn(`bairen.mainHandler.bet==>area:${msg.area}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
            }
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: mes };
            }
            if ((playerInfo.betList[msg.area].bet + msg.bet) > roomInfo.tallBet) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1108) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: hallConst.CODE, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            const ret = { code: 200, changeJettonNum: 0, gold: 0, bet: 0 };
            const sumCount = playerInfo.betList.reduce((sum, value) => sum + value.bet, 0) + msg.bet;
            if (sumCount * roomInfo.compensate > playerInfo.gold) {
                let str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1109);
                if (roomInfo.sceneId != 0) {
                    str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1022);
                }
                return { code: 500, msg: str };
            }
            if (roomInfo.isBeyondZhuangLimit([msg])) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
            }
            playerInfo.handler_bet(roomInfo, [msg]);
            ret.bet = playerInfo.bet;
            ret.gold = playerInfo.gold;
            return ret;
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    }
    ;
    async goonBet({}, session) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.goonBet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
            }
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            const betNum = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (betNum === 0 || playerInfo.bet > 0) {
                return { code: 200 };
            }
            if (gamesBetAstrict_1.betAstrict.nid_9 && (gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: mes };
            }
            if ((playerInfo.gold - playerInfo.bet) < roomInfo.lowBet) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                };
            }
            const sumCount = playerInfo.betList.reduce((sum, value) => sum + value.bet, 0) + betNum;
            if (sumCount * roomInfo.compensate > playerInfo.gold) {
                const num = roomInfo.sceneId === 0 ? 1109 : 1022;
                let str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1109);
                if (roomInfo.sceneId != 0) {
                    str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1022);
                }
                return { code: 500, msg: str };
            }
            if (roomInfo.isBeyondZhuangLimit(playerInfo.lastBets)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
            }
            if (playerInfo.bet) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            playerInfo.handler_bet(roomInfo, playerInfo.lastBets);
            return { code: 200 };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
        }
    }
    ;
    async applyplayers({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyplayers==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
            }
            return {
                code: 200,
                list: roomInfo.rankingLists().slice(0, 50),
                zhuang: roomInfo.zhuangInfo.uid
            };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyplayers==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
        }
    }
    ;
    async applyupzhuangs({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyupzhuangs==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
            }
            return {
                code: 200, list: roomInfo.zj_queues.map(pl => {
                    return {
                        uid: pl.uid,
                        headurl: pl.headurl,
                        nickname: pl.nickname,
                        gold: pl.gold,
                        isRobot: pl.isRobot
                    };
                })
            };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyupzhuangs==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
        }
    }
    ;
    async applyUpzhuang({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err || !playerInfo) {
                bairenLogger.warn(`bairen.mainHandler.applyUpzhuang==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) };
            }
            if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) };
            }
            if (roomInfo.zj_queues.findIndex(m => m.uid == playerInfo.uid) !== -1) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) };
            }
            if (playerInfo.gold < roomInfo.upZhuangCond) {
                let money = utils.changeMoneyToGold(roomInfo.upZhuangCond);
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1026, money);
                return { code: 500, msg: mes };
            }
            if (roomInfo.zj_queues.length >= 10) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) };
            }
            roomInfo.applyUpzhuang(playerInfo);
            return { code: 200 };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyUpzhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) };
        }
    }
    ;
    async applyXiazhuang({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyXiazhuang==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) };
            }
            if (uid !== roomInfo.zhuangInfo.uid) {
                bairenLogger.warn(`bairen.mainHandler.applyXiazhuang==>uid:${uid}|zhuangUid:${roomInfo.zhuangInfo.uid}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1210) };
            }
            roomInfo.xiaZhuangUid = uid;
            return { code: 200 };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyXiazhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) };
        }
    }
    ;
    async exitUpzhuanglist({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.exitUpzhuanglist==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language || null, langsrv.Net_Message.id_1211) };
            }
            if (roomInfo.zj_queues.findIndex(m => m.uid == playerInfo.uid) === -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1029) };
            }
            roomInfo.exitUpzhuanglist(playerInfo.uid);
            return { code: 200 };
        }
        catch (error) {
            bairenLogger.warn('bairen.mainHandler.exitUpzhuanglist==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) };
        }
    }
    ;
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW4vaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3Q0FBd0M7QUFDeEMsbUVBQW9FO0FBQ3BFLHVEQUF1RDtBQUN2RCwyREFBMkQ7QUFDM0QsZ0VBQWlEO0FBQ2pELDREQUE0RDtBQUM1RCw2RUFBcUU7QUFDckUsK0NBQXlDO0FBQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHekQsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLDJCQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztLQUM3QjtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDN0I7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFDRixNQUFhLFdBQVc7SUFDcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBS0QsS0FBSyxDQUFDLE1BQU0s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