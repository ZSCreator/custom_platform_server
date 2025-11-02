'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as utils from "../../../../utils";
import DeGameUtil = require("../../../../utils/gameUtil2");
import dz_logic = require('./../dz_logic');
import * as DZpipeiConst from "../DZpipeiConst";
import { getLogger } from 'pinus-logger';
import { random } from "../../../../utils";
const robotlogger = getLogger('robot_out', __filename);
//'黑A'0, '黑2'1, '黑3'2, '黑4'3, '黑5'4, '黑6'5, '黑7'6, '黑8'7, '黑9'8, '黑10'9, '黑J'10, '黑Q'11, '黑K'12,
/**type=0 同花色 1 不同 2 都可以*/



export default class DZpipeirobot extends BaseRobot {
  seat: number;
  //是在哪个场
  sceneId: number;
  /**携带金币 */
  currGold: number;
  roundCount: number;
  af: number;
  allbet: number;
  /**有人加注 */
  filling_num: number = 0;
  /**有人跟注 */
  cingl_num: number = 0;
  flodsPlay: any[];
  /**携带金币区间 */
  canCarryGold: number[];
  carryGold: number;
  /**手牌 */
  // aipoke: { uid: string, holds: number[], seat: number, cardSize: number }[] = [];
  /**玩家的类型 小盲 大盲*/
  playerType: 'SB' | 'BB' | '' = '';
  fahuaIdx: number;
  status: "dz_onDeal" | "dz_onDeal2" | "no" = "no";
  /** 是否是被调控的玩家 */
  winner: boolean = false;
  /**轮 */
  roundTimes = 0;
  constructor(opts) {
    super(opts);
    this.seat = 0;
    this.sceneId = 0;
    this.roundCount = 0;//盘数
    this.af = 0;//(总下注次数+总加注次数)/(总跟注次数)
    this.allbet = 0;//总下注次数

    // this.flodsPlay = [];
  }
  async loaded() {
    let data: DZpipeiConst.DZpipei_mainHandler_loaded;
    try {
      data = await this.requestByRoute("DZpipei.mainHandler.loaded", {});
      this.sceneId = data.sceneId;
      for (let pl of data.room.players) {
        if (pl && pl.uid == this.uid) {
          this.seat = pl.seat;
          this.currGold = pl.currGold;
          this.canCarryGold = data.room.canCarryGold;
        }
      }
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(`${error}|${data}`);
    }
  }


  /**监听 */
  registerListener() {
    this.Emitter.on("dz_onDeal", this.onDeal.bind(this));
    this.Emitter.on("dz_onFahua", this.onfahua.bind(this));
    this.Emitter.on("dz_onSettlement", this.onSettlement.bind(this));
    this.Emitter.on("dz_onDeal2", this.onDeal2.bind(this));
    this.Emitter.on("dz_onOpts", this.onOpts.bind(this));
  }

  /**监听对局结束 */
  onSettlement(data: DZpipeiConst.Idz_onSettlement) {
    this.winner = false;
    setTimeout(() => {
      this.destroy();
    }, utils.random(1, 3) * 10);
  }

  //监听发手牌
  onDeal(deal: DZpipeiConst.Idz_onDeal) {
    this.status = "dz_onDeal"
    const Me = deal.players.find(c => c && c.uid == this.uid);
    this.playerType = Me.playerType;

    if (deal.default === this.uid) this.winner = true;

    this.fahuaIdx = deal.fahuaIdx;
    this.roundCount = 0;
  }

  //监听发公共牌
  onDeal2(pubpo: DZpipeiConst.Idz_onDeal2) {
    this.status = "dz_onDeal2";
    this.roundCount++;
    this.allbet = 0;
    this.cingl_num = 0;
    this.filling_num = 0;
  }

