'use strict'
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import * as utils from '../../../utils';
import * as benzConst from '../lib/benzConst';
import benzRoomMgr from '../lib/benzRoomMgr';
import sessionService = require('../../../services/sessionService');
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { betAstrict, BenzLimit_totalBet } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = benzRoomMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到|BenzBmw|房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在|BenzBmw|房间${roomId}中找到玩家${uid}` };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
};

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * @route BenzBmw.mainHandler.loaded
     *  */
    async loaded({ }, session: BackendSession) {
        const { roomId, sceneId, uid } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 501, msg: error };
        }
        setTimeout(() => {
            roomInfo.playersChange();
        }, 500);

        const opts: benzConst.IBenzBmw_mainHandler_loaded = {
            code: 200,
            roomInfo: {
                status: roomInfo.status,
                lowBet: roomInfo.lowBet,
                motorcade: benzConst.motorcade,
                roundId: roomInfo.roundId,
                sceneId: roomInfo.sceneId,
                situations: roomInfo.situations,
                lotterys: roomInfo.lotterys,
                motorcade_ran: roomInfo.motorcade_ran,
                countdown: roomInfo.countdown,
                record_historys: roomInfo.record_historys
            },
            pl: {
                gold: playerInfo.gold,
                nickname: playerInfo.nickname,
                headurl: playerInfo.headurl,
                bets: playerInfo.betList,
                profit: playerInfo.profit,
                /**非0 可以续压 */
                lastBets: playerInfo.lastBets
            },
        };
        return opts;
    };

    /**
     * @route BenzBmw.mainHandler.upstarts
     */
    async upstarts({ }, session: BackendSession) {
        const { roomId, sceneId, uid } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, msg: error }
        } else {
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 6) }
        }
    };

    /**
     * 玩家列表
     * @route BenzBmw.mainHandler.rankingList
     */
    async rankingList({ }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
            const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
            if (error) {
                return { code: 500, msg: error };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 50) };
        } catch (error) {
            return { code: 500, msg: error };
        }
    };

    /**
     * @param bets:下注区域及下注区域金额 {area:"xxx",bet:0}
     * @route BenzBmw.mainHandler.userBet
     */
    async userBet(msg: { area: benzConst.BetAreas, bet: number }, session: BackendSession) {
        try {
            const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
            const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
            if (error) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (typeof msg.bet != `number` || msg.bet <= 0) {
                log_logger.warn(`${pinus.app.getServerId()}|${JSON.stringify(msg)}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status != "BETTING") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2011) };
            }
            if (!benzConst.points.find(c => c.area == msg.area)) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.bet == 0 && playerInfo.gold < roomInfo.lowBet) {
                let content = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, roomInfo.lowBet / 100);
                return { code: 500, msg: content };
            }
            //是否满足两千下注条件
            if (roomInfo.lowBet > utils.sum(playerInfo.gold)) {
                let content = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, roomInfo.lowBet / 100);
                return { code: 500, msg: content };
            }
            //下注金额不能超过庄家持有金币
            const area_total = playerInfo.betList.filter(c => c.area == msg.area).reduce((total, Value) => {
                return total + Value.bet;
            }, 0);
            if (area_total + msg.bet > BenzLimit_totalBet.find(c => c.area == msg.area).Limit[roomInfo.sceneId]) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2002) };
            }

            if (msg.bet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            playerInfo.handler_bet(roomInfo, [{ uid, area: msg.area, bet: msg.bet }]);
            return { code: 200, gold: playerInfo.gold };
        } catch (error) {
            return { code: 500, msg: error };
        }
    }

    /**
     * 需押
     * @route BenzBmw.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
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
            // if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == uid) {//庄家不能押注
            //     return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1105) };
            // }
            // 需押总金币
            const totalBet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (totalBet == 0) {
                return { code: 200, gold: playerInfo.gold - playerInfo.bet };
            }

            // if (playerInfo.gold - totalBet < roomInfo.lowBet) {
            //     return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            // }
            //防止刷金币
            //是否满足两千下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_14[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                let content = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, betAstrict.nid_14[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: content }
            }

            if (totalBet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }

            let betList: { uid: string, area: benzConst.BetAreas, bet: number }[] = [];
            for (const lastBets of playerInfo.lastBets) {
                betList.push({ uid: playerInfo.uid, area: lastBets.area, bet: lastBets.bet });
            }
            playerInfo.handler_bet(roomInfo, betList);
            let opts = { code: 200, gold: playerInfo.gold };
            return opts;
        } catch (error) {
            log_logger.warn("WanRenZJH.mainHandler.goonBet==>", error);
            return { code: 500, msg: error };
        }
    }
}