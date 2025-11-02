'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const mjGameManger_1 = require("../lib/mjGameManger");
const sessionService = require("../../../services/sessionService");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const mjConst_1 = require("../lib/mjConst");
function check(sceneId, roomId, uid) {
    const roomInfo = mjGameManger_1.default.searchRoom(sceneId, roomId);
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
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, msg: err };
            }
            setTimeout(() => {
                if (playerInfo.status == "NONE") {
                    let opts = {
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
                    };
                    roomInfo.channelIsPlayer('MJ_onEntry', opts);
                    playerInfo.status = "PS_READY";
                    roomInfo.wait();
                }
            }, 100);
            let opts = {
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
            };
            return opts;
        }
        catch (error) {
            console.error(`MJ.mainHandler.loaded:${error}`);
            return { code: 500, msg: error };
        }
    }
    async majiang_oper_c(msg, session) {
        try {
            const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
            const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
            if (err) {
                return { code: 501, error: err };
            }
            if (msg.oper_type == mjConst_1.Player_Oper.PO_READY && roomInfo.status == "INGAME") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (msg.oper_type > mjConst_1.Player_Oper.PO_READY && roomInfo.status != "INGAME") {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            return playerInfo.majiang_oper_c(msg.oper_type, msg.cmsg, roomInfo);
        }
        catch (error) {
            console.warn(`MJ.mainHandler.ready:${error}`);
            return { code: 500, error: error };
        }
    }
    async test(msg, session) {
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
        }
        catch (error) {
            console.warn(`MJ.mainHandler.test:${error}`);
            return { code: 500, error: error };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9NSi9oYW5kbGVyL21haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0RBQTZDO0FBQzdDLG1FQUFvRTtBQUNwRSw0REFBNkQ7QUFDN0QsK0NBQXlDO0FBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFdkQsNENBQTBEO0FBRTFELFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVztJQUN2RCxNQUFNLFFBQVEsR0FBRyxzQkFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxHQUFHLEVBQUUsVUFBVSxNQUFNLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUM3QztJQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNiLE9BQU8sRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2RTtJQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUNoRCxDQUFDO0FBRUQsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUNGLE1BQWEsV0FBVztJQUNwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgs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