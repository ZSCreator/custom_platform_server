import { Application, RemoterClass, BackendSession, Logger, getLogger } from 'pinus';
import roomManager, {IceBallRoomManager} from "../lib/roomManager";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";

// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        iceBall: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, mainRemote>;
        };
    }
}

export default function (app: Application) {
    return new mainRemote(app);
}

export class mainRemote {
    app: Application;

    logger: Logger;

    roomManager: IceBallRoomManager;

    constructor(app: Application) {
        this.app = app;
        this.logger = getLogger('Logger_err_log', __filename);
        this.roomManager = roomManager;
    }

    async entry({ player, roomId, sceneId }) {
        this.logger.debug(`冰球突破|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        try {
            // 获取一个房间
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            // 现从房间获取一次看到是否获取是断线重连
            const _player = room.getPlayer(player.uid);

            // 如果房间里面有玩家 说明是断线重连
            if (_player) {
                _player.setOnline()
                // 删除定时器
                room.deleteTimer(player);
            } else {
                room.addPlayerInRoom(player);
            }

            return { code: 200, msg: '', roomId: room.roomId };
        } catch (error) {
            this.logger.error(`冰球突破|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_6) };
        }
    }

    /**
     * 根据uid处理 夺宝游戏的玩家累积盈利
     * 离开游戏的同时清除其铲子记录 并结算(非掉线情况)
     */
    public async exit({ player, roomId, sceneId }) {

        this.logger.debug(`冰球突破|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                this.logger.error(`slots777|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            room.removePlayer(player);
            apiResult['code'] = 200;

            // 更新房间信息进数据库
            // await RoomController.updateUserFromRoom(room.getPlayers(), room.nid, room.roomId);

            return apiResult;
        } catch (error) {

            this.logger.error(`冰球突破|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;

        }

        return apiResult;
    }

    /**
     * 离线
     */
    public async leave({ uid, language, sceneId, roomId }) {

        this.logger.debug(`冰球突破|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_1004);

                return apiResult;
            }

            const p = room.getPlayer(uid);

            // 如果正在开奖状态则不删除
            if (p.isGameState()) {
                apiResult.msg = getlanguage(language, Net_Message.id_3103);
                p.setOffline();
                return apiResult;
            }

            // 移除离线玩家
            await room.removePlayer(p);

            apiResult.code = 200;
        } catch (error) {
            this.logger.error(`冰球突破|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
        }

        return apiResult;
    }


    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`冰球突破|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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
            if (currPlayer.isGameState()) {
                apiResult.code = 500;
                return apiResult;
            }

            // 金币置零
            currPlayer.gold = 0;

            return apiResult;

        } catch (error) {
            this.logger.error('冰球突破|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}
