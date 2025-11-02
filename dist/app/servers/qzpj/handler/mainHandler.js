"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const qzpjMgr_1 = require("../lib/qzpjMgr");
const sessionService = require("../../../services/sessionService");
const pinus_1 = require("pinus");
const qzpjErrorLogger = (0, pinus_1.getLogger)('server_out', __filename);
const langsrv = require("../../../services/common/langsrv");
const qzpjConst = require("../lib/qzpjConst");
const qzpjConst_1 = require("../lib/qzpjConst");
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
        try {
            if (err) {
                return { code: 500, msg: err };
            }
            if (playerInfo.status === 'NONE') {
                playerInfo.status = 'WAIT';
                let opts = {
                    player: playerInfo.strip(),
                    status: roomInfo.status,
                };
                roomInfo.kickOutMessage(playerInfo.uid);
                roomInfo.channelIsPlayer(qzpjConst_1.route.qzpj_onEntry, opts);
                roomInfo.addMessage(playerInfo);
            }
            setTimeout(() => {
                roomInfo.wait(playerInfo);
            }, 500);
            let opts = {
                code: 200,
                room: roomInfo.wrapGameData(),
                onLine: playerInfo.onLine,
            };
            return opts;
        }
        catch (error) {
            qzpjErrorLogger.error('qzpj.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
        }
    }
    async robTheBanker(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
        try {
            if (err) {
                return { code: 500, msg: err };
            }
            if (playerInfo.gold / roomInfo.lowBet < msg.mul * 30) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (!qzpjConst.robzhuang_arr.includes(msg.mul)) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status != qzpjConst_1.RoomState.ROBZHUANG) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (msg.mul != 0 && playerInfo.gold < roomInfo.entryCond) {
                return { code: 500, msg: '持有金币低于入场限制,不能抢庄' };
            }
            if (playerInfo.robmul != -1) {
                return { code: 200 };
            }
            playerInfo.handler_robBanker(roomInfo, msg.mul);
            return { code: 200 };
        }
        catch (error) {
            qzpjErrorLogger.error('qzpj.mainHandler.robTheBanker==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async bet(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
        if (err) {
            return { code: 500, msg: err };
        }
        if (!playerInfo.bet_mul_List.includes(msg.betNum)) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
        if (roomInfo.status != qzpjConst_1.RoomState.READYBET || playerInfo.status != `GAME`) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
        }
        if (roomInfo.zhuangInfo.uid == playerInfo.uid) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
        }
        if (playerInfo.betNum != 0) {
            return { code: 200 };
        }
        playerInfo.handler_bet(roomInfo, msg.betNum);
        return { code: 200 };
    }
    async RemainCard(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
        if (err) {
            return { code: 500, msg: err };
        }
        return { code: 200, TheCards: roomInfo._cards.slice().sort((a, b) => a - b) };
    }
}
exports.MainHandler = MainHandler;
function check(sceneId, roomId, uid, language) {
    const roomInfo = qzpjMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_1004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2017) };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xenBqL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQXFDO0FBQ3JDLG1FQUFvRTtBQUNwRSxpQ0FBa0M7QUFFbEMsTUFBTSxlQUFlLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1RCw0REFBNkQ7QUFDN0QsOENBQStDO0FBQy9DLGdEQUFvRDtBQUVwRCxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFFdEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNsQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNqQixDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDdkMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0UsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVFLElBQUk7WUFDRixJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7YUFDaEM7WUFFRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUNoQyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDM0Is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