  /**
   * //监听发话
   * @param {object} data
   * @param fahuaIdx:number   座位号
   * @param fahuaTime:number  待机上限时间
   * @param lastFahuaIdx:number 上一家座位号，如无则-1
   * @param gold:number
   * @param cinglNum:number 跟注金额
   * @param recommBet:Array<3> 推荐下注
   * @param freedomBet:Array<2> 自由下注区间
   */
  async onfahua(data: DZpipeiConst.Ionfahua) {
    const { fahuaIdx, currGold, freedomBet, recommBet, cinglNum, roundTimes, round_action } = data;
    this.roundTimes = roundTimes;
    const t1 = utils.cDate();

    // 如果是被调控玩家 直接考虑跟注或者加注
    if (this.winner) {

      // console.warn('3333333333', this.uid);
      const ran = Math.random();

      if (ran > 0.5) {
        await this.action_cingl();
      } else {
        if (Math.random() < 0.6) {
          await this.action_filling1(recommBet, currGold, cinglNum, 0);
        } else {
          await this.action_filling1(recommBet, currGold, cinglNum, 1);
        }
      }

      return;
    }

    try {
      if (fahuaIdx != this.seat) return;
      let sendMsgTimeout = utils.random(1000, 4000);
      let ran = utils.random(1, 10);
      let ran2 = utils.random(1, 10);
      if (roundTimes == 0) {
        if (round_action == "Y1") {
          if (this.playerType == "SB") {
            await this.action_fold();
            return;
          } else if (this.playerType == "BB") {
            if (cinglNum == 0) {
              /**过牌 */
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          } else {
            await this.action_fold();
            return;
          }
        } else if (round_action == "Y2") {
          if (this.playerType == "SB") {
            if (this.cingl_num >= 2) {
              await this.action_fold();
              return;
            } else if (this.cingl_num == 1) {
              this.action_cingl();
              return;
            }
            if (this.filling_num <= 1) {
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          } else if (this.playerType == "BB") {
            if (this.cingl_num == 1 || cinglNum == 0) {
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          } else {
            if (this.cingl_num <= 2 || cinglNum == 0) {
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          }
        } else if (round_action == "Y3") {
          if (this.playerType == "SB") {
            if (this.cingl_num <= 3) {
              if (ran < 7) {
                this.action_cingl();
                return;
              } else {
                if (ran2 < 6) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 0);
                  return;
                } else {
                  await this.action_filling1(recommBet, currGold, cinglNum, 1);
                  return;
                }
              }
            }
            if (this.filling_num >= 2) {
              await this.action_fold();
              return;
            } else {
              await this.action_fold();
              return;
            }
          } else if (this.playerType == "BB") {
            if (this.cingl_num >= 2) {
              this.action_cingl();
              return;
            } else if (this.cingl_num == 1) {
              if (ran < 6) {
                this.action_cingl();
                return;
              } else {
                if (ran2 < 6) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 0);
                  return;
                } else {
                  await this.action_filling1(recommBet, currGold, cinglNum, 1);
                  return;
                }
              }

            }
            if (this.filling_num <= 2) {
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          } else {
            if (this.filling_num <= 2) {
              this.action_cingl();
              return;
            } else {
              await this.action_fold();
              return;
            }
          }

        } else if (round_action == "Y4") {
          if (this.playerType == "SB") {
            if (this.filling_num == 0) {
              if (ran < 3) {
                this.action_cingl();
                return;
              } else {
                if (ran2 < 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 1);
                  return;
                } else if (ran2 < 8 && ran2 >= 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 2);
                  return;
                } else {
                  await this.action_allin();
                  return;
                }
              }
            }
            if (this.filling_num > 0) {
              if (ran <= 5) {
                this.action_cingl();
                return;
              }
              if (ran2 < 5) {
                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                return;
              } else if (ran2 < 8 && ran2 >= 4) {
                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                return;
              } else {
                await this.action_allin();
                return;
              }
            }
          } else if (this.playerType == "BB") {
            if (this.filling_num == 0) {
              if (ran < 3) {
                this.action_cingl();
                return;
              } else {
                if (ran2 < 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 1);
                  return;
                } else if (ran2 < 8 && ran2 >= 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 2);
                  return;
                } else {
                  await this.action_allin();
                  return;
                }
              }
            }
            if (this.filling_num > 0) {
              if (ran <= 5) {
                this.action_cingl();
                return;
              }
              if (ran2 < 5) {
                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                return;
              } else if (ran2 < 8 && ran2 >= 4) {
                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                return;
              } else {
                await this.action_allin();
                return;
              }
            }
          } else {
            if (this.filling_num == 0) {
              if (ran < 3) {
                this.action_cingl();
                return;
              } else {
                if (ran2 < 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 1);
                  return;
                } else if (ran2 < 8 && ran2 >= 4) {
                  await this.action_filling1(recommBet, currGold, cinglNum, 2);
                  return;
                } else {
                  await this.action_allin();
                  return;
                }
              }
            }
            if (this.filling_num > 0) {
              if (ran <= 5) {
                this.action_cingl();
                return;
              }
              if (ran2 < 5) {
                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                return;
              } else if (ran2 < 8 && ran2 >= 4) {
                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                return;
              } else {
                await this.action_allin();
                return;
              }
            }
          }
        }
        console.warn("round_action_AI", this.status, round_action);
        return;
      }
      if (round_action == "y1b") {
        if (cinglNum == 0) {
          /**过牌 */
          await this.action_cingl();
          return;
        } else {
          await this.action_fold();
          return;
        }
      } else if (round_action == "y2b") {
        if (cinglNum == 0) {
          /**过牌 */
          this.action_cingl();
          return;
        }
        if (this.filling_num <= 2 && cinglNum < this.canCarryGold[0] * 0.3) {
          this.action_cingl();
          return;
        } else {
          await this.action_fold();
          return;
        }
      } else if (round_action == "y3b") {
        if (this.filling_num == 0) {
          if (ran < 7) {
            this.action_cingl();
            return;
          } else {
            if (ran2 < 6) {
              await this.action_filling1(recommBet, currGold, cinglNum, 0);
              return;
            } else {
              await this.action_filling1(recommBet, currGold, cinglNum, 1);
              return;
            }
          }
        } else if (this.filling_num <= 3 && this.canCarryGold[0] * 0.3) {
          if (ran < 7) {
            this.action_cingl();
            return;
          } else {
            if (ran2 < 6) {
              await this.action_filling1(recommBet, currGold, cinglNum, 0);
              return;
            } else {
              await this.action_filling1(recommBet, currGold, cinglNum, 1);
              return;
            }
          }
        } else {
          this.action_cingl();
          return;
        }
      } else if (round_action == "y4b") {
        if (this.filling_num == 0) {
          if (ran < 3) {
            this.action_cingl();
            return;
          } else {
            if (ran2 <= 3) {
              await this.action_filling1(recommBet, currGold, cinglNum, 0);
              return;
            } else if (ran2 > 3 && ran2 <= 7) {
              await this.action_filling1(recommBet, currGold, cinglNum, 1);
              return;
            } else {
              await this.action_filling1(recommBet, currGold, cinglNum, 2);
              return;
            }
            await this.action_allin();
            return;
          }
        } else if (this.filling_num <= 3) {
          if (ran <= 3) {
            this.action_cingl();
            return;
          } else {
            if (ran2 <= 1) {
              await this.action_filling1(recommBet, currGold, cinglNum, 0);
              return;
            } else if (ran2 == 2 || ran2 == 3) {
              await this.action_filling1(recommBet, currGold, cinglNum, 1);
              return;
            } else if (ran2 == 4 || ran2 == 5 || ran2 == 6) {
              await this.action_filling1(recommBet, currGold, cinglNum, 2);
              return;
            } else {
              await this.action_allin();
              return;
            }
            await this.action_allin();
            return;
          }
        } else {
          this.action_cingl();
          return;
        }
      } else if (round_action == "y5b") {
        if (ran <= 1) {
          await this.action_filling1(recommBet, currGold, cinglNum, 0);
          return;
        } else if (ran > 1 && ran <= 4) {
          await this.action_filling1(recommBet, currGold, cinglNum, 1);
          return;
        } else if (ran > 4 && ran <= 8) {
          await this.action_filling1(recommBet, currGold, cinglNum, 2);
          return;
        }
        await this.action_allin();
        return;
      }
      console.warn("round_action_AI", round_action);
      return;
    } catch (error) {
      const t2 = utils.cDate();
      robotlogger.warn('DZpipei|发话阶段出错:', error, t1, t2, this.roomId, this.uid);
    }
  }

  async action_filling1(recommBet: number[], currGold: number, cinglNum: number, type: number) {
    let sendMsgTimeout = utils.random(0, 3);
    const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
    if (recommBet[1] <= currGold && cinglNum <= recommBet[type]) {
      await this.delayRequest(`DZpipei.mainHandler.filling1`, { type }, arr[sendMsgTimeout]);
      return;
    } else {
      await this.action_allin();
    }
  }

  async action_allin() {
    let sendMsgTimeout = utils.random(0, 3);
    const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
    await this.delayRequest(`DZpipei.mainHandler.allin`, {}, arr[sendMsgTimeout]);
  }
  async action_cingl() {
    let sendMsgTimeout = utils.random(0, 3);
    const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
    await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, arr[sendMsgTimeout]);
  }
  async action_fold() {
    let sendMsgTimeout = utils.random(0, 3);
    const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
    await this.delayRequest(`DZpipei.mainHandler.fold`, {}, arr[sendMsgTimeout]);
  }
  //监听下注加注
  onOpts(opt) {
    //AF
    if (opt.type == 'cingl' || opt.type == "allin" || opt.type == "filling") {
      this.allbet++;
      if (opt.type == 'cingl' && this.roundTimes == 0) {
        this.cingl_num++;
      }
      if (opt.type == 'cingl' && this.roundTimes > 0) {
        this.filling_num++;
      }
      if (opt.type == "allin" || opt.type == "filling") {
        this.filling_num++;
      }
    }
    // if (opt.type == 'fold') {
    //   this.flodsPlay.push(opt.seat);
    // }
  }

  //机器人离开房间
  destroy() {
    this.leaveGameAndReset(false);
  }

}