import { Application, BackendSession, RemoterClass, Logger } from 'pinus';
import roomManager, { WJRoomManger } from '../lib/WanrenMgr';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import { getLogger } from 'pinus-logger';
import langsrv = require('../../../services/common/langsrv');
const bairenLogger = getLogger('server_out', __filename);
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        WanRenJH: {
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
    roomManager: WJRoomManger;
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
            const group = this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);

            const rooms = group.getRooms();
            let data = rooms.map(roomInfo => {
                const {
                    sceneId,
                    roomId,
                    status,
                    countdown,
                    pais,
                    regions,
                    bairenHistory,
                    // history,
                    // players,
                    // isShuffle,
                    // allPoker
                } = roomInfo;
                const zhuang = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
                const res = zhuang ? { uid: zhuang.uid, gold: zhuang.gold } : { uid: null };

                return {
                    sceneId,
                    roomId,
                    history: {
                        sceneId,
                        roomId,
                        status,
                        countdown,
                        paiCount: pais.length,
                        regions,
                        // historys,
                        // players: players.map(p => p.result()),
                        zhuangInfo: res
                    },
                    bairenHistory
                };
            });
            return { code: 200, data };
        } catch (error) {
            bairenLogger.error('entryScenes', error);
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
            this.roomManager.playerLeaveChannel(player);
            return { code: 200, roomId: room.roomId };
        } catch (error) {
            console.warn('entrybairen==>', error);
            return { code: 500, msg: '创建房间失败' };
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
            // 是否庄家
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid === player.uid) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1051) };
            }

            // 是否有下注
            const playerInfo = roomInfo.getPlayer(player.uid);
            if (!playerInfo) {
                return { code: 200, msg: '' }
            }
            if (playerInfo.hasBet()) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
            }
            // RoomController.updateUserFromRoom(roomInfo.players, roomInfo.nid, roomInfo.roomId);
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayerSeat(player.uid);
            this.roomManager.playerAddToChannel(player);
            return { code: 200, msg: '' }
        } catch (error) {
            return { code: 500, msg: error };
        }
    };

    /**
     * 离线 - 直接强行离开
     */
    public async leave({ uid, language, nid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }

            let playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200, msg: '未找到玩家' };
            }
            if (playerInfo.bet > 0 ||
                (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == playerInfo.uid)) {
                roomInfo.leave(playerInfo, true);
                return { code: 500, msg: '玩家有押注' };
            }
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayer(playerInfo);
            this.roomManager.removePlayerSeat(uid);
            return { code: 200, msg: '' };
        } catch (error) {
            return { code: 500, msg: JSON.stringify(error) };
        }
    }
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
            if (playerInfo.bet > 0 || roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == playerInfo.uid) {
                return { code: 500 };
            } else {
                playerInfo.gold = 0;
                return { code: 200 };
            }
        } catch (error) {
            bairenLogger.error('WanRenJH|async  rpcLowerPlayer==>', error);
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
            bairenLogger.warn('async  leave==>', error);
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