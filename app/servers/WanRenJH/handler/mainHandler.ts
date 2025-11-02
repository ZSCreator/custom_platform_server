"use strict";
import { Application, ChannelService, RemoterClass, BackendSession, } from "pinus";

import utils = require("../../../utils/index");
import sessionService = require("../../../services/sessionService");
import WanRenJHConst = require("../../../consts/WanRenJHConst");
import WJRoomManger from "../lib/WanrenMgr";
import langsrv = require("../../../services/common/langsrv");
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import {
  WanRenZJH_mainHandler_loaded,
  WanRenZJH_mainHandler_applyBet,
  WanRenZJH_mainHandler_applyResult,
  WanRenZJH_mainHandler_bet,
  WanRenZJH_mainHandler_applyplayers,
  WanRenZJH_mainHandler_rankingList, WanRenZJH_mainHandler_applyupzhuangs,
} from "../lib/interface/wrjh_interface";

import { getLogger } from "pinus-logger";

const Logger = getLogger("server_out", __filename);

function check(sceneId: number, roomId: string, uid: string) {
  const roomInfo = WJRoomManger.searchRoom(sceneId, roomId);
  if (!roomInfo) {
    return { err: `万人金花房间不存在|sceneId:${sceneId}|roomId:${roomId}` };
  }
  const playerInfo = roomInfo.getPlayer(uid);
  if (!playerInfo) {
    return { err: `万人金花玩家不存在${uid}` };
  }
  playerInfo.update_time();
  return { roomInfo, playerInfo };
}

