import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { BGRoomManagerImpl } from '../lib/BGRoomManager';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import langsrv = require('../../../services/common/langsrv');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';

const ErrorLogger = getLogger('server_out', __filename);

// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        BlackGame: {
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
    roomManager: BGRoomManagerImpl;
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
            ErrorLogger.error('public async entry==>', JSON.stringify(error));
            return { code: 500, msg: error.msg }
        }
    };


    /**
     * 退出
     */
    async exit({ nid, sceneId, roomId, player }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `not find roomCode:${roomId}` };
            }
            const playerInfo = roomInfo.getPlayer(player.uid);
            if (!playerInfo) {
                ErrorLogger.warn(`捕鱼${roomId}房间没有这个玩家uid:${player.uid}`);
                return { code: 200, msg: '' };
            }
            if (roomInfo.status != "INWAIT") {//您有下注，请等待这局游戏结束
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
            }

            roomInfo.leave(playerInfo, false);
            return { code: 200, msg: '' }

        } catch (error) {
            ErrorLogger.error('public async exit==>', error);
            return { code: 200, msg: '' }
        }
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
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
                return { code: 200, msg: '未找到玩家' };
            }
            roomInfo.leave(playerInfo, true);
            this.roomManager.removePlayer(playerInfo);
            return { code: 200, msg: '' };
        } catch (error) {
            ErrorLogger.error('public async leave==>', error);
            return { code: 500, msg: JSON.stringify(error) }
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
            // if (playerInfo.bet > 0) {
            return { code: 500 }
            // } else {
            //     return { code: 200 }
            // }
        } catch (error) {
            ErrorLogger.error('BlackGame|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    };
    /**掉线回来 记录 不踢人 */
    public async reconnectBeforeEntryRoom({ uid }) {
        try {
            const roomList = this.roomManager.getAllRooms();
            for (const roomInfo of roomList) {
                let playerInfo = roomInfo.players.find(pl => pl && pl.uid == uid);
                if (playerInfo) {
                    playerInfo.onLine = true;
                    return { code: 200, msg: '' };
                }
            }
        } catch (error) {
            ErrorLogger.warn('async  leave==>', error);
            return { code: 500, msg: '' };
        }
    }

    //消息分发
    public MessageDispatch(Message_Id: number, data: any) {
        return expandingMethod.MessageDispatch(Message_Id, this.app, data)
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