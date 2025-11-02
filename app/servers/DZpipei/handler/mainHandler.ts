import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import RoomMgr from '../lib/dzRoomMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from "pinus";
import *as  DZpipeiConst from '../lib/DZpipeiConst';
import { PlayerStatus } from '../lib/dzPlayer';

import langsrv = require('../../../services/common/langsrv');

const Logger = getLogger('server_out', __filename);


export default function (app: Application) {
  return new MainHandler(app);
}

export class MainHandler {

  constructor(private app: Application) {
    this.app = app;
  }

  /**
   * 加载完成
   * @route DZpipei.mainHandler.loaded
   */
  async loaded({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.loaded==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      playerInfo.isOnLine = false;
      let offLine = roomInfo.getOffLineData(playerInfo);//获取离线数据

      let opts: DZpipeiConst.DZpipei_mainHandler_loaded = {
        code: 200,
        room: roomInfo.strip(),
        sceneId,
        roundId: roomInfo.roundId,
        offLine
      }
      return opts;
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.loaded==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
    }
  }

  /**
   * 跟注
   * @route DZpipei.mainHandler.cingl
   */
  async cingl({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);

    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
    if (err) {
      Logger.warn(`DZpipei.mainHandler.cingl==>err:${err}`);
      return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
    }
    try {
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      const bet = roomInfo.lastBetNum - playerInfo.bet;
      do {
        if (playerInfo.canUserGold() > bet && bet > 0) {
          roomInfo.handler_oper('cingl', playerInfo, bet);
          break;
        }
        if (playerInfo.canUserGold() <= bet && bet > 0) {
          let betNum = playerInfo.canUserGold();
          roomInfo.handler_oper('allin', playerInfo, betNum);
          break;
        }
        if (bet == 0) {
          roomInfo.handler_oper('pass', playerInfo, bet);
          break;
        }
      } while (true);
      return { code: 200 };
    } catch (error) {
      Logger.warn(`DZpipei.mainHandler.cingl==>${playerInfo.nickname}`, error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 推荐加注
   *@route  DZpipei.mainHandler.filling1
   */
  async filling1({ type }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.filling1==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      let betNum = playerInfo.recommendBet[type];
      if (!betNum || playerInfo.isFold == true || (roomInfo.lastBetNum - playerInfo.bet) > betNum) {
        Logger.warn(`DZpipei.mainHandler.filling1|${playerInfo.nickname}|betNum:${betNum}|lastBetNum:${roomInfo.lastBetNum}|bet:${playerInfo.bet}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
      }
      //筹码不足
      if (playerInfo.canUserGold() < betNum) {
        betNum = playerInfo.canUserGold();
        //全下
        roomInfo.handler_oper('allin', playerInfo, betNum);
        return { code: 200 };
      }
      roomInfo.handler_oper('filling', playerInfo, betNum);
      return { code: 200 };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.filling1==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 自由加注
   *@route DZpipei.mainHandler.filling2
   */
  async filling2(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.filling2==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      if (typeof msg.betNum != 'number' || msg.betNum <= 0 || msg.betNum < roomInfo.freedomBet[0]
        // || msg.betNum > roomInfo.freedomBet[1]
      ) {
        Logger.warn(`DZpipei.mainHandler.filling2==>|${playerInfo.nickname}|${roomInfo.curr_doing_seat}|betNum:${msg.betNum}|${roomInfo.freedomBet}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
      }
      if (playerInfo.canUserGold() < msg.betNum || playerInfo.isFold == true || (roomInfo.lastBetNum - playerInfo.bet) > msg.betNum) {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
      }
      do {
        if (msg.betNum == 0) {
          roomInfo.handler_oper('pass', playerInfo, msg.betNum);
          break;
        }
        if (playerInfo.canUserGold() == msg.betNum) {
          roomInfo.handler_oper('allin', playerInfo, msg.betNum);
          break;
        }
        roomInfo.handler_oper('filling', playerInfo, msg.betNum);
        break;
      } while (true);
      return { code: 200 };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.filling2==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 全下
   * @route DZpipei.mainHandler.allin
   */
  async allin({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.allin==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
      }
      if (playerInfo.isFold == true) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
      }
      let betNum = playerInfo.canUserGold();
      //下注
      roomInfo.handler_oper('allin', playerInfo, betNum);
      return { code: 200 };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.allin==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 弃牌
   *@route DZpipei.mainHandler.fold
   */
  async fold({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.fold==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1033) };
      }
      //弃牌
      playerInfo.handler_fold(roomInfo, 'fold');
      return { code: 200 };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.fold==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 仅提供给机器人调用
   *@route DZpipei.mainHandler.robotNeed
   */
  async robotNeed({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = checkCanOpt(sceneId, roomId, uid, true);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.robotNeed==>err:${err}|isRobot:${playerInfo.isRobot}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (playerInfo.isRobot != 2) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }
      return { code: 200, descSortAllPlayer: roomInfo.getDescSortAllPlayer() };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.robotNeed==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }


  /**
   * 玩家准备
   *@route DZpipei.mainHandler.ready
   */
  async ready({ option }: { option: boolean }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, playerInfo, roomInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`DZpipei.mainHandler.ready==>err:${err}`);
        return { code: 501, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }

      // 玩家准备
      roomInfo.ready(playerInfo, option);

      return { code: 200 };
    } catch (error) {
      Logger.warn('DZpipei.mainHandler.ready==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
    }
  }

}

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = RoomMgr.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: "德州房间不存在" };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: "德州玩家不存在" };
  }
  playerInfo.update_time();
  return { roomInfo: roomInfo, playerInfo };
}

function checkCanOpt(sceneId: number, roomId: string, uid: string, isHistory: boolean = false) {
  const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
  if (err) {
    return { err: err };
  }
  if (roomInfo.status != 'INGAME' && !isHistory) {
    return { err: '操作错误01' };
  }
  if (playerInfo.status != 'GAME' && !isHistory) {
    return { err: '操作错误02' };
  }
  playerInfo.update_time();
  return { roomInfo: roomInfo, playerInfo };
}
