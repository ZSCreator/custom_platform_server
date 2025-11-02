'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';

import SangongMgr from '../lib/SangongMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');

function check(roomId: string, uid: string, sceneId: number) {
    const roomInfo = SangongMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: "sangong 房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { roomInfo, err: "sangong 玩家不存在" };
    }
    return { roomInfo, playerInfo };
}

export default function (app: Application) {
    return new mainHandler(app);
};

export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载游戏
     * @param
     * @return {Object} 房间信息
     * @route sangong.mainHandler.loaded
     * */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(roomId, uid, sceneId);

        if (err) return { code: 501, msg: err };

        try {
            // 看是不是断线重连的
            if (!playerInfo.onLine) {
                roomInfo.addMessage(playerInfo);
                roomInfo.reconnectPlayer(playerInfo.uid);
            }
            if (playerInfo.status == `NONE`) {
                playerInfo.status = `WAIT`;
            }
            roomInfo.wait(playerInfo);
            return { code: 200, room: roomInfo.wrapGameData() };
        } catch (e) {
            Logger.warn(`sangong.mainHandler.loaded ==> 加载游戏出错  ${JSON.stringify(e)}`);
            return { code: 500, msg: err };
        }
    };

    /**
     * 点击抢庄
     * @param {Object} odds {Number}: 抢庄的倍率 Number: 1 2 3 （0 不抢）
     * @return {Object} 抢庄成功或者抢庄失败
     * @route sangong.mainHandler.robBanker
     * */
    async robBanker({ odds }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(roomId, uid, sceneId);

        if (err) return { code: 501, msg: err };

        if (roomInfo.status != 'ROB') {
            return { code: 500, msg: 'not ROB' };
        }

        if (playerInfo.isRob) {
            return { code: 500, msg: 'has isRob' };
        }

        // 抢庄
        playerInfo.handler_rob(roomInfo, odds);
        return { code: 200, msg: '' };
    };

    /**
     * 点击下注
     * @param {Object} odds {Number}: 抢庄的倍率 Number: 1 2 3
     * @return {Object} 下注成功或者失败
     * @route sangong.mainHandler.bet
     * */
    async bet({ odds }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(roomId, uid, sceneId);

        if (err)
            return { code: 501, msg: err }

        if (roomInfo.status !== 'BET' || roomInfo.Banker.uid == uid) {
            return { code: 500, msg: '' };
        }

        if (playerInfo.isBet) {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1018) }
        }

        // 如果玩家不在游戏中 则无法下注（防机器人误操作）
        if (!roomInfo.curPlayers.find(pl => pl && pl.uid == uid)) {
            return { code: 500, msg: '' };
        }
        // 同步金币

        // 下注
        playerInfo.handler_bet(roomInfo, odds);
        return { code: 200, msg: '' };
    };

    /**
     * 点击亮牌
     * @param location 牌的位置
     * @param session 
     * @route sangong.mainHandler.openCardType
     */
    async openCardType({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(roomId, uid, sceneId);

        if (err) {
            return { code: 501, msg: err };
        }
        if (roomInfo.status != 'LOOK') {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1018) };
        }

        // 如果玩家不在游戏中 则无法下注（防机器人误操作）
        if (!roomInfo.curPlayers.find(pl => pl.uid == uid) && roomInfo.Banker.uid !== uid) {
            return { code: 500, msg: "" };
        }
        if (playerInfo.openCards == false) {
            playerInfo.handler_openCard(roomInfo);
        }
        return { code: 200, };
    };

}