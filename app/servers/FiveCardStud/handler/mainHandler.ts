import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import FCSConst = require('../lib/FCSConst');
import FCSRoomMgr from '../lib/FCSRoomMgr';
import sessionService = require('../../../services/sessionService');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import { getLogger } from "pinus";
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
   * @route FiveCardStud.mainHandler.loaded
   */
  async loaded({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`FiveCardStud.mainHandler.loaded==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }

      roomInfo.wait(playerInfo);

      let opts: FCSConst.FiveCardStud_mainHandler_loaded = {
        code: 200,
        room: {
          sceneId: roomInfo.sceneId,
          roomId: roomInfo.roomId,
          roundId: roomInfo.roundId,
          status: roomInfo.status,
          waitTime: roomInfo.getWaitTime(),
          lowBet: roomInfo.lowBet,
          curr_doing_seat: roomInfo.curr_doing_seat,
          freedomBet: roomInfo.freedomBet,
          roundTimes: roomInfo.roundTimes,
          roomCurrSumBet: roomInfo.roomCurrSumBet,
          canCarryGold: roomInfo.canCarryGold,
        },
        players: roomInfo.players.map(pl => {
          if (pl) {
            return {
              seat: pl.seat,
              uid: pl.uid,
              nickname: pl.nickname,
              headurl: pl.headurl,
              gold: pl.gold,
              currGold: pl.canUserGold(),
              profit: pl.profit,
              status: pl.status,
              bet: pl.bet,
              isFold: pl.isFold,
              holds: (playerInfo.uid == pl.uid || roomInfo.status == "END") ? pl.holds : pl.holds.map((c, i) => i == 0 ? 0x99 : c),
              cardType: pl.cardType
            }
          }
        }),
      }
      return opts;
    } catch (error) {
      Logger.warn('FiveCardStud.mainHandler.loaded==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
    }
  }

  /**
   * 跟注
   * @route FiveCardStud.mainHandler.cingl
   */
  async cingl({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);

    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    if (err) {
      Logger.warn(`FiveCardStud.mainHandler.cingl==>err:${err}`);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
    }
    try {
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      const bet = roomInfo.lastBetNum - playerInfo.bet;
      do {
        if (playerInfo.canUserGold() > bet && bet > 0) {
          playerInfo.handler_play(roomInfo, 'cingl', bet);
          break;
        }
        if (playerInfo.canUserGold() <= bet && bet > 0) {
          let betNum = playerInfo.canUserGold();
          playerInfo.handler_play(roomInfo, 'allin', betNum);
          break;
        }
        if (bet == 0) {
          playerInfo.handler_play(roomInfo, 'pass', bet);
          break;
        }
      } while (true);
      return { code: 200 };
    } catch (error) {
      Logger.warn(`FiveCardStud.mainHandler.cingl==>${playerInfo.nickname}`, error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 自由加注
   *@route FiveCardStud.mainHandler.filling
   */
  async filling(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`FiveCardStud.mainHandler.filling==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      if (typeof msg.betNum != 'number' || msg.betNum < 0 || isNaN(msg.betNum) ||
        msg.betNum > roomInfo.freedomBet[1]) {
        Logger.warn(`FiveCardStud.mainHandler.filling==>|${playerInfo.uid}|${playerInfo.bet}|betNum:${msg.betNum}|${roomInfo.freedomBet}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
      }
      if (playerInfo.canUserGold() < msg.betNum || playerInfo.isFold == true) {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1015) };
      }
      do {
        if (msg.betNum == 0) {
          playerInfo.handler_play(roomInfo, 'pass', msg.betNum);
          break;
        }
        if (playerInfo.canUserGold() == msg.betNum) {
          playerInfo.handler_play(roomInfo, 'allin', msg.betNum);
          break;
        }
        playerInfo.handler_play(roomInfo, 'filling', msg.betNum);
        break;
      } while (true);
      return { code: 200 };
    } catch (error) {
      Logger.warn('FiveCardStud.mainHandler.filling2==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 全下
   * @route FiveCardStud.mainHandler.allin
   */
  // async allin({ }, session: BackendSession) {
  //   const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
  //   const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
  //   try {
  //     if (err) {
  //       Logger.warn(`FiveCardStud.mainHandler.allin==>err:${err}`);
  //       return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
  //     }
  //     if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
  //       return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
  //     }
  //     if (playerInfo.isFold == true) {
  //       return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1015) };
  //     }
  //     let betNum = playerInfo.canUserGold();

  //     playerInfo.handler_play(roomInfo, 'allin', betNum);
  //     return { code: 200 };
  //   } catch (error) {
  //     Logger.warn('FiveCardStud.mainHandler.allin==>', error);
  //     return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
  //   }
  // }

  /**
   * 弃牌
   *@route FiveCardStud.mainHandler.fold
   */
  async fold({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`FiveCardStud.mainHandler.fold==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.curr_doing_seat != playerInfo.seat || playerInfo.state == "PS_NONE") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1033) };
      }
      //弃牌
      playerInfo.handler_fold(roomInfo);
      return { code: 200 };
    } catch (error) {
      Logger.warn('FiveCardStud.mainHandler.fold==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }
}

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = FCSRoomMgr.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: "梭哈房间不存在" };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: "梭哈玩家不存在" };
  }
  playerInfo.update_time();
  return { roomInfo: roomInfo, playerInfo };
}

