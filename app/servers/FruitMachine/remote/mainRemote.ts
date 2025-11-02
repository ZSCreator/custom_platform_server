import { Application, BackendSession, RemoterClass } from 'pinus';
import { getLogger, Logger } from "pinus-logger";
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import roomManager, {FruitMachineRoomManager} from "../lib/roomManager";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";

declare global {
    interface UserRpc {
        FruitMachine: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, MainRemote>;
        };
    }
}

export default function (app: Application) {
    return new MainRemote(app);
}

export class MainRemote {
    logger: Logger;
    roomManager: FruitMachineRoomManager;

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }

    // 玩家进入游戏
    async entry({ player, roomId, sceneId }) {
        this.logger.debug(`水果机|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            room.addPlayerInRoom(player);

            return { code: 200, msg: '', roomId: room.roomId };
        } catch (e) {
            this.logger.error(`FruitMachine.Remote.entry ==> 进入游戏错误 ${e.stack || e.message || e}`);
            return { code: 200, msg: getlanguage(player.language, Net_Message.id_6) };
        }
    }

    // 退出游戏
    async exit({  sceneId, roomId, player }) {
        this.logger.debug(`FruitMachine|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                this.logger.error(`FruitMachine|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            room.removePlayer(player);
            apiResult['code'] = 200;

            // 更新房间信息进数据库
            // await RoomController.updateUserFromRoom(room.getPlayers(), room.nid, room.roomId);

            return apiResult;
        } catch (e) {
            this.logger.error(`FruitMachine|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${e.stack || e.message || e}`);
            apiResult.code = 200;
        }

        return apiResult;
    }

    // 强行退出游戏 or 掉线
    public async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`FruitMachine|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

        let apiResult = new RpcApiResult();
        try {
            // 搜索房间
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_1004);

                return apiResult;
            }

            const playerInfo = roomInfo && roomInfo.getPlayer(uid);

            if (!playerInfo) {
                apiResult.code = 500;
                apiResult.msg = getlanguage(language, Net_Message.id_2017);
                playerInfo.setOffline();

                return apiResult;
            }

            roomInfo.removePlayer(playerInfo);

            apiResult.code = 200;

        } catch (error) {
            this.logger.error(`FruitMachine|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
        }

        return apiResult;
    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`水果机|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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

            // 金币置零
            currPlayer.gold = 0;

            return apiResult;

        } catch (error) {
            this.logger.error('水果机|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }

    //消息分发
    public MessageDispatch(Message_Id: number, data: any) {
        return expandingMethod.MessageDispatch(Message_Id, this.app, data)
    }
}
