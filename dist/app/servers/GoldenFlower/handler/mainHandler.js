'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const GoldenFlowerMgr_1 = require("../lib/GoldenFlowerMgr");
const sessionService = require("../../../services/sessionService");
const pinus_logger_1 = require("pinus-logger");
const utils = require("../../../utils/index");
const langsrv = require("../../../services/common/langsrv");
const GoldenFlower_logic = require("../lib/GoldenFlower_logic");
function check(sceneId, roomId, uid) {
    const roomInfo = GoldenFlowerMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: `三张牌房间不存在${roomId}|${uid}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "该局已结束，你已离开房间", uid: uid, players: roomInfo.players };
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
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async loaded(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.status === 'NONE') {
                roomInfo.channelIsPlayer('ZJH_onEntry', {
                    roomId: roomInfo.roomId,
                    player: playerInfo.strip(),
                    status: roomInfo.status,
                    waitTime: roomInfo.getWaitTime(),
                    roomNum: roomInfo.players.filter(m => m != null).length
                });
            }
            if (roomInfo.status == `NONE` || roomInfo.status == `INWAIT`) {
                roomInfo.wait(playerInfo);
            }
            const opts = {
                code: 200,
                room: roomInfo.strip(),
                holds: playerInfo.holdStatus === 1 ? playerInfo.toHolds() : null,
                waitTime: roomInfo.getWaitTime(),
                lowBet: roomInfo.lowBet,
                capBet: roomInfo.capBet,
                seat: playerInfo.seat,
                roundId: roomInfo.roundId,
                offLine: roomInfo.stripSpeak(playerInfo),
                totalBet: playerInfo.totalBet,
                id: roomInfo.sceneId
            };
            return opts;
        }
        catch (error) {
            this.logger.warn(`GoldenFlower.mainHandler.loaded:${error}`);
            return { code: 500, msg: error };
        }
    }
    ;
    async cingl({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            const betNum = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < betNum) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            playerInfo.handler_cingl(roomInfo, betNum);
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        }
        catch (error) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()}|GoldenFlower.mainHandler.cingl:${error}`);
            return { code: 500, msg: error };
        }
    }
    ;
    async filling(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            if (typeof msg.multiple !== 'number') {
                msg.multiple = roomInfo.betNum;
            }
            let flag = (msg.multiple > roomInfo.betNum && msg.multiple <= roomInfo.capBet / 2) ? true : false;
            let num = Math.max(roomInfo.betNum, msg.multiple);
            num = Math.min(num, roomInfo.capBet / 2);
            let betNum = playerInfo.holdStatus === 1 ? num * 2 : num;
            if (playerInfo.gold < betNum) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            if (flag) {
                playerInfo.handler_filling(roomInfo, betNum, num);
            }
            else {
                betNum = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
                playerInfo.handler_cingl(roomInfo, betNum);
            }
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        }
        catch (error) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()}|GoldenFlower.mainHandler.filling:${error}`);
        }
    }
    ;
    async kanpai({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME' || playerInfo.totalBet < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (playerInfo.holdStatus != 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
            }
            playerInfo.holdStatus = 1;
            playerInfo.handler_kanpai(roomInfo);
            const num = playerInfo.holdStatus == 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            let allin = false;
            if (playerInfo.gold < num) {
                allin = true;
            }
            return { code: 200, holds: playerInfo.toHolds(), holdStatus: playerInfo.holdStatus, allin };
        }
        catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.kanpai:${error}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
        }
    }
    ;
    async applyBipai({}, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            const canBipai = roomInfo.get_canBipai();
            if (!canBipai) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1032) };
            }
            const num = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < num) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            const list = roomInfo.players.filter(m => m && m.status == 'GAME' && m.uid !== playerInfo.uid);
            if (list.length === 0) {
                return { code: 500, msg: "" };
            }
            if (list.length === 1) {
                roomInfo.handler_bipai(playerInfo, list[0], num);
                return { code: 200 };
            }
            else {
                return {
                    code: 200, list: list.map(m => {
                        return {
                            seat: m.seat,
                            holdStatus: m.holdStatus
                        };
                    })
                };
            }
        }
        catch (error) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()}|GoldenFlower.mainHandler.applyBipai:${error}`);
        }
    }
    ;
    async bipai({ seat: seat }, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            const other = roomInfo.players[seat];
            if (!other || other.status != "GAME") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1009) };
            }
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            const canBipai = roomInfo.get_canBipai();
            if (!canBipai) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1032) };
            }
            const num = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < num) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            roomInfo.handler_bipai(playerInfo, other, num);
            return { code: 200 };
        }
        catch (error) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()}|GoldenFlower.mainHandler.bipai:${error}`);
            return { code: 500, msg: error };
        }
    }
    ;
    async fold({}, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME' || playerInfo.status != "GAME") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            const list = roomInfo.players.filter(pl => pl && pl.status == 'GAME');
            if (list.length <= 1) {
                return { code: 500, msg: "" };
            }
            playerInfo.handler_fold(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.fold:${error}`);
            return { code: 500, msg: error };
        }
    }
    ;
    async Allfighting(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            const num = playerInfo.holdStatus == 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold >= num) {
                console.warn(`${playerInfo.nickname}|${playerInfo.gold}|${playerInfo.holdStatus}|${roomInfo.betNum}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            let ret = playerInfo.handler_Allfighting(roomInfo);
            return { code: 200, win: ret };
        }
        catch (error) {
            this.logger.warn(`GoldenFlower.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }
    async auto_genzhu(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (![true, false].includes(msg.cmsg)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.curr_doing_seat != playerInfo.seat) {
                playerInfo.auto_genzhu = msg.cmsg;
                roomInfo.record_history.oper.push({ uid: playerInfo.uid, oper_type: "auto_genzhu", update_time: utils.cDate(), msg: msg.cmsg });
            }
            return { code: 200, msg: msg.cmsg, auto_genzhu: playerInfo.auto_genzhu };
        }
        catch (error) {
            this.logger.warn(`SparrowHZH.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }
    async auto_no_Fold(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (![true, false].includes(msg.cmsg)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            playerInfo.auto_no_Fold = msg.cmsg;
            roomInfo.record_history.oper.push({ uid: playerInfo.uid, oper_type: "auto_no_Fold", update_time: utils.cDate(), msg: msg.cmsg });
            return { code: 200, msg: msg.cmsg };
        }
        catch (error) {
            this.logger.warn(`SparrowHZH.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }
    async getInning({}, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.isRobot !== 2) {
                throw "not robot";
            }
            return { code: 200, room: roomInfo.strip(), Holds: roomInfo.players.map(m => m && m.stripRobot()) };
        }
        catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.getInning: ${error}`);
            return { code: 500, msg: error };
        }
    }
    async test(msg, session) {
        try {
            let ret1 = GoldenFlower_logic.judgeCards(msg.cards1);
            let cardType1 = GoldenFlower_logic.getCardType(msg.cards1);
            let ret2 = GoldenFlower_logic.judgeCards(msg.cards2);
            let cardType2 = GoldenFlower_logic.getCardType(msg.cards2);
            let win = GoldenFlower_logic.bipaiSole({ cardType: cardType1, cards: msg.cards1 }, { cardType: cardType2, cards: msg.cards2 });
            return { code: 200, data: { pl1: { ret1, cardType1 }, pl2: { ret2, cardType2 }, win } };
        }
        catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.getInning: ${error}`);
            return { code: 500, msg: error };
        }
    }
    async ready({ option }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, playerInfo, roomInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.logger.warn(`GoldenFlower.mainHandler.ready==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.ready(playerInfo, option);
            return { code: 200 };
        }
        catch (error) {
            this.logger.warn('GoldenFlower.mainHandler.ready==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLGlDQUF5RjtBQUN6Riw0REFBZ0Q7QUFDaEQsbUVBQW9FO0FBQ3BFLCtDQUF5QztBQUN6Qyw4Q0FBK0M7QUFDL0MsNERBQTZEO0FBQzdELGdFQUFnRTtBQUVoRSxTQUFTLEtBQUssQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLEdBQVc7SUFDdkQsTUFBTSxRQUFRLEdBQUcseUJBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLFdBQVcsTUFBTSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7S0FDOUM7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkU7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBRUQsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUNGLE1BQWEsV0FBVztJQUVwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBRHBDLFdBQU0sR0FBRyxJQUFBLHdCQUFT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