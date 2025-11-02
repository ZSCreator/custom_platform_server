'use strict'
import { Application, pinus, BackendSession } from 'pinus';
import Util = require('../../../utils/index');
import sessionService = require('../../../services/sessionService');
import RedBlackConst = require('../lib/RedBlackConst');
import RedBlackMgr from '../lib/RedBlackMgr';
import RoomManager from '../../../common/dao/daoManager/Room.manager';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import langsrv = require('../../../services/common/langsrv');
import { betAstrict } from '../../../../config/data/gamesBetAstrict';

export default function (app: Application) {
    return new mainHandler(app);
};

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = RedBlackMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: "百家房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, error: "百家玩家不存在" };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}



export class mainHandler {
    constructor(private app: Application) {
    }

    /**红黑大战nid
     * 第一次进入游戏
     * @return {Object} 成功代码以及房间信息 || 失败 失败原因
     * @route RedBlack.mainHandler.enterGame
     *  */
    async enterGame({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }

        // 如果玩家是不在线, 说明是断线重连
        if (!playerInfo.isOnline()) {
            roomInfo.addPlayerInRoom(playerInfo);
        }

        let displayPlayers = roomInfo.rankingLists();
        const countdown = roomInfo.getCountdown();
        let res: RedBlackConst.RedBlack_mainHandler_enterGame = {
            code: 200,
            status: roomInfo.roomStatus,
            betSituation: roomInfo.playerAreaBets,
            countdown: countdown,
            MAX: RedBlackConst.MAX,
            sceneId,
            roundId: roomInfo.roundId,
            room: {
                lowBet: roomInfo.lowBet
            },
            bankerQueueLength: roomInfo.bankerQueue.length,
            playerLength: roomInfo.players.length,
            bankerProfitProportion: RedBlackConst.bankerProfitProportion,
            desktopPlayers: displayPlayers.slice(0, 6),
            desktopPlayers_num: displayPlayers.length,
            bankerGoldLimit: RedBlackConst.bankerGoldLimit[sceneId],
            players: playerInfo.strip(),
        }
        return res;
    };

    /**
     * 上庄、下庄
     * @param  isUp {boolean} true为上庄 false 为下庄
     * @return code {Number} 是否上庄成功
     * @route  RedBlack.mainHandler.becomeBanker
     *  */
    async becomeBanker({ isUp }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        // 上庄
        if (isUp) {
            if (Util.sum(playerInfo.gold) < RedBlackConst.bankerGoldLimit[roomInfo.sceneId]) {
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1054) }
            }

            if (roomInfo.checkPlayerIsBanker(uid)) {
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) }
            }

            if (roomInfo.checkPlayerInBankerQueue(uid)) {
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) }
            }

            roomInfo.joinBankerQueue(uid);
            return { code: 200 }
        } else {
            // 如果他当前是庄
            if (roomInfo.checkPlayerIsBanker(uid)) {
                roomInfo.descendBanker(uid);
                return { code: 200 }
            }

            // 如果不在上庄列表中
            if (!roomInfo.checkPlayerInBankerQueue(uid)) {
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1029) }
            }

            roomInfo.quitBankerQueue(uid);
            return { code: 200 }
        }
    };

    /**
     * 获取上庄列表
     * @return code {Number} 500 || 200 失败 或者 成功
     * @return bankerQueue {Array} 上庄列表
     * @route  RedBlack.mainHandler.getBankerQueue
     *  */
    async getBankerQueue({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }

        return { code: 200, bankerQueue: roomInfo.getBankerQueue() }
    };

    /**
     * 玩家下注
     * @param  {Object} bets:  下注区域及下注区域金额 {"red": number, "black": number, "luck": number}....
     * @return {Object} 成功 || 失败 失败原因
     * @route  RedBlack.mainHandler.userBet
     *  */
    async userBet(msg: { [key: string]: number }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2011) };
        }
        // 检测值bets是否为空
        if (roomInfo.roomStatus !== 'BETTING') {
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2011) };
        }

        // 检测玩家是否是庄
        if (roomInfo.checkPlayerIsBanker(uid)) {
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) };
        }
        // 检测值bets是否为空
        if (!(Object.keys(msg).length) || !(msg instanceof Object)) {
            //上一局未押註，無法續押
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2022) };
        }

        if ((playerInfo.gold - playerInfo.bet) < betAstrict.nid_19[`sceneId_${roomInfo.sceneId}`]) {
            const reGold = betAstrict.nid_19[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio;
            //金幣不足{0}無法下註
            return {
                code: 500,
                error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, reGold),
            }
        }

        // 玩家下注参数校验
        for (let area in msg) {
            if (typeof msg[area] !== 'number' || msg[area] <= 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
        }

        // 查看下注额是否大于玩家持有金币
        if (Util.sum(msg) > (playerInfo.gold - playerInfo.bet)) {
            //金幣不足
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
        }

        // 检查是否是玩家做庄 如果是则检测玩家押注额是否超过玩家可赔付
        if (roomInfo.playerIsBanker() && roomInfo.playerIsBankerBetLimit(msg)) {
            //下註金幣總和已超過莊家可賠付金額
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
        }

        const limitCheck = roomInfo.isLimit(msg, uid);
        if (limitCheck === RedBlackConst.LimitRed.personal) {
            //超過個人押註上限
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1108) };
        }

        if (limitCheck === RedBlackConst.LimitRed.total) {
            //押註超過限紅
            return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) };
        }

        // 下注
        await roomInfo.playerBet(uid, msg);
        return { code: 200, gold: playerInfo.gold - playerInfo.bet };
    };

    /**
     * 获取历史记录
     * @return {Array} record:  历史记录
     * @route  RedBlack.mainHandler.getRecord
     *  */
    async getRecord({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        const record = roomInfo.RedBlackHistory;

        return { code: 200, record }
    };

    /**
     * 获取红黑开奖次数记录
     * @return {Object} 红和黑分别赢的次数
     * @route  RedBlack.mainHandler.getRecords
     * */
    async getRecords({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        const record = await roomInfo.getRecords();
        return { code: 200, record }
    };

    /**
     * 获取玩家玩家列表 进入时间排序
     * @return {Array} upstarts:  玩家列表
     * @route  RedBlack.mainHandler.upstarts
     * */
    async upstarts({ }, session: BackendSession) {
        const { roomId, uid, sceneId, language } = sessionService.sessionInfo(session);
        const { error, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        return {
            code: 200,
            upstarts: roomInfo.rankingLists().slice(0, 50),
            desktopPlayers: roomInfo.rankingLists().slice(0, 6),
        }
    };
}