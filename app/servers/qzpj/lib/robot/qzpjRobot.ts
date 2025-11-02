'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import qzpjConst = require('../qzpjConst');
import qzpj_logic = require("../qzpj_logic");
import { getLogger } from "pinus-logger"
const log_logger = getLogger('robot', __filename);


export default class qzpjRobot extends BaseRobot {
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
  lowBet: number;
  /**最大点数 */
  max_point: number;
  /**庄家uid */
  zhuangInfo = "";
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
      let result = await this.requestByRoute("qzpj.mainHandler.loaded", {});
      this.lowBet = result.room.lowBet;
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

    this.Emitter.on(qzpjConst.route.qzpj_onStart, this.onfahua.bind(this));

    this.Emitter.on(qzpjConst.route.qzpj_onSettlement, this.onEndRound.bind(this));

    this.Emitter.on(qzpjConst.route.qzpj_onSetBanker, (data: qzpjConst.IRoom_route_bet) => {
      this.zhuangInfo = data.zhuangInfo.uid;
    })
    this.Emitter.on(qzpjConst.route.qzpj_onReadybet, this.onReadybet.bind(this));
  }





  /**下注操作 */
  async onReadybet(data: { bet_mul_List: number[] }) {
    setTimeout(async () => {
      //判断庄是否是自己
      if (this.zhuangInfo == this.uid) {
        return;
      }
      // if (!data.players.find(pl => pl && pl.uid == this.uid)) {
      //   return;
      // }
      //如果进入调控，且被调控的机器人没有抢到庄，那么此机器的喊倍规则为: 2倍30%， 3倍30%，4倍40%
      let betNum = qzpjConst.xj_bet_arr[0];
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
        betNum = data.bet_mul_List[bet];
      } else {
        /**随机逻辑 */
        if (this.max_point >= 7) {
          if (ran <= 90) {
            betNum = data.bet_mul_List[0];
          }
          else if (90 < ran && ran <= 95) {
            betNum = data.bet_mul_List[1];
          }
          else {
            betNum = data.bet_mul_List[2];
          }
        } else {
          betNum = data.bet_mul_List[0];
        }
      }
      try {
        await this.delayRequest("qzpj.mainHandler.bet", { betNum: betNum }, utils.random(2, 4) * 1000);
      } catch (error) {
        console.warn(JSON.stringify(error));
      }
    }, 1 * 1000);
  }

  /**监听抢庄 */
  async onfahua(data: qzpjConst.IRoom_route_start) {

    setTimeout(async () => {
      let isQz = 0;
      if (1 == 1) {//低排名
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
      while (this.gold / this.lowBet < isQz * 30) {
        isQz--;
      }
      try {
        await this.delayRequest("qzpj.mainHandler.robTheBanker", { mul: isQz }, 100);
      } catch (error) {
        console.warn(JSON.stringify(error));
      }
    }, utils.random(1, 3) * 1000);
  }


  /**监听一局结束 */
  async onEndRound(res: qzpjConst.IRoom_route_onSettlement) {
    // setTimeout(() => {
    //   this.destroy();
    // }, utils.random(1, 3) * 10);
  }

}
