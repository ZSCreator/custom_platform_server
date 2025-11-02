import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { FishPrawnCrabRoomManager } from '../lib/FishPrawnCrabRoomManager';
import langsrv = require('../../../services/common/langsrv');
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { PlayerInfo } from "../../../common/pojo/entity/PlayerInfo";
// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        fishPrawnCrab: {
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
    roomManager: FishPrawnCrabRoomManager;
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
                    history: r.historys,
                }
            })
            this.roomManager.addPlayer(player);


            return { code: 200, data };
        } catch (error) {
            this.logger.error('entryScenes====鱼虾蟹', error);
            return { code: 500, msg: getlanguage(null, Net_Message.id_1213) };
        }
    }

    /**
     * 进入
     */
    async entry({ player, nid, roomId, sceneId }) {
        this.logger.debug(`鱼虾蟹|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            if (!room || !(this.roomManager.checkPermissions(player, room.roomId))) {
                return { code: 500, msg: getlanguage(player.language, Net_Message.id_6) };
            }
            room.addPlayerInRoom(player);

            // 记录玩家所在房间位置
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            // 玩家离开选场的消息通道
            this.roomManager.playerLeaveChannel(player);
            return { code: 200, msg: '', roomId: room.roomId };
        } catch (error) {
            this.logger.error('async  entry==>', error);
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1737) };
        }
    };

    /**
     * 离线 - 直接强行离开
     */
    public async leave({ uid, language, nid, sceneId, roomId }) {
        this.logger.debug(`鱼虾蟹|断线:${roomId}|场:${sceneId}|玩家:${uid}`);
        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
            }

            const playerInfo = room.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200, msg: '' }
            }

            if (playerInfo.bet == 0) {
                room.leave(playerInfo, false);
                this.roomManager.removePlayer(playerInfo);
                this.roomManager.removePlayerSeat(playerInfo.uid);
                return { code: 200 }
            }


            room.leave(playerInfo, true);
            return { code: 500 }
        } catch (error) {
            this.logger.error('鱼虾蟹|async  leave==>', error);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
        }
    };


    /**
     * 退出
     */
    async exit({ nid, sceneId, roomId, player }) {
        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);
            let apiResult = new RpcApiResult();

            if (!room) {
                apiResult.code = 200;
                this.logger.error(`鱼虾蟹|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            // 搜索房间玩家是否有押注 或者 是否为庄
            const roomPlayer = room.getPlayer(player.uid);

            if (!roomPlayer) {
                apiResult.code = 200;
                this.logger.info(`鱼虾蟹|离开房间未找到玩家: ${roomId}|场:${sceneId}|${player.uid}||${room.players.map(p => p && p.uid)}`);

                return apiResult;
            }

            if (roomPlayer.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1050) }
            }
            room.leave(roomPlayer, false)
            // 玩家加入选场的消息通道
            this.roomManager.playerAddToChannel(player);
            this.roomManager.removePlayerSeat(player.uid);

            return { code: 200, msg: '' }
        } catch (error) {
            this.logger.error('鱼虾蟹|async  exit==>', error);
            return { code: 200, msg: '' };
        }
    };

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`鱼虾蟹|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        try {
            // 搜索房间
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
            //玩家有下注返回500 ,不能进行下分
            if (playerInfo.bet !== 0) {
                return { code: 500 }
            } else {
                return { code: 200 }
            }
        } catch (error) {
            this.logger.error('鱼虾蟹|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
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