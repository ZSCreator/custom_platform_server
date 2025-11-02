"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const sessionService = require("../../../services/sessionService");
const buyuConst = require("../lib/buyuConst");
const BuYuRoomManagerImpl_1 = require("../lib/BuYuRoomManagerImpl");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const langsrv = require("../../../services/common/langsrv");
function check(sceneId, roomId, uid) {
    const roomInfo = BuYuRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { err: `捕鱼 房间不存在:${roomId}` };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { err: `捕鱼 玩家不存在${roomId}|${uid}` };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
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
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            let local_time = new Date().getTime();
            roomInfo.active_fish_trace.forEach(m => m.aliveTime = local_time - m.create_time);
            let ret = {
                code: 200,
                room: roomInfo.players.map(pl => pl && pl.strip()),
                pl: playerInfo.strip(),
                active_fish_trace: roomInfo.active_fish_trace,
                room_info: roomInfo.strip(),
                Bullet_lsit: buyuConst.Bullet_lsit
            };
            return ret;
        }
        catch (error) {
            Logger.error('buyu.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async Fire(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.Fire==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            const user_fire = buyuConst.Bullet_lsit[msg.bullet_kind];
            if (!user_fire) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            if (playerInfo.gold < user_fire.multiple * roomInfo.bullet_value) {
                if (playerInfo.BulletInfoList.length == 0) {
                    return { code: 501, msg: "gold not enough" };
                }
                return { code: 500, msg: "gold not enough" };
            }
            let bet = user_fire.multiple * roomInfo.bullet_value;
            playerInfo.gold -= bet;
            if (playerInfo.BulletInfoList.length > buyuConst.MAX_BULLET_COUNT) {
                let bulletinfo = playerInfo.BulletInfoList.shift();
                playerInfo.gold += bulletinfo.multiple * roomInfo.bullet_value;
            }
            let BulletInfo = {
                kind: msg.bullet_kind, name: user_fire.name,
                speed: user_fire.speed, netRadius: user_fire.netRadius, multiple: user_fire.multiple
            };
            BulletInfo.angle = msg.angle;
            BulletInfo.lock_fishid = msg.lock_fishid;
            BulletInfo.Bullet_id = msg.bullet_id;
            playerInfo.BulletInfoList.push(BulletInfo);
            roomInfo.channelIsPlayer("on_S_USER_FIRE", { pl: playerInfo.strip(), BulletInfo, angle: msg.angle });
            return { code: 200, pl: { gold: playerInfo.gold }, BulletInfo };
        }
        catch (error) {
            Logger.error('buyu.mainHandler.Fire==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async change_bullet(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.change_bullet==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (msg.bullet_kind > buyuConst.Bullet_lsit.length - 1 || msg.bullet_kind < 0) {
                return { code: 500, error: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
            }
            playerInfo.bullet_kind = msg.bullet_kind;
            roomInfo.channelIsPlayer("on_S_USER_change_bullet", { pl: playerInfo.strip(), bullet_kind: msg.bullet_kind });
            return { code: 200, bullet_kind: msg.bullet_kind };
        }
        catch (error) {
            Logger.error('buyu.mainHandler.change_bullet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async HIT_FISH(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.HIT_FISH==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            if (!msg.fish_id_arr) {
                msg.fish_id_arr = [];
            }
            let bullet_info = playerInfo.GetBulletInfo(msg.bullet_id);
            if (bullet_info == null) {
                roomInfo.dell_Bullet(playerInfo, msg.bullet_id);
                roomInfo.channelIsPlayer("on_S_HIT_FISH", { pl: playerInfo.strip(), fish_id: msg.fish_id, bullet_id: msg.bullet_id, win: 0 });
                return { code: 200, pl: playerInfo.strip(), win: 0, fish_id_arr: 0 };
            }
            let bet = bullet_info.multiple * roomInfo.bullet_value;
            let main_fish_info = roomInfo.GetFishTraceInfo(msg.fish_id, msg.fish_kind);
            if (main_fish_info == null) {
                roomInfo.dell_Bullet(playerInfo, msg.bullet_id);
                playerInfo.gold += bet;
                return { code: 500, msg: `fish_trace_info:${msg.fish_id} not find|${msg.bullet_id}` };
            }
            let fish_id_arr = [];
            let total_win = main_fish_info.multiple * bet;
            let total_fish_multiple = main_fish_info.multiple;
            if (main_fish_info.kind == 20 ||
                main_fish_info.kind == 23 ||
                main_fish_info.kind == 25 ||
                main_fish_info.kind == 26 ||
                main_fish_info.kind == 33 ||
                main_fish_info.kind == 34) {
                let fish_List = [];
                if (main_fish_info.kind == 20) {
                    fish_List = roomInfo.get_multiple_fish(msg.fish_id_arr, 10);
                }
                else if (main_fish_info.kind == 34)
                    fish_List = roomInfo.get_multiple_fish(msg.fish_id_arr, 35);
                else if (main_fish_info.kind == 23) {
                    fish_List = roomInfo.get_same_kind(main_fish_info.fish_id, msg.fish_id_arr, main_fish_info.kind);
                }
                else
                    fish_List = roomInfo.get_same_places_kind(main_fish_info.fish_id, msg.fish_id_arr, main_fish_info.places);
                for (const fish_info of fish_List) {
                    let win = fish_info.multiple * bet;
                    total_win += win;
                    total_fish_multiple += fish_info.multiple;
                    fish_id_arr.push({ fish_id: fish_info.fish_id, kind: fish_info.kind, win: win });
                }
            }
            if (main_fish_info.kind == 27 || main_fish_info.kind == 28 || main_fish_info.kind == 29) {
                if (main_fish_info.kind == 29) {
                    for (const fish_trace of roomInfo.active_fish_trace) {
                        fish_trace.aliveTime += 10 * 1000;
                    }
                    roomInfo.yuzhen_run = true;
                    setTimeout(() => {
                        roomInfo.yuzhen_run = false;
                    }, 10 * 1000);
                }
                if (main_fish_info.kind == 27 || main_fish_info.kind == 28) {
                    let fish_List = roomInfo.get_multiple_fish(msg.fish_id_arr, 30);
                    for (const fish_info of fish_List) {
                        if (main_fish_info.kind == 27) {
                            if (fish_id_arr.length > fish_List.length / 2)
                                continue;
                        }
                        let win = fish_info.multiple * bet;
                        total_win += win;
                        total_fish_multiple += fish_info.multiple;
                        fish_id_arr.push({ fish_id: fish_info.fish_id, kind: fish_info.kind, win: win });
                    }
                }
            }
            let rate = roomInfo.controlLogic.runControl(playerInfo, total_win, total_fish_multiple);
            let less = Math.random();
            main_fish_info = roomInfo.GetFishTraceInfo(msg.fish_id, msg.fish_kind);
            if (main_fish_info == null && roomInfo.yuzhen_run == false) {
                roomInfo.dell_Bullet(playerInfo, msg.bullet_id);
                playerInfo.gold += bet;
                return { code: 500, error: `fish_trace_info:${msg.fish_id} not find|${msg.bullet_id}` };
            }
            if (less < rate) {
                playerInfo.addHit_fishs(roomInfo, main_fish_info, bullet_info.multiple);
                playerInfo.profit += total_win;
                playerInfo.gold += total_win;
                for (const fish_id of fish_id_arr) {
                    const fish_info = roomInfo.GetFishTraceInfo(fish_id.fish_id, fish_id.kind);
                    playerInfo.addHit_fishs(roomInfo, fish_info, bullet_info.multiple);
                    roomInfo.dell_fish_one(fish_id.fish_id);
                }
                roomInfo.dell_fish_one(msg.fish_id);
                roomInfo.channelIsPlayer("on_S_HIT_FISH", {
                    pl: { seat: playerInfo.seat, uid: playerInfo.uid, gold: playerInfo.gold },
                    fish_id: msg.fish_id, fish_kind: main_fish_info.kind, bullet_id: msg.bullet_id, win: total_win, fish_id_arr
                });
            }
            playerInfo.bet += bet;
            playerInfo.record_history.Fire_num++;
            if (playerInfo.record_history.Fire_num >= 100) {
                playerInfo.settlement(roomInfo);
            }
            roomInfo.dell_Bullet(playerInfo, msg.bullet_id, msg.fish_id);
            return { code: 200, pl: playerInfo.strip(), win: total_win, fish_id_arr };
        }
        catch (error) {
            Logger.error('buyu.mainHandler.HIT_FISH==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    async destructionOfBullet({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        if (err) {
            Logger.error(`buyu.mainHandler.destructionOfBullet==>err:${err}|`);
            return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
        }
        for (const user_fire of playerInfo.BulletInfoList) {
            let bet = user_fire.multiple * roomInfo.bullet_value;
            playerInfo.gold += bet;
        }
        playerInfo.BulletInfoList = [];
        return { code: 200, gold: playerInfo.gold };
    }
    async lock_fishid(msg, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.lock_fishid==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.channelIsPlayer("on_lock_fishid", { pl: { seat: playerInfo.seat }, lock_fishid: msg.lock_fishid });
            return { code: 200 };
        }
        catch (error) {
            Logger.error('buyu.mainHandler.on_lock_fishid==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9idXl1L2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUVBQW9FO0FBQ3BFLDhDQUE4QztBQUM5QyxvRUFBaUQ7QUFFakQsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsNERBQTZEO0FBRTdELFNBQVMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsR0FBVztJQUN2RCxNQUFNLFFBQVEsR0FBRyw2QkFBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxNQUFNLEVBQUUsRUFBRSxDQUFDO0tBQ3hDO0lBQ0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLE1BQU0sSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0tBQzlDO0lBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUdELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFDRixNQUFhLFdBQVc7SUFDcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFHLEVBQUUsT0FBdUI7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