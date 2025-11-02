'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const utils = require("../../../utils");
const sessionService = require("../../../services/sessionService");
const hallConst = require("../../../consts/hallConst");
const baijiaConst = require("../lib/baijiaConst");
const BaijiaRoomManagerImpl_1 = require("../lib/BaijiaRoomManagerImpl");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
function check(sceneId, roomId, uid) {
    const roomInfo = BaijiaRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "百家房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "百家玩家不存在" };
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
        this.Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.loaded==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
            }
            roomInfo.channelIsPlayer('bj_onEntry', {
                roomId: roomInfo.roomId,
                player: playerInfo.strip(),
                list: roomInfo.rankingLists().slice(0, 6),
                playerNum: roomInfo.players.length,
                zhuangInfo: roomInfo.zhuangInfo
            });
            let offline = roomInfo.getOffLineData(playerInfo);
            let opts = {
                code: 200,
                roomInfo: roomInfo.strip(),
                offLine: offline,
                sceneId: roomInfo.sceneId,
                roundId: roomInfo.roundId,
                poundage: baijiaConst.CHOU_SHUI * 100,
                upZhuangCond: roomInfo.upZhuangCond,
                pl: playerInfo.bets,
                playerInfo: { gold: playerInfo.gold }
            };
            return opts;
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    }
    ;
    async applyBet({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyBet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) };
            }
            if (roomInfo.status === 'INSETTLE') {
                return { code: 200, status: 'INBIPAI', countdownTime: roomInfo.getCountdownTime() };
            }
            const opts = {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                roundId: roomInfo.roundId,
                data: roomInfo.toBetBack(),
                pl: {
                    uid: playerInfo.uid,
                    gold: playerInfo.gold,
                    bet: playerInfo.bet
                }
            };
            return opts;
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) };
        }
    }
    ;
    async applyResult({}, session) {
        const { uid, nid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyResult==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
            }
            if (roomInfo.status === 'INSETTLE' || roomInfo.status === 'BETTING') {
                return { code: 200, status: 'BETTING', countdownTime: 500 };
            }
            const opts = {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: roomInfo.toResultBack()
            };
            return opts;
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyResult==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
        }
    }
    ;
    async bet(msg, session) {
        const areaArr = ['draw', 'pair0', 'pair1'];
        const areaArr2 = ['play', 'bank'];
        const areaArr3 = ['small', 'big'];
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err || !playerInfo) {
                this.Logger.warn(`baijia.mainHandler.bet==>err:${err}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (!roomInfo.ChipList.includes(msg.bet)) {
                this.Logger.warn(`${pinus_1.pinus.app.getServerId()}|${JSON.stringify(msg)}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (!roomInfo.area_bet[msg.area]) {
                this.Logger.warn(`baijia.mainHandler.bet==>area:${msg.area}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (areaArr.includes(msg.area) && (playerInfo.bets[msg.area].bet + msg.bet) > roomInfo.area_bet[msg.area].betUpperLimit) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2015) };
            }
            if (areaArr2.includes(msg.area) || areaArr3.includes(msg.area)) {
                let other;
                if (areaArr2.includes(msg.area))
                    other = areaArr2.filter(m => m != msg.area);
                if (areaArr3.includes(msg.area))
                    other = areaArr3.filter(m => m != msg.area);
                let maxArea = Math.max(roomInfo.area_bet[msg.area].sumBet + msg.bet, roomInfo.area_bet[other[0]].sumBet);
                let minArea = Math.min(roomInfo.area_bet[msg.area].sumBet + msg.bet, roomInfo.area_bet[other[0]].sumBet);
                if (maxArea - minArea > roomInfo.area_bet[msg.area].betUpperLimit) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2015) };
                }
            }
            if ((playerInfo.bets[msg.area].bet + msg.bet) > roomInfo.tallBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1108) };
            }
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            if (msg.bet > (playerInfo.gold - playerInfo.bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                };
            }
            if (gamesBetAstrict_1.betAstrict.nid_8 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: mes };
            }
            if (!roomInfo.checkZhangEnoughMoney([msg])) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) };
            }
            roomInfo.onBeting(playerInfo, msg);
            return { code: 200 };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    }
    ;
    async goonBet({}, session) {
        const areaArr = ['draw', 'pair0', 'pair1'];
        const areaArr2 = ['play', 'bank'];
        const areaArr3 = ['small', 'big'];
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.goonBet==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
            }
            if (roomInfo.status !== 'BETTING') {
                this.Logger.warn(`baijia.mainHandler.goonBet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            const betNum = playerInfo.lastSumBetNum();
            if (betNum > (playerInfo.gold - playerInfo.bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                };
            }
            if (gamesBetAstrict_1.betAstrict.nid_8 && (gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, gamesBetAstrict_1.betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / gamesBetAstrict_1.betAstrict.ratio);
                return { code: 500, msg: mes };
            }
            for (let lastBet of playerInfo.lastBets) {
                if (areaArr.includes(lastBet.area) && (playerInfo.bets[lastBet.area].bet + playerInfo.lastBets[lastBet.area]) > roomInfo.area_bet[lastBet.area].betUpperLimit) {
                    return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) };
                }
            }
            for (let lastBet of playerInfo.lastBets) {
                if (areaArr2.includes(lastBet.area) || areaArr3.includes(lastBet.area)) {
                    let other;
                    if (areaArr2.includes(lastBet.area))
                        other = areaArr2.filter(m => m != lastBet.area);
                    if (areaArr3.includes(lastBet.area))
                        other = areaArr3.filter(m => m != lastBet.area);
                    let maxArea = Math.max(roomInfo.area_bet[lastBet.area].sumBet + playerInfo.lastBets[lastBet.area], roomInfo.area_bet[other[0]].sumBet);
                    let minArea = Math.min(roomInfo.area_bet[lastBet.area].sumBet + playerInfo.lastBets[lastBet.area], roomInfo.area_bet[other[0]].sumBet);
                    if (maxArea - minArea > roomInfo.area_bet[lastBet.area].betUpperLimit) {
                        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) };
                    }
                }
            }
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            if (!roomInfo.checkZhangEnoughMoney(playerInfo.lastBets)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
            }
            roomInfo.onGoonBet(playerInfo);
            return { code: 200 };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
        }
    }
    ;
    async applyplayers({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyplayers==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 50) };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyplayers==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
        }
    }
    ;
    async rankingList({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`async  rankingList==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1207) };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 6) };
        }
        catch (error) {
            this.Logger.warn('async  rankingList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1207) };
        }
    }
    async applyupzhuangs({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyupzhuangs==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
            }
            return { code: 200, list: roomInfo.zj_List.map(pl => pl.strip1()) };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyupzhuangs==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
        }
    }
    ;
    async applyUpzhuang({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyUpzhuang==>err:${err}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) };
            }
            if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1024) };
            }
            if (roomInfo.zj_List.findIndex(m => m.uid == playerInfo.uid) !== -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1025) };
            }
            if (playerInfo.gold < roomInfo.upZhuangCond) {
                let money = utils.changeMoneyToGold(roomInfo.upZhuangCond);
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1026, money);
                return { code: 500, msg: mes };
            }
            if (playerInfo.isRobot == 2 && roomInfo.zj_List.length >= 3) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) };
            }
            if (roomInfo.zj_List.length >= 10) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) };
            }
            roomInfo.applyUpzhuang(playerInfo);
            return { code: 200 };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyUpzhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    ;
    async applyXiazhuang({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyXiazhuang==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1210) };
            }
            if (uid !== roomInfo.zhuangInfo.uid) {
                this.Logger.warn(`baijia.mainHandler.applyXiazhuang==>uid:${uid}|zhuangUid:${roomInfo.zhuangInfo.uid}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1210) };
            }
            roomInfo.xiaZhuangUid = uid;
            return { code: 200 };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.applyXiazhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) };
        }
    }
    ;
    async exitUpzhuanglist({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.exitUpzhuanglist==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) };
            }
            roomInfo.exitUpzhuanglist(playerInfo.uid);
            return { code: 200 };
        }
        catch (error) {
            this.Logger.warn('baijia.mainHandler.exitUpzhuanglist==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) };
        }
    }
    ;
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLGlDQUF5RjtBQUV6Rix3Q0FBd0M7QUFDeEMsbUVBQW9FO0FBQ3BFLHVEQUF1RDtBQUN2RCxrREFBa0Q7QUFDbEQsd0VBQTRFO0FBQzVFLDREQUE0RDtBQUU1RCwrQ0FBeUM7QUFDekMsNkVBQXFFO0FBS3JFLFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVztJQUN2RCxNQUFNLFFBQVEsR0FBRywrQkFBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDN0I7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQztLQUN2QztJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFFRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBRXBCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFEcEMsV0FBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFN0MsQ0FB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