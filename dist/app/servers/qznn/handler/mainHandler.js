"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const qznnMgr_1 = require("../lib/qznnMgr");
const sessionService = require("../../../services/sessionService");
const pinus_1 = require("pinus");
const qznnErrorLogger = (0, pinus_1.getLogger)('server_out', __filename);
const langsrv = require("../../../services/common/langsrv");
const qznnConst = require("../lib/qznnConst");
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
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 500, error: err };
            }
            if (playerInfo.status === 'NONE') {
                playerInfo.status = 'WAIT';
                setTimeout(() => {
                    roomInfo.channelIsPlayer('qz_onEntry', {
                        player: playerInfo.strip(roomInfo),
                        status: roomInfo.status,
                        waitTime: roomInfo.getWaitTime()
                    });
                }, 500);
            }
            setTimeout(() => {
                roomInfo.wait(playerInfo);
            }, 500);
            let opts = {
                code: 200,
                room: roomInfo.wrapGameData(),
                autoStartTime: roomInfo.getAutoStartTime(),
                onLine: playerInfo.onLine,
                waitTime: roomInfo.getWaitTime()
            };
            return opts;
        }
        catch (error) {
            qznnErrorLogger.error('qznn.mainHandler.loaded==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
        }
    }
    async robzhuang(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                return { code: 500, error: err };
            }
            if (!qznnConst.robzhuang_arr.includes(msg.mul)) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
            }
            if (roomInfo.status !== 'ROBZHUANG') {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            if (msg.mul != 0 && playerInfo.gold < roomInfo.entryCond) {
                return { code: 500, error: '持有金币低于入场限制,不能抢庄' };
            }
            if (roomInfo.robzhuangs.find(m => m.uid === playerInfo.uid)) {
                return { code: 200 };
            }
            roomInfo.robzhuangOpt(playerInfo, msg.mul);
            return { code: 200 };
        }
        catch (error) {
            qznnErrorLogger.error('qznn.mainHandler.robzhuang==>', error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async bet(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 500, error: err };
        }
        if (!qznnConst.xj_bet_arr.includes(msg.betNum)) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
        }
        if (roomInfo.status !== 'READYBET' || playerInfo.status != `GAME`) {
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
        }
        if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
        }
        if (playerInfo.betNum !== 0) {
            return { code: 200 };
        }
        if (msg.betNum === -1) {
            if (playerInfo.pushbet === 0) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
            }
            msg.betNum = playerInfo.pushbet;
            playerInfo.pushbet = -1;
        }
        await roomInfo.betOpt(playerInfo, msg.betNum);
        return { code: 200 };
    }
}
exports.MainHandler = MainHandler;
function check(sceneId, roomId, uid) {
    const roomInfo = qznnMgr_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: '抢庄牛牛房间不存在' };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: '该局已结束' };
    }
    playerInfo.update_time();
    return { roomInfo: roomInfo, playerInfo };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5uL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNENBQXFDO0FBQ3JDLG1FQUFvRTtBQUNwRSxpQ0FBa0M7QUFDbEMsTUFBTSxlQUFlLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1RCw0REFBNkQ7QUFDN0QsOENBQStDO0FBRS9DLG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUV0QixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFNRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUcsRUFBRSxPQUF1QjtRQUN2QyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFJO1lBQ0YsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDaEMsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQzNCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JB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