'use strict'
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import * as utils from '../../../utils';
import * as ttzConst from '../lib/ttzConst';
import roomManager from '../lib/ttzRoomMgr';
import sessionService = require('../../../services/sessionService');
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = roomManager.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到ttz_zhuang房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在ttz_zhuang房间${roomId}中找到玩家${uid}` };
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
     * @route bairenTTZ.mainHandler.loaded
     *  */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 501, msg: error };
        }
        setTimeout(() => {
            roomInfo.playersChange();
            roomInfo.noticeZhuangInfo();
        }, 500);

        const opts: ttzConst.IbairenTTZ_mainHandler_loaded = {
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
                /**非0 可以续压 */
                isRenew: playerInfo.isCanRenew()
            },
        };
        return opts;
    };

    /**
     * @route bairenTTZ.mainHandler.upstarts
     */
    async upstarts({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, msg: error }
        } else {
            return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 6) }
        }
    };

    /**
     * 玩家列表
     * @route bairenTTZ.mainHandler.rankingList
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
     * @param bets:下注区域及下注区域金额 {area:"south",bet:0}, {area:"north",bet:0}....
     * @route bairenTTZ.mainHandler.userBet
     */
    async userBet(msg: { area: string, bet: number }, session: BackendSession) {
        try {
            const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
            const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
            if (error) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (typeof msg.bet != `number` || msg.bet <= 0) {
                log_logger.warn(`${pinus.app.getServerId()}|${JSON.stringify(msg)}`);
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
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == uid) {//庄家不能押注
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1105) }
            }
            //防止刷金币
            //是否满足两千下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                let content = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: content }
            }

            //下注金额不能超过庄家持有金币

            let room_allBetNum = roomInfo.totalBet;//房间总下注 赋值
            room_allBetNum += msg.bet;
            let zj_pl = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
            if (zj_pl && room_allBetNum > zj_pl.gold) {//再下注庄家就赔不起啦
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) }
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
            }
            roomInfo.channelIsPlayer("TTZ_OtherBets", opts);
            return { code: 200, gold: playerInfo.gold };
        } catch (error) {
            return { code: 500, msg: error };
        }
    }

    /**
     * 需押
     * @route bairenTTZ.mainHandler.goonBet
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
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == uid) {//庄家不能押注
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1105) }
            }
            // 需押总金币
            const totalBet = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (totalBet == 0) {
                return { code: 200, gold: playerInfo.gold };
            }

            if (playerInfo.gold - totalBet < roomInfo.lowBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            //防止刷金币
            //是否满足两千下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                let content = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: content }
            }
            let room_allBetNum = roomInfo.totalBet;//房间总下注 赋值
            room_allBetNum += totalBet;
            let zj_pl = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
            if (zj_pl && room_allBetNum > zj_pl.gold) {//再下注庄家就赔不起啦
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) }
            }
            if (totalBet > playerInfo.gold) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }


            let opts: { uid: string, area: string, bet: number }[] = [];
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
        } catch (error) {
            log_logger.warn("WanRenZJH.mainHandler.goonBet==>", error);
            return { code: 500, msg: error };
        }
    }
    /**
     * @description
     *      玩家申请庄家
     *@route bairenTTZ.mainHandler.applyZhuang
     */
    async applyZhuang(msg: { apply: boolean }, session: BackendSession) {
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
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) }//已经在队列中了
            }
            if (playerInfo.isRobot == 2 && roomInfo.zj_queues.length >= 3) {
                return { code: 500, msg: "msg" };
            }
            roomInfo.zj_queues.push(playerInfo);
        } else {
            utils.remove(roomInfo.zj_queues, 'uid', uid);
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == playerInfo.uid) {
                roomInfo.xiaZhuangUid = playerInfo.uid;
            }
        }
        roomInfo.noticeZhuangInfo();
        return { code: 200 };
    }

    /**
     * @description
     *      玩家庄家列表
     * @route ttz_zhuang.mainHandler.ZhuangList
     *  */
    async ZhuangList({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, msg: error }
        }
        let ZhuangList = [];
        return { code: 200, list: ZhuangList };
    }
}