'use strict';
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as utils from "../../../../utils";
import DeGameUtil = require("../../../../utils/gameUtil2");
import * as DZpipeiConst from "../DZpipeiConst";
import RobotGameStrategy from '../../../../services/robotService/DZpipei/services/RobotGameStrategy';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

export default class DZpipeirobot extends BaseRobot {
  seat: number;
  inning: number;
  //是在哪个场
  sceneId: number;
  /**携带金币 */
  currGold: number;
  playerGold: number;
  roundCount: number;
  af: number;
  allbet: number;
  allfilling: number;
  heel: number;
  currSumBet: number;
  errorInfo: number;
  leaveTimes: any;
  playTimes: number;
  flodsPlay: any[];
  players: any[];
  isTiaokong: boolean;
  maxSeat: number;
  isgengfill: number;
  maxais: number;
  maxNum: number;
  godLikeMod: boolean;
  addGoldTimes: number;
  /**携带金币区间 */
  canCarryGold: number[];
  roomPlayerNum: number;
  carryGold: number;
  aipoke: any;
  fahuaIdx: number;
  aipokeType: number;
  otherPoke: any[];
  otherPokeNum: any[];
  robotPoke: string;
  descSortAllPlayer: any[];
  RobotGameStrategy: RobotGameStrategy = new RobotGameStrategy();
  constructor(opts) {
    super(opts);
    this.seat = 0;
    this.sceneId = 0;
    this.inning = 0;
    this.playerGold = 0;
    this.roundCount = 0;//盘数
    this.af = 0;//(总下注次数+总加注次数)/(总跟注次数)
    this.allbet = 0;//总下注次数
    this.allfilling = 0;//总加注次数
    this.heel = 0;//总跟注次数
    this.currSumBet = 0;//底池金额
    this.errorInfo = 0;
    this.leaveTimes = utils.random(10, 50);
    this.playTimes = 0;
    this.flodsPlay = [];
    this.isTiaokong = false;
    this.maxSeat = -1;
    this.isgengfill = 0;
    this.maxais = -1;
    this.maxNum = 0;
    this.descSortAllPlayer = [];
    this.godLikeMod = false;// 调控模式
    this.addGoldTimes = 0;// 补充金币次数
    this.roomPlayerNum = 0;// 当前房间人数
  }
  async loaded() {
    try {
      let data: DZpipeiConst.DZpipei_mainHandler_loaded = await this.requestByRoute("DZpipei.mainHandler.loaded", {});
      this.sceneId = data.sceneId;
      this.descSortAllPlayer = [];
      for (let pl of data.room.players) {
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
    this.Emitter.on("dz_onDeal", this.onDeal.bind(this));
    this.Emitter.on("dz_onFahua", this.onfahua.bind(this));
    this.Emitter.on("dz_onSettlement", this.onSettlement.bind(this));
    this.Emitter.on("dz_onDeal2", this.onDeal2.bind(this));
    this.Emitter.on("dz_onOpts", this.onOpts.bind(this));
  }

  /**监听对局结束 */
  onSettlement(data: DZpipeiConst.Idz_onSettlement) {
    this.descSortAllPlayer = [];
    setTimeout(() => {
      this.destroy();
    }, utils.random(1, 3) * 10);
  }

  //监听发手牌
  onDeal(deal) {
    let playerlist = deal.players;
    for (let val of playerlist) {
      if (val.seat !== this.seat) {
        continue;
      }
      if (val.holds == null) {
        continue;
      }
      this.aipoke = val.holds;
      /** 2019/3/28 添加 GodLike模式，即调控模式时，Robot不弃牌 */
      // Ps:currM>0 为正调控; <0为负调控,目前负调控Robot依旧正常逻辑
      if (this.uid === deal.default) {
        this.godLikeMod = true;
      }
    }

    this.currSumBet = deal.currSumBet;
    this.fahuaIdx = deal.fahuaIdx;
    this.roundCount = 0;
    this.maxSeat = deal.maxSeat;

  }

  //监听发公共牌
  onDeal2(pubpo: DZpipeiConst.Idz_onDeal2) {
    this.roundCount++;
    this.aipokeType = pubpo.cardType.type;

    this.otherPoke = [];
    this.otherPokeNum = [];

    for (let pl of pubpo.allPlayer) {

      if (this.flodsPlay.length > 0) {
        if (this.flodsPlay.indexOf(pl.seat) > -1) {
          continue;
        }
      }
      if (this.roundCount == 1) {
        if (DeGameUtil.sortPokerToType(pl.cardType.cards) > this.maxNum) {
          this.maxNum = DeGameUtil.sortPokerToType(pl.cardType.cards);
          this.maxais = pl.seat;
        }
      } else {
        if (pl.uid == this.uid) {
          continue;
        }
        this.otherPokeNum.push(DeGameUtil.sortPokerToType(pl.cardType.cards));
      }
    }
  }

  /**
   * //监听发话
   * @param {object} onfa
   * @param fahuaIdx:number   座位号
   * @param fahuaTime:number  待机上限时间
   * @param lastFahuaIdx:number 上一家座位号，如无则-1
   * @param gold:number
   * @param cinglNum:number 跟注金额
   * @param recommBet:Array<3> 推荐下注
   * @param freedomBet:Array<2> 自由下注区间
   */
  async onfahua(onfa: DZpipeiConst.Ionfahua) {
    const { fahuaIdx, currGold, freedomBet, recommBet, cinglNum } = onfa;
    const t1 = utils.cDate();
    try {
      if (fahuaIdx != this.seat) return;
      /** Step 1:判断牌力 */
      let currentRanking = -1;// 当前手牌排名
      if (!this.descSortAllPlayer || this.descSortAllPlayer.length == 0) {
        let result = await this.requestByRoute(`DZpipei.mainHandler.robotNeed`, {});
        this.descSortAllPlayer = result.descSortAllPlayer;
      }
      // console.warn("this.descSortAllPlayer",this.descSortAllPlayer);
      if (this.descSortAllPlayer) {
        currentRanking = this.descSortAllPlayer.findIndex(pl => pl.uid === this.uid) + 1;// 当前牌力排名
      } else {
        // 翻牌前或非对局中时，返回玩家信息里，参数 cards 可能为空->false
        // currentRanking = await this.pokerType();
        return;
      }

      // console.warn(`this.godLikeMod${this.uid},this.godLikeMod:${this.godLikeMod},currentRanking${currentRanking},roundCount${this.roundCount}`);
      // 发话延迟取自当前房间人数，min 1 上限15
      let sendMsgTimeout = utils.random(1000, 4000);
      /** Step 2:实时获取Robot策略配置信息 */
      let robotStrategyConfigJson = this.RobotGameStrategy.robotStrategyConfigJson;
      /** Step 3:下注轮逻辑 */
      //弃权
      const preFlopFoldProbability = this.RobotGameStrategy.getFoldProbability(this.roundCount, currentRanking);
      const random = utils.random(1, 100);
      //如果牌力值是第1 的话就不用弃牌
      if (!this.godLikeMod && preFlopFoldProbability >= random) {
        // console.warn(`弃牌${this.uid},random${random},preFlopFoldProbability${preFlopFoldProbability},currentRanking${currentRanking},roundCount${this.roundCount}`);
        if (cinglNum == 0) {
          /**过牌 */
          await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
          return;
        }
        await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
        return;
      }

      //如果是第一回合玩家加注了,判断前面两张玩家的牌和机器人的牌排序
      if (!this.godLikeMod && this.roundCount == 0 && cinglNum > 0) {
        const isPass = this.robotComparisonPlayerCard(this.descSortAllPlayer, currentRanking);
        // console.warn(`第一回合玩${this.godLikeMod},cinglNum${cinglNum},roundCount${this.roundCount},isPass${isPass}`);
        if (isPass) {
          return await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
        }
      }

      //最后一回合,如果真实玩家加注,同时机器人的牌又不大于真实玩家那么就要选择弃牌
      if (!this.godLikeMod && this.roundCount == 3 && cinglNum > 0) {
        const isPass = this.lastRandomRobotComparisonPlayerCard(this.descSortAllPlayer);
        // console.warn(`最后一回合${this.godLikeMod},cinglNum${cinglNum},roundCount${this.roundCount},isPass${isPass}`);
        if (isPass) {
          return await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
        }
      }
      // 如果被调控，但是钱不够 直接allin
      if (this.godLikeMod && currGold <= cinglNum) {
        return await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
      }

      // 加注
      const preFlopRaiseProbability = this.RobotGameStrategy.getfillingProbability(this.roundCount, currentRanking);
      const random1 = utils.random(1, 59);
      //如果最后一回合，牌力值
      if (preFlopRaiseProbability > random1) {
        // console.warn(`加注${this.uid},random1${random1},preFlopRaiseProbability${preFlopRaiseProbability},currentRanking${currentRanking},roundCount${this.roundCount}`);
        let intervalValue = 0;
        const random2 = utils.random(1, 100);
        // const random3 = utils.random(1, 100);
        //是否底池加注 == 概率
        let isRecommBet = robotStrategyConfigJson['raiseRecommBetProbabilityList'][currentRanking >= 6 ? 5 : currentRanking - 1] > random2;
        //是否自由加注 == 概率
        // let isFreedomBet = robotStrategyConfigJson['raiseFreedomBetProbabilityList'][currentRanking >= 6 ? 5 : currentRanking - 1] > random3;
        //这个根据底池的1/3，2/3 来进行押注
        //最后一回合用底池加注
        if (this.roundCount == 3 || isRecommBet) {
          // 推荐加注
          // console.warn(`底池加注${this.uid},判断${isRecommBet},currentRanking${currentRanking},roundCount${this.roundCount},random2:${random2}`);
          await this.raiseRecommBet(currGold, cinglNum, recommBet, intervalValue, robotStrategyConfigJson, sendMsgTimeout, currentRanking);
        } else {
          // } else if (isFreedomBet && [1, 2].includes(this.roundCount)) {
          //自由加注
          // console.warn(`自由加注${this.uid},判断${isFreedomBet},currentRanking${currentRanking},roundCount${this.roundCount},random3:${random3}`);
          await this.raiseFreedomBet(currentRanking, cinglNum, freedomBet, currGold, intervalValue, robotStrategyConfigJson, sendMsgTimeout);
        }
        // else {
        //   //判断固定加注[1, 2, 5, 10, 20] 来进行押注
        //   console.warn(`固定加注${this.uid},currentRanking${currentRanking},roundCount${this.roundCount}`);
        //   await this.raiseAddSceneBet(currGold, cinglNum, intervalValue, robotStrategyConfigJson, sendMsgTimeout);
        // }
        return true;
      } else {
        // 跟注
        await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
        return true;
      }

    } catch (error) {
      const t2 = utils.cDate();
      robotlogger.warn('DZpipei|发话阶段出错:', error, t1, t2, this.roomId, this.uid);
    }
  }

  /**
   * 底池的1/3，2/3 来进行押注
   */
  async raiseRecommBet(currGold, cinglNum, recommBet, intervalValue, robotStrategyConfigJson, sendMsgTimeout, currentRanking) {
    // 推荐加注
    // CC_DEBUG && console.warn(`底池加注recommBet：${recommBet}身上金额${currGold},cinglNum${cinglNum}`);
    const [low, mid, max] = robotStrategyConfigJson['raiseRecommBetList'];
    const random2 = utils.random(0, 100);
    if (max > random2) {
      intervalValue = 2;// 推荐加注 最高
    } else if (mid > utils.random(0, 100)) {
      intervalValue = 1;// 推荐加注 中间
    } else {
      intervalValue = 0;// 推荐加注 最小
    }
    //如果加注金币超出自身拥有金币
    if (intervalValue > 0) {
      do {
        if (recommBet[intervalValue] > currGold || cinglNum > recommBet[intervalValue]) {
          intervalValue--;
        } else if (intervalValue == 0) {
          break;
        } else {
          break;
        }
      } while (true);
    }
    // CC_DEBUG && console.warn(`底池加注intervalValue：${intervalValue}身上金额${currGold}recommBet[intervalValue]${recommBet[intervalValue]}`);
    if (recommBet[intervalValue] <= currGold && cinglNum <= recommBet[intervalValue]) {
      await this.delayRequest(`DZpipei.mainHandler.filling1`, { type: intervalValue }, sendMsgTimeout);
    } else if (this.roundCount == 3 && currentRanking == 1) {
      await this.delayRequest(`DZpipei.mainHandler.allin`, {}, sendMsgTimeout);
    } else {
      await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
    }
    return true;
  }

  /**
   * 固定的加注金额
   */
  async raiseAddSceneBet(currGold, cinglNum, intervalValue, robotStrategyConfigJson, sendMsgTimeout) {
    const raiseAddSceneBetList = robotStrategyConfigJson['raiseAddSceneBetList'][this.sceneId];
    let betNum = 0;
    if ([0, 1].includes(this.roundCount)) {
      betNum = raiseAddSceneBetList[utils.random(0, 1)];
    } else {
      betNum = raiseAddSceneBetList[utils.random(1, 4)];
    }
    //如果固定的加注金额小于自身金额,小于跟注金额，就用跟注金额
    if (currGold > betNum && betNum < cinglNum) {
      betNum = cinglNum;
      //如果固定金额大于自身金额 , 就用自身所有的金额
    } else if (currGold < betNum) {
      betNum = currGold;
    }
    // console.warn(`固定的加注金额：${betNum}身上金额:${currGold},cinglNum:${cinglNum}`);
    if (betNum > 0) {
      await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: betNum }, sendMsgTimeout);
    } else {
      await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
    }
    return true;
  }


