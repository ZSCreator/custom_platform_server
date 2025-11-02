import {Application, BackendSession, RemoterClass, Logger, getLogger} from 'pinus';
import roomManager, {SlotRoomManager} from "../lib/roomManager";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import {GameState} from "../lib/attConst";


// // UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        att: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, MainRemote>;
        };
    }
}

export default function (app: Application) {
    return new MainRemote(app);
}


export class MainRemote {

    app: Application;

    logger: Logger;

    roomManager: SlotRoomManager;

    constructor(app: Application) {
        this.app = app;
        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }

    /**
     * 进入房间
     * @returns {RpcApiResult}
     */
    public async entry({ player, roomId, sceneId }) {
        this.logger.debug(`皇家连环炮|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            const _player = room.getPlayer(player.uid);

            if (_player) {
                _player.isOnLine = true;
                room.removeOfflineTimer(player.uid);
            } else {
                room.addPlayerInRoom(player);
            }

            return { code: 200, msg: '', roomId: room.roomId };
        } catch (error) {

            this.logger.error(`皇家连环炮|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_6) };

        }

    }

    /**
     * 退出房间
     * @returns {RpcApiResult}
     */
    async exit({  sceneId, roomId, player }) {

        this.logger.debug(`皇家连环炮|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                this.logger.error(`皇家连环炮|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            const _player = room.getPlayer(player.uid);

            if (!_player) {
                apiResult.code = 200;
                this.logger.error(`皇家连环炮|离开房间未找到玩家: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }

            if (_player.totalBet > 0) {
                return { code: 500, msg: getlanguage(_player.language, Net_Message.id_1050) }
            }

            room.removePlayer(player);
            apiResult['code'] = 200;

            // 更新房间信息进数据库
            // await RoomController.updateUserFromRoom(room.getPlayers(), room.nid, room.roomId);

            return apiResult;
        } catch (error) {

            this.logger.error(`皇家连环炮|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;

        }

        return apiResult;
    }

    /**
     * 玩家掉线
     * @returns {RpcApiResult}
     * @description 离开房间 (强逻辑)
     */
    public async leave({ uid, language, sceneId, roomId }) {

        this.logger.debug(`皇家连环炮|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();
        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                apiResult.msg = getlanguage(language, Net_Message.id_1004);

                return apiResult;
            }

            const currPlayer = room.getPlayer(uid);

            if (!currPlayer) {
                apiResult.code = 200;
                return apiResult;
            }

            /**
             * 如果为留牌状态断线 则保留玩家则设置定时离线
             */
            if (currPlayer.gameState === GameState.Deal) {
                room.addOfflinePlayer(currPlayer);

                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_1050);

                return apiResult;
            }

            // 如果有盈利，直接结算
            if (currPlayer.profit > 0) {
                await room.settlement(currPlayer, true);
            }

            room.removePlayer(currPlayer);

            apiResult.code = 200;
            return apiResult;
        } catch (error) {
            this.logger.error(`皇家连环炮|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            // 错误把房间返回200
            apiResult.code = 200;
            apiResult.msg = JSON.stringify(error);

            return apiResult;
        }

    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`皇家连环炮|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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




            /**
             * 如果状态不为初始状态则不能下分
             */
            if (currPlayer.gameState !== GameState.Init) {
                apiResult.code = 500;
                return apiResult;
            }

            // 金币置零
            currPlayer.gold = 0;

            return apiResult;

        } catch (error) {
            this.logger.error('皇家连环炮|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }

    MessageDispatch(Message_Id: number, data: any) {
        return expandingMethod.MessageDispatch(Message_Id, this.app, data)
    }

}