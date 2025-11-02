import { Application, BackendSession, RemoterClass, Logger } from 'pinus';
import { getLogger } from 'pinus-logger';
import { ApiResult } from '../../../common/pojo/ApiResult';
import { BlackJackState } from '../../../common/systemState/blackJack.state';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { BlackJackPlayerStatusEnum } from '../lib/enum/BlackJackPlayerStatusEnum';
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import langsrv = require('../../../services/common/langsrv');
// import { BlackJackRoomImpl } from '../lib/BlackJackRoomImpl';
// import { BlackJackDynamicRoomManager } from "../lib/BlackJackDynamicRoomManager";
import roomManager, { BlackJackTenantRoomManager } from "../lib/BlackJackTenantRoomManager";
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';

declare global {
    interface UserRpc {
        BlackJack: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, mainRemote>;
        };
    }
}

export default function (app: Application) {
    return new mainRemote(app);
}

export class mainRemote {

    private backendServerId: string;

    private app: Application;

    private logger: Logger;

    roomManager: BlackJackTenantRoomManager;

    constructor(app: Application) {
        this.app = app;

        this.logger = getLogger('server_out', __filename);

        this.backendServerId = app.getServerId();

        this.roomManager = roomManager;
        // super(app);
    }
    async entry({ player, roomId, sceneId }) {
        // this.logger.debug(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 进入房间 | 开始`);
        try {

            /* const { status, roomInfo } = await BlackJackDynamicRoomManager.getInstance()
                .searchAndEntryRoom(sceneId, roomId, player); */

            const room = this.roomManager.getRoom(sceneId, roomId, player);

            if (!room) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }

            const result = room.addPlayerInRoom(player);

            if (!result) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) }
            }


            // this.roomManager.playerLeaveChannel(player);

            /* if (!status) {
                isRobot === RoleEnum.REAL_PLAYER && this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 进入房间 | 失败`);
                return new ApiResult(BlackJackState.Entry_Room_Fail, null, getlanguage(player.language, Net_Message.id_1737));
            }
 */
            /* if (isRobot !== RoleEnum.ROBOT) {
                BlackJackDynamicRoomManager.getInstance().entryRoomInIsolationPool(rootUid, parantUid, roomId);
            } */

            // this.logger.debug(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 进入房间 | 成功`);

            return { code: 200, roomId: room.roomId };
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 进入房间 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, getlanguage(player.language, Net_Message.id_1737));
        }
    }

    /**
     * 离开房间
     * @param param0 
     */
    async exit({ nid, sceneId, roomId, player }) {
        // this.logger.debug(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 开始`);
        try {
            // const roomInfo = BlackJackRoomManagerImpl
            //     .Instance()
            //     .getRoomInfo(roomId);
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                if (player.isRobot === RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 未查询到房间`);
                return new ApiResult(200, null, getlanguage(player.language, Net_Message.id_226));
            }

            const blackJackPlayer = room.getPlayer(player.uid);

            if (!blackJackPlayer) {
                if (player.isRobot === RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 未查询到玩家`);
                return new ApiResult(200, null, getlanguage(player.language, Net_Message.id_1002));
            }

            if (blackJackPlayer.status === BlackJackPlayerStatusEnum.Game || blackJackPlayer.totalBet > 0) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 正在对局中，不能离开`);

                return new ApiResult(BlackJackState.Can_Not_Leave, null, getlanguage(player.language, Net_Message.id_1050));
            }



            room.playerLeaveRoom(player.uid);
            this.roomManager.removePlayerSeat(player.uid);
            // this.logger.info(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 成功`);
            // RoomController.updateUserFromRoom(roomInfo.players, roomInfo.nid, roomInfo.roomId);
            return ApiResult.SUCCESS();
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 出错 | ${e.stack}`);

            return ApiResult.ERROR(null, getlanguage(player.language, Net_Message.id_230));
        }
    }

    /**
     * 掉线
     * @param param0 
     */
    public async leave({ uid, language, nid, sceneId, roomId }) {
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 离开房间 | 未查询到房间`);
                return new ApiResult(BlackJackState.Not_Find_Room, null, getlanguage(language, Net_Message.id_226));
            }

            const blackJackPlayer = room.getPlayer(uid);

            if (!blackJackPlayer) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 离开房间 | 未查询到玩家`);
                return new ApiResult(BlackJackState.Not_Find_Player, null, getlanguage(language, Net_Message.id_1002));
            }

            if (blackJackPlayer.totalBet !== 0) {
                room.playerLeaveRoom(uid, true);
                return ApiResult.ERROR();
            }

            room.playerLeaveRoom(uid, false);
            this.roomManager.removePlayer(blackJackPlayer);
            return ApiResult.SUCCESS();
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 玩家掉线 | 出错 | ${e.stack}`);

            return ApiResult.ERROR(null, getlanguage(language, Net_Message.id_230));
        }
    }

    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);

            //房间不存在可以进行下分
            if (!roomInfo) {
                return { code: 200 };
            }

            //玩家不存在可以进行下分
            const playerInfo = roomInfo.getPlayer(uid);

            if (!playerInfo) {
                return { code: 200 };
            }

            if (playerInfo.status === BlackJackPlayerStatusEnum.Game) {
                return { code: 500 };
            }

            if (playerInfo.getCurrentTotalBet() > 0) {
                return { code: 500 };
            }

            return { code: 200 };
        } catch (error) {
            this.logger.error('红包扫雷|离开房间  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }

    public async entryScenes({ player }) {
        try {
            const group = this.roomManager.getTenantScene(player);
            this.roomManager.addPlayer(player);
            const rooms = group.getRooms();
            const data = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        // countDown: roomInfo.countDown,
                        // roomStatus: roomInfo.status,
                    },
                    // up7Historys: roomInfo.getRecird()
                };
            });
            return { code: 200, data };
        } catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: getlanguage(null, Net_Message.id_1213) };
        }
    }

    /**
     * @name 获取可选房间列表
     * @returns 
     * @description 新版租户隔离
     */
    // async getRoomList(rootUid: string | null, parantUid: string) {
    //     try {
    //         // this.logger.warn(`大厅获取房间列表 | RPC |  rootUid ${rootUid} parantUid ${parantUid} | 获取前`);
    //         const list = BlackJackDynamicRoomManager.getInstance()
    //             .getRoomListByPlayerInfo(rootUid, parantUid);


    //         // this.logger.warn(`大厅获取房间列表 | RPC |  rootUid ${rootUid} parantUid ${parantUid} | 清洗数据后 | ${JSON.stringify(l, null, 2)}`);
    //         return ApiResult.SUCCESS(list);
    //     } catch (e) {
    //         this.logger.error('getRoomList', e.stack);
    //         return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1212) };
    //     }
    // }

    async leaveGameAndBackToHall(player: { group_id: string, lineCode: string, uid: string }, roomId: string) {
        try {

            // BlackJackDynamicRoomManager.getInstance().leaveRoomInIsolationPool(player.group_id, player.lineCode, roomId);
            this.roomManager.removePlayer(player as PlayerInfo)
            return ApiResult.SUCCESS();
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 玩家回到大厅 | 出错  ${e.stack}`);
            return ApiResult.ERROR();
        }
    }

    // async leaveRoomInIsolationPool(rootUid: string, lineCode: string, roomId: string) {
    //     try {
    //         BlackJackDynamicRoomManager.getInstance().leaveRoomInIsolationPool(rootUid, lineCode, roomId);
    //         return ApiResult.SUCCESS();
    //     } catch (e) {
    //         this.logger.error(`${this.backendServerId} | 21点游戏 | leaveRoomInIsolationPool | 玩家对局中离线| 出错 | ${e.stack}`);

    //         return ApiResult.ERROR(null, getlanguage(null, Net_Message.id_230));
    //     }
    // }
}
