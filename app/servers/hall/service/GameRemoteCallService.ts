import { pinus } from "pinus";
import { ApiResult } from "../../../common/pojo/ApiResult";
import { hallState } from "../../../common/systemState";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
const logger = getLogger('server_out', __filename);
/** Mysql */
import GameManager from "../../../common/dao/daoManager/Game.manager";




/**
 * 
 * @param uid 玩家编号
 */
export async function reconnectBeforeEntryRoom(nid: GameNidEnum, uid: string) {
    try {
        // 获取游戏配置信息
        // const { name } = await getOneGame(nid);
        const { name } = await GameManager.findOne({ nid });

        if (!name) {
            return false;
        }

        /** Step 1: 检测服务器状态 */
        if (!pinus.app.rpc[name]) {
            return new ApiResult(hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
        }

        const serverInfoList = pinus.app.getServersByType(name);

        const backendServerId = serverInfoList[0].id;

        if (!pinus.app.rpc[name].mainRemote.reconnectBeforeEntryRoom) {
            return false;
        }

        const rpcReuslt = await pinus.app.rpc[name].mainRemote.reconnectBeforeEntryRoom.toServer(backendServerId, { uid });


        return !!(rpcReuslt && rpcReuslt.code === 200);
    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | RPC玩家重连前出错:${e.stack}`);
        return false;
    }
}