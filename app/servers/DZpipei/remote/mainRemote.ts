import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import roomManager, { DzRoomManger } from '../lib/dzRoomMgr';
import langsrv = require('../../../services/common/langsrv');
// 机器人服务器生命周期
import expandingMethod from '../../../services/robotRemoteService/expandingMethod';
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";

const pipeiLogger = getLogger('server_out', __filename);

// // UserRpc的命名空间自动合并
declare global {
  interface UserRpc {
    DZpipei: {
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
  logger: Logger;
  roomManager: DzRoomManger;
  constructor(app: Application) {
    this.app = app;
    this.logger = getLogger('server_out', __filename);
    this.roomManager = roomManager;
  }
  /**
   * 进入选场界面 订阅推送和锁定租户标识的房间数据
   */
  public async entryScenes(msg: { player }) {
    try {
      this.roomManager.getTenantScene(msg.player);
      this.roomManager.addPlayer(msg.player);
      return { code: 200, data: "" };
    } catch (error) {
      this.logger.warn('entryScenes', error);
      return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
    }
  }
  /**
   * 进入匹配房间 - 这里随机给玩家随机一个房间
   */
  public async entry({ player, nid, sceneId, roomId, param }) {
    try {
      const room = this.roomManager.getRoom(sceneId, roomId, player);

      // 如果未找到房间返回失败
      if (!room) {
        return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
      }
      if (param) {
        player['currGold'] = param['currGold'];
        if (player['currGold'] < room.canCarryGold[0]) {
          player['currGold'] = room.canCarryGold[0];
        }
      }
      const result = room.addPlayerInRoom(player);

      if (!result) {
        return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) }
      }
      // 记录玩家所在房间位置
      this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);

      return { code: 200, roomId: room.roomId };
    } catch (error) {
      pipeiLogger.warn(`DZpipei.prototype.entry=>进入房间失败:${error}`);
      return { code: 500, msg: '进入房间失败' };
    }
  }

  /**
   * 退出
   */
  async exit({ nid, sceneId, roomId, player }) {
    try {
      const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
      if (!roomInfo) {
        return { code: 200, msg: `not find roomCode:${roomId}` };
      }
      // 是
      const playerInfo = roomInfo.getPlayer(player.uid);
      if (!playerInfo) {
        return { code: 200, msg: '' };
      }
      //玩家在游戏中并且没有弃牌
      if (roomInfo.status == "INGAME" && playerInfo.status == 'GAME' && playerInfo.isFold == false) {
        return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1052) };
      }

      roomInfo.exit(playerInfo, false);// 退出玩家
      return { code: 200, msg: '' };
    } catch (error) {
      pipeiLogger.warn('dz.mainRemote.exit=>', error);
      return { code: 200, msg: '' };
    }
  }

  /**
   * 离线 - 直接强行离开
   */
  public async leave({ uid, sceneId, roomId, group_id, lineCode }) {
    try {
      const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
      if (!roomInfo) {
        return { code: 200, msg: `not find roomCode:${roomId}` };
      }
      // 是
      const playerInfo = roomInfo.getPlayer(uid);

      if (!playerInfo) {
        this.roomManager.removePlayer({ uid, group_id, lineCode } as PlayerInfo);
        return { code: 200, msg: '未找到玩家' };
      }

      if (roomInfo.status == "INGAME" && playerInfo.status == "GAME") {
        roomInfo.exit(playerInfo, true);
        return { code: 500, msg: '玩家正在游戏中' };
      }
      roomInfo.exit(playerInfo, false);
      roomManager.removePlayer(playerInfo);
      return { code: 200, msg: '' };
    } catch (error) {
      pipeiLogger.warn('dz.mainRemote.leave=>', error);
      return { code: 500, msg: '' };
    }
  }
  /**
  * Rpc 下分查看玩家是否有下注
  */
  public async rpcLowerPlayer({ uid, sceneId, roomId }) {
    try {
      const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
      if (!roomInfo) {
        return { code: 200, msg: `not find roomCode:${roomId}` };
      }
      // 是
      //玩家不存在可以进行下分
      const playerInfo = roomInfo.getPlayer(uid);
      if (!playerInfo) {
        return { code: 200 }
      }
      if (roomInfo.status == "INGAME" && playerInfo.status == 'GAME' && playerInfo.isFold == false) {
        return { code: 500 };
      }
      roomInfo.exit(playerInfo, false);// 退出玩家
      return { code: 200 }
    } catch (error) {
      pipeiLogger.error('DZpipei|async  rpcLowerPlayer==>', error);
      return { code: 200 };
    }
  };
  /**掉线回来 记录 不踢人 */
  public async reconnectBeforeEntryRoom({ uid }) {
    const apiResult = new RpcApiResult();
    try {
      const seat = this.roomManager.getPlayerSeat(uid);

      // 没有位置
      if (!seat) {
        return apiResult;
      }

      // 搜索房间
      const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
      const player = room.getPlayer(uid);

      if (player) {
        player.onLine = true;
        apiResult.code = 200;
      } else {
        this.roomManager.removePlayerSeat(uid);
      }

      return apiResult;
    } catch (error) {
      pipeiLogger.warn('async  leave==>', error);
      return { code: 500, msg: '' };
    }
  }
  //消息分发
  public MessageDispatch(Message_Id: number, data: any) {
    return expandingMethod.MessageDispatch(Message_Id, this.app, data)
  }
  /**
 * 离开游戏返回大厅
 * @param player
 */
  leaveGameAndBackToHall(player: { group_id: string, lineCode: string, uid: string }) {
    this.roomManager.removePlayer(player as PlayerInfo);
    return { code: 200 };
  }
}