import {Application, BackendSession, RemoterClass} from 'pinus';
import roomManager from '../lib/FisheryRoomManagerImpl';
import {getLogger} from "pinus-logger";
import {ApiResult} from '../../../common/pojo/ApiResult';
import fRoom from '../lib/fRoom';
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import * as redisEvent from "../../../common/event/redisEvent";
import {PlayerInfo} from "../../../common/pojo/entity/PlayerInfo";
const fisheryLogger = getLogger('server_out', __filename);
declare global {
    interface UserRpc {
        fishery: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, MainRemote>;
        };
    }
}

export default function (app: Application) {
    return new MainRemote(app);
}

export class MainRemote {
    public app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 进入
     */
    async entry({player, roomId, sceneId}) {
        try {
            const room = await roomManager.getRoom(sceneId, roomId, player);

            if (!room) {
                return {code: 500, msg: getlanguage(player.language, Net_Message.id_6)};
            }

            room.addPlayerInRoom(player);

            // 记录玩家所在房间位置
            roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            roomManager.playerLeaveChannel(player);

            return {code: 200, roomId: room.roomId};
        } catch (error) {
            fisheryLogger.error('fishery.prototype.entry==>', error);
            return {code: 500, msg: getlanguage(player.language, Net_Message.id_6)};
        }
    }

    /**
     * 退出
     */
    async exit({sceneId, roomId, player}) {
        try {
            // 搜索房间
            const room = roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                fisheryLogger.warn(`渔场大亨没有这个房间roomCode:${roomId}`);
                return {code: 200, msg: ``};
            }

            // 搜索房间玩家是否有押注 或者 是否为庄
            const roomPlayer = room.getPlayer(player.uid);

            if (!roomPlayer) {
                fisheryLogger.warn(`渔场大亨${roomId}房间没有这个玩家uid:${player.uid}`);
                return {code: 200, msg: ``};
            }
            if (roomPlayer.bet > 0) {
                return {code: 200, msg: getlanguage(player.language, Net_Message.id_1050)};
            }

            room.leave(roomPlayer, false);

            // 移除玩家位置
            roomManager.removePlayerSeat(player.uid);
            roomManager.playerAddToChannel(player);

            return {code: 200, msg: ``};
        } catch (error) {
            fisheryLogger.error('Remote.prototype.exit==>', error);
            return {code: 200, msg: ``};
        }
    }

    /**
     * 离线 - 直接强行离开
     */
    public async leave({uid, sceneId, roomId}) {
        try {
            // 搜索房间
            const room = roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                return {code: 200, msg: `未找到房间`};
            }

            // 是否有下注
            const roomPlayer = room.getPlayer(uid);
            if (!roomPlayer) {
                fisheryLogger.warn(`渔场大亨${roomId}房间没有这个玩家uid:${uid}`);
                return {code: 200, msg: `未找到玩家`};
            }

            // 有下注则设置玩家离线
            if (roomPlayer.bet > 0) {
                room.leave(roomPlayer, true);
                return {code: 500, msg: `玩家正在游戏中`};
            }

            room.leave(roomPlayer, false);
            // 移除玩家位置
            roomManager.removePlayerSeat(uid);
            // 移除玩家
            roomManager.removePlayer(roomPlayer);

            return {code: 200, msg: ``};
        } catch (error) {
            fisheryLogger.error('Remote.prototype.leave==>', error);
            return {code: 200, msg: ``};
        }
    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({uid, sceneId, roomId}) {
        fisheryLogger.debug(`渔场大亨|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();
        apiResult.code = 200;

        try {
            // 搜索房间
            const room = roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                return {code: 200};
            }

            const currPlayer = room.getPlayer(uid);

            if (!currPlayer) {
                return apiResult;
            }

            // 如果正在开奖
            if (currPlayer.bet > 0) {
                apiResult.code = 500;
                return apiResult;
            }

            // 金币置零
            currPlayer.gold = 0;

            return apiResult;

        } catch (error) {
            fisheryLogger.error('渔场大亨|async  rpcLowerPlayer==>', error);
            return {code: 200};
        }
    }


    /**
     * 获取房间记录
     * @param player
     */
    async getRoomHistory(player) {
        try {
            const group = await roomManager.findGroup(player);
            const rooms = group.getRooms();
            const list = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,

                    fisheryHistory: roomInfo.fisheryHistory,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        roomStatus: roomInfo.roomStatus,
                        countDown: roomInfo.countDown,
                    },
                };
            });
            return ApiResult.SUCCESS(list);
        } catch (e) {
            fisheryLogger.error('async  getRoomHistory==>', e.satck);
            return {code: 500, msg: ``};
        }
    }

    /**
     * 进入选场界面 订阅推送和锁定租户标识的房间数据
     */
    public async entryScenes({ player }) {
        try {
            const group = roomManager.getTenantScene(player);
            const rooms = group.getRooms();
            const data = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,

                    fisheryHistory: roomInfo.fisheryHistory,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        roomStatus: roomInfo.roomStatus,
                        countDown: roomInfo.countDown,
                    },
                };
            });
            roomManager.addPlayer(player);

            return {code: 200 , data};
        } catch (error) {
            fisheryLogger.error('entryScenes', error);
            return { code: 500, msg: getlanguage(null, Net_Message.id_1213) };
        }
    }

    /**
     * 离开游戏返回大厅
     * @param player
     */
    leaveGameAndBackToHall(player: {group_id: string, lineCode: string, uid: string}) {
        roomManager.removePlayer(player as PlayerInfo);
        return {code: 200};
    }

    /**
     * 掉线回来
     * @param uid
     */
    public async reconnectBeforeEntryRoom({uid}) {
        const apiResult = new RpcApiResult();

        try { // 获取位置
            const seat = roomManager.getPlayerSeat(uid);

            // 没有位置
            if (!seat) {
                return apiResult;
            }

            // 搜索房间
            const room = roomManager.searchRoom(seat.sceneId, seat.roomId);

            // 获取玩家
            const roomPlayer = room.getPlayer(uid);

            // 重置断线重连状态
            roomPlayer.onLine = true;

            apiResult.code = 200;

            return apiResult;
        } catch (e) {
            return apiResult;
        }
    }
}
