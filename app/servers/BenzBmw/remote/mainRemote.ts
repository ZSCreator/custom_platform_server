import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { benzRoomManger } from '../lib/benzRoomMgr';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import langsrv = require('../../../services/common/langsrv');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        BenzBmw: {
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
    roomManager: benzRoomManger;
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
            // msg.player.lineCode = msg.player.uid;
            const group = this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);

            const rooms = group.getRooms();
            let data = rooms.map(roomInfo => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        status: roomInfo.status,
                        countdown: roomInfo.countdown,
                        lotterys: roomInfo.lotterys,
                        // regions,
                        // historys,
                        // players: players.map(p => p.result()),
                        // zhuangInfo: zhuang ? { uid: zhuang.uid, gold: zhuang.gold } : { uid: null }
                    },
                    record_historys: roomInfo.record_historys
                };
            });
            return { code: 200, data };
        } catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    /**
     * 进入
     */
    public async entry({ player, sceneId, roomId}) {
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
            this.logger.error('BenzBmw|public async entryttz==>', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    };

    /**退出游戏 */
    async exit({sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (!playerInfo) {
            this.logger.warn(`BenzBmw|exit|玩家：${player.uid}玩家不存在`);
            return { code: 200, msg: `BenzBmw|玩家：${player.uid}玩家不存在` };
        }
        if (playerInfo && playerInfo.bet > 0) {//您有下注，请等待这局游戏结束
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
        }

        roomInfo.leave(playerInfo, false);
        this.roomManager.removePlayerSeat(player.uid);
        this.roomManager.playerAddToChannel(player);
        return { code: 200, msg: '' }
    };

    // 强行退出游戏 or 掉线
    public async leave({ uid, sceneId, roomId }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }

        const playerInfo = roomInfo.getPlayer(uid);
        if (!playerInfo) {
            return { code: 200, msg: '未找到玩家' }
        }
        if (playerInfo.bet > 0) {
            roomInfo.leave(playerInfo, true);
            return { code: 500, msg: '玩家有押注' };
        }
        roomInfo.leave(playerInfo, false);
        this.roomManager.removePlayer(playerInfo);
        this.roomManager.removePlayerSeat(uid);
        return { code: 200, msg: '' }
    };
    /**
    * Rpc 下分查看玩家是否有下注
    */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 }
            }
            //玩家正在组牌型中
            if (playerInfo.bet > 0) {
                return { code: 500 }
            } else {
                playerInfo.gold = 0;
                return { code: 200 }
            }
        } catch (error) {
            this.logger.error('BenzBmw|async  rpcLowerPlayer==>', error);
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
            this.logger.warn('async  leave==>', error);
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