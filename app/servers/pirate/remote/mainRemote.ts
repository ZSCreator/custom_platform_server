import { Application, FrontendSession, RemoterClass, getLogger, Logger } from 'pinus';
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import roomManager, {PirateRoomManager} from "../lib/roomManager";
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";

// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        Pirate: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<FrontendSession, MainRemote>;
        };
    }
}


export default function (app: Application) {
    return new MainRemote(app);
}

export class MainRemote {

    app: Application;

    logger: Logger;

    roomManager: PirateRoomManager;

    constructor(app: Application) {
        this.app = app;

        this.logger = getLogger('server_out', __filename);
        this.roomManager = roomManager;
    }

    /**
     * 进入
     */
    async entry({ player, sceneId, roomId }) {
        this.logger.debug(`寻宝奇航|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            room.addPlayerInRoom(player);

            return { code: 200, msg: '', roomId: room.roomId };
        } catch (error) {

            this.logger.error(`寻宝奇航|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_6) };

        }
    }

    /**
     * 退出
     */
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`寻宝奇航|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);

        let apiResult = new RpcApiResult();

        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);

            if (!room) {
                apiResult.code = 200;
                this.logger.error(`寻宝奇航|离开房间未找到房间: ${roomId}|场:${sceneId}|`);

                return apiResult;
            }

            room.removePlayer(player);
            apiResult['code'] = 200;

            // 更新房间信息进数据库
            // await RoomController.updateUserFromRoom(room.getPlayers(), room.nid, room.roomId);

            return apiResult;
        } catch (error) {

            this.logger.error(`寻宝奇航|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;

        }

        return apiResult;
    }

    /**
     * 离线 - 直接强行离开
     */
    public async leave({ uid, language, sceneId, roomId }) {

        this.logger.debug(`寻宝奇航|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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
            if (p.isGameState()) {
                // apiResult.msg = getlanguage(language, Net_Message.id_3103);
                // p.setOffline();
                // return apiResult;
            }
            room.removePlayer(p);

            apiResult.code = 200;

            return apiResult;
        } catch (error) {
            this.logger.error(`寻宝奇航|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.msg = JSON.stringify(error);
            return apiResult;
        }
    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`寻宝奇航|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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
            this.logger.error('寻宝奇航|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }

    //消息分发
    public MessageDispatch(Message_Id: number, data: any
    ) {
        return expandingMethod.MessageDispatch(Message_Id, this.app, data)
    }
}
