import { Application, BackendSession, RemoterClass, Logger, getLogger } from 'pinus';
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import langsrv = require('../../../services/common/langsrv');
import { PlayerGameStatusEnum } from '../lib/enum/PlayerGameStatusEnum';
import { ApiResult } from '../../../common/pojo/ApiResult';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
// import { RedPacketDynamicRoomManager } from "../lib/RedPacketDynamicRoomManager";
import roomManager, { RedPacketTenantRoomManager } from "../lib/RedPacketTenantRoomManager";
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { getlanguage, Net_Message } from '../../../services/common/langsrv';

declare global {
  interface UserRpc {
    redPacket: {
      mainRemote: RemoterClass<BackendSession, RedPacketRemote>;
    };
  }
}

export default function (app: Application) {
  return new RedPacketRemote(app);
}


export class RedPacketRemote {

  app: Application;

  logger: Logger;

  roomManager: RedPacketTenantRoomManager

  constructor(app: Application) {
    this.app = app;
    this.logger = getLogger('server_out', __filename);
    this.roomManager = roomManager;
  }
  /**
   * 进入房间
   * @returns {RpcApiResult}
   */
  public async entry({ player, nid, roomId, sceneId }) {

    if (player.isRobot === RoleEnum.REAL_PLAYER) {
      this.logger.debug(`红包扫雷|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
    }

    try {
      // const roomManager = RedPacketDynamicRoomManager.getInstance();

      // Step 1:查询"场"信息
      // const sceneInfo = roomManager.get_sceneInfo(sceneId);
      // if (!sceneInfo)
      //   return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1212) };

      // Step 2:确认房间状态 暂注，功能重合
      // const { roomStatus } = roomManager.detectionAllRoomStatus(nid, player.uid, sceneId, roomId);
      // if (!roomStatus) return { code: 500, msg: '房间状态不符进入条件' };

      // Step 3:搜索并进入房间
      // const { roomInfo, status } = RedPacketDynamicRoomManager.getInstance().searchAndEntryRoom(sceneId, roomId, player);

      // const { roomInfo, status } = await roomManager.searchAndEntryRoom(this.app, sceneId, roomId, player);

      // if (!status) {
      //   return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
      // }
      const room = this.roomManager.getRoom(sceneId, roomId, player);

      const result = room.addPlayerInRoom(player);

      if (!result) {
        return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) }
      }

      this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);

      /* const {
        isRobot,
        // 平台编号
        group_id: rootUid,
        // 代理编号
        lineCode: parantUid,
      } = player;

      if (isRobot !== RoleEnum.ROBOT) {
        RedPacketDynamicRoomManager.getInstance().entryRoomInIsolationPool(rootUid, parantUid, roomId);
      } */
      return { code: 200, roomId: room.roomId };
    } catch (error) {

      this.logger.error(`红包扫雷|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
      return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2004) };

    }

  }

  /**
   * 退出房间
   * @returns {RpcApiResult}
   */
  async exit({ nid, sceneId, roomId, player }) {

    if (player.isRobot === RoleEnum.REAL_PLAYER) {
      this.logger.debug(`红包扫雷|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
    }

    let apiResult = new RpcApiResult();

    try {

      const room = this.roomManager.searchRoom(sceneId, roomId);

      if (player.isRobot === RoleEnum.ROBOT) {
        if (!room) {
          return ApiResult.SUCCESS();
        }
      }
      // 调用 玩家离房逻辑
      let resultMessage: string = room.leaveRoom(player.uid, false);

      if (resultMessage) {
        apiResult['msg'] = resultMessage
      } else {
        apiResult['code'] = 200
        this.roomManager.removePlayerSeat(player.uid);
      }

      // 更新房间信息进数据库
      // RoomController.updateUserFromRoom(roomInfo.players, roomInfo.nid, roomInfo.roomId);

    } catch (error) {

      this.logger.error(`红包扫雷|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
      apiResult.code = 200;

    }

    return apiResult;
  }

  /**
   * 玩家掉线
   * @returns {RpcApiResult}
   * @description 离开房间 (强逻辑)
   */
  public async leave({ uid, language, nid, sceneId, roomId }) {

    this.logger.debug(`红包扫雷|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);

    let apiResult = new RpcApiResult();
    apiResult.code = 500;
    try {
      // Step 1:获取所在房间信息
      // const roomInfo = RedPacketRoomManager.Instance().getRoomBySceneIdAndRoomCode(sceneId, roomId);

      const room = this.roomManager.searchRoom(sceneId, roomId);

      if (!room) apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1705);

      if (apiResult['msg'].length === 0) {

        // Step 2:退出房间
        const playerInRoom = room.getPlayer(uid);

        // 因玩家已离线，所以 leaveRoom 若异常分支不用返回客户端，“结算”时移除玩家信息
        let resultMessage: string = room.leaveRoom(playerInRoom.uid, true);

        resultMessage ? apiResult['msg'] = resultMessage : apiResult['code'] = 200;

        this.roomManager.removePlayer(playerInRoom);
      }

    } catch (error) {

      this.logger.error(`红包扫雷|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
      apiResult.msg = JSON.stringify(error);
    }

    return apiResult;
  }

  /**掉线回来 记录 不踢人 */
  public async reconnectBeforeEntryRoom({ uid }) {
    try {

      this.logger.debug(`红包扫雷|重连| 玩家: ${uid}`)

      const roomList = this.roomManager.getAllRooms();
      for (const roomInfo of roomList) {
        let playerInfo = roomInfo.players.find(pl => pl && pl.uid == uid);
        if (playerInfo) {
          playerInfo.onLine = true;
          return { code: 200, msg: '' };
        }
      }
      return { code: 500, msg: '' };
    } catch (error) {
      this.logger.warn('async  leave==>', error);
      return { code: 500, msg: '' };
    }
  }

  public async rpcLowerPlayer({ uid, sceneId, roomId }) {
    try {
      const roomInfo = this.roomManager.searchRoom(sceneId, roomId);

      //房间不存在可以进行下分
      if (!roomInfo) {
        return { code: 200 };
      }

      //玩家不存在可以进行下分
      const playerInfo = roomInfo.getPlayer(uid);

      if (!playerInfo) {
        return { code: 200 };
      }

      // 没有参与对局直接下分
      if (playerInfo.status !== PlayerGameStatusEnum.GAME) {
        playerInfo.gold = 0;
        return { code: 200 };
      }

      const redPacketInfo = roomInfo.redPackQueue[0]

      // 参与对局 庄
      if (redPacketInfo.owner_uid === playerInfo.uid) {
        // playerInfo.gold -= redPacketInfo.amount;
        return { code: 500 };
      }

      // 参与对局 闲
      return { code: 500 };
    } catch (error) {
      this.logger.error('红包扫雷|离开房间  rpcLowerPlayer==>', error);
      return { code: 200 };
    }
  }


  /**
   * @name 获取可选房间列表
   * @returns 
   * @description 新版租户隔离
   */
  // async getRoomList(rootUid: string | null, parantUid: string) {
  //   try {
  //     // this.logger.warn(`大厅获取房间列表 | RPC |  rootUid ${rootUid} parantUid ${parantUid} | 获取前`);
  //     const list = RedPacketDynamicRoomManager.getInstance()
  //       .getRoomListByPlayerInfo(rootUid, parantUid);


  //     // this.logger.warn(`大厅获取房间列表 | RPC |  rootUid ${rootUid} parantUid ${parantUid} | 清洗数据后 | ${JSON.stringify(l, null, 2)}`);
  //     return ApiResult.SUCCESS(list);
  //   } catch (e) {
  //     this.logger.error('getRoomList', e.stack);
  //     return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1212) };
  //   }
  // }

  async leaveGameAndBackToHall(player: { group_id: string, lineCode: string, uid: string }, roomId: string) {
    try {

      this.roomManager.removePlayer(player as PlayerInfo)

      return ApiResult.SUCCESS();
    } catch (e) {
      this.logger.error(` 红包扫雷 | 玩家回到大厅 | 出错  ${e.stack}`);
      return ApiResult.ERROR();
    }
  }

  public async entryScenes({ player }) {
    try {
        const group = this.roomManager.getTenantScene(player);
        this.roomManager.addPlayer(player);
        const rooms = group.getRooms();
        const data = rooms.map((roomInfo) => {
            return {
                sceneId: roomInfo.sceneId,
                roomId: roomInfo.roomId,
                history: {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    // countDown: roomInfo.countDown,
                    // roomStatus: roomInfo.status,
                },
                // up7Historys: roomInfo.getRecird()
            };
        });
        return { code: 200, data };
    } catch (error) {
        this.logger.error('entryScenes', error);
        return { code: 500, msg: getlanguage(null, Net_Message.id_1213) };
    }
}
}
