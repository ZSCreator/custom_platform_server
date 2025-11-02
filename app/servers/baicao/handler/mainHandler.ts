'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';

import baicaoMgr, { GameManger } from '../lib/baicaoMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from 'pinus-logger';
const LoggerErr = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');

async function check(sceneId: number, roomId: string, uid: string, language: string) {
    const roomInfo = await baicaoMgr.getRoom(sceneId, roomId);

    if (!roomInfo) {
        LoggerErr.info(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在游戏场${sceneId}找到对应房间`);
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
    }

    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        LoggerErr.info(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在游戏场${sceneId}房间${roomId}找到对应玩家`);
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
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
     * 加载游戏
     * @param
     * @return {Object} 房间信息
     * @route baicao.mainHandler.loaded
     * */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = await check(sceneId, roomId, uid, language);

        if (err) return { code: 501, error: err };

        try {
            if (playerInfo.status == `NONE`) {
                playerInfo.status = `WAIT`;
            }
            roomInfo.wait(playerInfo);
            return {
                code: 200, room: {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    roundId: roomInfo.roundId,
                    status: roomInfo.status,
                    players: roomInfo.players.map(pl => pl && pl.strip()),
                    countdown: roomInfo.toStatusTime(),
                    total_bet: roomInfo.total_bet,
                    lowBet: roomInfo.lowBet,
                }
            };
        } catch (e) {
            LoggerErr.info(`baicao.mainHandler.loaded ==> 加载游戏出错  ${JSON.stringify(e)}`);
            return { code: 500, msg: e };
        }
    };
}
