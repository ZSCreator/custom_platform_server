import { SystemRoom } from "../../../common/pojo/entity/SystemRoom";
import { BlackJackPlayerImpl } from "./BlackJackPlayerImpl";
import { pinus } from "pinus";
import { BlackJackRoomStatusEnum } from "./enum/BlackJackRoomStatusEnum";
import { BlackJackRuntimeData } from "./expansion/roomExpansion/BlackJackRuntimeData";
import { BlackJackRoomChannelForPlayer } from "./expansion/roomExpansion/BlackJackRoomChannelForPlayer";
import { BlackJackPlayerRoleEnum } from "./enum/BlackJackPlayerRoleEnum";
import { BlackJackPlayerStatusEnum } from "./enum/BlackJackPlayerStatusEnum";
import { ApiResult } from "../../../common/pojo/ApiResult";
import { BlackJackState } from "../../../common/systemState/blackJack.state";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { BlackJackSettlementAction } from "./expansion/roomExpansion/BlackJackSettlementAction";
import { random, remove } from "../../../utils/index";
import { calculateDot } from "../../../utils/GameUtil";
import { BlackJackDealerActionStrategy } from "./expansion/roomExpansion/BlackJackDealerActionStrategy";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import Control from "./control";
import { getLogger } from "pinus-logger";
import { BlackJackPlayerHistory } from "./BlackJackPlayerHistory";
import { EventEmitter } from "events";
import { BlackJackTenantRoomManager } from "./BlackJackTenantRoomManager";
// import { BlackJackDynamicRoomManager } from "./BlackJackDynamicRoomManager";

const robotlogger = getLogger("server_out", __filename);

export class BlackJackRoomImpl extends SystemRoom<BlackJackPlayerImpl> {

  public roomUserLimit: number;
  ChipList: number[];
  areaMaxBet: number = 1000000;

  lowBet: number;

  /** @property 所属服务器编号 */
  public backendServerId: string;

  /** @property 广播频道 */
  public channelForPlayer: BlackJackRoomChannelForPlayer;

  /** @property 结算阶段封装函数 */
  private settlementAction: BlackJackSettlementAction;

  /** @property 房间状态 */
  private roomStatus: BlackJackRoomStatusEnum = BlackJackRoomStatusEnum.None;

  /** @property 是否初始化 */
  // public roomBeInit: boolean = false;

  /** @property 房间是否开始运行 */
  private beRunning: boolean = false;
  private processInterval: NodeJS.Timeout = null
  /** @property 运行时常规业务数据及函数 */
  runtimeData: BlackJackRuntimeData;

  commonMaxBetListForRobot: Array<number>;

  /** @property 统计机器人当前下注量 */
  commonBetListForRobot: Array<number>;

  /** 发牌阶段 Start */

  /** @property 发牌动画 */
  licensingAnimation: boolean = false;

  /** 发牌阶段  End  */

  /** 保险阶段 Start  */

  /** @property 是否开始保险阶段 */
  private insuranceBeginning: boolean = false;

  /** @property 待通知是否购买保险的区域 */
  waitForNoticeAreaListOnInsurance: Array<number> = [];

  /** @property 待通知是否购买保险的玩家 */
  waitForNoticePlayerList: Array<Array<BlackJackPlayerImpl>> = [];

  /** @property 是否是从保险阶段跳至结算阶段 */
  beInsuranceToSettlement: boolean = false;

  /** 保险阶段  End  */

  /** 闲家阶段 Start */

  /** @property 是否开始闲家阶段 */
  private playerBeginning: boolean = false;

  /** @property 是否分牌 */
  beSeparate: boolean = false;

  /** @property 当前区域是否进行分牌通知 */
  playerSeparateBeginning: boolean = false;

  /** @property 分牌区域第一次通知 */
  private playerSeparateFirstNotice: boolean = false;

  /** @property 是否获取牌 */
  beAddPoker: boolean = false;

  /** @property 当前通知下注区域 */
  currentNoticeAreaIdx: -1 | 0 | 1 | 2 = -1;

  /** 闲家阶段  End  */

  /** 庄家阶段 Start */

  beShowSecendPoker: boolean = false;

  dealerActionStrategy: BlackJackDealerActionStrategy;

  /** @property 调控 */
  control: Control = new Control({ room: this });



  /** 庄家阶段  End */

  /** 结算阶段 Start */

  settlementBeginning: boolean = false;

  /**
   * @property startTime 回合开始时间
   * @property endTime 回合结束时间
   */
  startTime: number;
  endTime: number;

  /** 结算阶段  End */

  /** 真实玩家游玩记录 Start */

  playerGameHistoryMap: Map<string, BlackJackPlayerHistory> = new Map();

  /** 真实玩家游玩记录  End  */
  public roomManager: BlackJackTenantRoomManager;

  constructor(opts: any, roomManager: BlackJackTenantRoomManager) {
    super(opts);

    this.areaMaxBet = opts["areaMaxBet"];
    this.ChipList = opts.ChipList;
    this.lowBet = opts["lowBet"];

    this.roomUserLimit = opts["roomUserLimit"];


    this.backendServerId = pinus.app.getServerId();

    this.runtimeData = new BlackJackRuntimeData(this);

    this.settlementAction = BlackJackSettlementAction.getInstance(this, this.roomId);

    // this.channelForPlayer = BlackJackRoomChannelForPlayer.getInstance(this, this.roomId);
    this.channelForPlayer = new BlackJackRoomChannelForPlayer(this);

    this.dealerActionStrategy = BlackJackDealerActionStrategy.getInstance(this, this.roomId);

    this.event = new EventEmitter();

    this.roomManager = roomManager;
    /* this.robotManager = new IDynamicRoomRobotManager({
      robotNumber: 12,
      room: this
    }); */
  }

  /**
   * 初始化调用
   */
  public init() {
    if (this.roomBeInit) {
      return;
    }
    this.roomBeInit = true;

    // 初始化运行时所需数据
    this.runtimeData.initRuntimeData();


    this.addPlayerInRoom(new BlackJackPlayerImpl({
      role: BlackJackPlayerRoleEnum.Dealer
    }));

    this.run();
  }

  /**
   * 开启运行
   */
  private async run() {
    if (this.beRunning) {
      return;
    }


    this.beRunning = true;

    try {
      this.processInterval = setInterval(() => this.process.apply(this), 1e3);
    } catch (e) {
      robotlogger.error(`21点进程出错: ${e.stack}`);
    }
  }

