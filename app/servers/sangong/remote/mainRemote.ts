import { Application, BackendSession, RemoterClass, Logger } from 'pinus';
import roomManager, { sgRoomManger } from '../lib/SangongMgr';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import { getLogger } from 'pinus-logger';
import langsrv = require('../../../services/common/langsrv');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        sangong: {
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
    roomManager: sgRoomManger;
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
    // 进入匹配房间 - 这里随机给玩家随机一个房间
    async entry({ player, nid, roomId, sceneId, session }) {
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
        } catch (err) {
            this.logger.info(`sangong.Remote.entry ==> 进入游戏错误 ${err}`);
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2004) }
        }
    };

    // 退出房间
    async exit({ nid, sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (!playerInfo) {
            this.logger.info(`退出房间错误 ==> ${player || player.uid} | ${roomId} | ${sceneId} | ${roomInfo.roomId} | ${roomInfo.sceneId}`);
            return { code: 200, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_202) }
        }

        if (playerInfo.status == 'GAME') {
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2014) }
        }

        await roomInfo.exit(playerInfo, false); // 退出玩家
        // await RoomController.updateUserFromRoom(roomInfo.players, roomInfo.nid, roomInfo.roomId);
        return { code: 200, msg: '' }
    }

    // 离线 or 强行离开
    public async leave({ uid, language, sceneId, roomId, group_id, lineCode }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
                return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
            }
            if (playerInfo.status == "GAME") {
                roomInfo.exit(playerInfo, true);
                return { code: 500, msg: '玩家正在游戏中' };
            }
            roomInfo.exit(playerInfo, false);
            roomManager.removePlayer(playerInfo);
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
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 }
            }
            //玩家正在组牌型中
            // if (playerInfo.bet_mul > 0) {
            return { code: 500 }
            // } else {
            // return { code: 200 }
            // }
        } catch (error) {
            this.logger.error('sangong|async  rpcLowerPlayer==>', error);
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