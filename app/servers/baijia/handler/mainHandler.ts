'use strict';
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';

import * as utils from '../../../utils';
import sessionService = require('../../../services/sessionService');
import * as hallConst from '../../../consts/hallConst';
import * as baijiaConst from '../lib/baijiaConst';
import BaijiaMgr, { BaijiaRoomManager } from '../lib/BaijiaRoomManagerImpl';
import * as langsrv from '../../../services/common/langsrv';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { getLogger } from 'pinus-logger';
import { betAstrict } from '../../../../config/data/gamesBetAstrict';




function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = BaijiaMgr.searchRoom(sceneId, roomId);
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

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    Logger = getLogger('server_out', __filename);
    constructor(private app: Application) {
    }

    /**
     * 加载完成
     * @route baijia.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.loaded==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
            }

            // 通知其他玩家有人加入房间
            roomInfo.channelIsPlayer('bj_onEntry', {
                roomId: roomInfo.roomId,
                player: playerInfo.strip(),
                list: roomInfo.rankingLists().slice(0, 6),
                playerNum: roomInfo.players.length,
                zhuangInfo: roomInfo.zhuangInfo
            });
            let offline = roomInfo.getOffLineData(playerInfo);

            let opts: baijiaConst.baijia_mainHandler_loaded = {
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
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) };
        }
    };

    /**
     * 申请开始下注
     * @route baijia.mainHandler.applyBet
     */
    async applyBet({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyBet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) };
            }
            if (roomInfo.status === 'INSETTLE') {
                return { code: 200, status: 'INBIPAI', countdownTime: roomInfo.getCountdownTime() }
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
            }
            return opts;
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) }
        }
    };

    /**
     * 申请结果
     * @route baijia.mainHandler.applyResult
     */
    async applyResult({ }, session: BackendSession) {
        const { uid, nid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyResult==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
            }
            if (roomInfo.status === 'INSETTLE' || roomInfo.status === 'BETTING') {
                return { code: 200, status: 'BETTING', countdownTime: 500 }
            }
            // let res = roomInfo.toResultBack();
            const opts = {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: roomInfo.toResultBack()
            }
            return opts;
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyResult==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) };
        }

    };

    /**
     * 下注
     * @route baijia.mainHandler.bet
     */
    async bet(msg: { area: string, bet: number }, session: BackendSession) {
        const areaArr = ['draw', 'pair0', 'pair1'];//和 庄对 闲对
        const areaArr2 = ['play', 'bank'];//庄闲
        const areaArr3 = ['small', 'big'];//大小
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);

        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err || !playerInfo) {
                this.Logger.warn(`baijia.mainHandler.bet==>err:${err}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            if (!roomInfo.ChipList.includes(msg.bet)) {
                this.Logger.warn(`${pinus.app.getServerId()}|${JSON.stringify(msg)}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            //下注区域是否正确
            if (!roomInfo.area_bet[msg.area]) {
                this.Logger.warn(`baijia.mainHandler.bet==>area:${msg.area}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            //押注上限(如果押注的是和 庄对 闲对)
            if (areaArr.includes(msg.area) && (playerInfo.bets[msg.area].bet + msg.bet) > roomInfo.area_bet[msg.area].betUpperLimit) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2015) }
            }
            //押注上限，庄闲大小
            if (areaArr2.includes(msg.area) || areaArr3.includes(msg.area)) {
                let other;
                if (areaArr2.includes(msg.area)) other = areaArr2.filter(m => m != msg.area);//押注上限(如果押注的是庄闲)
                if (areaArr3.includes(msg.area)) other = areaArr3.filter(m => m != msg.area);//押注上限(如果押注的是大小)
                let maxArea = Math.max(roomInfo.area_bet[msg.area].sumBet + msg.bet, roomInfo.area_bet[other[0]].sumBet);
                let minArea = Math.min(roomInfo.area_bet[msg.area].sumBet + msg.bet, roomInfo.area_bet[other[0]].sumBet);
                if (maxArea - minArea > roomInfo.area_bet[msg.area].betUpperLimit) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2015) }
                }
            }
            //个人押注上限（不能超过顶注的十倍）
            if ((playerInfo.bets[msg.area].bet + msg.bet) > roomInfo.tallBet) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1108) }
            }
            // }
            //庄不能下注
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
            }
            // 是否下注时间
            if (roomInfo.status !== 'BETTING') {
                // this.Logger.info(`baijia.mainHandler.bet==>room.status:${roomInfo.status}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
            }
            // 金币是否够
            if (msg.bet > (playerInfo.gold - playerInfo.bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                }
            }

            //是否满足两千下注条件
            if (betAstrict.nid_8 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: mes }
            }

            if (!roomInfo.checkZhangEnoughMoney([msg])) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) }
            }
            // 投注
            roomInfo.onBeting(playerInfo, msg);
            return { code: 200 };
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    };

    /**
     * 续押
     * @route baijia.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
        const areaArr = ['draw', 'pair0', 'pair1'];//和 庄对 闲对
        const areaArr2 = ['play', 'bank'];//庄闲
        const areaArr3 = ['small', 'big'];//大小
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.goonBet==>err:${err}|isRobot:${playerInfo.isRobot}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
            }
            // 是否下注时间
            if (roomInfo.status !== 'BETTING') {
                this.Logger.warn(`baijia.mainHandler.goonBet==>room.status:${roomInfo.status}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) }
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            // 金币是否够
            const betNum = playerInfo.lastSumBetNum();
            if (betNum > (playerInfo.gold - playerInfo.bet)) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                }
            }
            //两千押注条件
            if (betAstrict.nid_8 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: mes }
            }

            // 押注上限
            for (let lastBet of playerInfo.lastBets) {
                if (areaArr.includes(lastBet.area) && (playerInfo.bets[lastBet.area].bet + playerInfo.lastBets[lastBet.area]) > roomInfo.area_bet[lastBet.area].betUpperLimit) {
                    return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) }
                }
            }
            for (let lastBet of playerInfo.lastBets) {
                if (areaArr2.includes(lastBet.area) || areaArr3.includes(lastBet.area)) {
                    let other;
                    if (areaArr2.includes(lastBet.area)) other = areaArr2.filter(m => m != lastBet.area);//押注上限(如果押注的是庄闲)
                    if (areaArr3.includes(lastBet.area)) other = areaArr3.filter(m => m != lastBet.area);//押注上限(如果押注的是大小)
                    let maxArea = Math.max(roomInfo.area_bet[lastBet.area].sumBet + playerInfo.lastBets[lastBet.area], roomInfo.area_bet[other[0]].sumBet);
                    let minArea = Math.min(roomInfo.area_bet[lastBet.area].sumBet + playerInfo.lastBets[lastBet.area], roomInfo.area_bet[other[0]].sumBet);
                    if (maxArea - minArea > roomInfo.area_bet[lastBet.area].betUpperLimit) {
                        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) }
                    }
                }
            }

            //押注后不能续押
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) };
            }
            //检查庄是否够赔
            if (!roomInfo.checkZhangEnoughMoney(playerInfo.lastBets)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) }
            }
            // 需押
            roomInfo.onGoonBet(playerInfo);
            return { code: 200 }
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) };
        }
    };


    /**
     * 申请玩家列表
     * @route baijia.mainHandler.applyplayers
     */
    async applyplayers({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyplayers==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 50) }
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyplayers==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) };
        }
    };

    /**
     * 刷新6个有位置的 玩家信息
     * @route baijia.mainHandler.rankingList
     */
    async rankingList({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`async  rankingList==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1207) };
            }
            return { code: 200, list: roomInfo.rankingLists().slice(0, 6) };
        } catch (error) {
            this.Logger.warn('async  rankingList==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1207) };
        }
    }

    /**
     * 申请上庄列表信息
     * @route baijia.mainHandler.applyupzhuangs
     */
    async applyupzhuangs({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyupzhuangs==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
            }
            return { code: 200, list: roomInfo.zj_List.map(pl => pl.strip1()) };

        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyupzhuangs==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) };
        }
    };

    /**
     * 申请上庄
     * @route baijia.mainHandler.applyUpzhuang
     */
    async applyUpzhuang({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.applyUpzhuang==>err:${err}|${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) };
            }
            // 是否已经上庄了
            if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1024) };
            }
            // 是否在列表中
            if (roomInfo.zj_List.findIndex(m => m.uid == playerInfo.uid) !== -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1025) };
            }
            // 金币是否够
            if (playerInfo.gold < roomInfo.upZhuangCond) {
                let money = utils.changeMoneyToGold(roomInfo.upZhuangCond);
                const mes = langsrv.getlanguage(language, langsrv.Net_Message.id_1026, money);
                return { code: 500, msg: mes }
            }
            if (playerInfo.isRobot == 2 && roomInfo.zj_List.length >= 3) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) };
            }
            if (roomInfo.zj_List.length >= 10) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) };
            }
            // 放入队列
            roomInfo.applyUpzhuang(playerInfo);
            return { code: 200 };
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyUpzhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    };

    /**
     * 申请下庄
     * @route baijia.mainHandler.applyXiazhuang
     */
    async applyXiazhuang({ }, session: BackendSession) {
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
            // 申请下庄
            roomInfo.xiaZhuangUid = uid;
            return { code: 200 }
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.applyXiazhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) };
        }
    };

    /**
     * 取消上庄队列
     * @route baijia.mainHandler.exitUpzhuanglist
     */
    async exitUpzhuanglist({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.Logger.warn(`baijia.mainHandler.exitUpzhuanglist==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) };
            }
            // 从队列中删除
            roomInfo.exitUpzhuanglist(playerInfo.uid);
            return { code: 200 }
        } catch (error) {
            this.Logger.warn('baijia.mainHandler.exitUpzhuanglist==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) };
        }
    };
}