import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import sessionService = require('../../../services/sessionService');
import * as buyuConst from '../lib/buyuConst';
import buyuMgr from '../lib/BuYuRoomManagerImpl';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');

function check(sceneId: number, roomId: string, uid: string) {
    const roomInfo = buyuMgr.searchRoom(sceneId, roomId);
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


export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }
    /**
     * 加载完成
     * @param {}
     * @route buyu.mainHandler.loaded
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {

                Logger.error(`buyu.mainHandler.loaded==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }

            // const { player, lock } = await PlayerManager.getPlayer({ uid }, false);

            let local_time = new Date().getTime();
            roomInfo.active_fish_trace.forEach(m => m.aliveTime = local_time - m.create_time);
            let ret = {
                code: 200,
                room: roomInfo.players.map(pl => pl && pl.strip()),
                pl: playerInfo.strip(),
                active_fish_trace: roomInfo.active_fish_trace,
                room_info: roomInfo.strip(),
                Bullet_lsit: buyuConst.Bullet_lsit
            }
            return ret;
        } catch (error) {
            Logger.error('buyu.mainHandler.loaded==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 开火
     * @param { bullet_kind: number, bullet_id: number, angle: number, lock_fishid: number }
     * @route buyu.mainHandler.Fire
     */
    async Fire(msg: { bullet_kind: number, bullet_id: number, angle: number, lock_fishid: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.Fire==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            const user_fire = buyuConst.Bullet_lsit[msg.bullet_kind]
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

            let BulletInfo: buyuConst.Bullet_info = {
                kind: msg.bullet_kind, name: user_fire.name,
                speed: user_fire.speed, netRadius: user_fire.netRadius, multiple: user_fire.multiple
            };
            BulletInfo.angle = msg.angle;
            BulletInfo.lock_fishid = msg.lock_fishid;
            BulletInfo.Bullet_id = msg.bullet_id;// currPlayer.new_bullet_id();
            playerInfo.BulletInfoList.push(BulletInfo);
            roomInfo.channelIsPlayer("on_S_USER_FIRE", { pl: playerInfo.strip(), BulletInfo, angle: msg.angle });
            return { code: 200, pl: { gold: playerInfo.gold }, BulletInfo };
        } catch (error) {
            Logger.error('buyu.mainHandler.Fire==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 改变炮台等级
     * @param { bullet_kind: number }
     * @route buyu.mainHandler.change_bullet
     */
    async change_bullet(msg: { bullet_kind: number }, session: BackendSession) {
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
        } catch (error) {
            Logger.error('buyu.mainHandler.change_bullet==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
    /**
     * 击中鱼
     * @param { fish_id: number, bullet_id: number, fish_kind: number, fish_id_arr: number[] }
     * @route buyu.mainHandler.HIT_FISH
     */
    async HIT_FISH(msg: { fish_id: number, bullet_id: number, fish_kind: number, fish_id_arr: number[] }, session: BackendSession) {
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
            /**扣钱 */
            let bet = bullet_info.multiple * roomInfo.bullet_value
            let main_fish_info = roomInfo.GetFishTraceInfo(msg.fish_id, msg.fish_kind);
            if (main_fish_info == null) {
                roomInfo.dell_Bullet(playerInfo, msg.bullet_id);
                playerInfo.gold += bet;
                return { code: 500, msg: `fish_trace_info:${msg.fish_id} not find|${msg.bullet_id}` };
            }

            /**places */
            let fish_id_arr: { fish_id: number, kind: number, win: number }[] = [];
            /**总赢钱 */
            let total_win = main_fish_info.multiple * bet;
            /**鱼倍数 */
            let total_fish_multiple = main_fish_info.multiple;

            //20(闪电鱼：击杀后把周围鱼 击杀)，places:[1] (组合鱼 只要 一条鱼 类型 1~10 随机)
            //23(大闹天空: 击杀同类型鱼)，places:[1] (组合鱼 只要 一条鱼 类型 1~10 随机)
            //25一箭双雕(组合鱼 只要 俩条鱼 类型 1~10 随机)
            //26一箭三雕 (组合鱼 只要 三条鱼 类型 1~10 随机)
            //34万佛朝宗 ,全屏击杀
            if (main_fish_info.kind == 20 ||
                main_fish_info.kind == 23 ||
                main_fish_info.kind == 25 ||
                main_fish_info.kind == 26 ||
                main_fish_info.kind == 33 ||
                main_fish_info.kind == 34) {
                let fish_List: buyuConst.Fish_info[] = [];
                if (main_fish_info.kind == 20) {
                    fish_List = roomInfo.get_multiple_fish(msg.fish_id_arr, 10);
                }
                else if (main_fish_info.kind == 34)
                    fish_List = roomInfo.get_multiple_fish(msg.fish_id_arr, 35);
                else if (main_fish_info.kind == 23) {
                    fish_List = roomInfo.get_same_kind(main_fish_info.fish_id, msg.fish_id_arr, main_fish_info.kind);
                    // Logger.warn(`大闹天宫|${main_fish_info.fish_id}|${main_fish_info.kind}|${msg.fish_id_arr.length}|${fish_List.length}`);
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
            /** 27 28 29 小范围爆炸 大范围爆炸 全屏冰冻*/
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

            /**鱼倍数=实时计算当前屏幕内可杀死的所有鱼的和值 */
            /**玩家赢取 */
            // let win = 0;
            let rate = roomInfo.controlLogic.runControl(playerInfo, total_win, total_fish_multiple);
            // rate = 0.5;//test
            let less = Math.random();

            /**rpc过程 */
            main_fish_info = roomInfo.GetFishTraceInfo(msg.fish_id, msg.fish_kind);
            if (main_fish_info == null && roomInfo.yuzhen_run == false) {
                roomInfo.dell_Bullet(playerInfo, msg.bullet_id);
                playerInfo.gold += bet;
                return { code: 500, error: `fish_trace_info:${msg.fish_id} not find|${msg.bullet_id}` };
            }
            // console.warn(`捕鱼 最终结果: 最总胜率->${rate},随机值->${less},鱼倍数->${total_fish_multiple}`);
            if (less < rate) {
                playerInfo.addHit_fishs(roomInfo, main_fish_info, bullet_info.multiple);
                // win = total_win;
                playerInfo.profit += total_win;
                playerInfo.gold += total_win;


                for (const fish_id of fish_id_arr) {
                    const fish_info = roomInfo.GetFishTraceInfo(fish_id.fish_id, fish_id.kind);
                    playerInfo.addHit_fishs(roomInfo, fish_info, bullet_info.multiple);
                    roomInfo.dell_fish_one(fish_id.fish_id);
                }
                roomInfo.dell_fish_one(msg.fish_id);
                // console.info(`deal ${msg.fish_id}`)
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
        } catch (error) {
            Logger.error('buyu.mainHandler.HIT_FISH==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }

    /**
     * 销毁废弹
     * 因为前端发送中鱼请求的时候可能没有发送子弹id，这时候未销毁的子弹就成了废弹一直积压在弹舱里，所以要由前端对获取到的废弹id进行销毁
     * @param number
     * @param session
     * @route buyu.mainHandler.destructionOfBullet
     */
    async destructionOfBullet({ }, session: BackendSession) {
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
        // 过滤掉废弹
        playerInfo.BulletInfoList = [];
        return { code: 200, gold: playerInfo.gold };
    }
    /**锁定鱼
     * @param { lock_fishid: number }
     * @route buyu.mainHandler.lock_fishid
     */
    async lock_fishid(msg: { lock_fishid: number }, session: BackendSession) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
        try {
            if (err) {
                Logger.error(`buyu.mainHandler.lock_fishid==>err:${err}|`);
                return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
            }
            roomInfo.channelIsPlayer("on_lock_fishid", { pl: { seat: playerInfo.seat }, lock_fishid: msg.lock_fishid });
            return { code: 200 };
        } catch (error) {
            Logger.error('buyu.mainHandler.on_lock_fishid==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
        }
    }
}