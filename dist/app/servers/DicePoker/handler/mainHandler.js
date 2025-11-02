'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const DiceRoomMgr_1 = require("../lib/DiceRoomMgr");
const sessionService = require("../../../services/sessionService");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function check(sceneId, roomId, uid) {
    const roomInfo = DiceRoomMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: `未找到|DicePoker|房间${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: `未在|DicePoker|房间${roomId}中找到玩家${uid}` };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
;
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
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
                    };
                }
            }),
            roundTimes: roomInfo.roundTimes,
            roundId: roomInfo.roundId,
            lowBet: roomInfo.lowBet,
            status: roomInfo.status,
            countdown: roomInfo.countdown,
            banker: roomInfo.banker ? roomInfo.banker.seat : null,
            setSice: roomInfo.setSice,
            operseat: roomInfo.curr_doing_seat,
        };
        return opts;
    }
    ;
    async handler_Play(msg, session) {
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
            }
            else {
                if (playerInfo.Number_extra > 0) {
                    playerInfo.Number_extra--;
                }
            }
            await playerInfo.handler_Play(roomInfo);
            return { code: 200 };
        }
        catch (error) {
            log_logger.warn("DicePoker.mainHandler.handler_Play", error);
            return { code: 501, msg: error };
        }
    }
    async handler_Set(msg, session) {
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
        }
        catch (error) {
            return { code: 501, msg: error };
        }
    }
    async handler_submit(msg, session) {
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
        }
        catch (error) {
            log_logger.warn("DicePoker.mainHandler.handler_submit", error);
            return { code: 501, msg: error };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EaWNlUG9rZXIvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUVaLG9EQUE2QztBQUM3QyxtRUFBb0U7QUFDcEUsK0NBQXlDO0FBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHdkQsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsTUFBTSxFQUFFLEVBQUUsQ0FBQztLQUNqRDtJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsa0JBQWtCLE1BQU0sUUFBUSxHQUFHLEVBQUUsRUFBRSxDQUFDO0tBQzNEO0lBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUFBLENBQUM7QUFFRixtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBQ0YsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQUlELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRyxFQUFF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