import Room from "../../RedPacketRoomImpl";
import { RedPacketGameStatusEnum } from "../../enum/RedPacketGameStatusEnum";
import { IGraberRedPacket } from '../../interface/IGraberRedPacket';
import IRedPacket from '../../interface/IRedPacket';
import { RoleEnum } from "../../../../../common/constant/player/RoleEnum";
import utils = require('../../../../../utils/index');
import { ApiResult } from "../../../../../common/pojo/ApiResult";
import { getlanguage, Net_Message } from "../../../../../services/common/langsrv";
import { filterProperty } from "../../../../../utils";

export default class StateGameAction {


  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): StateGameAction {
    if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new StateGameAction(room)
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * 发红包：添加红包进队列，并将未在游戏状态的红包进行排序(按金额降序）
   * @param redPacket
   */
  addRedPacketToRedPackQueue(redPacket: IRedPacket) {
    // Step 1:放进红包队列
    this.room.redPackQueue.push(redPacket);
    // Step 2:将未处于游戏中的红包进行排序
    const redPacketOfStatusNotInGameList = this.room.redPackQueue
      .filter((redPacket: IRedPacket) => redPacket.status === RedPacketGameStatusEnum.WAIT)
      .sort((redPacketA, redPacketB) => redPacketB.amount - redPacketA.amount);
    // Step 3:合并 以队列里第一个红包状态是否正在“游戏”来更新红包队列
    this.room.redPackQueue = this.room.redPackQueue[0].status === RedPacketGameStatusEnum.WAIT ? redPacketOfStatusNotInGameList : [this.room.redPackQueue[0]].concat(redPacketOfStatusNotInGameList);
  }

  deleteRedPacketFromRedPacketQueue(uid: string) {
    utils.remove(this.room.redPackQueue, 'owner_uid', uid);
    /*// Step 2:将未处于游戏中的红包进行排序
    const redPacketOfStatusNotInGameList = this.room.redPackQueue
      .filter((redPacket: IRedPacket) => redPacket.status === RedPacketGameStatusEnum.WAIT)
      .sort((redPacketA, redPacketB) => redPacketB.amount - redPacketA.amount);
    // Step 3:合并 以队列里第一个红包状态是否正在“游戏”来更新红包队列
    this.room.redPackQueue = this.room.redPackQueue[0].status === RedPacketGameStatusEnum.WAIT ? redPacketOfStatusNotInGameList : [this.room.redPackQueue[0]].concat(redPacketOfStatusNotInGameList);*/
  }

  /**
   * 红包生成器
   * @param num          红包个数
   * @param amount       总金额
   * @return {number[]} 初始红包数组
   */
  redPacketGenerator(num: number, amount: number): number[] {
    let redPacketList = [];
    let fSumTmp = amount;
    let iAcc = 0;
    for (let i = 0; i < (num - 1); i++) {
      let iTmp = Math.ceil((Math.random() * (fSumTmp / 2)));
      redPacketList.push(iTmp);
      fSumTmp -= iTmp;
      iAcc += iTmp;
    }
    redPacketList.push(Number((amount - iAcc)));
    return redPacketList;
  }

  /**
   * 生成对局用红包
   * @param redPacketNumber 必填 红包数
   * @param amount          必填 红包总金额
   * @param mineNum         必填 地雷
   * @param targetMineNum   可填 指定含多少雷 Ps:不会超过“场”最大雷数
   * @return {string[]}     返回可用红包数组
   * @description 此处返回是保留两位小数的字符串数组
   */
  randomRedPacketList(redPacketNumber: number, amount: number, mineNum: number, targetMineNum?: number): string[] {
    const { maxMineNum } = this.room.sceneInfo;
    let checkRedPacketFlag = true;
    let resultRedPacketList = [];

    do {
      let tmpRedPacketList = [];

      // HACK: 红包改为不排序 修改时间： 2019.12.25
      // let redPacketList = this.redPacketGenerator(redPacketNumber, amount).sort((a, b) => b - a);
      let redPacketList = this.redPacketGenerator(redPacketNumber, amount);

      // 单个红包数值最大值不超过红包60%，最低不为0。
      if ((Math.max(...redPacketList) / amount) > 0.6 || Math.min(...redPacketList) === 0) continue;

      // 红包里雷总数不应超过指定数字
      let curretMineNum = redPacketList.reduce((totalMineNum, val) => {
        let valStr = `${val}`;
        tmpRedPacketList.push(valStr);
        return valStr.split('').reverse()[0] === mineNum.toString() ? ++totalMineNum : totalMineNum;
      }, 0);

      // 地雷 不能超过指定上限
      if (curretMineNum > maxMineNum) continue;

      // 可选:生成指定数目地雷，但不会超过指定房间上限
      if (typeof targetMineNum === "number" && targetMineNum <= maxMineNum && curretMineNum !== targetMineNum) continue;

      resultRedPacketList = tmpRedPacketList;

      checkRedPacketFlag = false;

    } while (checkRedPacketFlag);

    return resultRedPacketList;
  }

  /**
   * 根据“场”配置、玩家“红包金额”、“红包抽利” 生成游戏中使用的红包池
   */
  async checkRedPacketListOnReady() {
    // Step 1:生成红包池
    const { redParketNum, maxMineNum, realPlayerMineNum } = this.room.sceneInfo;// 需生成的红包数
    /**
     * amount:发放红包金额
     * mineNumber:该红包地雷号
     */
    const { amount, mineNumber } = this.room.redPackQueue[0];
    const bet_ratio: number = this.room.currentCommissionBetRatio;
    const redPacketAmount: number = amount - (amount * bet_ratio);// 实际发放红包金额
    const redPacketOwner = this.room.players.find(player => player.uid === this.room.redPackQueue[0].owner_uid);
    // 如果发包者被调控了  检查发包玩家是否是调控玩家，如果是调控玩家则最多只生成一个有雷红包
    if (redPacketOwner.isRobot === RoleEnum.ROBOT) {
      const randomValue = utils.random(0, 1000);
      let currentMineNumber = 0;

      if (this.room.sceneId === 0) {
        /** 分场:10包  */
        if (randomValue > 990) {
          // 1%
          currentMineNumber = 6;
        } else if (randomValue > 970) {
          // 2%
          currentMineNumber = 5;
        } else if (randomValue > 930) {
          // 4%
          currentMineNumber = 4;
        } else if (randomValue > 840) {
          // 9%
          currentMineNumber = 3;
        } else if (randomValue > 700) {
          // 14%
          currentMineNumber = 2;
        } else if (randomValue > 460) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      } else {
        /** 分场: 7包 */
        if (randomValue > 994) {
          // 0.6%
          currentMineNumber = 6;
        } else if (randomValue > 982) {
          // 1.2%
          currentMineNumber = 5;
        } else if (randomValue > 959) {
          // 2.3%
          currentMineNumber = 4;
        } else if (randomValue > 909) {
          // 5%
          currentMineNumber = 3;
        } else if (randomValue > 829) {
          // 8%
          currentMineNumber = 2;
        } else if (randomValue > 589) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      }

      this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
    } else if (await this.room.control.isControl(redPacketOwner)) {
      /// @ts-ignore
      const { personalControlPlayers } = await this.room.control.getControlResult([filterProperty(redPacketOwner)]);
      if (personalControlPlayers.length > 0) {
        const randomValue = utils.random(0, 100);
        const currentMineNumber = randomValue > personalControlPlayers[0].probability ? 1 : 0;
        this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, mineNumber, currentMineNumber);
      } else {
        this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, mineNumber, 0);
      }
      // redPacketOwner.controlState = CommonControlState.LOSS;
    } else if (redPacketOwner.isRobot === RoleEnum.REAL_PLAYER) {
      // 真实玩家发包 | 非调控下
      const randomValue = utils.random(0, 1000);
      let currentMineNumber = 0;

      if (this.room.sceneId === 0) {
        /** 分场:10包  */
        if (randomValue > 990) {
          // 1%
          currentMineNumber = 6;
        } else if (randomValue > 970) {
          // 2%
          currentMineNumber = 5;
        } else if (randomValue > 930) {
          // 4%
          currentMineNumber = 4;
        } else if (randomValue > 840) {
          // 9%
          currentMineNumber = 3;
        } else if (randomValue > 700) {
          // 14%
          currentMineNumber = 2;
        } else if (randomValue > 460) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      } else {
        /** 分场: 7包 */
        if (randomValue > 994) {
          // 0.6%
          currentMineNumber = 6;
        } else if (randomValue > 982) {
          // 1.2%
          currentMineNumber = 5;
        } else if (randomValue > 959) {
          // 2.3%
          currentMineNumber = 4;
        } else if (randomValue > 909) {
          // 5%
          currentMineNumber = 3;
        } else if (randomValue > 829) {
          // 8%
          currentMineNumber = 2;
        } else if (randomValue > 589) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      }

      this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
    } else {

      const randomValue = utils.random(0, 1000);
      let currentMineNumber = 0;

      if (this.room.sceneId === 0) {
        /** 分场:10包  */
        if (randomValue > 990) {
          // 1%
          currentMineNumber = 6;
        } else if (randomValue > 970) {
          // 2%
          currentMineNumber = 5;
        } else if (randomValue > 930) {
          // 4%
          currentMineNumber = 4;
        } else if (randomValue > 840) {
          // 9%
          currentMineNumber = 3;
        } else if (randomValue > 700) {
          // 14%
          currentMineNumber = 2;
        } else if (randomValue > 460) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      } else {
        /** 分场: 7包 */
        if (randomValue > 994) {
          // 0.6%
          currentMineNumber = 6;
        } else if (randomValue > 982) {
          // 1.2%
          currentMineNumber = 5;
        } else if (randomValue > 959) {
          // 2.3%
          currentMineNumber = 4;
        } else if (randomValue > 909) {
          // 5%
          currentMineNumber = 3;
        } else if (randomValue > 829) {
          // 8%
          currentMineNumber = 2;
        } else if (randomValue > 589) {
          // 24%
          currentMineNumber = 1;
        } else {
          // 46%
          currentMineNumber = 0;
        }
      }

      this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
      /**
       * @data 2020/09/29 
       * @description 策划变更机器人与真实玩家正常发包一致的雷数
       */
      // redPacketOwner.controlState = CommonControlState.RANDOM;
      // Step 2:为对局备好运算用红包 优化: 红包扫雷改为有可能不生成雷 修改时间: 2019.11.27
      // this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, mineNumber, utils.random(1, this.room.sceneId === 0 ? maxMineNum : maxMineNum - 2));
    }

    this.room.currentGraberQueue = this.room.currentRedPacketList.map((amountStr, idx) => {
      const isStepInMine = amountStr.toString().split('').reverse()[0] === mineNumber.toString();
      return {
        grabUid: null,
        hasGrabed: false,
        grabTime: 0,
        redPacketListIdx: idx,
        redPacketAmount: amountStr,
        isStepInMine,
        nickname: null,
        gold: 0,
        headurl: null,
      }
    });
  }

  /**
   * 是否可结算
   * 两种条件满足其一即可
   * 1.结算倒计时为0
   * 2.抢包者人数 = 红包数量
   */
  canBeSettled() {
    return this.room.currentGraberQueue.length === this.room.sceneInfo.redParketNum || this.room.tmp_countDown === 0
  }

  /**
   * 获取含雷红包，若无则随机一个
   * @return {boolean} 是否中雷
   */
  getHasMineInRedPacket(uid: string): boolean | ApiResult {
    // Step 1:获取当前未被抢且含有雷的红包;
    const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket: IGraberRedPacket) => !graberRedPacket.hasGrabed && graberRedPacket.isStepInMine);
    if (grabRedPacketIdx >= 0) {
      const player = this.room.getPlayer(uid);
      // Step 2:变更该红包状态
      const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
      graberRedPacket.grabUid = uid;
      graberRedPacket.hasGrabed = true;
      graberRedPacket.grabTime = Date.now();
      graberRedPacket.nickname = player.nickname;
      graberRedPacket.gold = player.gold;
      graberRedPacket.headurl = player.headurl;
      return graberRedPacket.isStepInMine;
    }
    // Step 3:剩下的都没雷，则随机占一个
    return this.getRedPacketByRandom(uid);
  }

  /**
   * 随机获取一个红包
   * @return {boolean} 是否中雷
   */
  getRedPacketByRandom(uid: string): boolean | ApiResult {
    // Step 1:获取当前未被抢的红包;
    const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket: IGraberRedPacket) => !graberRedPacket.hasGrabed);
    if (grabRedPacketIdx < 0) {
      const p = this.room.getPlayer(uid);
      return ApiResult.ERROR(null, getlanguage(p.language, Net_Message.id_8116));
    };
    // if (grabRedPacketIdx < 0) throw Error(`随机获取一个红包出错，已无可用红包。当前抢包队列信息:${JSON.stringify(this.room.currentGraberQueue, null, 2)}`);
    const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
    // Step 2:变更红包状态
    const player = this.room.getPlayer(uid);
    graberRedPacket.grabUid = uid;
    graberRedPacket.hasGrabed = true;
    graberRedPacket.grabTime = Date.now();
    graberRedPacket.nickname = player.nickname;
    graberRedPacket.gold = player.gold;
    graberRedPacket.headurl = player.headurl;
    // Step 3:返回是否中雷
    return graberRedPacket.isStepInMine;
  }

  /**
   * 获取一个不含雷的红包
   * @return {boolean} 获取处理成功,false 获取失败
   * @date 2019年11月4日
   * @description 返回函数与上面2个抢包函数返回有区别；属补丁逻辑
   */
  getNotHasMineInRedPacket(uid: string): boolean | ApiResult {
    // Step 1:获取当前"未被抢"且"无雷"的红包;
    const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket: IGraberRedPacket) => !graberRedPacket.hasGrabed && !graberRedPacket.isStepInMine);
    // 如果都是有雷的 随机一个
    if (grabRedPacketIdx < 0) return this.getRedPacketByRandom(uid);
    // Step 2:变更红包状态
    const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
    //
    const player = this.room.getPlayer(uid);
    graberRedPacket.grabUid = uid;
    graberRedPacket.hasGrabed = true;
    graberRedPacket.grabTime = Date.now();
    graberRedPacket.nickname = player.nickname;
    graberRedPacket.gold = player.gold;
    graberRedPacket.headurl = player.headurl;
    return true;
  }
}
