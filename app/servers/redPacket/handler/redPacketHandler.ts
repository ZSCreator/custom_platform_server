import { Application, BackendSession, Logger, pinus } from 'pinus';
import { getLogger } from 'pinus-logger';
const logger = getLogger('server_out', __filename);
import RpcApiResult from "../../../common/pojo/dto/ApiResultDTO";
import { GameStatusEnum } from "../lib/enum/GameStatusEnum";
// import RedPacketGameManager from "../lib/RedPacketRoomManager";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { RedPacketGameStatusEnum } from "../lib/enum/RedPacketGameStatusEnum";
import { ChannelEventEnum } from "../lib/enum/ChannelEventEnum";
import sessionService = require('../../../services/sessionService');
import { ApiResult } from '../../../common/pojo/ApiResult';
import langsrv = require('../../../services/common/langsrv');
import { PlayerGameStatusEnum } from '../lib/enum/PlayerGameStatusEnum';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
// import { RedPacketDynamicRoomManager } from '../lib/RedPacketDynamicRoomManager';
import roomManager from "../lib/RedPacketTenantRoomManager";

export default function (app: Application) {
  return new RedPacketHandler(app);
}

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = roomManager.searchRoom(sceneId, roomId);
  if (!roomInfo) return { err: '房间不存在' };
  const player = roomInfo.getPlayer(uid);
  if (!player) return { err: '玩家不存在' };
  player.update_time();
  return { roomInfo, player };
}

export class RedPacketHandler {

  private logger: Logger;

  constructor(private app: Application) {
    this.app = app;
    this.logger = logger;
  }

  /**
   * 玩家就绪 - 加载完成
   * @route redPacket.redPacketHandler.loaded
   * @returns {RpcApiResult}
   */
  async loaded({ }, session: BackendSession) {

    let apiResult = new RpcApiResult();
    let language = null;
    // const { uid, roomId, sceneId } = gutils.sessionInfo(session);
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    // const roomId = '001';
    // const sceneId = 0;
    try {
      const { err, roomInfo, player: currPlayer } = check(sceneId, roomId, uid);
      if (err) {
        // apiResult['msg'] = langsrv.getlanguage(currPlayer.language, langsrv.Net_Message.id_1201);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1201);

        this.logger.warn(`红包扫雷|加载游戏|用户:${uid}|加载场:${sceneId},房间号:${roomId}|异常分支:${err}`)
      }
      if (!err) language = currPlayer.language;

      if (apiResult['msg'].length === 0) {

        const player = currPlayer.isRobot === RoleEnum.REAL_PLAYER ?
          await PlayerManagerDao.findOne({ uid }, false) :
          roomInfo.getPlayer(uid);

        /* if (roomInfo.status === GameStatusEnum.NONE) {
          roomInfo.init();
          roomInfo.run();
        } */
        const offline = currPlayer.onLine ? roomInfo.getOffLineData(currPlayer) : undefined;

        const handOutRedPacket = roomInfo.redPackQueue && roomInfo.redPackQueue.length > 0 && roomInfo.redPackQueue[0].status === RedPacketGameStatusEnum.GAME ? roomInfo.redPackQueue[0] : {};

        if (Object.keys(handOutRedPacket).length > 0) {
          const playerInRoom = roomInfo.getPlayer(player.uid);
          Object.assign(handOutRedPacket, { headurl: playerInRoom.headurl,  })
        }

        currPlayer.gold = player.gold;

        return {
          code: 200,
          handOutRedPacket,
          redPackQueue: roomInfo.redPackQueue,
          room: roomInfo.getCurrentInformationAboutRoom(),
          currentPlayer: {
            uid,
            gold: player.gold,
            gain: currPlayer.gain,
            nickname: currPlayer.nickname,
            headurl: currPlayer.headurl,
            status: currPlayer.status
          },
          playerList: roomInfo.currentGraberQueue.filter(graber => graber.hasGrabed).map(({ grabUid: uid, gold, nickname, headurl }) => ({ uid, gold, nickname, headurl })),
          offLine: offline,
          sceneId: roomInfo.sceneId,
          roundId: roomInfo.roundId,
          redParketNum: roomInfo.redParketNum,
          playerCount: roomInfo.players.length
        }
      }
    } catch (e) {
      this.logger.error(`红包扫雷|加载出错|房间:${roomId}|场:${sceneId}|用户:${uid}|`, e);
      apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1201);
    }

