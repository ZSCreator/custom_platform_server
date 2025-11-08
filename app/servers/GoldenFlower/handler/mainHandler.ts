'use strict';
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import gameManger from '../lib/GoldenFlowerMgr';
import sessionService = require("../../../services/sessionService");
import { getLogger } from 'pinus-logger';
import utils = require('../../../utils/index');
import langsrv = require('../../../services/common/langsrv');
import * as GoldenFlower_logic from '../lib/GoldenFlower_logic';

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = gameManger.searchRoom(sceneId, roomId);
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

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    logger = getLogger('server_out', __filename);
    constructor(private app: Application) {

    }

    /**
     * 加载完成
     * 进入房间加载
     * @route GoldenFlower.mainHandler.loaded
     */
    async loaded(msg: {}, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            /**玩家状态为NONE 通知其他玩家有人加入房间 */
            if (playerInfo.status === 'NONE') {
                // 通知其他玩家有人加入房间(不是掉线玩家进入游戏才调用)
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

            //返回给客户端
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
                totalBet: playerInfo.totalBet,//玩家总下注额度
                id: roomInfo.sceneId//场id
            }
            return opts;
        } catch (error) {
            this.logger.warn(`GoldenFlower.mainHandler.loaded:${error}`);
            return { code: 500, msg: error };
        }
    };

    /**
     * 跟注
     * @route GoldenFlower.mainHandler.cingl
     */
    async cingl({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }

            //不该你操作
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            // 如果看牌了 就是两倍额度
            const betNum = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;

            if (playerInfo.gold < betNum) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
            }
            // 执行扣钱
            playerInfo.handler_cingl(roomInfo, betNum);
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|GoldenFlower.mainHandler.cingl:${error}`);
            return { code: 500, msg: error };
        }
    };

    /**
     * 加注
     * @route GoldenFlower.mainHandler.filling
     */
    async filling(msg: { multiple: number }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            //不该你操作
            if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
            }
            if (typeof msg.multiple !== 'number') {
                msg.multiple = roomInfo.betNum;
            }
            /**true 加注 */
            let flag = (msg.multiple > roomInfo.betNum && msg.multiple <= roomInfo.capBet / 2) ? true : false;
            let num = Math.max(roomInfo.betNum, msg.multiple);
            // 下注额度
            num = Math.min(num, roomInfo.capBet / 2);
            /**如果看牌了 就是两倍额度 */
            let betNum = playerInfo.holdStatus === 1 ? num * 2 : num;
            //判断钱是不是够
            if (playerInfo.gold < betNum) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }
            if (flag) {
                playerInfo.handler_filling(roomInfo, betNum, num);
            } else {
                betNum = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
                playerInfo.handler_cingl(roomInfo, betNum);
            }
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|GoldenFlower.mainHandler.filling:${error}`);
        }
    };



    /**
     * 看牌
     * @route GoldenFlower.mainHandler.kanpai
     */
    async kanpai({ }, session: BackendSession) {
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
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) }
            }

            playerInfo.holdStatus = 1;// 设置状态
            // 看牌
            playerInfo.handler_kanpai(roomInfo);
            const num = playerInfo.holdStatus == 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            let allin = false;
            if (playerInfo.gold < num) {
                allin = true;
            }
            return { code: 200, holds: playerInfo.toHolds(), holdStatus: playerInfo.holdStatus, allin };
        } catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.kanpai:${error}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
        }
    };

    /**
     * 申请比牌
     * @route GoldenFlower.mainHandler.applyBipai
     */
    async applyBipai({ }, session: BackendSession) {
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
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            // if (roomInfo.players[roomInfo.curr_doing_seat].uid !== playerInfo.uid) {//不该你操作
            //     return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            // }
            const canBipai = roomInfo.get_canBipai();
            if (!canBipai) {//还不能比牌
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1032) };
            }

            // 如果看牌了 就是两倍额度 然后比牌再两倍
            const num = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < num) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }
            // 获取可以比牌的玩家
            const list = roomInfo.players.filter(m => m && m.status == 'GAME' && m.uid !== playerInfo.uid);
            if (list.length === 0) {
                return { code: 500, msg: "" };
            }
            // 如果只有一个人 那么直接参与比牌
            if (list.length === 1) {
                roomInfo.handler_bipai(playerInfo, list[0], num);
                return { code: 200 };
            } else {
                return {
                    code: 200, list: list.map(m => {
                        return {
                            seat: m.seat,
                            holdStatus: m.holdStatus
                        }
                    })
                };
            }
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|GoldenFlower.mainHandler.applyBipai:${error}`);
        }
    };

    /**
     * 比牌
     * @param: {roomId,seat}，房间id,座位号
     * @route GoldenFlower.mainHandler.bipai
     */
    async bipai({ seat: seat }, session: BackendSession) {
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
            //不该你操作
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            //还不能比牌
            const canBipai = roomInfo.get_canBipai();
            if (!canBipai) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1032) };
            }
            // 如果看牌了 就是两倍额度 然后比牌再两倍
            const num = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < num) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }
            roomInfo.handler_bipai(playerInfo, other, num);
            return { code: 200 }
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|GoldenFlower.mainHandler.bipai:${error}`);
            return { code: 500, msg: error };
        }
    };

    /**
     * 弃牌
     * @param: {roomId}，房间id
     * @route GoldenFlower.mainHandler.fold
     */
    async fold({ }, session: BackendSession) {
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
        } catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.fold:${error}`);
            return { code: 500, msg: error }
        }
    };

    /**孤注一掷 
     * @route GoldenFlower.mainHandler.Allfighting
    */
    async Allfighting(msg: {}, session: BackendSession) {
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
            //不该你操作
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            let ret = playerInfo.handler_Allfighting(roomInfo);
            return { code: 200, win: ret };
        } catch (error) {
            this.logger.warn(`GoldenFlower.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }

    /**
     * 
     * @param msg  { oper_type: Player_Oper, cmsg: any }
     * @route GoldenFlower.mainHandler.auto_genzhu
     */
    async auto_genzhu(msg: { cmsg: boolean }, session: BackendSession) {
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
        } catch (error) {
            this.logger.warn(`SparrowHZH.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }
    /**
     * 
     * @param msg 
     * @param route GoldenFlower.mainHandler.auto_no_Fold
     */
    async auto_no_Fold(msg: { cmsg: boolean }, session: BackendSession) {
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
        } catch (error) {
            this.logger.warn(`SparrowHZH.mainHandler.ready:${error}`);
            return { code: 500, msg: error };
        }
    }
    /**
     * @param: {}，房间id
     * @return:{ code: 200 }
     * @route GoldenFlower.mainHandler.getInning
     */
    //获取房间局数(机器人用)
    async getInning({ }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.isRobot !== 2) {
                throw "not robot";
            }
            return { code: 200, room: roomInfo.strip(), Holds: roomInfo.players.map(m => m && m.stripRobot()) }
        } catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.getInning: ${error}`);
            return { code: 500, msg: error };
        }
    }

    /**测试用 */
    async test(msg: { cards1: number[], cards2: number[] }, session: BackendSession) {
        try {

            let ret1 = GoldenFlower_logic.judgeCards(msg.cards1);
            let cardType1 = GoldenFlower_logic.getCardType(msg.cards1);

            let ret2 = GoldenFlower_logic.judgeCards(msg.cards2);
            let cardType2 = GoldenFlower_logic.getCardType(msg.cards2);

            let win = GoldenFlower_logic.bipaiSole({ cardType: cardType1, cards: msg.cards1 }, { cardType: cardType2, cards: msg.cards2 });

            return { code: 200, data: { pl1: { ret1, cardType1 }, pl2: { ret2, cardType2 }, win } }
        } catch (error) {
            this.logger.error(`GoldenFlower.mainHandler.getInning: ${error}`);
            return { code: 500, msg: error };
        }
    }

    /**
   * 玩家准备
   *@route GoldenFlower.mainHandler.ready
   */
    async ready({ option }: { option: boolean }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, playerInfo, roomInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                this.logger.warn(`GoldenFlower.mainHandler.ready==>err:${err}`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            // 玩家准备
            roomInfo.ready(playerInfo, option);

            return { code: 200 };
        } catch (error) {
            this.logger.warn('GoldenFlower.mainHandler.ready==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
    }
}