  /**
   * 自由加注的加注金额
   */
  async raiseFreedomBet(currentRanking, cinglNum, freedomBet, currGold, intervalValue, robotStrategyConfigJson, sendMsgTimeout) {
    // 自由加注
    let [min, max] = freedomBet;
    if (max > 0) {
      const percent = robotStrategyConfigJson['raiseFreedomBetList'][currentRanking >= 6 ? 5 : currentRanking - 1];
      intervalValue = min + Math.floor((max - min) * (percent / 100));
      if (intervalValue > currGold) intervalValue = currGold;
      // console.warn(`自由加注的加注金额：加注金额${intervalValue},身上金额${currGold}freedomBet${freedomBet}`);
      if (intervalValue > 0) {
        await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: intervalValue }, sendMsgTimeout);
      }
    } else if (currentRanking == 1 && this.roundCount == 3) {
      await this.delayRequest(`DZpipei.mainHandler.allin`, {}, sendMsgTimeout);
    } else if (cinglNum > 0) {
      await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
    } else if (currGold > 0) {
      //如果自由加注min = 0 ,max = 0;
      let betNum = (Math.floor(utils.random(1, 9)) / 10) * currGold;
      await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: betNum }, sendMsgTimeout);
    } else {
      await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
    }
    return true;
  }

  /**
 * 获得当前手牌类型
 * @returns {number} 0-6 手牌类型
 */
  // async pokerType() {
  //   /** 变量aipoke 手牌待更名 */
  //   if (!this.aipoke) {
  //     let allPlayerList = await this.requestByRoute(`DZpipei.mainHandler.robotNeed`, {});
  //     let robotIdx = allPlayerList.findIndex(playInfo => playInfo['uid'] === this['uid']);
  //     if (robotIdx < 0) return;
  //     this.aipoke = allPlayerList[robotIdx]['holds'];
  //     this.roomPlayerNum = allPlayerList.length;// 当前玩家人数
  //   }
  //   const [firstHandPokerNum, secondHandPokerNum] = this.aipoke;
  //   let firstHandPokerColor = RobotPokerAction.getPokerColor(firstHandPokerNum);
  //   let secondHandPokerColor = RobotPokerAction.getPokerColor(secondHandPokerNum);
  //   // 手牌2张
  //   let handPokers = RobotPokerAction.getPokerFace(firstHandPokerNum % 13) + RobotPokerAction.getPokerFace(secondHandPokerNum % 13);
  //   this.robotPoke = handPokers;// FixMe 暂不清楚此变量何处有引用，待基本功能重构测试时决定去留
  //   const isSameColorFlag = firstHandPokerColor === secondHandPokerColor ? 1 : 2;
  //   try {
  //     return RobotPokerAction.getPokerType(handPokers, isSameColorFlag);
  //   } catch (error) {
  //     return 6;
  //   }
  // }

  //监听下注加注
  onOpts(opt) {
    //AF
    if (opt.type == 'cingl' || opt.type == "allin" || opt.type == "filling") {
      this.allbet++;
      if (opt.type == 'cingl') {
        this.heel++;
      }
      if (opt.type == "allin" || opt.type == "filling") {
        this.allfilling++;
      }
    }
    if (opt.type == 'fold') {
      this.flodsPlay.push(opt.seat);
    }
    this.currSumBet = opt.sumBet;
  }

  //机器人离开房间
  destroy() {
    this.leaveGameAndReset(false);
  }

  //第一回合玩家和机器人排序,如果只有两张手牌的时候,如果玩家存在两张牌的时候牌力值不高的人可以pass
  robotComparisonPlayerCard(descSortAllPlayer: any[], currentRanking: number) {
    const playerCardList = descSortAllPlayer.filter(pl => pl.isRobot == 0);
    let isPass = false;
    //判断是否有真实玩家起手牌有对子
    if (playerCardList.length > 0) {
      for (const pl of playerCardList) {
        const arr = pl.holds.map(m => m % 13);
        const alikeCount = DeGameUtil.checkAlike(arr);
        if (alikeCount[2]) {
          isPass = true;
        }
      }
    }
    if (isPass) {
      //如果真实玩家起手牌有对子 , 同时剩余机器人 >= 2 ,排名 在2之后
      const robotCardList = descSortAllPlayer.filter(pl => pl.isRobot == 2);
      if (robotCardList.length >= 2) {
        if (currentRanking <= 2) {
          return true;
        }
      }
    }
    return false;
  }

  //最后一回合,如果真实玩家加注,同时机器人的牌又不大于真实玩家那么就要选择弃牌
  lastRandomRobotComparisonPlayerCard(descSortAllPlayer: any[]) {
    const player = descSortAllPlayer[0];
    if (player && player.isRobot == 0) {
      return true;
    } else {
      return false;
    }


  }

}