export default function (app: Application) {
  return new mainHandler(app);
}
export class mainHandler {
  constructor(private app: Application) { }
  /**
   * 加载完成
   * @route WanRenJH.mainHandler.loaded
   */
  async loaded({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.loaded==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }


      setTimeout(() => {
        roomInfo.playersChange(playerInfo);
        roomInfo.noticeZhuangInfo(playerInfo);
      }, 500);

      let offline = roomInfo.toResultBack();
      const opts: WanRenZJH_mainHandler_loaded = {
        code: 200,
        room: roomInfo.strip(),
        players: playerInfo.loadedStrip(roomInfo),
        offLine: offline,
        sceneId: roomInfo.sceneId,
        roundId: roomInfo.roundId,
        poundage: WanRenJHConst.CHOU_SHUI * 100,
        situations: roomInfo.situations
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.loaded==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请开始下注
   * @route WanRenJH.mainHandler.applyBet
   */
  async applyBet({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyBet==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.status === "INSETTLE" || roomInfo.status === "INBIPAI") {
        return {
          code: 200,
          status: "INBIPAI",
          countdownTime: roomInfo.getCountdownTime(),
        };
      }
      const opts: WanRenZJH_mainHandler_applyBet = {
        code: 200,
        status: roomInfo.status,
        countdownTime: roomInfo.getCountdownTime(),
        data: roomInfo.toBetBack(),
        isRenew: playerInfo.isCanRenew(roomInfo)
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyBet==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请结果
   * @route WanRenJH.mainHandler.applyResult
   */
  async applyResult({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyResult==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      // if (roomInfo.status === "INSETTLE" || roomInfo.status === "BETTING") {
      //   return { code: 200, status: "BETTING", countdownTime: 1000 };
      // }
      let res = roomInfo.toResultBack();
      const opts: WanRenZJH_mainHandler_applyResult = {
        code: 200,
        status: roomInfo.status,
        countdownTime: roomInfo.getCountdownTime(),
        data: res,
        isRenew: playerInfo.isCanRenew(roomInfo)
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyResult==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 下注(百人下注的时候不扣钱)
   * @route WanRenJH.mainHandler.bet
   */
  async bet(msg: { area: number, betNum: number }, session: BackendSession) {
    const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err || !playerInfo) {
        Logger.warn(`WanRenJH.mainHandler.bet==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo && playerInfo.language, langsrv.Net_Message.id_2003) };
      }
      if (typeof msg.betNum !== "number" || msg.betNum <= 0) {
        Logger.warn(`WanRenJH.mainHandler.bet==>betNum:${msg.betNum}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1214) };
      }
      if (!roomInfo.regions[msg.area]) {
        Logger.warn(`WanRenJH.mainHandler.bet==>area:${msg.area}`);
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012), };
      }
      if (playerInfo.bet == 0 && playerInfo.gold - playerInfo.bet < roomInfo.lowBet) {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1012) };
      }
      //庄不能下注
      if (roomInfo.zhuangInfo.uid == uid) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }
      // 是否下注时间
      if (roomInfo.status !== "BETTING") {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1011) };
      }


      //个人限红
      if (playerInfo.bets[msg.area].bet + msg.betNum > roomInfo.tallBet) {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1108) };
      }
      const ret: WanRenZJH_mainHandler_bet = {
        code: 200,
        changeJettonNum: null,
      };
      // 是不是超出10倍了
      const sumCount = playerInfo.bets.reduce((sum, value) => sum + value.bet, 0) + msg.betNum;
      if (sumCount * roomInfo.compensate > playerInfo.gold) {
        let str = langsrv.Net_Message.id_1109;
        if (roomInfo.sceneId != 0) {
          str = langsrv.Net_Message.id_1022;
        }
        return {
          code: 500, msg: langsrv.getlanguage(playerInfo.language, str),
        };
      }

      if (roomInfo.isBeyondZhuangLimit([msg])) {
        return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1023) };
      }
      // 投注
      roomInfo.onBeting(playerInfo, msg.area, msg.betNum);

      return ret;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.bet==>", error);
      return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 需押
   * @route WanRenJH.mainHandler.goonBet
   */
  async goonBet({ }, session: BackendSession) {
    const { uid, roomId, nid, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.goonBet==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (roomInfo.zhuangInfo.uid == uid) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }

      // 是否下注时间
      if (roomInfo.status !== "BETTING") {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1011) };
      }
      if (playerInfo.bet > 0) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1018) };
      }

      // 需押总金币
      const betNum = playerInfo.lastBets.reduce((sum, value) => sum + value.betNum, 0);
      if (betNum == 0) {
        return { code: 200 };
      }
      if (playerInfo.gold - betNum < roomInfo.lowBet) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1012) };
      }

      // 是不是超出10倍了
      if (betNum * roomInfo.compensate > playerInfo.gold) {
        let msg = langsrv.getlanguage(language, langsrv.Net_Message.id_1022);
        msg = langsrv.getlanguage(language, langsrv.Net_Message.id_1109);
        return { code: 500, msg: msg };
      }

      // 够不够庄家赔
      if (roomInfo.isBeyondZhuangLimit(playerInfo.lastBets)) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1023) };
      }

      //需押
      roomInfo.onGoonBet(playerInfo);
      return { code: 200 };
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.goonBet==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请玩家列表
   * @route WanRenJH.mainHandler.applyplayers
   */
  async applyplayers({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyplayers==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      const opts: WanRenZJH_mainHandler_applyplayers = {
        code: 200,
        list: roomInfo.rankingLists().slice(0, 50),
        zhuang: roomInfo.zhuangInfo.uid,
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyplayers==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请排行榜
   * @route WanRenJH.mainHandler.rankingList
   */
  async rankingList({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.rankingList==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      const opts: WanRenZJH_mainHandler_rankingList = {
        code: 200,
        list: roomInfo.rankingLists().slice(0, 6),
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.rankingList==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请上庄列表
   * @route WanRenJH.mainHandler.applyupzhuangs
   */
  async applyupzhuangs({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyupzhuangs==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      const opts: WanRenZJH_mainHandler_applyupzhuangs = {
        code: 200,
        list: roomInfo.applyZhuangs.map(pl => {
          return {
            uid: pl.uid,
            headurl: pl.headurl,
            nickname: pl.nickname,
            bet: pl.bet,
            gold: pl.gold,
            robot: pl.isRobot,
          }
        }),
      };
      return opts;
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyupzhuangs==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请上庄
   * @rouete WanRenJH.mainHandler.applyUpzhuang
   */
  async applyUpzhuang({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyUpzhuang==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      // 是否已经上庄了
      if (roomInfo.zhuangInfo.uid === playerInfo.uid) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1024) };
      }
      // 是否在列表中
      if (roomInfo.applyZhuangs.findIndex((pl) => pl.uid == playerInfo.uid) !== -1) {
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1025) };
      }
      // 金币是否够
      if (playerInfo.gold < roomInfo.upZhuangCond) {
        const goldLimit = `${roomInfo.upZhuangCond / 100}`;
        const msg = langsrv.getlanguage(language, langsrv.Net_Message.id_1026, goldLimit);
        return { code: 500, msg: msg };
      }
      // 放入队列
      if (playerInfo.isRobot == 2 && roomInfo.applyZhuangs.length >= 3) {
        return { code: 200, msg: "msg" };
      }
      roomInfo.applyUpzhuang(playerInfo.uid);
      return { code: 200 };
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyUpzhuang==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 申请下庄
   * @route WanRenJH.mainHandler.applyXiazhuang
   */
  async applyXiazhuang({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.applyXiazhuang==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      if (uid != roomInfo.zhuangInfo.uid) {
        return { code: 200 };
      }
      // 申请下庄
      roomInfo.xiaZhuangUid = uid;
      return { code: 200 };
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.applyXiazhuang==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }

  /**
   * 取消上庄队列
   * @route WanRenJH.mainHandler.exitUpzhuanglist
   */
  async exitUpzhuanglist({ }, session: BackendSession) {
    const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
    const { err, roomInfo, playerInfo } = check(sceneId, roomId, uid);
    try {
      if (err) {
        Logger.warn(`WanRenJH.mainHandler.exitUpzhuanglist==>err:${err}`);
        return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2003) };
      }
      // 是否在队列中
      if (roomInfo.applyZhuangs.findIndex((m) => m.uid == playerInfo.uid) === -1) {
        return {
          code: 500,
          msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1029),
        };
      }
      // 从队列中删除
      roomInfo.exitUpzhuanglist(playerInfo.uid);
      return { code: 200 };
    } catch (error) {
      Logger.warn("WanRenJH.mainHandler.exitUpzhuanglist==>", error);
      return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1216) };
    }
  }
}