  /**
   * 核心业务逻辑
   */
  private async process() {
    if (this.roomStatus !== BlackJackRoomStatusEnum.None) {
      this.runtimeData.decreaseToCountDown();
    }

    switch (this.roomStatus) {
      case BlackJackRoomStatusEnum.None: {
        await this.noneState();
        this.printLog('初始');
        break;
      }

      // 下注阶段
      case BlackJackRoomStatusEnum.Betting: {
        this.betState();
        this.printLog('押注');
        break;
      }


      // 发牌阶段
      case BlackJackRoomStatusEnum.Licensing: {
        this.licensingState();
        this.printLog('发牌');
        break;
      }
      // 保险阶段
      case BlackJackRoomStatusEnum.Insurance: {
        this.insuranceState();
        this.printLog('保险');
        break;
      }

      // 闲家阶段
      case BlackJackRoomStatusEnum.Player: {
        this.playerState();
        this.printLog('闲家');
        break;
      }

      // 庄家阶段
      case BlackJackRoomStatusEnum.Dealer: {
        await this.dealerState();
        this.printLog('庄家');
        break;
      }

      // 结算阶段
      case BlackJackRoomStatusEnum.Settlement: {
        await this.settlementState();
        this.printLog('结算');
        break;
      }

      default:
        break;
    }
  }

  printLog(state: string) {
    const {
      rss,
      heapTotal,
      heapUsed,
      external
    } = process.memoryUsage();
    // console.warn(`场:${this.sceneId}, 房间:${this.roomId} 状态: ${state} 总内存占用:${rss}堆占用的内存 (已使用和未使用):${heapTotal}用到的堆的部分:${heapUsed}`);
  }

  /**
   * 初始状态
   */
  async noneState() {
    // robotlogger.warn(`当前 ${this.players.length} 人 `);
    /* const {
      rss,
      heapTotal,
      heapUsed,
      external
    } = process.memoryUsage();
    robotlogger.warn(`
    总内存占用:
      ${rss}
    堆占用的内存 (已使用和未使用):
      ${heapTotal}
    用到的堆的部分:
      ${heapUsed}
    V8 引擎内部的 C++ 对象占用的内存:
      ${rss}
    `); */
    /** Step 2: 每局开始的时候踢掉离线玩家,同时3局未下注就提示玩家，5局未下注就踢掉玩家 */
    await this.br_kickNoOnline();

    /** Step 3: 变更房间状态开启下一局 */
    this.changeRoomStatus(BlackJackRoomStatusEnum.Betting);

    /** Step 4: 重置运行数据 */
    this.runtimeData.resetRoomInfoAndRestart();
    this.initRunData();
    this.startTime = Date.now();
    /** Step 5: 通知前端下注 */
    this.channelForPlayer.bettingToAllPlayer(this.roundId, this.runtimeData.getCurrentCountdown());
  }

  /**
   * 下注状态
   */
  betState() {
    if (this.runtimeData.getCurrentCountdown() === 0) {

      /** Step 1: 无人下注则开启下一局 */
      if (!this.runtimeData.checkBettingToPlayer()) {
        // 变更房间状态开启下一局
        this.changeRoomStatus(BlackJackRoomStatusEnum.None);

        return;
      }

      /** Step 2: 进入发牌阶段 */
      this.changeRoomStatus(BlackJackRoomStatusEnum.Licensing);
    }
  }

  /**
   * 发牌阶段
   */
  licensingState() {
    if (this.licensingAnimation) {

      if (this.runtimeData.getCurrentCountdown() === 0) {
        /** Step 4: 进入保险阶段 */
        this.changeRoomStatus(BlackJackRoomStatusEnum.Insurance);
      }
      return;
    }

    /** Step 1: 检测是否含有庄家（系统） */
    const dealerPlayer = this.players.find(p => p.role === BlackJackPlayerRoleEnum.Dealer);

    if (!dealerPlayer) {
      throw new Error(`没有庄家`);
    }

    /** Step 2: 发放公共区域牌 */

    // 庄家区域牌
    this.runtimeData.handoutPokerForCommonArea(BlackJackPlayerRoleEnum.Dealer);

    // 闲家公共区域牌
    this.runtimeData.handoutPokerForCommonArea(BlackJackPlayerRoleEnum.Player);

    // 复制公共区域牌进玩家独立公共区域
    const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();

    // 公共区域: 当前区域下注的玩家
    const currentAreaPlayerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game &&
      p.role === BlackJackPlayerRoleEnum.Player &&
      p.getCurrentTotalBet() > 0
    );

    currentAreaPlayerList.forEach(p => {

      commonPokerInfoList.forEach((playerArea, idx) => {

        const { basePokerList, baseCount } = playerArea

        p.commonAreaBetList[idx].setPokerList([...basePokerList], [...baseCount]);
      });

    });

    /** Step 3: 通知前端初始牌 */
    this.channelForPlayer.showPokerToAllPlayer(
      this.runtimeData.getDealerPokerListAndCount(),
      this.runtimeData.getCommonPokerListAndCount()
    );

    const second = commonPokerInfoList.reduce((second, { basePokerList }) => {
      if (basePokerList.length > 0) ++second;
      return second;
    }, 0)

    this.runtimeData.setSettlementCountdown(second);

