'use strict';
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import gameManger from '../lib/TeenPattiMgr';
import sessionService = require("../../../services/sessionService");
import { getLogger } from 'pinus-logger';

import langsrv = require('../../../services/common/langsrv');

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
     * @route TeenPatti.mainHandler.loaded
     */
    async loaded(msg: {}, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (playerInfo.status == 'NONE') {
                playerInfo.status = `WAIT`;
                // 通知其他玩家有人加入房间(不是掉线玩家进入游戏才调用)
                roomInfo.channelIsPlayer('TeenPatti_onEntry', {
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
                multipleLimit: roomInfo.multipleLimit,
                seat: playerInfo.seat,
                roundId: roomInfo.roundId,
                offLine: roomInfo.stripSpeak(playerInfo),
                pl_totalBet: playerInfo.totalBet,//玩家总下注额度
                sceneId: roomInfo.sceneId//场id
            }
            return opts;
        } catch (error) {
            this.logger.warn(`TeenPatti.mainHandler.loaded:${error}`);
            return { code: 500, msg: error };
        }
    };

    /**
     * 跟注
     * @route TeenPatti.mainHandler.cingl
     */
    async cingl({ }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }

            //不该你操作
            if (roomInfo.players[roomInfo.curr_doing_seat].uid !== playerInfo.uid || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            // 如果看牌了 就是两倍额度
            const betNum = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;

            if (playerInfo.gold < betNum) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }
            playerInfo.state = "PS_NONE";
            // 执行扣钱
            playerInfo.handler_cingl(roomInfo, betNum);
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        } catch (error) {
            this.logger.error(`TeenPatti.mainHandler.cingl:${JSON.stringify(error)}`);
            return { code: 500, msg: error };
        }
    };

    /**
     * 加注
     * @route TeenPatti.mainHandler.filling
     */
    async filling({ }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500 };
            }
            //不该你操作
            if (roomInfo.players[roomInfo.curr_doing_seat].uid !== playerInfo.uid || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            let type = true;
            let betNum = roomInfo.betNum * 2;
            if (roomInfo.betNum == roomInfo.multipleLimit * roomInfo.lowBet / 2) {
                betNum = roomInfo.betNum;
                type = false;
            }
            let num = betNum;
            betNum = playerInfo.holdStatus == 1 ? betNum * 2 : betNum;
            //判断钱是不是够
            if (playerInfo.gold < betNum) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) }
            }
            playerInfo.state = "PS_NONE";
            if (type) {
                playerInfo.handler_filling(roomInfo, betNum, num);
            } else {
                playerInfo.handler_cingl(roomInfo, betNum);
            }
            return { code: 200, betNum: betNum, gold: playerInfo.gold };
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|TeenPatti.mainHandler.filling:${error}`);
            return { code: 500, msg: error };
        }
    };



    /**
     * 看牌
     * @route TeenPatti.mainHandler.kanpai
     */
    async kanpai({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status != 'INGAME') {
                console.warn(`kanpai|${playerInfo.uid}|${roomInfo.status}|${roomInfo.roundTimes}`);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
            }
            if (playerInfo.holdStatus != 0) {
                console.warn(`kanpai|${playerInfo.uid}|${playerInfo.holdStatus}|${roomInfo.roundTimes}`);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) }
            }
            // 看牌
            playerInfo.handler_kanpai(roomInfo);
            let canBipai = playerInfo.canBipai(roomInfo);
            return { code: 200, holds: playerInfo.toHolds(), canBipai };
        } catch (error) {
            this.logger.error(`TeenPatti.mainHandler.kanpai:${error}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
        }
    };

    /**
     * 申请比牌
     * @route TeenPatti.mainHandler.applyBipai
     */
    async applyBipai({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                throw "not in game";
            }

            //不该你操作
            if (roomInfo.curr_doing_seat !== playerInfo.seat || playerInfo.state == "PS_NONE") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }
            //还不能比牌
            let { plys, canBipai } = playerInfo.canBipai(roomInfo);
            if (canBipai == false) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1032) };
            }
            // 如果看牌了 就是两倍额度 然后比牌再两倍
            const num = playerInfo.holdStatus === 1 ? roomInfo.betNum * 2 : roomInfo.betNum;
            if (playerInfo.gold < num) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
            }

            playerInfo.state = "PS_NONE";
            roomInfo.bipai_arr.apply = playerInfo.seat;//比牌存入数组 申请人
            if (plys.length > 1) {
                roomInfo.bipai_arr.other = roomInfo.previousFahuaIdx();//被申请人
            } else {
                roomInfo.bipai_arr.other = plys[0].seat;
            }

            let accept_pl = roomInfo.players[roomInfo.bipai_arr.other];
            if (plys.length == 1) {
                roomInfo.handler_bipai(playerInfo, accept_pl, num);
            } else {
                roomInfo.handler_applyBipai(playerInfo, accept_pl, num);
            }
            return { code: 200 };
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|TeenPatti.mainHandler.bipai:${error}`);
            return { code: 500, msg: error };
        }
    }
    /**
     * 同意 拒绝比牌
     * type 0同意比牌 1拒绝比牌
     * @route TeenPatti.mainHandler.agreeBiPai
     */
    async agreeBiPai(msg: { type: 0 | 1 }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                throw "not in game";
            }
            let Launch_pl = roomInfo.players[roomInfo.bipai_arr.apply];
            if (!Launch_pl || roomInfo.bipai_arr.other != playerInfo.seat || Launch_pl.holdStatus == 2) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
            }

            if (msg.type == 0) {
                roomInfo.handler_bipai(Launch_pl, playerInfo, 0);
            } else {
                roomInfo.handler_rejectBiPai();
            }
            return { code: 200 };
        } catch (error) {
            this.logger.error(`${pinus.app.getServerId()}|TeenPatti.mainHandler.bipai:${error}`);
            return { code: 500, msg: error };
        }
    }

    /**
     * 弃牌
     * @param: {roomId}，房间id
     * @route TeenPatti.mainHandler.fold
     */
    async fold({ }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (roomInfo.status !== 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            if (playerInfo.status != "GAME") {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            if (roomInfo.bipai_arr.apply == playerInfo.seat ||
                roomInfo.bipai_arr.other == playerInfo.seat) {
                    return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            const list = roomInfo.players.filter(pl => pl && pl.status == 'GAME');
            if (list.length <= 1) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
            }
            playerInfo.handler_fold(roomInfo);
            return { code: 200 };
        } catch (error) {
            this.logger.warn(`TeenPatti.mainHandler.fold:${error}`);
            return { code: 500, msg: error }
        }
    };

    /**
     * @param: {}，房间id
     * @return:{ code: 200 }
     * @route TeenPatti.mainHandler.getInning
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
            this.logger.error(`TeenPatti.mainHandler.getInning: ${error}`);
            return { code: 500, msg: error };
        }
    }
}