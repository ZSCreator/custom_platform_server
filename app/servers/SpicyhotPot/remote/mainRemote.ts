import roomManager, {HotpotRoomManager} from '../lib/RoomMgr';
import { Application, BackendSession, RemoterClass, Logger } from 'pinus';
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { getLogger } from 'pinus-logger';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";


// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        SpicyhotPot: {
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
    roomManager: HotpotRoomManager;
    logger: Logger;

    constructor(app: Application) {
        this.app = app;
        this.roomManager = roomManager;
        this.logger = getLogger('server_out', __filename);
    }

    /**
     * 进入游戏
     * @param param0 
     */
    async entry({ player, roomId, sceneId }) {
        try {
            // 获取一个房间
            const room = this.roomManager.getRoom(sceneId, roomId, player);

            room.addPlayerInRoom(player);

            return { code: 200, roomId: room.roomId };
        } catch (e) {
            this.logger.error(`麻辣火锅 ==> 进入游戏错误 ${e}`);
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_2004) };
        }
    }

    /**
     * 退出游戏
     */
    async exit({ sceneId,  roomId, player }) {
        // 搜索房间
        const room = this.roomManager.searchRoom(sceneId, roomId);

        if (!room) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_2004) };
        }

        const getPlayer = room.getPlayer(player.uid);

        if (!getPlayer) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_2004) };
        }

        room.removePlayer(player.uid);

        return { code: 200, msg: '' };
    }

    /**
     * 掉线 
     * @param param0 
     */
    public async leave({ uid, language, sceneId, roomId }) {
        try {
            // 搜索房间
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                return { code: 500, msg: getlanguage(language, Net_Message.id_2004) };
            }
            const player = room.getPlayer(uid);
            if (!player) {
                return { code: 500, msg: getlanguage(language, Net_Message.id_2004) };
            }
            room.removePlayer(uid);

            return { code: 200, msg: '' };
        } catch (error) {
            this.logger.error(`火锅|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            return { code: 500, error: getlanguage(language, Net_Message.id_2004) }
        }

    }

    /**
     * Rpc 下分查看玩家是否有下注
     */
    public async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`火锅|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

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
            this.logger.error('火锅|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}