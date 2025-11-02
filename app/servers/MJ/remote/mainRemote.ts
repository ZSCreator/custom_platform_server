import { Application, BackendSession, pinus, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { mjRoomManger } from '../lib/mjGameManger';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import langsrv = require('../../../services/common/langsrv');
const log_logger = getLogger('server_out', __filename);
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";

// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        MJ: {
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
    logger: Logger;
    roomManager: mjRoomManger;
    constructor(app: Application) {
        this.app = app;
        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }
    /**
 * 进入选场界面 订阅推送和锁定租户标识的房间数据
 */
    public async entryScenes(msg: { player }) {
        try {
            this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);
            return { code: 200, data: "" };
        } catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    /**
     * 进入
     */
    public async entry({ player, nid, roomId, sceneId }) {
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            // 如果未找到房间返回失败
            if (!room) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            const result = room.addPlayerInRoom(player);

            if (!result) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) }
            }
            // 记录玩家所在房间位置
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);

            return { code: 200, roomId: room.roomId };
        } catch (error) {
            console.error('entry.mj==>', error);
            return { code: 500, msg: '创建房间失败' };
        }
    };

    /**
     * 退出
     */
    async exit({ nid, sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }
        // 游戏是否开始
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (playerInfo) {
            if (roomInfo.status == 'INGAME') {
                roomInfo.leave(playerInfo, true);
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
            }
            roomInfo.leave(playerInfo, false);
        }
        return { code: 200, msg: '' };
    };

    /**
     * 离线 - 直接强行离开
     */
    public async leave({ uid, sceneId, roomId, group_id, lineCode }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `not find roomCode:${roomId}` };
            }
            const playerInfo = roomInfo ? roomInfo.getPlayer(uid) : null;
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
                return { code: 200, msg: '未找到玩家' };
            }
            if (roomInfo.status == "INGAME" || roomInfo.status == "END") {
                roomInfo.leave(playerInfo, true);
                return { code: 500, msg: '玩家正在游戏中' };
            }
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayer(playerInfo);
            return { code: 200, msg: '' };
        } catch (error) {
            log_logger.error(`${pinus.app.getServerId()}|${error}`);
            return { code: 500, msg: JSON.stringify(error) };
        }

    };
    /**
    * Rpc 下分查看玩家是否有下注
    */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `not find roomCode:${roomId}` };
            }
            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 }
            }
            //玩家正在组牌型中
            if (roomInfo.status == "INGAME") {
                return { code: 500 }
            } else {
                roomInfo.leave(playerInfo, false);
                return { code: 200 }
            }
        } catch (error) {
            log_logger.error('MJ|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    };
    /**掉线回来 记录 不踢人 */
    public async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new RpcApiResult();
        try {
            const seat = this.roomManager.getPlayerSeat(uid);

            // 没有位置
            if (!seat) {
                return apiResult;
            }

            // 搜索房间
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
            const player = room.getPlayer(uid);

            if (player) {
                player.onLine = true;
                apiResult.code = 200;
            } else {
                this.roomManager.removePlayerSeat(uid);
            }

            return apiResult;
        } catch (error) {
            log_logger.warn('async  leave==>', error);
            return { code: 500, msg: '' };
        }
    }
    //消息分发
    public MessageDispatch(Message_Id: number, data: any) {
        return expandingMethod.MessageDispatch(Message_Id, this.app, data)
    }
    /**
     * 退出
     */
    public async exitEx(sceneId: number, roomId: string, uid: string) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }
        // 游戏是否开始
        const currPlayer = roomInfo ? roomInfo.getPlayer(uid) : null;
        if (currPlayer) {
            if (roomInfo.status === 'INGAME') {
                return { code: 500, msg: langsrv.getlanguage(currPlayer.language, langsrv.Net_Message.id_1050) };
            }
            roomInfo.leave(currPlayer, false);
        }
        // RoomController.updateUserFromRoom(roomInfo.players, roomInfo.nid, roomInfo.roomId);
        return { code: 200, msg: '' };
    };
    /**
 * 离开游戏返回大厅
 * @param player
 */
    leaveGameAndBackToHall(player: { group_id: string, lineCode: string, uid: string }) {
        this.roomManager.removePlayer(player as PlayerInfo);
        return { code: 200 };
    }
}