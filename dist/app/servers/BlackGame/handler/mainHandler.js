"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const sessionService = require("../../../services/sessionService");
const BGRoomManager_1 = require("../lib/BGRoomManager");
const BG_logic = require("../lib/BG_logic");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const langsrv = require("../../../services/common/langsrv");
function check(sceneId, roomId, uid) {
    const roomInfo = BGRoomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: `21点|房间不存在:${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: `21点|玩家不存在${roomId}|${uid}` };
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
                Logger.error(`BlackGame.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.wait(playerInfo);
            return {
                code: 200,
                roomInfo: {
                    status: roomInfo.status,
                    roundId: roomInfo.roundId,
                    sceneId: roomInfo.sceneId,
                    lowBet: roomInfo.lowBet,
                    waitTime: roomInfo.getWaitTime(),
                    curr_doing_seat: roomInfo.curr_doing_seat,
                    area_list: roomInfo.area_list,
                    banker_cards: roomInfo.status == "END" ? roomInfo.banker.banker_cards.map(c => c) : roomInfo.banker.banker_cards.map((c, i) => i == 1 ? 0x99 : c),
                },
                players: roomInfo.players.filter(c => !!c).map(pl => {
                    return {
                        seat: pl.seat,
                        uid: pl.uid,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        gold: pl.gold,
                        profit: pl.profit,
                    };
                })
            };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async first_bet(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (typeof msg.bet != `number` || msg.bet < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.gold < msg.bet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            const temp_areaList = roomInfo.area_list[msg.location];
            if (temp_areaList.length > 0 &&
                temp_areaList[0].uid != playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (temp_areaList.length > 0 &&
                temp_areaList[0].uid == playerInfo.uid && temp_areaList[0].bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (temp_areaList.length == 0) {
                temp_areaList.push({ bet: msg.bet, profit: 0, insurance: false, insurance_bet: -1, type: 0, cards: [], operate_status: 0, Points: 0, Points_t: 0, uid: playerInfo.uid, addMultiple: false });
            }
            playerInfo.action_first(roomInfo, msg.bet, msg.location, false);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async separatePoker({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            const card1 = roomInfo.area_list[roomInfo.location][0].cards[0];
            const card2 = roomInfo.area_list[roomInfo.location][0].cards[1];
            const bet = roomInfo.area_list[roomInfo.location][0].bet;
            if (BG_logic.is_eq_cards(card1, card2) == false ||
                roomInfo.area_list[roomInfo.location].length > 1 ||
                roomInfo.area_list[roomInfo.location][0].uid != playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1725) };
            }
            if (bet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            if (temp_areaList.insurance && temp_areaList.insurance_bet == -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            playerInfo.action_separatePoker(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async addMultiple({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.addMultiple==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            if (temp_areaList.insurance && temp_areaList.insurance_bet == -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (playerInfo.state == "PS_NONE" || temp_areaList.cards.length != 2) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (temp_areaList.bet > playerInfo.gold) {
                return { code: 500, data: { gold: playerInfo.gold }, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            playerInfo.action_addMultiple(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.addMultiple==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async getOnePoker(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.getOnePoker==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            if (temp_areaList.insurance && temp_areaList.insurance_bet == -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            playerInfo.action_getOnePoker(roomInfo, true);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.getOnePoker==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async action_stop_getCard({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.action_stop_getCard==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            if (temp_areaList.insurance && temp_areaList.insurance_bet == -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            playerInfo.action_stop_getCard(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.action_stop_getCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async insurance({ flag }, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`BlackGame.mainHandler.insurance==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (BG_logic.getCardValue(roomInfo.banker.banker_cards[0]) != 1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1732) };
            }
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            if ((temp_areaList.insurance && temp_areaList.insurance_bet >= 0) ||
                temp_areaList.insurance == false) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1713) };
            }
            if (temp_areaList.bet / 2 > playerInfo.gold && flag == true) {
                return { code: 500, data: { gold: playerInfo.gold }, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            playerInfo.action_insurance(roomInfo, flag);
            return { code: 200 };
        }
        catch (error) {
            Logger.error('BlackGame.mainHandler.insurance==>', error);
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0dhbWUvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtRUFBb0U7QUFFcEUsd0RBQStDO0FBRS9DLDRDQUE2QztBQUM3QywrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCw0REFBNkQ7QUFFN0QsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLHVCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxhQUFhLE1BQU0sRUFBRSxFQUFFLENBQUM7S0FDekM7SUFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixPQUFPLEVBQUUsR0FBRyxFQUFFLFlBQVksTUFBTSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7S0FDL0M7SUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekIsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDO0FBR0QsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUNGLE1BQWEsV0FBVztJQUNwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO0lBQ3BDLENBQUM7SUFNRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUcsRUFBRSxP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