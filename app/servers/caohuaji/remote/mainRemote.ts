import {Application, BackendSession, RemoterClass, Logger, getLogger} from 'pinus';
import roomManager, {CHJRoomManagerImpl} from '../lib/CHJRoomManagerImpl';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import langsrv = require('../../../services/common/langsrv');
import {getlanguage} from "../../../services/common/langsrv";
import {PlayerInfo} from '../../../common/pojo/entity/PlayerInfo';

// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        caohuaji: {
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
    roomManager: CHJRoomManagerImpl;

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
    public async entry({player, roomId, sceneId}) {

        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            // 如果未找到房间返回失败
            if (!room) {
                return {code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012)};
            }
            const result = room.addPlayerInRoom(player);

            if (!result) {
                return {code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012)}
            }
            // 记录玩家所在房间位置
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);

            return {code: 200, roomId: room.roomId};
        } catch (error) {
            this.logger.error('public async entry==>', error);
            return {code: 500, msg: getlanguage(player.language, langsrv.Net_Message.id_6)}
        }
    };


    /**
     * 退出
     */
    async exit({roomId, player, sceneId}) {
        try {

            this.logger.info('玩家', player.uid, '离开五星宏辉', roomId);
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                return {code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}`};
            }
            const roomPlayer = room.getPlayer(player.uid);
            if (!roomPlayer) {
                this.logger.warn(`五星宏辉${roomId}房间没有这个玩家uid:${player.uid}`);
                return {code: 200, msg: ''};
            }

            // 如果有押注则不让离开
            if (roomPlayer.bet) {
                return {code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1050)};
            }
            
            room.removePlayer(player.uid, false);
            // 移除玩家位置
            this.roomManager.removePlayerSeat(player.uid);
            
            return {code: 200, msg: ''}

        } catch (error) {
            this.logger.error('public async exit==>', error);
            return {code: 200, msg: ''}
        }
    };

    /**
     * 离线 - 直接强行离开
     */
    public async leave({uid, language, roomId, sceneId}) {
        try {
            this.logger.info('玩家', uid, '五星宏辉掉线', roomId);

            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                return {code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}`};
            }

            const roomPlayer = room.getPlayer(uid);
            if (!roomPlayer) {
                this.logger.warn(`五星宏辉${roomId}房间没有这个玩家uid:${uid}`);
                return {code: 200, msg: getlanguage(language, langsrv.Net_Message.id_1009)}
            }

            this.logger.warn('五星宏辉玩家掉线 移除玩家', roomPlayer.uid);

            // 如果有押注则表示则稍后删除
            if (roomPlayer.bet > 0) {
                room.removePlayer(roomPlayer.uid, true);
                return {code: 500, msg: '玩家有押注'};
            }

            // 没有押注则立即删除 并把玩家位置放置在大厅
            room.removePlayer(roomPlayer.uid, false);
            // 移除玩家位置
            this.roomManager.removePlayerSeat(uid);

            return {code: 200, msg: ''};
        } catch (error) {
            this.logger.error('public async leave==>', error);
            return {code: 200, msg: getlanguage(language, langsrv.Net_Message.id_6)}
        }

    };

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({uid, sceneId, roomId}) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return {code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}`};
            }
            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return {code: 200}
            }
            //玩家正在组牌型中
            if (playerInfo.bet > 0) {
                return {code: 500}
            } else {
                playerInfo.gold = 0;
                return {code: 200}
            }
        } catch (error) {
            this.logger.error('caohuaji|async  rpcLowerPlayer==>', error);
            return {code: 200};
        }
    };

    /**掉线回来 记录 不踢人 */
    public async reconnectBeforeEntryRoom({uid}) {
        try {
            const seat = this.roomManager.getPlayerSeat(uid);

            // 没有位置
            if (!seat) {
                return {code: 500, msg: ''};
            }

            // 搜索房间
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);

            // 获取玩家
            const roomPlayer = room.getPlayer(uid);

            // 重置断线重连状态
            roomPlayer.onLine = true;

            return {code: 200, msg: ''};
        } catch (error) {
            this.logger.warn('async  leave==>', error);
            return {code: 500, msg: ''};
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
        return {code: 200};
    }
}