    return apiResult;
  }

  /**
   * 抢红包
   * @readonly {RpcApiResult}
   */
  async grabRedPacket({ }, session: BackendSession) {
    let apiResult = new RpcApiResult();
    const { uid, roomId, sceneId, isRobot } = sessionService.sessionInfo(session);
    let language = null;
    try {

      const { err, roomInfo, player } = check(sceneId, roomId, uid);
      if (err) {
        if (isRobot === RoleEnum.ROBOT) {
          return ApiResult.SUCCESS()
        }
        this.logger.error('红包扫雷|抢红包|获取用户信息出错', err);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
        return apiResult;
      }
      language = player.language;
      // Step 1:判断房间状态是否可抢
      if (roomInfo.status !== GameStatusEnum.READY) {
        player.isRobot === 0 && this.logger.warn(`红包扫雷|抢红包失败|房间当前状态不能抢红包|room status:${roomInfo.status}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8101);
        return apiResult;
      }
      // Step 2:判断红包队列里红包是否数量大于1
      if (roomInfo.redPackQueue.length === 0) {
        player.isRobot === 0 && this.logger.warn(`红包扫雷|抢红包失败|红包队列为空:${roomInfo.redPackQueue.length}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8102);
        return apiResult;
      }
      // Step 2:判断抢包队列里红包是否有可抢红包
      if (roomInfo.currentGraberQueue.filter(redPacketInfo => redPacketInfo.hasGrabed).length === roomInfo.sceneInfo.redParketNum) {
        player.isRobot === 0 && this.logger.info(`红包扫雷|抢红包失败|红包已抢完，请等待下一局|用户:${player.uid}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8103);
        return apiResult;
      }

      // Step 3:判断抢包队列里红包已经抢过
      if (roomInfo.currentGraberQueue.filter(redPacketInfo => redPacketInfo.grabUid === uid).length > 0) {
        player.isRobot === 0 && this.logger.info(`红包扫雷|抢红包失败|已抢得红包，不可再抢|用户:${player.uid}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
        return apiResult;
      }

      // Step 4:判断抢包阶段时间是否超时
      if (roomInfo.status === GameStatusEnum.READY && roomInfo.tmp_countDown <= 0) {
        this.logger.info(`红包扫雷|抢红包失败|抢红包超时|用户id:${player.uid}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8104);
        return apiResult;
      }
      // Step 5:判断当前玩家携带金币是否够参加当前对局
      // const { player: currentPlayer } = await getPlayer({ uid });
      const currentPlayer = player.isRobot === RoleEnum.REAL_PLAYER ?
        await PlayerManagerDao.findOne({ uid }, false) :
        roomInfo.getPlayer(uid);

      if (roomInfo.redPackQueue[0].amount * roomInfo.sceneInfo.lossRation > currentPlayer.gold) {
        this.logger.info(`红包扫雷|抢红包失败|用户金额不足赔付|红包金额:${roomInfo.redPackQueue[0].amount}|赔率:${roomInfo.sceneInfo.lossRation}|用户金额:${player.gold}`);
        sceneId === 0 ?
          apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8105) :
          apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8117);

        return apiResult;
      }

      /**
       * 检查机器人是否还能抢包
       */
      if (currentPlayer.isRobot === 2 && roomInfo.allowedRobotGrab()) {
        // return {code: 200};
        // TODO 之所以返回500抢红包失败 是为了让机器人离开房间保持活性 后续可优化 然机器人玩的回合更短
        apiResult.code = 81001;
        apiResult['msg'] = '机器人:不超过可抢最大数 - 抢红包失败';
        return apiResult;
      }

      // 抢包
      const apiResultOrBoolean = await roomInfo.grabRedPacket(player.uid);

      if (apiResultOrBoolean instanceof ApiResult) {
        return apiResultOrBoolean;
      }

      // Step 6:封装响应给前端所需数据
      const redPacketIdx = roomInfo.currentGraberQueue.findIndex(graberRedPacket => graberRedPacket.grabUid === player.uid);
      const result = roomInfo.currentGraberQueue
        .filter(graberRedPacketInfo => graberRedPacketInfo.hasGrabed)
        .map(redPacketInfo => {
          const { grabUid, redPacketAmount, nickname, grabTime, headurl, ...rest } = redPacketInfo;
          // isStepInMine,
          /* hasGrabed: boolean;
          grabTime: number;
          redPacketListIdx: number;
          isStepInMine: boolean;
          nickname: string;
          gold: number;
          headurl: string;
          vipScore: number; */
          return {
            uid: grabUid,
            // isStepInMine,
            headurl,
            nickname,
            grabTime,
            // ...rest
          };
        })
        .sort((a, b) => a.grabTime - b.grabTime);
      // Step 7:广播抢包事件
      roomInfo.channelIsPlayer(ChannelEventEnum.grab, {
        result
      });

      let { redPacketAmount, ...res } = roomInfo.currentGraberQueue[redPacketIdx]
      return {
        code: 200,
        redPacketAmount,
        ...res
      }
    } catch (e) {
      this.logger.error(`红包扫雷|抢红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
      apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
      return apiResult;
    }
  }

  /**
   * 申请发红包
   */
  async applyForHandOutRedPacket({ }, session: BackendSession) {
    let apiResult = new RpcApiResult();
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    let language = null;
    try {
      const { err, roomInfo, player } = check(sceneId, roomId, uid);

      if (err) {
        this.logger.error('红包扫雷|申请发红包|获取用户信息|出错:', err);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
        return apiResult;
      }
      language = player.language;
      if (roomInfo.status === GameStatusEnum.NONE) {
        this.logger.warn(`红包扫雷|发红包|房间 ${roomId} 状态异常|用户${uid}|发红包时还未处于为运行状态`);
        roomInfo.changeGameStatues(GameStatusEnum.WAIT);
        roomInfo.init();
        roomInfo.run();
      }

      return {
        code: 200,
        redPacketList: roomInfo.redPackQueue
      };

    } catch (e) {
      this.logger.error(`红包扫雷|申请发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
      apiResult.msg = langsrv.getlanguage(language, langsrv.Net_Message.id_8107);
    }
    return apiResult
  }

  /**
   * 发红包(即埋雷)
   * @param amount
   * @param mineNumber
   * @param session
   * @returns {RpcApiResult}
   */
  async handOutRedPacket({ amount, mineNumber }, session: BackendSession) {

    let apiResult = new RpcApiResult();
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    let language = null;
    try {
      amount = parseFloat(amount);
      mineNumber = parseInt(mineNumber);
      if (!Number.isInteger(amount) || !Number.isInteger(mineNumber) || amount <= 0) {
        this.logger.warn(`红包扫雷|发红包|前端传入参数异常:amount:${amount},mineNumber:${mineNumber}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
        return apiResult;
      }

      const { err, roomInfo, player } = check(sceneId, roomId, uid);
      if (err) {
        if (err !== "玩家不存在")
          this.logger.error('红包扫雷|发红包|获取用户信息|出错:', err);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
        return apiResult;
      }
      language = player.language;
      const isRobot = player.isRobot === 2;

      if (roomInfo.status === GameStatusEnum.NONE) {
        this.logger.warn(`红包扫雷|发红包|房间 ${roomId} 状态异常|${isRobot ? '机器人' : '用户'}${uid}|发红包时还未处于为运行状态`);
        roomInfo.changeGameStatues(GameStatusEnum.WAIT);
        roomInfo.init();
        roomInfo.run();
      }

      if (roomInfo.redPackQueue.findIndex(redPacketInfo => redPacketInfo.owner_uid === player.uid) >= 0) {
        this.logger.info(`红包扫雷|发红包|${isRobot ? '机器人' : '用户'}:${player.uid}|金额:${amount}|雷号:${mineNumber}|异常分支:同一时间同个红包队列能发一个红包。`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8108);
        return apiResult;
      }

      if (player.status === PlayerGameStatusEnum.GAME) {

        const curPlayer = roomInfo.currentGraberQueue.find(({ grabUid }) => grabUid === player.uid);

        if (curPlayer && curPlayer.isStepInMine && roomInfo.redPackQueue[0].amount + (isRobot ? amount : amount * 100) > player.gold) {
          this.logger.warn(`红包扫雷|发红包失败|${isRobot ? '机器人' : '用户'}金额不足|红包金额:${isRobot ? amount : amount * 100}|用户金额:${player.gold}`);
          apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8109);
          return apiResult;
        }

      }

      if (amount > player.gold) {
        this.logger.warn(`红包扫雷|发红包失败|${isRobot ? '机器人' : '用户'}金额不足|红包金额:${amount}|用户金额:${player.gold}`);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8109);
        return apiResult;
      }

      amount = isRobot ? amount : amount * 100;

      const redPackQueue = roomInfo.handOutRedPacket(player.uid, amount, mineNumber);
      // apiResult.code = 200;
      // apiResult.data = redPackQueue;
      return {
        code: 200,
        redPacketList: redPackQueue
      };
    } catch (e) {
      this.logger.error(`红包扫雷|发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
    }
    return apiResult;
  }

  /**
   * 取消发红包
   * @param session
   * @returns {RpcApiResult}
   */
  async cancelHandOutRedPacket({ }, session: BackendSession) {
    let apiResult = new RpcApiResult();
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    let language = null;
    try {
      const { err, roomInfo, player } = check(sceneId, roomId, uid);

      if (err) {
        this.logger.error('红包扫雷|发红包|获取用户信息|出错:', err);
        apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8110);
        return apiResult;
      }
      language = player.language;
      if (roomInfo.status === GameStatusEnum.NONE) {
        this.logger.warn(`红包扫雷|取消发红包|房间 ${roomId} 状态异常|用户${uid}|发红包时还未处于为运行状态`);
        roomInfo.changeGameStatues(GameStatusEnum.WAIT);
        roomInfo.init();
        roomInfo.run();
      }

      const redPacketList = roomInfo.redPackQueue.filter(redPacket => redPacket.owner_uid === player.uid);

      if (redPacketList[0].status === RedPacketGameStatusEnum.GAME) {
        apiResult.msg = langsrv.getlanguage(language, langsrv.Net_Message.id_8111);
        return apiResult;
      }

      roomInfo.cancelHandOutRedPacket(player.uid);

      apiResult.code = 200;
    } catch (e) {
      this.logger.error(`红包扫雷|取消发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e)
    }

    return apiResult;
  }

}
