import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { ErRoomManger } from '../lib/ErbaRoomMgr';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import langsrv = require('../../../services/common/langsrv');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        bairenErba: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, mainRemote>;
        };
    }
}



export default function (app: Application) {
    return new mainRemote(app);
}
//Erba
export class mainRemote {
    public app: Application;
    logger: Logger;
    roomManager: ErRoomManger;
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
            this.logger.warn('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    /**
     * 进入
     */
    public async entry({ player, sceneId, roomId, nid }) {
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
            this.logger.error('Erba|public async entryErba==>', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    };

    /**退出游戏 */
    async exit({ nid, sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (!playerInfo) {
            this.logger.warn(`Erba|玩家：${player.uid}玩家不存在`);
            return { code: 200, msg: `Erba|玩家：${player.uid}玩家不存在` };
        }
        if (playerInfo && playerInfo.status == "GAME") {//您有下注，请等待这局游戏结束
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
        }


        roomInfo.leave(playerInfo, false);
        return { code: 200, msg: '' }
    };

    // 强行退出游戏 or 掉线
    public async leave({ uid, sceneId, roomId, group_id, lineCode }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }

        const playerInfo = roomInfo.getPlayer(uid);
        if (!playerInfo) {
            this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
            return { code: 200, msg: '未找到玩家' };
        } 
        if (playerInfo.status == "GAME") {//您有下注，请等待这局游戏结束
            roomInfo.leave(playerInfo, true);
            return { code: 500 , msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
        }
        roomInfo.leave(playerInfo, false);
        this.roomManager.removePlayer(playerInfo);
        return { code: 200, msg: '' }
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
            // if (playerInfo.bet_mul > 0) {
            return { code: 500 }
            // } else {
            //     return { code: 200 }
            // }
        } catch (error) {
            this.logger.error('Erba|async  rpcLowerPlayer==>', error);
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