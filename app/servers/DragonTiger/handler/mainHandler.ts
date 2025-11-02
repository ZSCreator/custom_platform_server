'use strict'
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import sessionService = require('../../../services/sessionService');
import DragonTigerMgr from '../lib/DragonTigerRoomMangerImpl';
import * as DragonTigerConst from '../lib/DragonTigerConst';
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import langsrv = require('../../../services/common/langsrv');
export default function (app: Application) {
    return new mainHandler(app);
};
function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = DragonTigerMgr.searchRoom(sceneId, roomId);
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
export class mainHandler {

    constructor(private app: Application) {
        this.app = app;
    }

    /**
     * 第一次进入游戏
     * @return {Object} 房间信息以及玩家信息
     * @route DragonTiger.mainHandler.enterGame
     *  */
    async enterGame({ }, session: BackendSession): Promise<object> {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (err) return { code: 501, msg: err };

        // roomInfo.roomStatus === DragonTigerConst.status.NONE && await roomInfo.runRoom();		 // 如果房间状态为NONE，运行房间

        // 为手机断网准备
        if (!playerInfo.onLine) roomInfo.addPlayerInRoom(playerInfo);

        const { countdown } = roomInfo.getRoomInfo();
        setTimeout(() => {
            roomInfo.playersChange(playerInfo);
            roomInfo.noticeZhuangInfo(playerInfo);
        }, 500);

        const opts = {
            code: 200,
            status: roomInfo.roomStatus,
            countdown,
            cards: roomInfo.cards,
            roomId: roomInfo.roomId,
            roundId: roomInfo.roundId,
            result: roomInfo.result,
            room: {
                lowBet: roomInfo.lowBet
            },
            playerInfo: playerInfo.strip(),
            winArea: roomInfo.winArea,
            banker: roomInfo.banker ? roomInfo.banker.bankerStrip() : roomInfo.banker,
            // myBet: playerInfo.bets,
            situation: roomInfo.situations,
            sceneId,
            bankerProfitProportion: DragonTigerConst.bankerProfitProportion,
            bankerGoldLimit: DragonTigerConst.bankerGoldLimit[sceneId]
        }
        return opts;
    };

    /**
     * 获取房间玩家列表
     * @return {Array} upstarts:  玩家列表
     * @route  DragonTiger.mainHandler.upstarts
     *  */
    async upstarts({ }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        let result = {
            code: 200,
            upstarts: null
        };
        if (err) {
            return { code: 501, msg: err };
        } else {
            result.upstarts = roomInfo.rankingLists().slice(0, 50);
            return result;
        }
    };

    /**
     * 上庄、下庄
     * @param  isUp {boolean} true为上庄 false 为下庄
     * @return code {Number} 是否上庄成功
     * @route  DragonTiger.mainHandler.becomeBanker
     *  */
    async becomeBanker({ isUp }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: err }
        }
        // 上庄
        if (isUp) {
            if (playerInfo.gold < DragonTigerConst.bankerGoldLimit[roomInfo.sceneId]) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1054) }
            }

            if (roomInfo.checkPlayerIsBanker(uid)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) }
            }

            if (roomInfo.checkPlayerInBankerQueue(uid)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1025) }
            }
            // 放入队列
            if (playerInfo.isRobot == 2 && roomInfo.bankerQueue.length >= 3) {
                return { code: 200, msg: "msg" };
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
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1029) }
            }

            roomInfo.quitBankerQueue(uid);
            return { code: 200 }
        }
    };

    /**
     * 获取上庄列表
     * @return code {Number} 500 || 200 失败 或者 成功
     * @return bankerQueue {Array} 上庄列表
     * @route  DragonTiger.mainHandler.getBankerQueue
     *  */
    async getBankerQueue({ }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: err }
        }
        return { code: 200, bankerQueue: roomInfo.getBankerQueue() }
    };


    /**
     * 玩家下注
     * @param {Object} bets: 下注区域及下注区域金额 {"dd": number}, {"dt": number}....
     * @return {Object} bets: 怎么传过来，怎么传回去
     * @route DragonTiger.mainHandler.userBet
     *  */
    async userBet(msg: { area: string, bet: number }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: err };
        }
        try {
            // 玩家下注参数校验
            if (typeof msg.bet !== 'number' || msg.bet <= 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1217) };
            }

            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1217) };
            }
            // 检测房间是否为下注状态
            if (roomInfo.roomStatus !== DragonTigerConst.status.BET) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2011) };
            }

            // 检测玩家是否是庄
            if (roomInfo.checkPlayerIsBanker(uid)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) }
            }

            // 查看玩家金币是否小于下注限制

            if ((playerInfo.gold - playerInfo.bet) < betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`]) {
                const reGold = betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio;
                return {
                    code: 500,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, reGold),
                }
            }



            // 查看下注额是否大于玩家持有金币
            if (msg.bet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }

            // 检查是否是玩家做庄 如果是则检测玩家押注额是否超过玩家可赔付
            if (roomInfo.playerIsBankerBetLimit([msg])) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) }
            }

            const limitCheck = roomInfo.ceiling(uid, [msg]);
            if (limitCheck === DragonTigerConst.LimitRed.total) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) }
            }

            // 玩家下注
            await roomInfo.playerBet(uid, [msg]);

            return { code: 200, gold: playerInfo.gold - playerInfo.bet };
        } catch (error) {
        }
    };

    /**
     * 获取历史记录
     * @return {Array} record:  游戏开奖历史，及开奖的期数
     * @route DragonTiger.mainHandler.getRecords
     *  */
    async getRecords({ }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: "" };
        }
        if (roomInfo && playerInfo) {
            const DragonTigerHistory = roomInfo['DragonTigerHistory'] ? roomInfo['DragonTigerHistory'] : [];
            return { code: 200, DragonTigerHistory };
        }

        return { code: 500, msg: langsrv.getlanguage(playerInfo && playerInfo.language, langsrv.Net_Message.id_2004) }
    };
    /**
    * 续押
    * @route DragonTiger.mainHandler.goonBet
    */
    async goonBet({ }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);

        if (err) {
            return { code: 501, msg: err };
        }
        try {
            //押注后不能续押
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1215) };
            }
            if (playerInfo.bet == 0 && roomInfo.lowBet > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1217) };
            }
            // 检测房间是否为下注状态
            if (roomInfo.roomStatus !== DragonTigerConst.status.BET) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2011) };
            }

            // 检测玩家是否是庄
            if (roomInfo.checkPlayerIsBanker(uid)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1024) }
            }

            // 查看玩家金币是否小于下注限制
            if ((playerInfo.gold - playerInfo.bet) < betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`]) {
                const reGold = betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio;
                return {
                    code: 500,
                    msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1106, reGold),
                }
            }

            let total_gold = playerInfo.recordBets.reduce((total, Value) => {
                return total + Value.bet;
            }, 0);
            // 查看下注额是否大于玩家持有金币
            if (total_gold > (playerInfo.gold - playerInfo.bet)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }

            // 检查是否是玩家做庄 如果是则检测玩家押注额是否超过玩家可赔付
            if (roomInfo.playerIsBankerBetLimit(playerInfo.recordBets)) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) }
            }

            const limitCheck = roomInfo.ceiling(uid, playerInfo.recordBets);
            if (limitCheck === DragonTigerConst.LimitRed.total) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2015) }
            }

            // 玩家下注
            await roomInfo.playerBet(uid, playerInfo.recordBets);

            return { code: 200, gold: playerInfo.gold - playerInfo.bet };
        } catch (error) {
            console.error(`dt:${error}`);
            return { code: 200, msg: error };
        }
    }
}