'use strict';

import { Application, ChannelService, RemoterClass, BackendSession } from 'pinus';
import utils = require('../../../utils');
import sessionService = require('../../../services/sessionService');
import fisheryConst = require('../lib/fisheryConst');
import RedisManager = require('../../../common/dao/redis/lib/redisManager');
import fisheryManager from '../lib/FisheryRoomManagerImpl';
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
const fisheryErrorLogger = getLogger('server_out', __filename);

export default function (app: Application) {
  return new MainHandler(app);
}

export class MainHandler {

  constructor(app: Application) {

  }

  /**
   * 进入渔场游戏：
   * @param: {}
   * @return:
   * @route: fishery.mainHandler.intoFishery
   * */
  async intoFishery({ }, session: BackendSession) {
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        fisheryErrorLogger.warn(`fishery.mainHandler.intoFishery==>err:${err}|isRobot:${playerInfo.isRobot}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1201) };
      }
      setTimeout(() => {
        roomInfo.channelIsPlayer('changeFishery', {
          playerNum: roomInfo.players.length,
          list: roomInfo.rankingLists().slice(6),
          entryPlayer: playerInfo.basicsStrip()
        });
      }, 500);

      //查询上期开奖结果
      // let data = await fisheryManager.Instance().getRecordRedis(sceneId, roomId);
      // data && (data = data[0].fishType);
      return {
        code: 200,
        countDown: roomInfo.countTime(),
        fisheryRoom: roomInfo.stipRoom(),
        sceneId: roomInfo.sceneId,
        lastResult: roomInfo.fisheryHistory.slice(-1).length > 0 ? roomInfo.fisheryHistory.slice(-1)[0].fishType : null,
        gold: playerInfo.gold - playerInfo.bet,
        lotteryResult: roomInfo.result,
        roundId: roomInfo.roundId,
        state: roomInfo.roomStatus
      };
    } catch (error) {
      fisheryErrorLogger.warn('fishery.mainHandler.intoFishery==>', error);
      return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1201) };
    }
  }

  /**
   * 玩家下注：
   * @param: {gold} gold 下注金额
   * @return:
   * @route: fishery.mainHandler.fisheryBet
   **/
  async fisheryBet({ gold, seat }, session: BackendSession) {
    let tempLock;
    const { uid, roomId, sceneId, nid } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {

      // const { player, lock } = await PlayerManager.getPlayer({ uid }, false);

      if (err) {
        fisheryErrorLogger.warn(`fishery.mainHandler.fisheryBet==>err:${err}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_204) };
      }
      // 是否下注时间
      if (roomInfo.roomStatus !== 'BETTING') {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1011) }
      }
      if (typeof gold !== 'number' || gold <= 0 || fisheryConst.SEAT[seat] === undefined) {
        fisheryErrorLogger.warn(`fishery.mainHandler.fisheryBet==>gold:${gold}|seat:${seat}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_204) };
      }
      if (gold > utils.sum(playerInfo.gold - playerInfo.bet)) {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1015) };
      }

      //是否满足两千下注条件
      if (betAstrict.nid_9 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
        await RedisManager.unlock(tempLock);
        const mes = getlanguage(playerInfo.language, Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
        return { code: 500, error: mes };
      }

      if (playerInfo.betCheck(gold)) {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1013) };
      }


      //如果没有下注并且玩家没有续压,清除继压记录
      if (playerInfo.isBet == false && playerInfo.isContinue == false) {
        playerInfo.allSeat = {};
      }
      //下注
      playerInfo.playerFisheryBet(gold, roomInfo, fisheryConst.SEAT[seat], seat);
      playerInfo.isBet = true;

      //记录下注位置
      playerInfo.recordBetSeat(gold, seat);
      // 下注通知
      roomInfo.fisheryBet_(gold, seat, playerInfo);
      return { code: 200, gold: playerInfo.gold - playerInfo.bet };
    } catch (error) {
      fisheryErrorLogger.warn('fishery.mainHandler.fisheryBet==>', error);
      return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_204) };
    }
  }

  /**
   * 获取开奖记录：
   * @return: reslut 开奖记录
   * @route: fishery.mainHandler.getRecord
   * */
  async getRecord({ }, session: BackendSession) {
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        fisheryErrorLogger.warn(`fishery.mainHandler.getRecord==>err:${err}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3053) };
      }

      // const data = await fisheryManager.Instance().getRecordRedis(sceneId, roomId);
      return { code: 200, result: roomInfo.fisheryHistory };
    } catch (error) {
      fisheryErrorLogger.warn('fishery.mainHandler.getRecord==>', error);
      return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3053) };
    }
  }

  /**
   * 获取玩家列表：
   * @return: reslut 开奖记录
   * @route: fishing.fisheryHandler.getPlayerList
   * */
  async getPlayerList({ }, session: BackendSession) {
    const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        fisheryErrorLogger.warn(`fishery.mainHandler.getPlayerList==>err:${err}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3051) };
      }
      return { code: 200, upstarts: roomInfo.rankingLists().slice(0, 50) };
    } catch (error) {
      fisheryErrorLogger.warn('fishery.mainHandler.getPlayerList==>', error);
      return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3051) };
    }
  }
  /**
   * 
   * @param param0 
   * @route fishery.mainHandler.continueBet
   */
  async continueBet({ }, session: BackendSession) {
    const { uid, roomId, sceneId, nid } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {

      // const { player, lock } = await PlayerManager.getPlayer({ uid }, false);
      if (err) {
        fisheryErrorLogger.warn(`fishery.mainHandler.continueBet==>err:${err}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3250) };
      }
      // 是否下注时间
      if (roomInfo.roomStatus != 'BETTING') {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1011) }
      }
      if (playerInfo.bet > 0) {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1039) };
      }
      const continueGold = utils.sum(playerInfo.allSeat);
      if (continueGold <= 0) {
        fisheryErrorLogger.warn(`fishery.mainHandler.continueBet==>continueGold:${continueGold}`);
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3250) };
      }

      if (continueGold > utils.sum(playerInfo.gold - playerInfo.bet)) {
        return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_1015) };
      }
      //是否满足两千下注条件
      if (betAstrict.nid_9 && (betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] > utils.sum(playerInfo.gold))) {
        const mes = getlanguage(playerInfo.language, Net_Message.id_1106, betAstrict.nid_8[`sceneId_${roomInfo.sceneId}`] / betAstrict.ratio);
        return { code: 500, error: mes };
      }
      //扣钱
      playerInfo.continueGolds(roomInfo);
      roomInfo.continueBets_(playerInfo);
      return { code: 200, gold: playerInfo.gold - playerInfo.bet };
    } catch (error) {
      // await RedisManager.unlock(tempLock);
      fisheryErrorLogger.warn('fishery.mainHandler.continueBet==>', error);
      return { code: 500, error: getlanguage(playerInfo.language, Net_Message.id_3250) };
    }
  }

}

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = fisheryManager.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: '没有找到渔场' };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: '渔场里面没有玩家' };
  }
  playerInfo.update_time();
  return { roomInfo, playerInfo };
}
