import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { RummyRoomManager } from '../lib/RummyRoomManager';
import langsrv = require('../../../services/common/langsrv');
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { PlayerInfo } from "../../../common/pojo/entity/PlayerInfo";
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        Rummy: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, mainRemote>;
        };
    }
}

export default function (app: Application) {
    return new mainRemote(app);
}

export class mainRemote {
    public app: Application;
    roomManager: RummyRoomManager;
    logger: Logger;
    constructor(app: Application) {
        this.app = app;
        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }

    /**
     * 进入选场界面 订阅推送和锁定租户标识的房间数据
     */
    public async entryScenes({ player }) {
        try {
            let data = null;
            const group = this.roomManager.getTenantScene(player);
            const rooms = group.getRooms();
            data = rooms.map(r => {
                return {
                    sceneId: r.sceneId,
                    roomId: r.roomId,
                    status: r.status,
                    countdown: r.countdown,
                }
            })
            this.roomManager.addPlayer(player);
            return { code: 200, data };
        } catch (error) {
            this.logger.warn('entryScenes====鱼虾蟹', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    /**
     * 进入
     */
    async entry({ player, nid, roomId, sceneId }) {

        this.logger.debug(`拉米|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            if (!room || !(this.roomManager.checkPermissions(player, room.roomId))) {
                return { code: 500, msg: getlanguage(player.language, Net_Message.id_6) };
            }
            room.addPlayerInRoom(player);

            // 记录玩家所在房间位置
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);

            if (!room.status)
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) }
            if (room.status) {

                return { code: 200, roomId: room.roomId };
            }
            return { code: 200, msg: '', roomId: room.roomId };
        } catch (error) {
            this.logger.warn('async  entry==>拉米', error);
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1737) };
        }
    };

    /**
     * 退出 id_1050
     */
    async exit({ nid, sceneId, roomId, player }) {
        try {
            // 搜索房间
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            let apiResult = new RpcApiResult();

            if (!roomInfo) {
                apiResult.code = 200;
                this.logger.error(`鱼虾蟹|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            // 该局是否已完成
            if (roomInfo.status != "INWAIT") {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1050) }
            }
            const playerInfo = roomInfo.getPlayer(player.uid);
            if (!playerInfo) {
                this.logger.info(`Rummy|${roomId}房间没有这个玩家uid:${player.uid}`);
                return { code: 200, msg: '' };
            }
            //如果玩家退出有戏那么，就让机器人也一起退出
            await roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayerSeat(player.uid);

            return { code: 200, msg: '' }
        } catch (error) {
            this.logger.error('Rummy|async  exit==>', error);
            return { code: 200, msg: '' };
        }
    };

    /**
     * 离线 - 直接强行离开
     */
    public async leave({ uid, language, sceneId, roomId, group_id, lineCode }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
                return { code: 200, msg: '未找到玩家' }
            }
            if (roomInfo.status == "INWAIT") {
                await roomInfo.leave(playerInfo, false);

                this.roomManager.removePlayer(playerInfo);

                return { code: 200 }
            } else {
                roomInfo && roomInfo.leave(playerInfo, true);
                return { code: 500, msg: '玩家正在游戏中' };
            }
        } catch (error) {
            this.logger.error('Rummy|async  leave==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
        }
    };

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            //房间不存在可以进行下分
            if (!roomInfo) {
                return { code: 200 };
            }
            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 }
            }
            //玩家正在组牌型中
            if (roomInfo.status == 'PLAY_CARD' || roomInfo.status == 'FINISH_CARD') {
                return { code: 500 }
            } else {
                return { code: 200 }
            }
        } catch (error) {
            this.logger.error('Rummy|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    };


    /**
     * 掉线回来
     * @param uid
     */
    public async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new RpcApiResult();

        try { // 获取位置
            const seat = this.roomManager.getPlayerSeat(uid);

            // 没有位置
            if (!seat) {
                return apiResult;
            }

            // 搜索房间
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);

            // 获取玩家
            const roomPlayer = room.getPlayer(uid);

            // 重置断线重连状态
            roomPlayer.resetOnlineState();

            apiResult.code = 200;

            return apiResult;
        } catch (e) {
            this.logger.error(`拉米|reconnectBeforeEntryRoom 断线重连| 玩家:${uid}|出错:${e}`);
            return apiResult;
        }
    }

    /**
     * 离开游戏返回大厅
     * @param player
     */
    leaveGameAndBackToHall(player: { group_id: string, lineCode: string, uid: string }) {
        this.roomManager.removePlayer(player as PlayerInfo);
        return { code: 200 };
    }
}