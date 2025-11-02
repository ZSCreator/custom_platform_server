'use strict'
import { Application, BackendSession } from 'pinus';
import DiceRoomMgr from '../lib/DiceRoomMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from 'pinus-logger';
const log_logger = getLogger('server_out', __filename);


function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = DiceRoomMgr.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到|DicePoker|房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在|DicePoker|房间${roomId}中找到玩家${uid}` };
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
     * @route DicePoker.mainHandler.loaded
     *  */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            log_logger.warn("DicePoker.mainHandler.loaded", error);
            return { code: 501, msg: error };
        }
        if (playerInfo.status == "NONE") {
            playerInfo.status = "WAIT";
            roomInfo.addMessage(playerInfo);
            roomInfo.wait(playerInfo);
        }

        let opts = {
            code: 200,
            plys: roomInfo.players.map(pl => {
                if (pl) {
                    return {
                        seat: pl.seat,
                        uid: pl.uid,
                        headurl: pl.headurl,
                        nickname: encodeURI(pl.nickname),
                        gold: pl.gold,
                        status: pl.status,
                        profit: pl.profit,
                        subtotal: pl.subtotal,
                        totalPoint: pl.totalPoint,
                        Number_draws: pl.Number_draws,
                        Number_extra: pl.Number_extra,
                        curr_DiceList: roomInfo.curr_DiceList,
                        save_DiceList: roomInfo.save_DiceList,
                        area_DiceList: pl.area_DiceList,
                    }
                }
            }),
            roundTimes: roomInfo.roundTimes,
            roundId: roomInfo.roundId,
            lowBet: roomInfo.lowBet,
            status: roomInfo.status,
            countdown: roomInfo.countdown,
            banker: roomInfo.banker ? roomInfo.banker.seat : null,
            setSice: roomInfo.setSice,
            operseat:roomInfo.curr_doing_seat,
        };
        return opts;
    };
    /**
    * 摇
    * @route DicePoker.mainHandler.handler_Play
    */
    async handler_Play(msg: {}, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            log_logger.warn("DicePoker.mainHandler.handler_Play", error);
            return { code: 501, msg: error };
        }
        if (roomInfo.curr_doing_seat != playerInfo.seat) {
            return { code: 500, msg: "不该你操作" };
        }
        if (playerInfo.Number_draws + playerInfo.Number_extra <= 0) {
            return { code: 500, msg: "次数不够" };
        }
        if (roomInfo.save_DiceList.filter(c => c != 0).length == 5) {
            return { code: 500, msg: "最多保留4颗骰子" };
        }
        try {
            if (playerInfo.Number_draws > 0) {
                playerInfo.Number_draws--;
            } else {
                if (playerInfo.Number_extra > 0) {
                    playerInfo.Number_extra--;
                }
            }
            await playerInfo.handler_Play(roomInfo);
            return { code: 200 };
        } catch (error) {
            log_logger.warn("DicePoker.mainHandler.handler_Play", error);
            return { code: 501, msg: error };
        }
    }
    /**
     * 点击
     * @param Mod true 放入，反之 移除，Idx 数组下标
     * @route DicePoker.mainHandler.handler_Set 
     */
    async handler_Set(msg: { Mod: boolean, Idx: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            log_logger.warn("DicePoker.mainHandler.handler_Set", error);
            return { code: 501, msg: error };
        }
        if (roomInfo.curr_doing_seat != playerInfo.seat) {
            return { code: 500, msg: "不该你操作" };
        }
        if (msg.Idx < 0 || msg.Idx >= 5) {
            return { code: 500, msg: "非法操作" };
        }
        try {
            playerInfo.handler_set(roomInfo, msg.Mod, msg.Idx);
            return { code: 200 };
        } catch (error) {
            return { code: 501, msg: error };
        }
    }

    /**
     * 提交
     * @param {Idx:number}
     * @route DicePoker.mainHandler.handler_submit 
     */
    async handler_submit(msg: { Idx: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid);

        if (error) {
            log_logger.warn("DicePoker.mainHandler.handler_submit", error);
            return { code: 501, msg: error };
        }
        if (roomInfo.curr_doing_seat != playerInfo.seat) {
            return { code: 500, msg: "不该你操作" };
        }
        if (playerInfo.area_DiceList[msg.Idx].submit) {
            return { code: 500, msg: "不该你操作" };
        }
        try {
            playerInfo.handler_submit(roomInfo, msg.Idx);
            return { code: 200 };
        } catch (error) {
            log_logger.warn("DicePoker.mainHandler.handler_submit", error);
            return { code: 501, msg: error };
        }
    }
}
