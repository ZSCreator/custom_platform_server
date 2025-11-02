'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import ldMgr from '../lib/ldMgr';
import utils = require('../../../utils');
import ld_Logic = require("../lib/ld_Logic");
import sessionService = require('../../../services/sessionService');
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);
import JsonMgr = require('../../../../config/data/JsonMgr');
import { ld_mainHandler_loaded } from "../lib/ld_interface"
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import * as RedisManager from "../../../common/dao/redis/lib/redisManager";
import langsrv = require('../../../services/common/langsrv');
import landMgr from '../lib/ldMgr';



function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = ldMgr.searchRoom(sceneId, roomId);

    if (!roomInfo) {
        return { err: "斗地主房间不存在" };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "未在房间中找到玩家", uid: uid, players: roomInfo.players };
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
     * 加载完成
     * @route: LuckyDice.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        if (playerInfo.status == "NONE") {
            playerInfo.status = "WAIT";
            const opts = {
                roomId: roomInfo.roomId,
                player: playerInfo.strip(),
            }
            roomInfo.channelIsPlayer('ld.onEntry', opts);
        }
        roomInfo.wait(playerInfo);
        const opts: ld_mainHandler_loaded = {
            code: 200,
            room: {
                nid: roomInfo.nid,
                sceneId: roomInfo.sceneId,
                roomId: roomInfo.roomId,
                roundId: roomInfo.roundId,
                waitTime: roomInfo.getWaitTime(),
                players: roomInfo.players.map(pl => pl && pl.strip()),
                status: roomInfo.status,
                lowBet: roomInfo.lowBet
            },

        }
        // 返回给客户端
        return opts;
    };

    /**
     * 保留
     * @param: {dices:number[] }
     * @return:{ code: 200 }
     * @route LuckyDice.mainHandler.Keep
     */
    async Keep(msg: { dices: number[] }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        if (!msg.dices || Object.prototype.toString.call(msg.dices) != '[object Array]' ||
            !utils.isContain(playerInfo.cards, msg.dices)) {
            return { code: 500, data: msg.dices, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) }
        }
        //不该你操作
        if (playerInfo.state == "PS_NONE") {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) }
        }
        playerInfo.handler_Keep(roomInfo, msg.dices);
        return { code: 200 };
    }
}