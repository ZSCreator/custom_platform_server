'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import qznnConst = require('../qznnConst');
import { getLogger } from "pinus-logger"
const log_logger = getLogger('robot', __filename);


export default class qznnRobot extends BaseRobot {
  seat: number;
  initgold: number;
  leaveTimes: number;
  playTimes: number = 0;
  /**0旁观 1 游戏中 */
  isPlayGame: 0 | 1 = 1;
  isTiaoKong: boolean = false;
  gold: number;
  /**底注 */
  entryCond: number = 0;
  constructor(opts: any) {
    super(opts);
    this.seat = opts.seat;
    this.initgold = 10000 * utils.random(3, 10);
    this.leaveTimes = utils.random(10, 20);
  }

  async loaded() {
    try {
      let result = await this.requestByRoute("qznnpp.mainHandler.loaded", {});

      this.entryCond = result.room.entryCond;
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**机器人离开房间 */
  async destroy() {
    await this.leaveGameAndReset(false);
  }

  /**监听 */
  registerListener() {
    this.Emitter.on('qz_onStart', (data: qznnConst.Iqz_onStart) => {
      if (data.gamePlayer.find(pl => pl && pl.uid == this.uid)) {
        this.isPlayGame = 1;
      }
    });
    this.Emitter.on("qz_onRobzhuang", this.onfahua.bind(this));
    this.Emitter.on("qz_onSettlement", this.onEndRound.bind(this));
    this.Emitter.on("qz_onReadybet", this.onReadybet.bind(this));
    this.Emitter.on("qz_onLook", this.onLook.bind(this));
  }

  //监听看牌亮牌
  onLook(data: qznnConst.Iqz_onLook) {

  }

  /**下注操作 */
  async onReadybet(data: qznnConst.Iqz_onReadybet) {
    //判断庄是否是自己
    if (data.zhuangInfo.uid == this.uid) {
      return;
    }
    if (!data.players.find(pl => pl && pl.uid == this.uid)) {
      return;
    }
    if (this.isPlayGame == 0) {
      return;
    }
    //如果进入调控，且被调控的机器人没有抢到庄，那么此机器的喊倍规则为: 2倍30%， 3倍30%，4倍40%
    let betNum = 5;
    let ran = utils.random(1, 100);
    if (this.isTiaoKong) {
      if (ran <= 30) {
        betNum = qznnConst.xj_bet_arr[1];
      }
      else if (ran > 30 && ran <= 60) {
        betNum = qznnConst.xj_bet_arr[2];
      }
      else {
        betNum = qznnConst.xj_bet_arr[3];
      }
    } else {
      if (ran <= 80) {
        betNum = qznnConst.xj_bet_arr[0];
      }
      else if (ran > 80 && ran <= 95) {
        betNum = qznnConst.xj_bet_arr[1];
      }
      else if (ran > 95 && ran <= 99) {
        betNum = qznnConst.xj_bet_arr[2];
      }
      else {
        betNum = qznnConst.xj_bet_arr[3];
      }
    }
    try {
      await this.delayRequest("qznnpp.mainHandler.bet", { betNum: betNum }, utils.random(1, 3) * 1000);
    } catch (error) {
      log_logger.warn(`qznnpp.mainHandler.bet|${JSON.stringify(error)}`);
    }

  }

  /**监听抢庄 */
  async onfahua(onfa: qznnConst.Iqz_onRobzhuang) {
    // let robotHands: number[] = [];
    // if (robotHands.length < 4) {
    //   return;
    // }

    let isQz = 0;
    const ran = utils.random(1, 100);
    if (ran > 35 && ran <= 60) {
      isQz = 1;
    } else if (ran > 60 && ran <= 85) {
      isQz = 2;
    } else if (ran > 85) {
      isQz = 3;
    }
    // isQz = qznnConst.robzhuang_arr[utils.random(1, 5)];

    try {
      await this.delayRequest("qznnpp.mainHandler.robzhuang", { mul: isQz }, utils.random(1, 3) * 1000);
    } catch (error) {
      log_logger.warn(`qznnpp.mainHandler.robzhuang|${JSON.stringify(error)}`);
    }
  }

  /**机器人抢庄规则 */
  qzUtil(robotHands_c: number[]) {

    let robotHands = robotHands_c.map(m => {
      let num = m % 13 + 1;
      (num >= 10) && (num = 10);
      return num;
    });

    let isQiang = 0;
    for (let i of robotHands) {
      if (utils.sum(i) % 10 == 0) {
        isQiang = 1;
        break;
      }
    }
    return isQiang;
  }


  /**监听一局结束 */
  async onEndRound(res: qznnConst.Iqz_onSettlement) {
    setTimeout(() => {
      this.destroy();
    }, utils.random(1, 3) * 10);
  }

}