'use strict';
import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import gameManger from '../lib/mjGameManger';
import sessionService = require("../../../services/sessionService");
import langsrv = require('../../../services/common/langsrv');
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);
import mjConst = require("../lib/mjConst");
import { Player_Oper, IMJ_onEntry } from "../lib/mjConst";

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = gameManger.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: `二人麻将不存在${roomId}|${uid}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: "该局已结束，你已离开房间", uid: uid, players: roomInfo.players };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo: playerInfo };
}

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 
     * @route MJ.mainHandler.loaded 
     */
    async loaded(msg: {}, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: err };
            }
            setTimeout(() => {
                if (playerInfo.status == "NONE") {
                    // 通知其他玩家有人加入房间(不是掉线玩家进入游戏才调用)
                    let opts: IMJ_onEntry = {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        player: {
                            uid: playerInfo.uid,
                            nickname: playerInfo.nickname,
                            gold: playerInfo.gold,
                            headurl: playerInfo.headurl,
                            seat: playerInfo.seat,
                        },
                        status: roomInfo.status,
                        lowBet: roomInfo.lowBet,
                    }
                    roomInfo.channelIsPlayer('MJ_onEntry', opts);
                    playerInfo.status = "PS_READY";
                    roomInfo.wait();
                }
            }, 100);
            let opts: mjConst.MJ_mainHandler_loaded = {
                code: 200,
                uid: playerInfo.uid,
                seat: playerInfo.seat,
                roundId: roomInfo.roundId,
                players: roomInfo.players.map(pl => pl && pl.loaded_strip(playerInfo.uid)),
                roomInfo: {
                    RepertoryCard_len: roomInfo.RepertoryCard.length,
                    lowBet: roomInfo.lowBet,
                    curr_doing_seat: roomInfo.curr_doing_seat,
                    curr_majiang: roomInfo.curr_majiang,
                    status: roomInfo.status,
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    WaitTime: roomInfo.getWaitTime(),
                    mo_random: roomInfo.mo_random
                },
            }
            return opts;
        } catch (error) {
            console.error(`MJ.mainHandler.loaded:${error}`);
            return { code: 500, msg: error };
        }
    }
    /**
     * 
     * @param { oper_type: Player_Oper, cmsg: any } 
     * @route MJ.mainHandler.majiang_oper_c
     */
    async majiang_oper_c(msg: { oper_type: Player_Oper, cmsg: any }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, error: err };
            }
            if (msg.oper_type == Player_Oper.PO_READY && roomInfo.status == "INGAME") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (msg.oper_type > Player_Oper.PO_READY && roomInfo.status != "INGAME") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            return playerInfo.majiang_oper_c(msg.oper_type, msg.cmsg, roomInfo);
        } catch (error) {
            console.warn(`MJ.mainHandler.ready:${error}`);
            return { code: 500, error: error };
        }
    }
    /**
     * 
     * @param msg 
     * @route MJ.mainHandler.test
     */
    async test(msg: { mjs: number[] }, session: BackendSession) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, error: err };
            }
            if (msg.mjs.length > 13) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status == "INGAME") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            playerInfo.hand_majiang = msg.mjs;
            // if (msg.oper_type > Player_Oper.PO_READY && roomInfo.status != "INGAME") {
            //     return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            // }
            // return playerInfo.majiang_oper_c(msg.oper_type, msg.cmsg, roomInfo);
        } catch (error) {
            console.warn(`MJ.mainHandler.test:${error}`);
            return { code: 500, error: error };
        }
    }
}
