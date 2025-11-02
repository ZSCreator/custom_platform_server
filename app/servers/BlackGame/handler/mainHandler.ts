import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import sessionService = require('../../../services/sessionService');
import * as BGConst from '../lib/BGConst';
import roomManager from '../lib/BGRoomManager';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import BG_logic = require("../lib/BG_logic");
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = roomManager.searchRoom(sceneId, roomId);
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


export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载完成
     * @param {}
     * @route BlackGame.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
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
                    }
                })
            };
        } catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**下注
     * @route BlackGame.mainHandler.first_bet
     */
    async first_bet(msg: { bet: number, location: number }, session: BackendSession) {
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
                // Logger.warn(`${pinus.app.getServerId()}|${JSON.stringify(msg)}`);
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**分牌
     * @route BlackGame.mainHandler.separatePoker
     */
    async separatePoker({ }, session: BackendSession) {
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**加倍
     * BlackGame.mainHandler.addMultiple
     */
    async addMultiple({ }, session: BackendSession) {
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.addMultiple==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**要牌
     * @route BlackGame.mainHandler.getOnePoker
     */
    async getOnePoker(msg: {}, session: BackendSession) {
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.getOnePoker==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**停牌 
    * @route BlackGame.mainHandler.action_stop_getCard
    */
    async action_stop_getCard({ }, session: BackendSession) {
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.action_stop_getCard==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**保险 
     * @route BlackGame.mainHandler.insurance {flag:boolean}
    */
    async insurance({ flag }, session: BackendSession) {
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
        } catch (error) {
            Logger.error('BlackGame.mainHandler.insurance==>', error);
            const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}

