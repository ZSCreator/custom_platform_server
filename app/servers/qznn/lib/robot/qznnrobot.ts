'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import qznnConst = require('../qznnConst');
import qznn_logic = require("../qznn_logic");
import { getLogger } from "pinus-logger"
const log_logger = getLogger('robot', __filename);


export default class qznnRobot extends BaseRobot {
  seat: number;
  initgold: number;
  // leaveTimes: number;
  playTimes: number = 0;
  /**0旁观 1 游戏中 */
  // isPlayGame: 0 | 1 = 1;
  isControl: boolean = false;
  /**true 大于玩家，false小于玩家 */
  Rank: boolean = false;
  gold: number;
  /**底注 */
  entryCond: number = 0;
  /**是否有牛 */
  hasNiu: boolean;
  /**最大点数 */
  max_point: number;
  /**是炸弹牛 */
  is_zhadan = false;
  has_robmul3: boolean;
  constructor(opts: any) {
    super(opts);
    this.seat = opts.seat;
    this.initgold = 10000 * utils.random(3, 10);
    // this.leaveTimes = utils.random(10, 20);
    this.has_robmul3 = false;
  }

  async loaded() {
    try {
      let result = await this.requestByRoute("qznn.mainHandler.loaded", {});

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
      // if (data.gamePlayer.find(pl => pl && pl.uid == this.uid)) {
      //   this.isPlayGame = 1; 
      // }
    });
    this.Emitter.on("qz_onRobzhuang", this.onfahua.bind(this));
    this.Emitter.on("qz_onWait", this.onWait.bind(this));
    this.Emitter.on("qz_onSettlement", this.onEndRound.bind(this));
    this.Emitter.on("qz_onReadybet", this.onReadybet.bind(this));
    this.Emitter.on("qz_onLook", this.onLook.bind(this));
    this.Emitter.on("qz_onEntry", this.onEnter.bind(this));
    this.Emitter.on("qz_onExit", this.onExit.bind(this));
    this.Emitter.on("qz_onOpts", this.onOpts.bind(this));
  }

  //监听看牌亮牌
  onLook(data: qznnConst.Iqz_onLook) {

  }

  onOpts(data) {
    if (data.type == "robzhuang") {
      if (data.robmul == 3) {
        this.has_robmul3 = true;
      }
    }
  }

  /**下注操作 */
  async onReadybet(data: qznnConst.Iqz_onReadybet) {
    setTimeout(async () => {
      //判断庄是否是自己
      if (data.zhuangInfo.uid == this.uid) {
        return;
      }
      if (!data.players.find(pl => pl && pl.uid == this.uid)) {
        return;
      }
      //如果进入调控，且被调控的机器人没有抢到庄，那么此机器的喊倍规则为: 2倍30%， 3倍30%，4倍40%
      let betNum = qznnConst.xj_bet_arr[0];
      let ran = utils.random(1, 100);
      if (this.isControl) {
        let _arr = [
          { group: 0, weight: 90 },
          { group: 1, weight: 5 },
          { group: 2, weight: 5 },
        ]
        if (this.Rank) {
          _arr = [
            { group: 0, weight: 0 },
            { group: 1, weight: 20 },
            { group: 2, weight: 40 },
            { group: 2, weight: 40 },
          ]
        }
        let bet = utils.sortProbability_(_arr);
        betNum = qznnConst.xj_bet_arr[bet];
      } else {
        /**随机逻辑 */
        if (!this.hasNiu) {
          //有人抢3倍
          if (this.max_point >= 7) {
            if (ran <= 90) {
              betNum = qznnConst.xj_bet_arr[0];
            }
            else if (90 < ran && ran <= 95) {
              betNum = qznnConst.xj_bet_arr[1];
            }
            else {
              betNum = qznnConst.xj_bet_arr[2];
            }
          } else {
            betNum = qznnConst.xj_bet_arr[0];
          }
        } else {
          //有牛
          if (ran <= 30) {
            betNum = qznnConst.xj_bet_arr[0];
          }
          else if (30 < ran && ran <= 60) {
            betNum = qznnConst.xj_bet_arr[1];
          }
          else if (60 < ran && ran <= 90) {
            betNum = qznnConst.xj_bet_arr[2];
          }
          else {
            betNum = qznnConst.xj_bet_arr[3];
          }
        }
        if (this.is_zhadan) {
          betNum = qznnConst.xj_bet_arr[3];
        }
      }
      await this.delayRequest("qznn.mainHandler.bet", { betNum: betNum }, utils.random(2, 4) * 1000);
    }, 1 * 1000);
  }

  /**监听抢庄 */
  async onfahua(data: qznnConst.Iqz_onRobzhuang) {
    let robotHands: number[] = [];
    if (data.players.length > 0) {
      for (let pl of data.players) {
        if (pl && pl.uid == this.uid && pl.cards.length > 0) {
          robotHands = pl.cards;
          break;
        }
      }
    }
    if (robotHands.length < 4) {
      return;
    }
    this.isControl = data.isControl;
    this.Rank = data.Rank;
    setTimeout(async () => {
      let isQz = this.qzUtil(robotHands);
      if (data.isControl) {
        if (data.Rank == false) {//低排名
          let _arr = [
            { group: 0, weight: 50 },
            { group: 1, weight: 30 },
            { group: 2, weight: 10 },
          ]
          isQz = utils.sortProbability_(_arr);
        } else {
          let _arr = [
            { group: 0, weight: 20 },
            { group: 1, weight: 20 },
            { group: 2, weight: 30 },
            { group: 3, weight: 30 },
          ]
          isQz = utils.sortProbability_(_arr);
        }
      }
      //如果是调控状态下且被调控的机器人必定抢庄
      await this.delayRequest("qznn.mainHandler.robzhuang", { mul: isQz }, 100);
    }, utils.random(1, 3) * 1000);
  }

  /**机器人抢庄规则 */
  qzUtil(robotHands_c: number[]) {
    const ran = utils.random(1, 100);
    this.hasNiu = qznn_logic.isNiuCards(robotHands_c);
    this.max_point = 0;
    for (let card of robotHands_c) {
      if (qznn_logic.getCardValue(card) > this.max_point) {
        this.max_point = qznn_logic.getCardValue(card);
      }
    }
    //炸弹牛
    if (qznn_logic.getCardValue(robotHands_c[0]) == qznn_logic.getCardValue(robotHands_c[1]) &&
      qznn_logic.getCardValue(robotHands_c[1]) == qznn_logic.getCardValue(robotHands_c[2]) &&
      qznn_logic.getCardValue(robotHands_c[2]) == qznn_logic.getCardValue(robotHands_c[3])) {
      this.is_zhadan = true;
      return 3;
    }
    if (!this.hasNiu) {
      if (this.max_point < 7) {
        return 0;
      } else {
        if (ran <= 90) {
          return 0;
        }
        if (ran <= 95) return 1;
        return 2;
      }
    } else {
      //有牛
      if (!this.has_robmul3) {
        if (ran <= 10) return 0;
        if (ran <= 40) return 1;
        if (ran <= 70) return 2;
        return 3;
      } else {
        if (ran <= 10) return 0;
        if (ran <= 30) return 1;
        if (ran <= 60) return 1;
        return 3;
      }
    }
  }

  //监听进入
  async onEnter(onen) {
  }

  /**退出 */
  onExit(data) {
    if (data.uid == this.uid) {
      this.destroy();
    }
  }

  /**结束一局是否离开房间 */
  onWait(res) {
    // if (this.playTimes > this.leaveTimes || this.gold <= this.entryCond) {
    // this.destroy();
    // return;
    // }
  }

  /**监听一局结束 */
  async onEndRound(res: qznnConst.Iqz_onSettlement) {
    setTimeout(() => {
      this.destroy();
    }, utils.random(1, 3) * 10);
  }

}