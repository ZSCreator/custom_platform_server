import { Application, BackendSession } from 'pinus';
import * as utils from '../../../utils';
import sessionService = require('../../../services/sessionService');
import * as hallConst from '../../../consts/hallConst';
import * as bairenConst from '../lib/constant/bairenConst';
import BairenMgr from '../lib/BairenRoomManager';
import * as langsrv from '../../../services/common/langsrv';
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const bairenLogger = getLogger('server_out', __filename);


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = BairenMgr.searchRoom(sceneId, roomId);
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

export default function (app: Application) {
    return new MainHandler(app);
};
export class MainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载完成
     * @route bairen.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
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
            let res: bairenConst.bairen_mainHandler_loaded = {
                code: 200,
                room: roomInfo.strip(),
                players: roomInfo.players.filter(pl => pl.uid == playerInfo.uid).map(pl => pl.loadedStrip()),
                offLine: offline,
                sceneId: roomInfo.sceneId,
                roundId: roomInfo.roundId,
                poundage: bairenConst.CHOU_SHUI * 100,
                pl: { bets: playerInfo.betList, isRenew: playerInfo.isCanRenew() }
            }
            return res;
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1201) }
        }
    };

    /**
     * 申请开始下注
     * @route bairen.mainHandler.applyBet
     */
    async applyBet({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyBet==>err:${err}|uid:${uid}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) }
            }
            if (roomInfo.status == 'INBIPAI') {
                return { code: 200, status: 'INBIPAI', countdownTime: roomInfo.getCountdownTime() }
            }

            return {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: roomInfo.toBetBack(),
            }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1202) }
        }

    };

    /**
     * 申请结果
     * @route bairen.mainHandler.applyResult
     */
    async applyResult({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyResult==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) }
            }
            if (roomInfo.status == 'BETTING') {
                return { code: 200, status: 'BETTING', countdownTime: 1000 }
            }
            let res = roomInfo.toResultBack();
            return {
                code: 200,
                status: roomInfo.status,
                countdownTime: roomInfo.getCountdownTime(),
                data: res
            }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyResult==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1203) }
        }
    };

    /**
     * 下注(百人下注的时候不扣钱)
     * @route bairen.mainHandler.bet
     */
    async bet(msg: { area: number, bet: number }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.bet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) }
            }
            if (typeof msg.bet !== 'number' || msg.bet <= 0) {
                bairenLogger.warn(`bairen.mainHandler.bet==>betNum:${msg.bet}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            if (![0, 1, 2, 3].includes(msg.area)) {
                bairenLogger.warn(`bairen.mainHandler.bet==>area:${msg.area}|isRobot:${playerInfo.isRobot}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
            }
            //庄不能下注
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1204) };
            }
            // 是否下注时间
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
            }
            //是否满足两千下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: mes };
            }

            //个人限红
            if ((playerInfo.betList[msg.area].bet + msg.bet) > roomInfo.tallBet) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1108) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: hallConst.CODE, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            const ret = { code: 200, changeJettonNum: 0, gold: 0, bet: 0 };
            // 是不是超出10倍了
            const sumCount = playerInfo.betList.reduce((sum, value) => sum + value.bet, 0) + msg.bet;
            if (sumCount * roomInfo.compensate > playerInfo.gold) {
                let str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1109);
                if (roomInfo.sceneId != 0) {
                    str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1022);
                }
                return { code: 500, msg: str };
            }

            // 够不够庄家赔
            if (roomInfo.isBeyondZhuangLimit([msg])) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
            }
            // 投注
            playerInfo.handler_bet(roomInfo, [msg]);
            ret.bet = playerInfo.bet;
            ret.gold = playerInfo.gold;
            return ret;
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.bet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1204) };
        }
    };

    /**
     * 需押
     * @param param0 
     * @param session 
     * @route bairen.mainHandler.goonBet
     */
    async goonBet({ }, session: BackendSession) {
        const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.goonBet==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) }
            }
            if (roomInfo.zhuangInfo.uid == uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) }
            }
            // 是否下注时间
            if (roomInfo.status !== 'BETTING') {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) }
            }

            // 需押总金币
            const betNum = playerInfo.lastBets.reduce((sum, value) => sum + value.bet, 0);
            if (betNum === 0 || playerInfo.bet > 0) {
                return { code: 200 };
            }

            //是否满足两千下注条件
            if (betAstrict.nid_9 && (betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, betAstrict.nid_9[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
                return { code: 500, msg: mes };
            }

            //是否弹金币不足请充值
            if ((playerInfo.gold - playerInfo.bet) < roomInfo.lowBet) {
                return {
                    code: hallConst.CODE,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015)
                }
            }

            // 是不是超出10倍了
            const sumCount = playerInfo.betList.reduce((sum, value) => sum + value.bet, 0) + betNum;
            if (sumCount * roomInfo.compensate > playerInfo.gold) {
                const num = roomInfo.sceneId === 0 ? 1109 : 1022;
                let str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1109);
                if (roomInfo.sceneId != 0) {
                    str = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1022);
                }
                return { code: 500, msg: str }
            }

            // 够不够庄家赔
            if (roomInfo.isBeyondZhuangLimit(playerInfo.lastBets)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) }
            }
            if (playerInfo.bet) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1205) }
            }
            playerInfo.handler_bet(roomInfo, playerInfo.lastBets);
            return { code: 200 };
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.goonBet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1205) }
        }
    };

    /**
     * 申请玩家列表
     * @route bairen.mainHandler.applyplayers
     */
    async applyplayers({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyplayers==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) }
            }
            return {
                code: 200,
                list: roomInfo.rankingLists().slice(0, 50),
                zhuang: roomInfo.zhuangInfo.uid
            }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyplayers==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1206) }
        }
    };

    /**
     * 申请上庄列表信息
     * @route bairen.mainHandler.applyupzhuangs
     */
    async applyupzhuangs({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyupzhuangs==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) }
            }

            return {
                code: 200, list: roomInfo.zj_queues.map(pl => {
                    return {
                        uid: pl.uid,
                        headurl: pl.headurl,
                        nickname: pl.nickname,
                        gold: pl.gold,
                        isRobot: pl.isRobot
                    }
                })
            }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyupzhuangs==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1208) }
        }
    };

    /**
     * 申请上庄
     * @route bairen.mainHandler.applyUpzhuang
     */
    async applyUpzhuang({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        // const player = await PlayerManagerDao.findOne({ uid }, true);
        try {
            if (err || !playerInfo) {
                bairenLogger.warn(`bairen.mainHandler.applyUpzhuang==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) };
            }
            // 是否已经上庄了
            if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) }
            }
            // 是否在列表中
            if (roomInfo.zj_queues.findIndex(m => m.uid == playerInfo.uid) !== -1) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) }
            }
            // 金币是否够
            if (playerInfo.gold < roomInfo.upZhuangCond) {
                let money = utils.changeMoneyToGold(roomInfo.upZhuangCond);
                const mes = langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1026, money);
                return { code: 500, msg: mes }
            }
            if (roomInfo.zj_queues.length >= 10) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1209) }
            }
            // 放入队列
            roomInfo.applyUpzhuang(playerInfo);
            return { code: 200 };
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyUpzhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1209) }
        }
    };

    /**
     * 申请下庄
     * @route bairen.mainHandler.applyXiazhuang
     */
    async applyXiazhuang({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.applyXiazhuang==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) }
            }
            if (uid !== roomInfo.zhuangInfo.uid) {
                bairenLogger.warn(`bairen.mainHandler.applyXiazhuang==>uid:${uid}|zhuangUid:${roomInfo.zhuangInfo.uid}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1210) }
            }
            // 申请下庄
            roomInfo.xiaZhuangUid = uid;
            return { code: 200 }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.applyXiazhuang==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1210) }
        }
    };

    /**
     * 取消上庄队列
     * @route bairen.mainHandler.exitUpzhuanglist
     */
    async exitUpzhuanglist({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            // const player = await PlayerManagerDao.findOne({ uid }, true);
            if (err) {
                bairenLogger.warn(`bairen.mainHandler.exitUpzhuanglist==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language || null, langsrv.Net_Message.id_1211) }
            }
            // 是否在队列中
            if (roomInfo.zj_queues.findIndex(m => m.uid == playerInfo.uid) === -1) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1029) }
            }
            // 从队列中删除
            roomInfo.exitUpzhuanglist(playerInfo.uid);
            return { code: 200 }
        } catch (error) {
            bairenLogger.warn('bairen.mainHandler.exitUpzhuanglist==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1211) }
        }
    };
}