    this.licensingAnimation = true;
  }

  /**
   * 保险阶段
   */
  insuranceState() {
    /**
     * Step 1: 检测是否已开始保险阶段
     * @description 分支 1: 若第二张牌满足合计21点，则进入结算流程
     * @description 分支 2: 若第二张牌不满足21点，则进入正常流程。闲家说话 -> 庄家说话 -> 结算
     */
    if (this.insuranceBeginning) {

      const currentCountdown = this.runtimeData.getCurrentCountdown();

      if (currentCountdown === 0) {

        // Step 1.1: 通知完所有区域的玩家购买保险
        const areaIdxOrFalse = this.runtimeData.nextAreaSpeakOnInsurance();

        if (typeof areaIdxOrFalse === "number") {

          const waitToNoticePlayerList = this.waitForNoticePlayerList[areaIdxOrFalse];

          this.channelForPlayer.insuranceToAllPlayer(areaIdxOrFalse, waitToNoticePlayerList);

          return;
        }

        // Step 1.2: 庄家继续要牌,检测是否进入结算流程
        const dealerMaxCount = this.runtimeData.dealerHit();


        if (dealerMaxCount === 21) {

          // 展示庄家第二张手牌
          this.channelForPlayer.showDealerPokerToAllPlayer(this.runtimeData.getDealerPokerListAndCount());


          this.beInsuranceToSettlement = true;

          this.changeRoomStatus(BlackJackRoomStatusEnum.Settlement);

          return;
        }

        // 如果不符合则回滚
        this.runtimeData.rollbackBankerDeal();

        // Step 1.3: 转向正常流程 -> 玩家说话
        this.changeRoomStatus(BlackJackRoomStatusEnum.Player);

        return;
      }


      return;
    }

    /**
     * Step 2: 检测庄家手牌是否具备进入保险阶段条件
     * @description 分支 1:满足首张 ace A牌：1点 或 11点;通知所有下过注的玩家是否购买保险
     * @description 分支 2:无论是否满足首张牌是否 ace，若第二张牌满足合计21点，则进入结算流程;
     */

    if (!this.runtimeData.checkChangesToInsurance()) {

      const dealerMaxCount = this.runtimeData.dealerHit();

      // Step 2.1: 庄家继续要牌,检测是否进入结算流程
      if (dealerMaxCount === 21) {

        // 展示庄家第二张手牌
        this.channelForPlayer.showDealerPokerToAllPlayer(this.runtimeData.getDealerPokerListAndCount());


        this.beInsuranceToSettlement = true;

        this.changeRoomStatus(BlackJackRoomStatusEnum.Settlement);

        return;
      }

      // 如果不符合则回滚
      this.runtimeData.rollbackBankerDeal();


      // Step 2.2: 转向正常流程 -> 玩家说话

      this.changeRoomStatus(BlackJackRoomStatusEnum.Player);

      return;
    }

    /** Step 3: 通知是否购买保险 */
    this.insuranceBeginning = true;



    // 3.1: 过滤玩家: 闲家身份、下注
    const insurancePlayerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0
    );


    // 3.2: 过滤玩家: 每个独立区域下过注，依次广播通知
    this.waitForNoticePlayerList = insurancePlayerList.reduce((playerList, player) => {

      // 遍历玩家独立下注区域
      player.commonAreaBetList.map((p, i) => {

        // 若已下过注则放进对应映射的通知集合内
        if (p.getCurrentBet() > 0) {

          if (!this.waitForNoticeAreaListOnInsurance.includes(i)) {
            this.waitForNoticeAreaListOnInsurance.push(i);
          }

          playerList[i].push(player);

        }

      })

      return playerList;
    }, [[], [], []]);


    // 3.3: 首次通知
    const firstAreaIdx = this.runtimeData.nextAreaSpeakOnInsurance();

    if (typeof firstAreaIdx === "boolean") {
      this.changeRoomStatus(BlackJackRoomStatusEnum.Player);
      return;
    }

    const waitToNoticePlayerList = this.waitForNoticePlayerList[firstAreaIdx];

    this.channelForPlayer.insuranceToAllPlayer(firstAreaIdx as number, waitToNoticePlayerList);
  }

  /**
   * 闲家阶段
   */
  playerState() {
    /**
     * Step 1: 检测是否已开始闲家阶段(初始化完毕)
     */
    if (this.playerBeginning) {

      if (this.runtimeData.getCurrentCountdown() !== 0) {
        return;
      }

      /**
       * 每个区域首次:是否有分牌操作
       * @description 优先级最高,阻塞非分牌操作的玩家的 加倍、要牌操作
       */
      if (this.beSeparate) {
        // 恢复分牌操作状态
        this.beSeparate = false;

        // 变更首次通知状态
        this.playerSeparateFirstNotice = true;

        // 过滤出当前区域具备“操作”权限的玩家
        const currentAreaPlayerList = this.players.filter(p =>
          p.status === BlackJackPlayerStatusEnum.Game &&
          p.role === BlackJackPlayerRoleEnum.Player &&
          p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0
        );

        /**
         * 当前操作是否有人进行 加倍、要牌
         * @description 阻塞 | retry
         */
        if (this.beAddPoker) {
          // 恢复要牌操作状态
          this.beAddPoker = false;

          // 过滤出要牌操作的玩家,并恢复操作状态
          const addPokerPlayerList = currentAreaPlayerList.filter((p) =>
            p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction
          );

          addPokerPlayerList.forEach(p => {
            p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;
            p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
            p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = false;
          })
        }

        /** 分牌操作处理 */

        // 设置当前区域有分牌通知
        this.playerSeparateBeginning = true;

        // 复制公共区域第 2 张牌作为分牌区域第 1 张牌
        this.runtimeData.pasteSeparateAreaFromCommonArea(this.currentNoticeAreaIdx);

        // 分牌区域补 1 张牌
        const poker = this.runtimeData.getOnePokerFromPokerPool();
        this.runtimeData.addPokerIntoSeparateAreaByAreaIdx(this.currentNoticeAreaIdx, poker);

        // 设置下一次操作计时器
        this.runtimeData.nextAreaSpeakOnPlayer();

        // 过滤出进行"分牌"操作的玩家
        const firstSeparateAreaActionPlayerList = currentAreaPlayerList.filter((p) =>
          p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate()
        )

        // 玩家的分牌区域补相同牌
        firstSeparateAreaActionPlayerList.forEach(p => {
          p.actionList.separate = false;
          p.separateAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);
        })


        this.channelForPlayer.noticeSeparateActionToAllPlayer(
          this.currentNoticeAreaIdx,
          firstSeparateAreaActionPlayerList
        );

        // 公共区域: 判断当前区域是否操作完毕
        const commonAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p =>
          p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete
        );

        // 恢复分牌操作玩家的公共区域操作状态
        firstSeparateAreaActionPlayerList.forEach(p => {
          p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
          p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = false;
        });

        if (!commonAreaEveryPlayerBeActionComplete) {
          this.channelForPlayer.noticeActionToAllPlayer(
            this.currentNoticeAreaIdx,
            currentAreaPlayerList.filter(p => !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete)
          );
        } else {
          this.channelForPlayer.noticeActionToAllPlayer(
            this.currentNoticeAreaIdx,
            firstSeparateAreaActionPlayerList,
            true
          );
        }

        return;
      }

      /**
       * Step 4: 是否进入庄家状态
       */
      if (this.currentNoticeAreaIdx >= 3) {

        this.changeRoomStatus(BlackJackRoomStatusEnum.Dealer);
        return;
      }

      /**
       * Step 3: 闲家阶段核心业务逻辑
       */

      /** Step 3.1: 当前"公共区域"是否操作完毕 */

      // 公共区域: 当前区域下注的玩家
      const currentAreaPlayerList = this.players.filter(p =>
        p.status === BlackJackPlayerStatusEnum.Game &&
        p.role === BlackJackPlayerRoleEnum.Player &&
        p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0
      );

      // 公共区域 获取牌
      if (this.beAddPoker) {
        const addPokerPlayerList = this.players.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction);

        if (addPokerPlayerList.length > 0) {
          this.beAddPoker = false;
          let poker = this.runtimeData.getOnePokerFromPokerPool();
          // let poker = 7;


          const maxCount = this.runtimeData.addPokerIntoCommonAreaByAreaIdx(this.currentNoticeAreaIdx, poker);

          addPokerPlayerList.forEach(p => {
            p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;

            p.commonAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);

            if (maxCount >= 21) {
              p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
            }

            if (p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().pokerList.length === 5) {
              p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
            }
          });

          const currentAreaList = this.runtimeData.getCommonPokerListAndCount();

          this.channelForPlayer.showPlayerListPokerToAllPlayer(this.currentNoticeAreaIdx, this.beSeparate, addPokerPlayerList, currentAreaList);
        }

      }

      // 公共区域: 判断当前区域是否操作完毕
      const commonAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p =>
        p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete
      );

      // 公共区域: 当前区域继续操作
      if (!commonAreaEveryPlayerBeActionComplete) {

        // 公共区域: 已操作过、可继续操作、当前区域未结束的玩家集合
        const continuePlayerList = currentAreaPlayerList.filter(p =>
          p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction &&
          p.commonAreaBetList[this.currentNoticeAreaIdx].continueAction &&
          !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete
        );

        // 公共区域: 通知玩家继续操作
        if (continuePlayerList.length !== 0) {
          // 通知玩家继续操作
          this.runtimeData.nextAreaSpeakOnPlayer();

          continuePlayerList.forEach(p => {
            p.actionList.multiple = false;
            p.actionList.separate = false;
            p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
          });

          this.channelForPlayer.noticeActionToAllPlayer(
            this.currentNoticeAreaIdx,
            continuePlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0)
          );

          return;
        }

        // 公共区域: 变更状态
        currentAreaPlayerList.forEach(p => {
          p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
        });

      }

      /** Step 3.2: 当前"分牌区域"是否操作完毕 */

      // 分牌区域 获取牌
      if (this.beAddPoker) {
        const addPokerPlayerList = this.players.filter(p => p.separateAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction);

        if (addPokerPlayerList.length > 0) {
          this.beAddPoker = false;

          const poker = this.runtimeData.getOnePokerFromPokerPool();

          const maxCount = this.runtimeData.addPokerIntoSeparateAreaByAreaIdx(this.currentNoticeAreaIdx, poker);

          addPokerPlayerList.forEach(p => {
            p.separateAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;

            p.separateAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);

            if (maxCount >= 21) {
              p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
            }

            if (p.separateAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().pokerList.length === 5) {
              p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
            }

          });

          const currentAreaList = this.runtimeData.getSeparatePokerListAndCount();

          this.channelForPlayer.showPlayerListPokerToAllPlayer(this.currentNoticeAreaIdx, this.playerSeparateBeginning, addPokerPlayerList, currentAreaList);
        }

      }

      // 分牌区域: 若分牌则同区域，进行分牌区域操作
      if (this.playerSeparateBeginning) {


        const separateAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p => {
          p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate() &&
            p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete
        });

        // 分牌区域: 通知玩家继续操作
        if (!separateAreaEveryPlayerBeActionComplete) {

          // 分牌区域: 初次操作
          if (this.playerSeparateFirstNotice) {

            if (!currentAreaPlayerList.every(p => p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete)) {
              currentAreaPlayerList.filter(p => !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete).forEach(p => {
                p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
              })
            }

            this.playerSeparateFirstNotice = false;

            const firstSeparateAreaActionPlayerList = this.players.filter(p =>
              p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate()
            );

            firstSeparateAreaActionPlayerList.forEach(p => {
              // 玩家可操作行为
              p.actionList.multiple = true;
            });

            // 通知玩家继续操作
            this.runtimeData.nextAreaSpeakOnPlayer();

            this.channelForPlayer.noticeActionToAllPlayer(
              this.currentNoticeAreaIdx,
              firstSeparateAreaActionPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0),
              true
            );

            return;
          }

          // 分牌区域: 当前"分牌"、"已操作过"、"可继续操作"、"未结束"的玩家集合
          const currentSeparateAreaPlayerList = currentAreaPlayerList.filter(p =>
            p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate() &&
            p.separateAreaBetList[this.currentNoticeAreaIdx].playerHadAction &&
            p.separateAreaBetList[this.currentNoticeAreaIdx].continueAction &&
            !p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete
          );

          // 分牌区域: 通知玩家继续操作
          if (currentSeparateAreaPlayerList.length !== 0) {


            // 通知玩家继续操作
            this.runtimeData.nextAreaSpeakOnPlayer();

            currentSeparateAreaPlayerList.forEach(p => {
              p.separateAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
              // 玩家可操作行为
              p.actionList.multiple = false;
            });

            this.channelForPlayer.noticeActionToAllPlayer(
              this.currentNoticeAreaIdx,
              currentSeparateAreaPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0),
              true
            );

            return;
          }

          // 分牌区域: 变更状态
          currentSeparateAreaPlayerList.forEach(p => {
            p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
          });

        }

      }

      // 恢复分牌区域操作状态
      this.playerSeparateBeginning = false;

      let nextNoticeFlag = false;

      while (!nextNoticeFlag) {
        // 公共区域: 进行下一区域
        this.currentNoticeAreaIdx++;

        if (this.currentNoticeAreaIdx >= 3) {

          this.changeRoomStatus(BlackJackRoomStatusEnum.Dealer);
          return;
        }

        const nextAreaPlayerList = this.players.filter(p =>
          p.status === BlackJackPlayerStatusEnum.Game &&
          p.role === BlackJackPlayerRoleEnum.Player &&
          p.getCurrentTotalBet() > 0 &&
          p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0
        );

        nextNoticeFlag = nextAreaPlayerList.length > 0;

        nextNoticeFlag = !nextAreaPlayerList.every(p => Math.max(...p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().countList) === 21);

        if (nextNoticeFlag) {

          nextAreaPlayerList.forEach(p => {
            const canSeparate = p.commonAreaBetList[this.currentNoticeAreaIdx].canPlayerSeparate();
            p.actionList.multiple = true;
            p.actionList.separate = !!canSeparate;
          });

          this.runtimeData.nextAreaSpeakOnPlayer();

          // 通知玩家开始操作
          this.channelForPlayer.noticeActionToAllPlayer(
            this.currentNoticeAreaIdx,
            nextAreaPlayerList
          );

        }

      }

      return;
    }


    this.playerBeginning = true;

    /**
     * Step 2: 初始化闲家阶段数据
     */

    // 过滤出参与游戏的玩家
    const curPlayerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0
    );


    // 检测可以分牌的区域
    curPlayerList.forEach(player => {
      const canSeparate = player.commonAreaBetList.some(area => area.canPlayerSeparate());

      if (canSeparate) {
        player.actionList.separate = true;
      }

    });

    let noticeFlag = false;

    while (!noticeFlag) {
      // 设置首次玩家操作区域
      this.currentNoticeAreaIdx++;

      if (this.currentNoticeAreaIdx >= 3) {

        this.changeRoomStatus(BlackJackRoomStatusEnum.Dealer);
        return;
      }

      const noticePlayerList = curPlayerList.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0)

      noticeFlag = noticePlayerList.length > 0;

      noticeFlag = !noticePlayerList.every(p => Math.max(...p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().countList) === 21);

      // 通知玩家开始初次操作
      if (noticeFlag) {

        noticePlayerList.forEach(p => {
          const canSeparate = p.commonAreaBetList[this.currentNoticeAreaIdx].canPlayerSeparate();
          p.actionList.multiple = true;
          p.actionList.separate = !!canSeparate;
        });

        this.runtimeData.nextAreaSpeakOnPlayer();

        this.channelForPlayer.noticeActionToAllPlayer(
          this.currentNoticeAreaIdx,
          curPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0)
        );
      }
    }
  }

  /**
   * 庄家阶段
   */
  async dealerState() {
    if (!this.beShowSecendPoker) {
      this.beShowSecendPoker = true;
      // 如果不跳入结算状态则开始调控
      await this.control.startControl();

      // 展示庄家第二张手牌
      const dealPoker = this.runtimeData.getDealerPokerListAndCount();

      // 只发送两张牌的数据和点数
      this.channelForPlayer.showDealerPokerAfterHitPoker({
        pokerList: dealPoker.pokerList.slice(0, 2),
        countList: calculateDot(dealPoker.pokerList.slice(0, 2))
      });

      const { countList } = dealPoker;


      if (Math.max(...countList) >= 17) {
        this.changeRoomStatus(BlackJackRoomStatusEnum.Settlement);
      }
      // else {
      //   // 如果不跳入结算状态则开始调控
      //   await this.control.startControl();
      // }

      return;
    }

    const dealerPokerMaxCount = this.runtimeData.afterDealerHit();

    const dealPoker = this.runtimeData.getDealerPokerListAndCount();


    const { pokerList } = dealPoker;

    this.channelForPlayer.showDealerPokerAfterHitPoker(dealPoker);

    if (pokerList.length === 5 || dealerPokerMaxCount >= 17) {
      this.changeRoomStatus(BlackJackRoomStatusEnum.Settlement);
      return;
    }
  }

  /**
   * 结算状态
   */
  async settlementState() {

    if (this.settlementBeginning) {

      if (this.runtimeData.getCurrentCountdown() === 0) {
        // 变更房间状态开启下一局
        this.changeRoomStatus(BlackJackRoomStatusEnum.None);
      }

      return;
    }

    this.settlementBeginning = true;

    this.runtimeData.setSettlementCountdown(5);

    this.endTime = Date.now();

    // 结算
    await this.settlementAction.settedCurrentGame();

    // 获取参与游戏的玩家
    const playerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game &&
      p.role === BlackJackPlayerRoleEnum.Player &&
      p.totalBet > 0
    );

    // 广播结算结果
    await this.channelForPlayer.showSettlementResult(playerList);

    // 初始化玩家运行参数
    playerList.forEach(p => p.initRunData());

    /* const offlinePlayers = this.players
      .filter(p => !p.onLine)
      .map(p => {
        this.playerLeaveRoom(p.uid);

        return p.uid;
      });

    if (offlinePlayers.length > 0) {

      this.channelForPlayer.playerLeaveToAllPlayer(this.players);
    } */
  }

  /**
   * 初始化房间运行时数据
   */
  public initRunData() {
    /** 
     * 统计机器人下注
     * @description 根据场限红 机器人每局随机 40%-60% 下注量
     */
    this.commonMaxBetListForRobot = Array.from({ length: 3 }).map(() => random(40, 60) * this.areaMaxBet / 100);

    this.commonBetListForRobot = [0, 0, 0];

    /** 发牌阶段 */
    this.licensingAnimation = false;

    /** 保险阶段参数初始化 */
    this.insuranceBeginning = false;
    this.beInsuranceToSettlement = false;
    this.waitForNoticeAreaListOnInsurance = [];
    this.waitForNoticePlayerList = [];

    /** 闲家阶段参数初始化 */
    this.playerBeginning = false;
    this.playerSeparateBeginning = false;
    this.playerSeparateFirstNotice = false;
    this.beAddPoker = false;
    this.beSeparate = false;
    this.currentNoticeAreaIdx = -1;

    /** 庄家阶段 */
    this.beShowSecendPoker = false;

    /** 结算阶段参数初始化 */
    this.settlementBeginning = false;
    this.updateRoundId();
  }

  /**
   * 添加玩家进房间
   * @param player 玩家
   */
  public addPlayerInRoom(dbplayer: BlackJackPlayerImpl) {

    // robotlogger.warn(`进入房间 | ${this.roomId} | ${player.uid} |${player.isRobot === RoleEnum.ROBOT ? "机器人" : "真人"}`);

    const beInRoom = this.getPlayer(dbplayer.uid);

    /** 若在房间，则断线重连 */
    if (beInRoom) {
      beInRoom.sid = dbplayer.sid;
      this.offLineRecover(beInRoom);
      return true;
    }

    dbplayer.role = this.players.length >= 1 ? BlackJackPlayerRoleEnum.Player : BlackJackPlayerRoleEnum.Dealer;

    let seatNumberOrFailResult = 1;

    if (dbplayer.role === BlackJackPlayerRoleEnum.Player) {
      /** 添加进座位 */
      const statusOrSeatNum = this.runtimeData.sitInSeat(dbplayer);

      if (!statusOrSeatNum) {
        robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 当前房间状态: ${this.roomStatus} | 进入房间 | 玩家 ${dbplayer.uid} | 进入位置失败 `)
        return false;
      }

      seatNumberOrFailResult = statusOrSeatNum;
    }

    /** 变更玩家信息 */
    dbplayer.onLine = true;
    dbplayer.seatNum = seatNumberOrFailResult;

    // // 判断玩家角色身份: 座位号 1 = 庄,反之 闲
    // player.role = seatNumberOrFailResult === 1 ? BlackJackPlayerRoleEnum.Dealer : BlackJackPlayerRoleEnum.Player;

    // 变更玩家状态
    dbplayer.status = BlackJackPlayerStatusEnum.Ready;

    /** 房间玩家列表添加玩家信息 */
    this.players.push(new BlackJackPlayerImpl(dbplayer));

    // 添加到消息通道
    if (dbplayer.role === BlackJackPlayerRoleEnum.Player) {
      this.addMessage(dbplayer);
    }

    this.channelForPlayer.playerListWithUpdate();
    return true;
  }

  /**
   * 进入房间后，获取当前信息
   */
  public getRoomInfoAfterEntryRoom(uid: string) {
    const player = this.getPlayer(uid);

    /** 断线部分 */
    player.onLine = true;

    const {
      roomStatus,
      insuranceBeginning,
      beSeparate,
      areaMaxBet,
      sceneId,
      lowBet
    } = this;

    const countdown = this.runtimeData.getCurrentCountdown();

    /** 房间信息 */
    let areaIdx = -1;

    if (roomStatus === BlackJackRoomStatusEnum.Insurance && this.insuranceBeginning) {
      const { length } = this.waitForNoticeAreaListOnInsurance;

      areaIdx = length > 0 ? length - 1 : -1;
    }

    if (roomStatus === BlackJackRoomStatusEnum.Player && this.playerBeginning) {
      areaIdx = this.currentNoticeAreaIdx;
    }


    let dealerArea = { pokerList: [], countList: [] };

    if (this.roomStatus === BlackJackRoomStatusEnum.Dealer || this.roomStatus === BlackJackRoomStatusEnum.Settlement) {
      dealerArea = this.runtimeData.getDealerPokerListAndCount();
    } else {
      const firstPoker = this.runtimeData.getDealerPokerListAndCount().pokerList[0];
      dealerArea.pokerList.push(firstPoker);
      dealerArea.countList.push(...calculateDot([firstPoker]));
    }

    const roomInfo = {
      countdown,
      roomStatus,
      insuranceBeginning,
      beSeparate,
      areaIdx,
      areaMaxBet,
      sceneId,
      lowBet,
      dealerArea,
      // dealerArea: this.runtimeData.getDealerPokerListAndCount(),
      commonAreaList: this.runtimeData.getCommonPokerListAndCount(),
      separatePokerList: this.runtimeData.getSeparatePokerListAndCount(),
      areaBetList: [0, 0, 0].map((v, i) => this.runtimeData.getTotalBetByAreaIdx(i) || v)
    };

    /** 玩家信息列表 */
    const playerList = this.players
      .filter(({ role }) => role === BlackJackPlayerRoleEnum.Player)
      .map(player => {
        const {
          uid, nickname, headurl, gold, totalBet,
          seatNum, status
        } = player;

        return {
          uid,
          nickname,
          headurl,
          gold: gold - totalBet,
          seat: seatNum,
          playerStatus: status,
          commonAreaList: player.commonAreaBetList.map(area => {
            const {
              countList,
              pokerList
            } = area.getPokerAndCount();

            return {
              bet: area.getCurrentBet(),
              hadSeparate: area.checkHadSeparate(),
              countList: [...countList],
              pokerList: [...pokerList],
            }
          }),
          separatePokerList: player.separateAreaBetList.map(area => {
            const {
              countList,
              pokerList
            } = area.getPokerAndCount();
            return {
              bet: area.getCurrentBet(),
              hadSeparate: area.checkHadSeparate(),
              countList: [...countList],
              pokerList: [...pokerList],
            }
          })
        };
      });

    return {
      roomInfo,
      playerList,
      currentPlayer: playerList.find(p => p.uid === uid),
      roundId: this.roundId
    };
  }

  /**
   * 排行榜
   */
  public rankinglist() {
    const playerList = this.players
      .filter(({ role }) => role === BlackJackPlayerRoleEnum.Player)
      .map(({ uid, nickname, headurl, gold, totalBet, winRound, profitQueue }) => {

        return {
          uid,
          nickname,
          headurl,
          totalBet,
          gold: gold - totalBet,
          winRound,
          totalProfit: profitQueue.length === 0 ? 0 : profitQueue.reduce((total, val) => total + val)
        };
      })
      .sort((p1, p2) => p2.totalProfit - p1.totalProfit);

    return playerList;
  }

  /**
   * 离开房间
   * @param uid 玩家编号
   */
  public playerLeaveRoom(uid: string, disconnect: boolean = false) {
    // robotlogger.warn(`离开房间 | ${this.roomId} | ${uid}`);
    const player = this.getPlayer(uid);
    if (!player) {
      return;
    }
    if (disconnect) {
      // 踢出消息通道
      this.kickOutMessage(uid);
      player.onLine = false;
      return;
    }
    if (player.status === BlackJackPlayerStatusEnum.Game) {
      player.onLine = false;
      return;
    }
    // 踢出消息通道
    this.kickOutMessage(uid);

    this.runtimeData.leaveSeat(uid);

    player.playerHadLeave();

    remove(this.players, "uid", uid);

    this.channelForPlayer.playerLeaveToAllPlayer(this.players);
  }

  /**
   * 变更房间状态
   * @param roomStatus 房间状态
   */
  private changeRoomStatus(roomStatus: BlackJackRoomStatusEnum) {

    this.roomStatus = roomStatus;
  }

  /**
   * 指定区域下注
   * @param areaIdx 指定区域下标
   * @param bet     下注金额
   * @param uid     玩家编号
   */
  public bet(areaIdx: number, bet: number, uid: string) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Betting) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 下注: ${bet} | 当前房间状态不允许下注`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1729));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 下注: ${bet} | 当前房间下注时间: ${currentCountdown} 不能再下注`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1730));
    }

    /** Step 1: 判断指定区域金额是否达到上限 */
    const areaCanBetFlag = this.runtimeData.checkAreaCanBet(areaIdx, bet);

    if (!areaCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 下注失败 | 区域: ${areaIdx} 已达可下注上限 `);

      return new ApiResult(BlackJackState.Area_Gold_Had_Be_Max, null, getlanguage(language, Net_Message.id_1731));
    }

    /** Step 2: 判断玩家下注是否超过随身携带金额的一半 */
    const playerCanBetFlag = player.checkPlayerCanBet(bet);

    if (!playerCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 下注失败 | 区域: ${areaIdx} 已达可下注上限 `);

      return new ApiResult(BlackJackState.Player_Gold_Had_Be_Max, null, getlanguage(language, Net_Message.id_1724));
    }

    /** Step 3: 公共区域加注 */
    this.runtimeData.betIntoCommonByAreaIdx(areaIdx, bet);

    /** Step 4: 玩家独立区域加注 */
    if (player.totalBet === 0) {

      // 4.1 若玩家是首次下注则复制公共区域牌至自身
      const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();

      commonPokerInfoList.forEach(({ basePokerList, baseCount }, idx) => {
        player.commonAreaBetList[idx].setPokerList(basePokerList, baseCount);
      });


      // 4.2 变更玩家状态: 游玩状态
      player.status = BlackJackPlayerStatusEnum.Game;


      // 4.3 初始化下注历史
      player.betHistory = [0, 0, 0];
    }

    // 4.3 玩家加注
    player.bet(areaIdx, bet);
    //玩家下注了就把为下注清零
    player.standbyRounds = 0;
    // 5  广播
    this.channelForPlayer.someOneBeting(areaIdx, player, bet);
  }

  /**
   * 指定区域购买保险
   * @param areaIdx 保险区域
   * @param uid 玩家编号
   */
  public insurance(areaIdx: number, uid: string) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Insurance) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间状态不允许购买保险`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_insurance, null, getlanguage(language, Net_Message.id_1732));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间时间: ${currentCountdown} 不能再购买保险`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_insurance, null, getlanguage(language, Net_Message.id_1733));
    }

    // 是否已买过保险
    if (player.insuranceAreaList[areaIdx].checkBuyInsurance()) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间时间: ${currentCountdown} 已购买过当前区域 ${areaIdx} 保险`);

      return new ApiResult(BlackJackState.Had_Buy_insurance, null, getlanguage(language, Net_Message.id_1734));
    }

    player.insurance(areaIdx);
  }

  /**
   * 指定区域分牌
   * @param areaIdx 分牌区域
   * @param uid 玩家编号
   */
  public separate(areaIdx: number, uid: string) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Player) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 分牌 | 当前房间状态不允许分牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Separate, null, getlanguage(language, Net_Message.id_1725));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 分牌 | 当前房间时间: ${currentCountdown} 不能进行分牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Separate, null, getlanguage(language, Net_Message.id_1726));
    }

    const currentAreaBet = player.commonAreaBetList[areaIdx].getCurrentBet();

    // 变更分牌通知状态
    this.beSeparate = true;

    this.runtimeData.betIntoBySeparateAreaIdx(areaIdx, currentAreaBet);

    player.separate(areaIdx);

    player.actionList.multiple = false;

    player.commonAreaBetList[areaIdx].playerHadAction = true;

    this.channelForPlayer.someOneSeparate(areaIdx, player, currentAreaBet, this.runtimeData.getTotalBetByAreaIdx(areaIdx));
  }

  /**
   * 闲家要牌
   * @param uid 玩家编号
   * @description 暂弃
   */
  public playerHit(uid: string, areaIdx: number) {
    const player = this.getPlayer(uid);

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Player) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间状态不允许要牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Hit, null, "当前房间状态不允许要牌操作");
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间时间: ${currentCountdown} 不能进行要牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Hit, null, "当前房间已超过要牌时间");
    }

    const {
      pokerList,
      countList
    } = this.beSeparate ?
        player.separateAreaBetList[areaIdx].getPokerAndCount() :
        player.commonAreaBetList[areaIdx].getPokerAndCount();

    // 判断是否可再要牌
    if (pokerList.length === 5) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 已经 5 张手牌,不能再要`);

      return new ApiResult(300);
    }

    // 获取牌
    const poker = this.runtimeData.getOnePokerFromPokerPool();

    this.beSeparate ?
      player.separateAreaBetList[areaIdx].addPoker(poker) :
      player.commonAreaBetList[areaIdx].addPoker(poker);

    // 变更当前区域操作状态
    this.beSeparate ?
      player.separateAreaBetList[areaIdx].playerHadAction = true :
      player.commonAreaBetList[areaIdx].playerHadAction = true;

    // 判断是否可以继续操作下去
    const maxPokerCount = this.beSeparate ?
      player.separateAreaBetList[areaIdx].getCount() :
      player.commonAreaBetList[areaIdx].getCount();

    // 若大于21点，则不可继续操作
    if (maxPokerCount >= 21) {

      if (this.beSeparate) {
        player.separateAreaBetList[areaIdx].continueAction = false;
        player.separateAreaBetList[areaIdx].actionComplete = true;
      } else {
        player.commonAreaBetList[areaIdx].continueAction = false;
        player.commonAreaBetList[areaIdx].actionComplete = true;
      }

      return new ApiResult(300);
    }

    return {
      commonAreaList: player.commonAreaBetList.map(area => {
        area.getPokerAndCount()
        return {
          // area.
        };
      })
    };
  }

  public playerHitWithNew(uid: string, areaIdx: number) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Player) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间状态不允许要牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Hit, null, getlanguage(language, Net_Message.id_1727));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间时间: ${currentCountdown} 不能进行要牌操作`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_Hit, null, getlanguage(language, Net_Message.id_1728));
    }

    // 当前区域是否有人新增操作
    if (!this.beAddPoker) {
      this.beAddPoker = true;
    }

    const currentAreaPlayerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game &&
      p.role === BlackJackPlayerRoleEnum.Player &&
      p.commonAreaBetList[areaIdx].getCurrentBet() > 0
    );

    const beSeparateArea = this.playerSeparateBeginning && currentAreaPlayerList.every(p => p.commonAreaBetList[areaIdx].actionComplete);

    if (beSeparateArea) {
      player.separateAreaBetList[areaIdx].beAddPokerAction = true;
      player.separateAreaBetList[areaIdx].playerHadAction = true;
      return true;
    }

    player.commonAreaBetList[areaIdx].beAddPokerAction = true;
    player.commonAreaBetList[areaIdx].playerHadAction = true;

    return true;
  }

  /**
   * 玩家加倍
   */
  public multiple(areaIdx: number, uid: string) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Player) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间状态不允许加倍`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1722));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间时间: ${currentCountdown} 不能加倍`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1723));
    }

    const currentAreaBet = player.commonAreaBetList[areaIdx].getCurrentBet();

    // 判断指定区域金额是否达到上限
    /* const areaCanBetFlag = player.commonAreaBetList[areaIdx].checkPlayerCanBet(currentAreaBet);

    if (!areaCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间时间: ${currentCountdown} 不能再购买保险`);
      return new ApiResult(BlackJackState.Area_Gold_Had_Be_Max, null, "当前区域下注额已达上限")
    } */

    const playerCanBetFlag = player.checkPlayerCanBet(currentAreaBet);

    // 判断玩家下注是否超过随身携带金额的一半
    if (!playerCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间时间: ${currentCountdown} 不能再购买保险`);

      return new ApiResult(BlackJackState.Player_Gold_Had_Be_Max, null, getlanguage(language, Net_Message.id_1724));
    }

    this.runtimeData.betIntoCommonByAreaIdx(areaIdx, currentAreaBet);

    player.multiple(areaIdx, currentAreaBet);


    if (!this.beAddPoker) {
      this.beAddPoker = true;
    }

    const currentAreaPlayerList = this.players.filter(p =>
      p.status === BlackJackPlayerStatusEnum.Game &&
      p.role === BlackJackPlayerRoleEnum.Player &&
      p.commonAreaBetList[areaIdx].getCurrentBet() > 0
    );

    const beSeparateArea = this.playerSeparateBeginning && currentAreaPlayerList.every(p => p.commonAreaBetList[areaIdx].actionComplete);

    if (beSeparateArea) {
      player.separateAreaBetList[areaIdx].beAddPokerAction = true;
      return true;
    }

    player.actionDone(areaIdx, beSeparateArea);

    player.commonAreaBetList[areaIdx].beAddPokerAction = true;

    this.channelForPlayer.someOneMultiple(areaIdx, player, currentAreaBet, this.runtimeData.getTotalBetByAreaIdx(areaIdx));

  }

  /**
   * 续押
   * @param uid 玩家编号
   */
  public continueBet(uid: string) {
    const player = this.getPlayer(uid);

    const { language } = player;

    // 校验房间状态
    if (this.roomStatus !== BlackJackRoomStatusEnum.Betting) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 续押 | 当前房间状态不允许续押`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1735));
    }

    // 校验房间计时器
    const currentCountdown = this.runtimeData.getCurrentCountdown();

    if (currentCountdown <= 0) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 续押 | 当前房间下注时间: ${currentCountdown} 不能续押`);

      return new ApiResult(BlackJackState.Room_status_Not_Allow_bet, null, getlanguage(language, Net_Message.id_1736));
    }
    /** Step 1: 获取上一次下注历史记录 */
    const betHistory = player.betHistory;

    /** Step 2: 判断指定区域金额是否达到上限 */
    const areaCanBetFlag = betHistory.reduce((areaCanBetFlag, bet, areaIdx) => {

      if (!areaCanBetFlag) return false;

      areaCanBetFlag = this.runtimeData.checkAreaCanBet(areaIdx, bet);

      return areaCanBetFlag;
    }, true)

    if (!areaCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 续押失败 | 区域:  已达可下注上限 `);

      return new ApiResult(BlackJackState.Area_Gold_Had_Be_Max, null, getlanguage(language, Net_Message.id_1731));
    }

    /** Step 3: 判断玩家下注是否超过随身携带金额的一半 */

    const playerCanBetFlag = player.checkPlayerCanBet(betHistory.reduce((total, bet) => total + bet));

    if (!playerCanBetFlag) {
      if (player.isRobot === RoleEnum.REAL_PLAYER)
        robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 续押失败 |  下注不能超过携带金额的一半 `);

      return new ApiResult(BlackJackState.Player_Gold_Had_Be_Max, null, getlanguage(language, Net_Message.id_1724));
    }

    /** Step 4: 复制公共区域牌至自身 */
    const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();

    commonPokerInfoList.forEach(({ basePokerList, baseCount }, idx) => {
      player.commonAreaBetList[idx].setPokerList(basePokerList, baseCount);
    });

    /** Step 5: 玩家独立区域加注 */
    for (let areaIdx = 0; areaIdx < betHistory.length; areaIdx++) {
      const bet = betHistory[areaIdx];

      /** 下注 Start */
      if (bet === 0) continue;
      // 公共区域
      this.runtimeData.betIntoCommonByAreaIdx(areaIdx, bet);

      // 玩家公共区域
      player.continueBet(areaIdx, bet);

      // 下注广播
      this.channelForPlayer.someOneBeting(areaIdx, player, bet);
      /** 下注  End  */
    }

    /** Step 6: */
    player.status = BlackJackPlayerStatusEnum.Game;
  }

  /**
   * 修改庄家牌
   */
  changeDealerPoker() {
    // 庄家要牌
    let dealerMaxCount = this.runtimeData.dealerHit();
    while (dealerMaxCount < 17) {
      dealerMaxCount = this.runtimeData.dealerHit();
    }

    return dealerMaxCount;
  }

  /**
   * 设置庄家预设保留牌 和 庄家保留牌
   */
  setPreparePokerAndReservePoker() {
    // 保留剩余的发牌 等会展示
    this.runtimeData.setDealerPreparePoker(this.runtimeData.getDealerResidualPoker());
    // 让庄家的牌保留位初始状态
    this.runtimeData.reserveDealerPoker();
  }

  /**
   * 随机开奖
   */
  randomLottery() {
    this.changeDealerPoker();
    this.setPreparePokerAndReservePoker();
  }

  /**
   * 计算玩家纯利润
   * @param players
   */
  calculatePlayersProfit(players: BlackJackPlayerImpl[]): number {
    const { pokerList, countList } = this.runtimeData.getDealerPokerListAndCount();
    return players.reduce((totalProfit, p) => {
      return totalProfit + p.presettlement(pokerList, countList);
    }, 0);
  }

  /**
   * 个控发牌
   * @param controlPlayers
   * @param state CommonControlState.WIN 玩家赢 CommonControlState.LOSS 玩家输
   */
  personalControl(controlPlayers: PersonalControlPlayer[], state: CommonControlState) {
    const players = controlPlayers.map(p => this.getPlayer(p.uid));

    controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

    for (let i = 0; i < 100; i++) {
      // 随机开奖
      this.changeDealerPoker();

      // 计算收益
      const totalProfit = this.calculatePlayersProfit(players);


      // 如果玩家输 则纯利润小于零
      if ((state === CommonControlState.LOSS && totalProfit < 0)) {
        break;
      }

      if (state === CommonControlState.WIN && totalProfit > 0) {
        break;
      }

      // 如果不合格保留庄家初始的一张牌
      this.runtimeData.reserveDealerOnePoker();
    }

    this.setPreparePokerAndReservePoker();
  }

  /**
   * 场控
   * @param sceneControlState
   * @param isPlatformControl 是否是平台调控
   */
  sceneControl(sceneControlState: ControlState, isPlatformControl) {
    // 不调控则随机开奖
    if (sceneControlState === ControlState.NONE) {
      return this.randomLottery();
    }

    const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
    const players = this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
    players.forEach(p => p.setControlType(type));

    for (let i = 0; i < 100; i++) {
      // 随机开奖
      this.changeDealerPoker();

      // 计算收益
      const totalProfit = this.calculatePlayersProfit(players);


      // 如果玩家输 则纯利润小于零
      if ((sceneControlState === ControlState.SYSTEM_WIN && totalProfit < 0)) {
        break;
      }

      if (sceneControlState === ControlState.PLAYER_WIN && totalProfit > 0) {
        break;
      }

      // 如果不合格保留庄家初始的两张牌
      this.runtimeData.reserveDealerOnePoker();
    }

    this.setPreparePokerAndReservePoker();
  }

  /**踢掉离线玩家 */
  async br_kickNoOnline() {
    const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players.filter(p => p.role !== BlackJackPlayerRoleEnum.Dealer),
      5, 3);

    offlinePlayers.forEach(p => {
      this.playerLeaveRoom(p.uid, false);

      // 不在线则从租户列表中删除 如果在线则是踢到大厅则不进行删除
      if (!p.onLine) {
        // 删除玩家
        this.roomManager.removePlayer(p);
      }
    });


    if (this.players.filter(p => p.role !== BlackJackPlayerRoleEnum.Dealer && p.isRobot === RoleEnum.REAL_PLAYER).length === 0) {
      this.canBeDestroy = true;
    }
  }

  public destroy() {
    clearInterval(this.processInterval);
    this.sendRoomCloseMessage();
    // const uidList = this.channel.getMembers()
    // uidList.forEach(uid => this.kickOutMessage(uid));
  }

  public close() {
    this.roomManager = null;
    clearInterval(this.processInterval);
  }
}
