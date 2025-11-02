'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as utils from "../../../../utils";
import DeGameUtil = require("../../../../utils/gameUtil2");
import * as FCSConst from "../FCSConst";
import RobotGameStrategy from '../../../../services/robotService/DZpipei/services/RobotGameStrategy';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import * as FCS_logic from "../FCS_logic";
const CC_DEBUG = false;

export default class DZpipeirobot extends BaseRobot {
  seat: number;
  //是在哪个场
  sceneId: number;
  /**携带金币 */
  currGold: number;
  playerGold: number;
  /**轮数 */
  roundCount: number;
  /**最近一次对手下注 */
  isTiaokong: boolean;
  maxSeat: number;
  /**携带金币区间 */
  canCarryGold: number[];
  carryGold: number;
  /**庄 */
  // zhuang_seat = 0;
  HoldsType: "Y1" | "Y2" | "Y3" | "Y4" | "Y5" | "Y6";
  holds: number[];
  /**每轮对手跟注次数:Cn */
  Cn = 0;
  /**每轮对手加注次数:Rn */
  Rn = 0;
  /**每轮对手过牌次数:CHn */
  CHn = 0;
  /**每回合对手行动次数:N */
  N = 0;
  lowBet: number;
  descSortAllPlayer: {
    uid: string;
    seat: number;
    /**前位（FP） 中位（MP） 后位（BP）*/
    Location: "FP" | "MP" | "BP";
    isFold: boolean;
  }[];
  plys: {
    uid: string, HoldsType: string, hand_strength: number,
    pl1_win: number, holds: number[], typeSize: number,
    isFold: boolean
  }[] = [];
  isFold = false;
  /**是否初始化位置 */
  isInitLocation = false;
  /**牌力 */
  hand_strength: number;
  TheCards: number[];
  constructor(opts) {
    super(opts);
    this.seat = 0;
    this.sceneId = 0;
    this.playerGold = 0;
    this.roundCount = 0;//盘数
    this.isTiaokong = false;
    this.maxSeat = -1;
  }
  async loaded() {
    try {
      let data: FCSConst.FiveCardStud_mainHandler_loaded = await this.requestByRoute("FiveCardStud.mainHandler.loaded", {});
      this.sceneId = data.room.sceneId;
      this.lowBet = data.room.lowBet;
      for (let pl of data.players) {
        if (pl && pl.uid == this.uid) {
          this.seat = pl.seat;
          this.currGold = pl.currGold;
          this.canCarryGold = data.room.canCarryGold;
        }
      }
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }


  /**监听 */
  registerListener() {
    this.Emitter.on("FiveCardStud.onDeal", this.onDeal.bind(this));
    this.Emitter.on("FiveCardStud.msg_oper_c", this.msg_oper_c.bind(this));
    this.Emitter.on("FiveCardStud.onSettlement", this.onSettlement.bind(this));
    this.Emitter.on("FiveCardStud.onDeal2", this.onDeal2.bind(this));
    this.Emitter.on("FiveCardStud.onOpts", this.onOpts.bind(this));
  }

  /**监听对局结束 */
  onSettlement(data: FCSConst.Idz_onSettlement) {
    setTimeout(() => {
      this.destroy();
    }, utils.random(1, 3) * 10);
  }

  //监听发手牌
  onDeal(data: FCSConst.FiveCardStud_onDeal) {
    this.holds = data.players.find(c => c && c.uid == this.uid).holds;
    this.HoldsType = FCS_logic.getAiHoldsType(this.holds) as any;
    this.descSortAllPlayer = data.players.map(c => {
      return {
        seat: c.seat,
        uid: c.uid,
        Location: "FP",
        isFold: false,
        holds: c.holds,
        typeSize: 0,
      }
    });
    CC_DEBUG && console.warn(this.uid, this.HoldsType, this.holds.map(c => FCS_logic.pukes[c]));
  }

  //监听发公共牌
  onDeal2(data: FCSConst.Idz_onDeal2) {
    this.Rn = 0;
    this.CHn = 0;
    this.Cn = 0;
    this.N = 0;
    this.roundCount++;
    this.isInitLocation = false;
    if (this.isFold) {
      return;
    }

    let TheCards = FCS_logic.getPai();
    this.plys = [];
    {
      const list = utils.clone(data.players);
      for (const pl of list) {
        if (!pl) continue;
        for (const card of pl.holds) {
          for (let index = 0; index < TheCards.length; index++) {
            const thecard = TheCards[index];
            if (thecard == card) {
              TheCards[index] = null;
              break;
            }
          }
        }
        if (pl.isFold) continue;
        this.plys.push({ uid: pl.uid, hand_strength: 0, HoldsType: "", pl1_win: 0, holds: pl.holds, typeSize: 0, isFold: false });
      }
    }
    TheCards = TheCards.filter(c => !!c);
    this.TheCards = TheCards;
    this.calculateType();
  }

  calculateType() {
    if (this.roundCount == 0) {
      return;
    }
    for (const pl of this.plys) {
      pl.hand_strength = 0;
      pl.pl1_win = 0;
      pl.typeSize = 0;
    }
    let total_num = 200;
    for (let index = 0; index < total_num; index++) {
      let temp = this.TheCards.map(c => c);
      temp.sort(() => 0.5 - Math.random());
      const list = utils.clone(this.plys);

      for (const pl of list) {
        pl.holds = pl.holds.filter(c => c != 0x99);
        do {
          if (pl.holds.length >= 5) {
            break;
          }
          pl.holds.push(temp.shift());
        } while (true);
        pl.typeSize = FCS_logic.sortPokerToType(pl.holds);
      }
      list.sort((a, b) => {
        return b.typeSize - a.typeSize;
      });
      this.plys.find(c => c.uid == list[0].uid).pl1_win++;
    }
    for (const pl of this.plys) {
      const win_Probability = (pl.pl1_win / (total_num / 100));//pl.pl1_win; 
      if (win_Probability >= 76 && win_Probability <= 99) {
        pl.HoldsType = "Y1";
      } else if (win_Probability > 50 && win_Probability <= 75) {
        pl.HoldsType = "Y2";
      } else if (win_Probability > 30 && win_Probability <= 50) {
        pl.HoldsType = "Y3";
      } else if (win_Probability > 15 && win_Probability <= 30) {
        pl.HoldsType = "Y4";
      } else if (win_Probability >= 0 && win_Probability <= 15) {
        pl.HoldsType = "Y5";
      } else {
        pl.HoldsType = "Y6";
      }
      pl.hand_strength = win_Probability;
      if (pl.uid == this.uid) {
        this.HoldsType = pl.HoldsType as any;
        this.hand_strength = pl.hand_strength;
      }
    }
    CC_DEBUG && console.warn(this.uid, this.roundCount, this.plys.map(c => {
      return {
        uid: c.uid,
        HoldsType: c.HoldsType,
        hand_strength: c.hand_strength,
        holds: c.holds.map(c => FCS_logic.pukes[c]),
      }
    }));
  }

  async msg_oper_c(data: FCSConst.Ionfahua) {
    if (data.curr_doing_seat != this.seat) {
      return;
    }
    /**弃牌（F）、过牌（CH）、跟注（C）、加注（R） */
    let action: "F" | "CH" | "C" | "R" | "" = "";
    let betNum = 0;
    if (this.isInitLocation == false) {
      this.calculateLocation(data.curr_doing_seat);
      this.isInitLocation = true;
    }
    if (data['maxUid'] == this.uid) {
      if (this.roundCount == 0) {
        this.HoldsType = "Y1";
      } else {
        this.HoldsType = "Y6";
      }
    }
    let r = utils.random(1, 100);
    let Me = this.descSortAllPlayer.find(c => c.seat == this.seat);
    //二、底池的赔率=目标下注/（目标下注+POT）
    let pot_odds = data.cinglNum / (data.cinglNum + data.recommendBet[2]);
    //三、回报率RR=牌力/底池赔率
    let RR = (this.hand_strength / 100) / pot_odds;
    if (this.roundCount == 0) {
      if (this.HoldsType == "Y1") {
        if (this.Rn == 0) {
          action = "R";
          betNum = utils.random(this.lowBet * 2, this.lowBet * 5) + this.lowBet * this.CHn;
        } else if (this.Rn == 1) {
          action = "R";
          betNum = utils.random(data.cinglNum * 2, data.cinglNum * 4) + data.cinglNum * (this.CHn + this.Cn);
        } else if (this.Rn > 1) {
          action = "R";
          betNum = utils.random(data.cinglNum * 2, data.cinglNum * 4) + data.cinglNum * (this.CHn + this.Cn);
          if (utils.random(1, 100) <= 50) {
            betNum = data.freedomBet[1];
          }
        }
      } else if (this.HoldsType == "Y2") {
        if (this.Rn == 0) {
          action = "R";
          betNum = utils.random(this.lowBet * 2, this.lowBet * 4) + this.lowBet * this.CHn;
        } else if (this.Rn == 1) {
          action = "R";
          betNum = utils.random(data.cinglNum * 2, data.cinglNum * 3) + data.cinglNum * (this.CHn + this.Cn);
        } else if (this.Rn > 1) {
          action = "C";
          if (utils.random(1, 100) <= 93) {
            action = "F";
          }
        }
      } else if (this.HoldsType == "Y3" || this.HoldsType == "Y4") {
        if (this.Rn == 0) {
          if (Me.Location == "FP") {
            action = "CH";
          } else if (Me.Location == "MP") {
            action = "R";
            betNum = utils.random(this.lowBet * 1, this.lowBet * 3);
            if (utils.random(1, 100) <= 60) {
              action = "CH";
            }
          } else if (Me.Location == "BP") {
            action = "R";
            betNum = utils.random(this.lowBet * 2, this.lowBet * 4);
          }
        } else if (this.Rn == 1) {
          action = "CH";
        } else if (this.Rn > 1) {
          if (data.freedomBet[0] > (1 / 10) * data.currGold) {
            action = "C";
          } else {
            if (utils.random(1, 100) <= 95) {
              action = "F";
            } else {
              action = "C";
            }
          }
        }
      } else if (this.HoldsType == "Y5") {
        if (this.Rn == 0) {
          if (Me.Location == "FP" || Me.Location == "MP") {
            action = "CH";
          } else if (Me.Location == "BP") {
            action = "R";
            betNum = utils.random(this.lowBet * 1, this.lowBet * 3);
            if (utils.random(1, 100) <= 60) {
              action = "CH";
            }
          }
        } else if (this.Rn == 1) {
          action = "C";
        } else if (this.Rn > 1) {
          action = "F";
        }
      } else if (this.HoldsType == "Y6") {
        if (this.Rn == 0) {
          action = "F";
          if (utils.random(1, 100) <= 60) {
            action = "CH";
          }
        } else if (this.Rn >= 1) {
          action = "F";
        }
      }
    } else if (this.roundCount == 1 || this.roundCount == 2) {
      if (this.Rn == 0) {
        if (this.HoldsType == "Y1") {
          if (r <= 15) {
            action = "R";
            betNum = data.recommendBet[0];
          } else if (r <= 45) {
            action = "R";
            betNum = data.recommendBet[1];
          } else if (r <= 95) {
            action = "R";
            betNum = data.recommendBet[2];
          } else {
            return this.raiseAddSceneBet(data, data.freedomBet[1]);
          }
        } else if (this.HoldsType == "Y2") {
          if (r <= 40) {
            action = "R";
            betNum = data.recommendBet[0];
          } else if (r <= 70) {
            action = "R";
            betNum = data.recommendBet[1];
          } else if (r <= 100) {
            action = "R";
            betNum = data.recommendBet[2];
          }
        } else if (this.HoldsType == "Y3") {
          if (Me.Location == "FP") {
            if (r <= 70) {
              action = "CH";
            } else {
              action = "R";
              betNum = data.recommendBet[2];
            }
          } else if (Me.Location == "MP") {
            action = "CH";
          } else if (Me.Location == "BP") {
            if (r <= 50) {
              action = "R";
              betNum = data.recommendBet[0];
            } else if (r <= 80) {
              action = "R";
              betNum = data.recommendBet[1];
            } else if (r <= 100) {
              action = "R";
              betNum = data.recommendBet[2];
            }
          }
        } else if (this.HoldsType == "Y4") {
          if (Me.Location == "FP") {
            action = "F";
          } else if (Me.Location == "MP") {
            action = "CH";
          } else if (Me.Location == "BP") {
            if (r <= 70) {
              action = "CH";
            } else if (r <= 90) {
              action = "F";
            } else if (r <= 100) {
              action = "R";
              betNum = data.recommendBet[2];
            }
          }
        } else if (this.HoldsType == "Y5") {
          if (Me.Location == "FP") {
            action = "F";
          } else if (Me.Location == "MP") {
            action = "F";
          } else if (Me.Location == "BP") {
            if (r <= 95) {
              action = "F";
            } else if (r <= 100) {
              action = "R";
              betNum = data.recommendBet[2];
            }
          }
        } else if (this.HoldsType == "Y6") {
          action = "R";
          betNum = data.freedomBet[1];
        }
      } else if (this.Rn >= 1) {
        if (this.HoldsType == "Y6") {
          action = "R";
          betNum = data.freedomBet[1];
        } else {
          if (RR < 0.8 || isNaN(RR)) {
            action = "F";
            if (r <= 5) {
              action = "R";
            }
          } else if (RR >= 0.8 && RR < 1) {
            if (r <= 75) {
              action = "F";
            } else if (r <= 90) {
              action = "C";
            } else {
              action = "R";
            }
          } else if (RR >= 1 && RR < 1.3) {
            if (r <= 60) {
              action = "C";
            } else {
              action = "R";
            }
          } else if (RR >= 1.3) {
            if (r <= 30) {
              action = "C";
            } else {
              action = "R";
            }
          }
          if (action == "") {
            console.warn("0000");
          }
          if (action == "R") {
            let rr = utils.random(1, 100);
            if (this.HoldsType == "Y1") {
              if (rr <= 15) {
                action = "R";
                betNum = data.recommendBet[0];
              } else if (rr <= 45) {
                action = "R";
                betNum = data.recommendBet[1];
              } else if (rr <= 95) {
                action = "R";
                betNum = data.recommendBet[2];
              } else {
                return this.raiseAddSceneBet(data, data.freedomBet[1]);
              }
            } else if (this.HoldsType == "Y2") {
              if (rr <= 40) {
                action = "R";
                betNum = data.recommendBet[0];
              } else if (rr <= 70) {
                action = "R";
                betNum = data.recommendBet[1];
              } else if (rr <= 100) {

                action = "R";
                betNum = data.recommendBet[2];
              }
            } else if (this.HoldsType == "Y3") {
              if (rr <= 50) {
                action = "R";
                betNum = data.recommendBet[0];
              } else if (rr <= 80) {
                action = "R";
                betNum = data.recommendBet[1];
              } else if (rr <= 100) {
                action = "R";
                betNum = data.recommendBet[2];
              }
            } else if (this.HoldsType == "Y4") {
              action = "R";
              betNum = data.recommendBet[2];
            } else if (this.HoldsType == "Y5") {
              action = "R";
              betNum = data.recommendBet[2];
            }
          }
        }
      }
    } else if (this.roundCount == 3) {
      if (this.Rn == 0) {
        if (this.HoldsType == "Y1") {
          if (r <= 15) {
            action = "R";
            betNum = data.recommendBet[0];
          } else if (r <= 45) {
            action = "R";
            betNum = data.recommendBet[1];
          } else if (r <= 95) {
            action = "R";
            betNum = data.recommendBet[2];
          } else {
            return this.raiseAddSceneBet(data, data.freedomBet[1]);
          }
        } else if (this.HoldsType == "Y2") {
          if (r <= 40) {
            action = "R";
            betNum = data.recommendBet[0];
          } else if (r <= 70) {
            action = "R";
            betNum = data.recommendBet[1];
          } else if (r <= 100) {
            action = "R";
            betNum = data.recommendBet[2];
          }
        } else if (this.HoldsType == "Y3") {
          if (Me.Location == "FP") {
            // if (r <= 70) {
            action = "CH";
            // } else {
            //   action = "R";
            //   betNum = data.recommendBet[2];
            // }
          } else if (Me.Location == "MP") {
            action = "CH";
          } else if (Me.Location == "BP") {
            action = "CH";
          }
        } else if (this.HoldsType == "Y4") {
          if (Me.Location == "FP") {
            action = "F";
          } else if (Me.Location == "MP") {
            action = "CH";
          } else if (Me.Location == "BP") {
            // if (r <= 70) {
            action = "CH";
            // } else if (r <= 90) {
            //   action = "F";
            // } else if (r <= 100) {
            //   action = "R";
            //   betNum = data.recommendBet[2];
            // }
          }
        } else if (this.HoldsType == "Y5") {
          if (Me.Location == "FP") {
            action = "F";
          } else if (Me.Location == "MP") {
            action = "F";
          } else if (Me.Location == "BP") {
            // if (r <= 95) {
            action = "F";
            // } else if (r <= 100) {
            //   action = "R";
            //   betNum = data.recommendBet[2];
            // }
          }
        } else if (this.HoldsType == "Y6") {
          action = "R";
          betNum = data.freedomBet[1];
        }
      } else if (this.Rn >= 1) {
        if (this.HoldsType == "Y1") {
          if (RR < 1 || isNaN(RR)) {
            action = "F";
          } else if (1 <= RR && RR < 1.3) {
            if (r <= 60) {
              action = "C";
            } else {
              action = "R";
            }
          } else if (RR >= 1.3) {
            if (r <= 30) {
              action = "C";
            } else {
              action = "R";
            }
          }
        } else if (this.HoldsType == "Y2" ||
          this.HoldsType == "Y3" ||
          this.HoldsType == "Y4" ||
          this.HoldsType == "Y5") {
          action = "F";
        } else {
          action = "R";
          betNum = data.freedomBet[1];
        }
      }
    }
    CC_DEBUG && console.warn(this.uid, this.roundCount, action, this.HoldsType, betNum, `Rn:${this.Rn}`, `odds:${pot_odds}`, RR);
    if (action == "C") {
      this.action_cingl();
    } else if (action == "CH") {
      this.action_cingl();
    } else if (action == "F") {
      if (data.cinglNum == 0) {
        this.action_cingl();
      } else {
        this.action_fold();
      }
    } else if (action == "R") {
      this.raiseAddSceneBet(data, betNum);
    } else {
      console.warn("no caozuo no die");
      console.warn(this.roundCount, this.HoldsType, this.Rn);
    }
  }

  /**
   * 底池的1/3，2/3 来进行押注
   */
  async raiseRecommBet(data: FCSConst.Ionfahua, intervalValue: number) {
    const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
    //如果加注金币超出自身拥有金币
    if (intervalValue > 0) {
      do {
        if (data.recommendBet[intervalValue] > data.currGold) {
          intervalValue--;
        } else {
          break;
        }
        if (intervalValue == 0) {
          break;
          // } else {
          // break;
        }
      } while (true);
    }
    try {
      if (data.recommendBet[intervalValue] > data.currGold ||
        data.recommendBet[intervalValue] > data.freedomBet[1]) {
        await this.delayRequest(`FiveCardStud.mainHandler.cingl`, {}, sendMsgTimeout);
      } else {
        let betNum = data.recommendBet[intervalValue];
        this.raiseAddSceneBet(data, betNum);
      }
    } catch (error) {
      console.warn(this.uid, JSON.stringify(error), 1);
    }
    return true;
  }

  /**
   * 固定的加注金额
   */
  async raiseAddSceneBet(data: FCSConst.Ionfahua, betNum: number) {
    const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
    try {
      if (betNum == undefined || isNaN(betNum) || betNum == 0) {
        console.warn("0000");
      }
      betNum = Math.floor(betNum / 100) * 100;
      if (betNum > data.freedomBet[1]) {
        betNum = data.freedomBet[1];
      }
      if (betNum < data.freedomBet[0]) {
        betNum = data.freedomBet[0];
      }
      if (betNum > data.currGold) {
        betNum = data.currGold;
      }
      await this.delayRequest(`FiveCardStud.mainHandler.filling`, { betNum }, sendMsgTimeout);
    } catch (error) {
      console.warn(this.uid, JSON.stringify(error));
    }
    return true;
  }

  async action_fold() {
    const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
    try {
      this.isFold = true;
      await this.delayRequest(`FiveCardStud.mainHandler.fold`, {}, sendMsgTimeout);
    } catch (error) {
      console.warn(this.uid, JSON.stringify(error));
    }

  }
  async action_cingl() {
    const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
    try {
      await this.delayRequest(`FiveCardStud.mainHandler.cingl`, {}, sendMsgTimeout);
    } catch (error) {
      console.warn(this.uid, JSON.stringify(error));
    }

  }
  /**监听下注加注 */
  onOpts(opt) {
    CC_DEBUG && console.warn(opt.uid, opt.type);
    if (opt.type == 'cingl') {
      this.Cn++;
      this.N++;
    } else if (opt.type == "allin" || opt.type == "filling") {
      this.Rn++;
      this.N++;
    } else if (opt.type == "pass") {
      this.CHn++;
      this.N++;
    }

    if (opt.type == 'fold') {
      this.descSortAllPlayer.find(c => c && c.seat == opt.seat).isFold = true;
      let other = this.plys.find(c => c.uid == opt.seat);
      if (other) {
        other.isFold = true;
        this.plys = this.plys.filter(c => c.isFold == false);
        this.calculateType();
      }
    }
  }

  //机器人离开房间
  destroy() {
    this.leaveGameAndReset(false);
  }

  /**计算位置 */
  calculateLocation(Firstseat: number) {
    let length = this.descSortAllPlayer.filter(pl => pl && pl.isFold == false).length;
    if (length >= 3) {
      for (const ccc of this.descSortAllPlayer) {
        ccc.Location = "MP";
      }
      let len = 4;
      let seat = Firstseat - 1;
      do {
        if (seat < 0) {
          seat = len;
        }
        let pl = this.descSortAllPlayer.find(c => c.seat == seat);
        if (pl) {
          pl.Location = "BP"
          break;
        }
        seat--;
      } while (true);
      this.descSortAllPlayer.find(c => c.seat == Firstseat).Location = "FP";
    } else if (length == 2) {
      for (const ccc of this.descSortAllPlayer) {
        ccc.Location = "BP";
      }
      this.descSortAllPlayer.find(c => c.seat == Firstseat).Location = "MP";
    }
  }
}
