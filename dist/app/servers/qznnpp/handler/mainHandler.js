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
                        player: playerInfo.strip(),
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
            playerInfo.action_robzhuangOpt(roomInfo, msg.mul);
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
        playerInfo.action_betOpt(roomInfo, msg.betNum);
        return { code: 200 };
    }
    async pinpai(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            return { code: 500, error: err };
        }
        playerInfo.action_liangpaiOpt(roomInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5ucHAvaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw0Q0FBcUM7QUFDckMsbUVBQW9FO0FBQ3BFLGlDQUFrQztBQUNsQyxNQUFNLGVBQWUsR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzVELDREQUE2RDtBQUM3RCw4Q0FBK0M7QUFFL0MsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBRXRCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQU1ELEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRyxFQUFFLE9BQXVCO1FBQ3ZDLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLElBQUk7WUFDRixJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7YUFDbEM7WUFFRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUNoQyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDM0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtv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