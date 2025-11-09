import { Application, BackendSession, pinus } from 'pinus';
import qznnMgr from '../lib/qznnMgr';
import sessionService = require('../../../services/sessionService');
import { getLogger } from "pinus";
const qznnErrorLogger = getLogger('server_out', __filename);
import langsrv = require('../../../services/common/langsrv');
import qznnConst = require('../lib/qznnConst');
import { PlayerStatus } from '../lib/qznnPlayer';

export default function (app: Application) {
  return new MainHandler(app);
}

export class MainHandler {

  constructor(private app: Application) {
    this.app = app;
  }

  /**
   * 加载完成
   * @route qznnpp.mainHandler.loaded
   */
  async loaded({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        return { code: 500, error: err };
      }

      if (playerInfo.status === 'NONE') {
        playerInfo.setStatus(PlayerStatus.WAIT);
        setTimeout(() => {
          roomInfo.channelIsPlayer('qz_onEntry', {
            player: playerInfo.strip(),
            status: roomInfo.status,
            waitTime: roomInfo.getWaitTime()
          });
        }, 500)
      }
      setTimeout(() => {
        roomInfo.wait(playerInfo);
      }, 500);


      // 这里到时候考虑是不是要通知有人进入房间了
      let opts = {
        code: 200,
        room: roomInfo.wrapGameData(),
        autoStartTime: roomInfo.getAutoStartTime(),
        onLine: playerInfo.onLine,
        waitTime: roomInfo.getWaitTime()
      }
      return opts;
    } catch (error) {
      qznnErrorLogger.error('qznn.mainHandler.loaded==>', error);
      return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1212) };
    }
  }

  /**
   * 点击抢庄
   * @param 0 1 2 3 不抢 123倍
   * @route qznnpp.mainHandler.robzhuang
   */
  async robzhuang(msg: { mul: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        return { code: 500, error: err };
      }
      if (!qznnConst.robzhuang_arr.includes(msg.mul)) {
        return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
      }
      // 是不是抢庄 状态
      if (roomInfo.status !== 'ROBZHUANG') {
        return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }
      if (msg.mul != 0 && playerInfo.gold < roomInfo.entryCond) {
        return { code: 500, error: '持有金币低于入场限制,不能抢庄' };
      }
      // 是否已经选择了
      if (roomInfo.robzhuangs.find(m => m.uid === playerInfo.uid)) {
        return { code: 200 };
      }

      // 记录
      playerInfo.action_robzhuangOpt(roomInfo, msg.mul);
      return { code: 200 };
    } catch (error) {
      qznnErrorLogger.error('qznn.mainHandler.robzhuang==>', error);
      return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 点击下注
   * @route qznnpp.mainHandler.bet
   */
  async bet(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    if (err) {
      return { code: 500, error: err };
    }
    if (!qznnConst.xj_bet_arr.includes(msg.betNum)) {
      return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1214) };
    }

    // 是不是下注 状态
    if (roomInfo.status !== 'READYBET' || playerInfo.status != `GAME`) {
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
    }
    // 检查如果是庄 就不用下注
    if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
      return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
    }
    // 是否下过注了
    if (playerInfo.betNum !== 0) {
      return { code: 200 };
    }
    // 检查是否推注
    if (msg.betNum === -1) {
      if (playerInfo.pushbet === 0) {
        return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }
      msg.betNum = playerInfo.pushbet;
      playerInfo.pushbet = -1;
    }

    playerInfo.action_betOpt(roomInfo, msg.betNum);
    return { code: 200 };
  }

  /**
   * @route qznnpp.mainHandler.pinpai
   */
  async pinpai(msg: { betNum: number }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    if (err) {
      return { code: 500, error: err };
    }
    playerInfo.action_liangpaiOpt(roomInfo);
    return { code: 200 };
  }

}

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = qznnMgr.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: '抢庄牛牛房间不存在' };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: '该局已结束' };
  }
  playerInfo.update_time();
  return { roomInfo: roomInfo, playerInfo };
}
