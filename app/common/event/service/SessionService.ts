import { pinus } from "pinus";
import GameManager from "../../dao/daoManager/Game.manager";
import { ApiResult } from "../../pojo/ApiResult";
import { hallState } from "../../systemState";
import PlayersInRoomDao from "../../dao/redis/PlayersInRoom.redis.dao";
import { RoleEnum } from "../../constant/player/RoleEnum";
import * as ServerCurrentNumbersPlayersDao from "../../../common/dao/redis/ServerCurrentNumbersPlayersDao";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { getLogger } from 'pinus-logger';
import { PositionEnum } from "../../constant/player/PositionEnum";
import hallConst = require('../../../consts/hallConst');
import {PlayerInfo} from "../../pojo/entity/PlayerInfo";
import {PlayerInRedis} from "../../dao/redis/entity/player.entity";
const logger = getLogger('server_out', __filename);

export async function closeSession(backendServerId: string, nid: string, sceneId: number, roomId: string,  player: PlayerInfo | PlayerInRedis) {
    try {
        const { name } = await GameManager.findOne({ nid });
        const {uid, language, isRobot} = player;

        /** Step 1: 检测服务器状态 */
        if (!pinus.app.rpc[name]) {
            return new ApiResult(hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
        }

        /** Step 2: RPC 退出房间 */
        // TODO 这里暂改 * , 因为会出现backendServerId为undefined的情况  可能是那里session绑定有逻辑遗漏
        const [{ code, msg }] = await pinus.app.rpc[name].mainRemote.leave.toServer('*', {
            uid, language, nid, sceneId, roomId, group_id: player.group_id, lineCode: player.lineCode });

        if (code === 200) {
            if (backendServerId !== undefined) {
                await PlayersInRoomDao.delete(backendServerId, roomId, uid, isRobot);
                // 更新对应的服务器在线人数
                // await ServerCurrentNumbersPlayersDao.decreaseByServerId(backendServerId);
            }

            if (isRobot === RoleEnum.REAL_PLAYER) {
                await PlayerManagerDao.updateOne({ uid },
                    {
                        position: PositionEnum.HALL,
                        kickself: false,
                        abnormalOffline: false,
                        lastLogoutTime: new Date(),
                        sid: null,
                    }
                );
            }
        } else {
            if (isRobot === RoleEnum.REAL_PLAYER) {
                logger.debug(`${pinus.app.getServerId()} | RPC玩家离线退出玩家出错: uid ${uid} nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}, serverId: ${backendServerId}, msg: ${msg}`);
            }
        }

    } catch (e) {
        logger.error(`${pinus.app.getServerId()} | RPC玩家离线出错:${e.stack}`);
    }
}
