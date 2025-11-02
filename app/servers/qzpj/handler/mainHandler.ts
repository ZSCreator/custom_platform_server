import { Application, BackendSession, pinus } from 'pinus';
import gutils = require('../../../domain/games/util');
import qzpjMgr from '../lib/qzpjMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from "pinus";
import *as qzpj_logic from "../lib/qzpj_logic";
const qzpjErrorLogger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');
import qzpjConst = require('../lib/qzpjConst');
import { RoomState, route } from '../lib/qzpjConst';

export default function (app: Application) {
  return new MainHandler(app);
}

export class MainHandler {

  constructor(private app: Application) {
    this.app = app;
  }

  /**
   * 加载完成
   * @route qzpj.mainHandler.loaded
   */
  async loaded({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
    try {
      if (err) {
        return { code: 500, msg: err };
      }

      if (playerInfo.status === 'NONE') {
        playerInfo.status = 'WAIT';
        let opts = {
          player: playerInfo.strip(),
          status: roomInfo.status,
        }
        //避免自己收到自己进入房间广播
        roomInfo.kickOutMessage(playerInfo.uid);
        roomInfo.channelIsPlayer(route.qzpj_onEntry, opts);
        roomInfo.addMessage(playerInfo);
      }
      setTimeout(() => {
        roomInfo.wait(playerInfo);
      }, 500);


      // 这里到时候考虑是不是要通知有人进入房间了
      let opts = {
        code: 200,
        room: roomInfo.wrapGameData(),
        onLine: playerInfo.onLine,
      }
      return opts;
    } catch (error) {
      qzpjErrorLogger.error('qzpj.mainHandler.loaded==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
    }
  }

  /**
   * 点击抢庄
   * @param 0 1 2 3 不抢 123倍
   * @route qzpj.mainHandler.robTheBanker {mul:number}
   */
  async robTheBanker(msg: { mul: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
    try {
      if (err) {
        return { code: 500, msg: err };
      }
      if (playerInfo.gold / roomInfo.lowBet < msg.mul * 30) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
      }
      if (!qzpjConst.robzhuang_arr.includes(msg.mul)) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
      }
      // 是不是抢庄 状态
      if (roomInfo.status != RoomState.ROBZHUANG) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }
      if (msg.mul != 0 && playerInfo.gold < roomInfo.entryCond) {
        return { code: 500, msg: '持有金币低于入场限制,不能抢庄' };
      }
      // 是否已经选择了
      if (playerInfo.robmul != -1) {
        return { code: 200 };
      }

      // 记录
      playerInfo.handler_robBanker(roomInfo, msg.mul);
      return { code: 200 };
    } catch (error) {
      qzpjErrorLogger.error('qzpj.mainHandler.robTheBanker==>', error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 点击下注
   * @route qzpj.mainHandler.bet { betNum: number }
   */
  async bet(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
    if (err) {
      return { code: 500, msg: err };
    }


    if (!playerInfo.bet_mul_List.includes(msg.betNum)) {
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
    }

    // 是不是下注 状态
    if (roomInfo.status != RoomState.READYBET || playerInfo.status != `GAME`) {
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
    }
    // 检查如果是庄 就不用下注
    if (roomInfo.zhuangInfo.uid == playerInfo.uid) {
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
    }
    // 是否下过注了
    if (playerInfo.betNum != 0) {
      return { code: 200 };
    }
    playerInfo.handler_bet(roomInfo, msg.betNum);
    return { code: 200 };
  }
  /**
  * 获取剩余牌
  * @route qzpj.mainHandler.RemainCard {}
  */
  async RemainCard(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid, language);
    if (err) {
      return { code: 500, msg: err };
    }
    return { code: 200, TheCards: roomInfo._cards.slice().sort((a, b) => a - b) };
  }
}

function check(sceneId: number, roomId: string, uid: string, language: string) {
  const roomInfo = qzpjMgr.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_1004) };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2017) };
  }
  playerInfo.update_time();
  return { roomInfo: roomInfo, playerInfo };
}
