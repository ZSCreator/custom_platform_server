'use strict'
import { Application, ChannelService, RemoterClass, BackendSession, pinus } from 'pinus';
import * as utils from '../../../utils';
import * as ErbaConst from '../lib/ErbaConst';
import ErbaMgr from '../lib/ErbaRoomMgr';
import sessionService = require('../../../services/sessionService');
import langsrv = require('../../../services/common/langsrv');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = ErbaMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到|Erba|房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在|Erba|房间${roomId}中找到玩家${uid}` };
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
     * @route Erba.mainHandler.loaded
     *  */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 501, msg: error };
        }
        if (playerInfo.status == "NONE") {
            playerInfo.status = "WAIT";
            roomInfo.wait(playerInfo);
        }

        let opts = {
            code: 200,
            plys: roomInfo.players.map(pl => pl && pl.strip()),
            roundTimes: roomInfo.roundTimes,
            roundId: roomInfo.roundId,
            lowBet: roomInfo.lowBet,
            status: roomInfo.status,
            countdown: roomInfo.countdown,
            banker: roomInfo.banker ? roomInfo.banker.seat : null,
            setSice: roomInfo.setSice,
            statistics: roomInfo.statistics
        };
        return opts;
    };
    /**
     * 
     * @route Erba.mainHandler.handler_grab 
     */
    async handler_grab(msg: { Grab_num: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 501, msg: error };
        }
        if (playerInfo.Grab_num != -1) {
            return { code: 500, msg: "重复操作" };
        }
        try {
            const Grab_num = playerInfo.startGrab_List[msg.Grab_num];
            playerInfo.handler_grab(roomInfo, Grab_num);
            return { code: 200 };
        } catch (error) {
            return { code: 501, msg: error };
        }
    }

    /**
     * 
     * @route Erba.mainHandler.handler_Bet 
     */
    async handler_Bet(msg: { bet_mul: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            return { code: 501, msg: error };
        }
        if (playerInfo.bet_mul != 0) {
            return { code: 500, msg: "重复操作" };
        }
        try {
            const bet_mul = playerInfo.bet_mul_List[msg.bet_mul];
            playerInfo.handler_Bet(roomInfo, bet_mul);
            return { code: 200 };
        } catch (error) {
            return { code: 501, msg: error };
        }
    }
}
