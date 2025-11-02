import {Application, BackendSession, RemoterClass, Logger, getLogger} from 'pinus';
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import roomManager, {ColorPlateRoomManager} from "../lib/roomManager";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import {PlayerInfo} from "../../../common/pojo/entity/PlayerInfo";


// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        colorPlate: {
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
    roomManager: ColorPlateRoomManager

    constructor(app: Application) {
        this.app = app;
        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }


    /**
     * 进入游戏
     * @param player
     * @param nid
     * @param roomId
     * @param sceneId
     */
    async entry({player, nid, roomId, sceneId}) {
        this.logger.debug(`色碟|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            if (!room) {
                return {code: 500, msg: getlanguage(player.language, Net_Message.id_6)};
            }

            room.addPlayerInRoom(player);

            // 记录玩家所在房间位置
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            this.roomManager.playerLeaveChannel(player);


            return {code: 200, msg: '', roomId: room.roomId};
        } catch (error) {

            this.logger.error(`色碟|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return {code: 500, msg: getlanguage(player.language, Net_Message.id_6)};

        }
    };

    /**
     * 退出游戏
     * @param player
     * @param roomId
     * @param sceneId
     */
    async exit({sceneId, roomId, player}) {
        this.logger.debug(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                this.logger.debug(`色碟|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            // 搜索房间玩家是否有押注 或者 是否为庄
            const roomPlayer = room.getPlayer(player.uid);

            if (!roomPlayer) {
                apiResult.code = 200;
                this.logger.info(`色碟|离开房间未找到玩家: ${roomId}|场:${sceneId}|${player.uid}||${room.players.map(p => p && p.uid)}`);

                return apiResult;
            }

            // 是庄或者有押注则不让退出
            if (roomPlayer === room.getBanker() || roomPlayer.isBet()) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(player.language, Net_Message.id_1050);
                return apiResult;
            }

            // 移除玩家
            room.removePlayer(player);

            // 移除玩家位置
            this.roomManager.removePlayerSeat(player.uid);
            this.roomManager.playerAddToChannel(player);

            apiResult.code = 200;

            // 更新房间信息进数据库
            // await RoomController.updateUserFromRoom(room.getPlayers(), room.nid, room.roomId);

            return apiResult;
        } catch (error) {
            this.logger.error(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }

        return apiResult;
    }

    /**
     * 强行退出游戏 or 掉线
     * @param player
     * @param nid
     * @param roomId
     * @param sceneId
     */
    public async leave({uid, language, nid, sceneId, roomId}) {
        this.logger.warn(`色碟|断线:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_1004);
                this.logger.error(`色碟|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            // 搜索房间玩家是否有押注 或者 是否为庄
            const roomPlayer = room.getPlayer(uid);

            if (!roomPlayer) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_2017);

                return apiResult;
            }

            // 是庄或者有押注则不让退出
            if (roomPlayer === room.getBanker() || roomPlayer.isBet()) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_1050);

                // 玩家断线操作
                room.playerOffline(roomPlayer);
                return apiResult;
            }

            // 移除玩家
            room.removePlayer(roomPlayer);


            // 移除玩家位置
            this.roomManager.removePlayerSeat(uid);
            // 移除玩家
            this.roomManager.removePlayer(roomPlayer);

            apiResult.code = 200;

            return apiResult;
        } catch (error) {
            this.logger.error(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${uid}|出错:${error}`);
            apiResult.code = 500;
            return apiResult;
        }
    }

    /**
     * 掉线回来
     * @param uid
     */
    public async reconnectBeforeEntryRoom({uid}) {
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
            this.logger.error(`色碟|reconnectBeforeEntryRoom 断线重连| 玩家:${uid}|出错:${e}`);
            return apiResult;
        }
    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({uid, sceneId, roomId}) {
        this.logger.debug(`色碟|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();
        apiResult.code = 200;

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                return apiResult;
            }

            const currPlayer = room.getPlayer(uid);

            if (!currPlayer) {
                return apiResult;
            }

            // 如果正在开奖
            if (currPlayer === room.getBanker() || currPlayer.isBet()) {
                apiResult.code = 500;
                return apiResult;
            }

            // 金币置零
            currPlayer.gold = 0;

            return apiResult;

        } catch (error) {
            this.logger.error('色碟|async  rpcLowerPlayer==>', error);
            return {code: 200};
        }
    }

    /**
     * 进入选场界面 订阅推送和锁定租户标识的房间数据
     */
    public async entryScenes({player}) {
        try {
            const group = this.roomManager.getTenantScene(player);
            const rooms = group.getRooms();
            let data = rooms.map(r => {
                return {
                    sceneId: r.sceneId,
                    roomId: r.roomId,
                    status: r.processState.stateName,
                    countdown: r.processState.getRemainingTime(),
                    history: r.getLotteryHistory(true)
                }
            })
            this.roomManager.addPlayer(player);

            return {code: 200 , data};
        } catch (error) {
            this.logger.error('entryScenes', error);
            return {code: 500, msg: getlanguage(null, Net_Message.id_1213)};
        }
    }

    /**
     * 离开游戏返回大厅
     * @param player
     */
    leaveGameAndBackToHall(player: {group_id: string, lineCode: string, uid: string}) {
        this.roomManager.removePlayer(player as PlayerInfo);
        return {code: 200};
    }
}