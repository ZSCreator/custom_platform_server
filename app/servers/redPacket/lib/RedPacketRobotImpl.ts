import { BaseRobot } from "../../../common/pojo/baseClass/BaseRobot";
import { RobotChannelMessage } from "./expansion/robotExpansion/RobotChannelMessage";
import { RobotAgentMessage } from "./expansion/robotExpansion/RobotAgentMessage";
import { RobotAction } from "./expansion/robotExpansion/RobotAction";
import { RobotException } from "./expansion/robotExpansion/RobotException";
import { GameStatusEnum } from "./enum/GameStatusEnum";
import { PlayerGameStatusEnum } from "./enum/PlayerGameStatusEnum";
import { ChannelEventEnum } from "./enum/ChannelEventEnum";
import IRedPacket from "./interface/IRedPacket";
import { IGraberRedPacket } from "./interface/IGraberRedPacket";
import { ICurrentRedPacketInfo } from "./interface/ICurrentRedPacketInfo";
import { randomFromRange } from "../../../utils/lottery/commonUtil";
import { random } from "../../../utils";



/**
 * @property initGold               进入房间初始金币
 * @property entryCond              场:准入金额
 * @property lowBet                 场:红包最低金额
 * @property capBet                 场:红包最高金额
 * @property redParketNum           场:每局可抢红包数
 * @property lossRation             场:中雷赔付倍率
 * @property playRound              当前:游玩局数
 * @property playerGold             当前:机器人携带金额
 * @property roomStatus             当前:房间状态
 * @property countDown              当前:房间倒计时 单位：毫秒
 * @property playerStatus           当前:机器人状态
 * @property currentGraberQueue     当前:待抢红包队列
 * @property currentMines           当前:含雷总数
 * @property grabbedCount           当前:已抢次数
 * @property beInRedPacketQueueFlag 当前:若发过红包，下一轮是否仍在红包队列上
 * @property hadGrabFlag            当前:当前是否已抢红包
 * @property maxRound               当前:机器人在游戏内最多玩多少回合就要离开
 * @author Andy
 */
export class RedPacketRobotImpl extends BaseRobot {

  initGold: number = 0;
  /** 场 信息 */
  entryCond: number;
  lowBet: number;
  capBet: number;
  redParketNum: number;
  lossRation: number;
  /** 对局信息 */
  playRound: number = 0;
  profit: number;
  winRound: number = 0;
  leaveRound: number;
  playerGold: number = 0;
  /** 消息通道 */
  channelMessage: RobotChannelMessage;
  agentMessage: RobotAgentMessage;
  action: RobotAction;
  /** 日志 */
  robotLogger: RobotException;
  /** 游戏过程属性 */
  roomStatus: GameStatusEnum = GameStatusEnum.NONE;
  countDown: number = 0;
  playerStatus: PlayerGameStatusEnum = PlayerGameStatusEnum.NONE;
  redPacketQueue: IRedPacket[];
  currentRedPacketInfo: ICurrentRedPacketInfo;
  currentMines: number = 0;
  currentGraberQueue: IGraberRedPacket[];
  grabbedCount: number = 0;
  /** @property beInRedPacketQueueFlag 发的红包是否在房间红包队列上 */
  beInRedPacketQueueFlag: boolean | null = null;
  grabTimeOut: NodeJS.Timer;
  canGrabFlag: boolean = false;
  hadGrabFlag: boolean = false;
  maxRound: number = random(5, 20);
  countDown_Timer: NodeJS.Timer = null;

  canNotAction: boolean = false;

  heartbeatTimer: NodeJS.Timer = null;
  redPacketQueueUpdateTimeStamp: number = 0;
  heartbetHandoutRedPacketAction: boolean = false;

  constructor(options) {
    super(options);
    this.redPacketQueue = [];
    this.grabTimeOut = setTimeout(() => { }, 0);
    /** 常用日志 */
    this.robotLogger = new RobotException(this);
    /** 初始化消息通道 - 接收信息 */
    this.channelMessage = new RobotChannelMessage(this);
    /** 初始化消息通道 - 发送信息 */
    this.agentMessage = new RobotAgentMessage(this);
    /** 封装核心复用逻辑 */
    this.action = new RobotAction(this);
  }



  /**
   * 注册机器人消息事件
   * @description 初始化机器人时调用
   */
  registerListener() {
    /** 群信息 */
    // 红包队列为空，等待玩家or机器人发红包
    this.Emitter.on(ChannelEventEnum.roomWaitForHandout, (msg) => this.channelMessage.waitForHandoutRedPacket(msg));
    // 可开抢红包
    this.Emitter.on(ChannelEventEnum.roomReady, (msg) => this.channelMessage.grabRedPacket(msg));
    // 红包队列发生变化：减少
    this.Emitter.on(ChannelEventEnum.redPacketQueueWithUpdate, (msg) => this.channelMessage.redPacketQueueWithUpdate(msg));
    // 游戏每一句结算前接收此信息
    this.Emitter.on(ChannelEventEnum.settle, (msg) => this.channelMessage.endOfGameRound);
    // 游戏结算通知
    this.Emitter.on(ChannelEventEnum.settled, (msg) => this.channelMessage.gameSettled(msg));
    // 有人发红包
    this.Emitter.on(ChannelEventEnum.handout, (msg) => this.channelMessage.someOneHandoutRedPacket(msg));
    // 有人抢红包
    this.Emitter.on(ChannelEventEnum.grab, (msg) => this.channelMessage.someOneGrabRedPacket(msg));

    /** 单信息 */
    // 下一轮游戏，发的红包是否依旧会在队列里
    this.Emitter.on(ChannelEventEnum.beInRedPacketQueue, (msg) => this.channelMessage.beInRedPacketQueue(msg));
    // 当前游戏的待抢红包信息
    this.Emitter.on(ChannelEventEnum.currentGraberQueue, (msg) => this.channelMessage.currentGraberQueue(msg));

    // 超时
    this.Emitter.on(ChannelEventEnum.timeout, () => this.channelMessage.timeOut());

    /** 初始化 */
    this.countDownProcess();

    // this.heartbeatCheck();
  }

  /**
   * 变更房间状态
   * @param status
   */
  changeRoomStatus(status: GameStatusEnum) {
    // this.robotLogger.debug(`房间状态改变前: ${GameStatusEnum[this.roomStatus]}`);
    this.roomStatus = status;
    // this.robotLogger.debug(`房间状态改变后: ${GameStatusEnum[this.roomStatus]}`);
  }

  /**
   * 变更玩家状态
   * @param status
   */
  changePlayerStatus(status: PlayerGameStatusEnum) {
    // this.robotLogger.debug(`机器人状态改变前: ${PlayerGameStatusEnum[this.playerStatus]}`);
    this.playerStatus = status;
    // this.robotLogger.debug(`机器人状态改变后: ${PlayerGameStatusEnum[this.playerStatus]}`);
  }

  /**
   * 离开游戏
   */
  async leave() {
    clearInterval(this.countDown_Timer);
    clearTimeout(this.grabTimeOut);
    clearInterval(this.heartbeatTimer);
    await this.agentMessage.leaveRoom();
  }

  async destroy() {
    await this.agentMessage.leaveRoom();
    clearTimeout(this.grabTimeOut);
    clearInterval(this.countDown_Timer);
    clearInterval(this.heartbeatTimer);
  }
  /**
   * 房间计时器，辅助策略判断
   */
  private countDownProcess() {
    this.countDown_Timer = setInterval(() => {
      if (this.countDown >= 0) {
        this.countDown -= 500;
        // 抢红包
        if (this.canGrabFlag) {
          this.grabRedPacket();
        }
      }
    }, 500);
  }

  /**
   * 核心策略: 抢红包
   */
  grabRedPacket() {
    // Step 1:不能抢自己发的红包
    if (this.hadGrabFlag || this.currentRedPacketInfo.uid === this.uid) return;

    // 抢红包
    this.action.grabTheRedPacket();
  }

  /**
  * 核心策略: 发红包
  */
  handOutRedPacket() {
    // Step 1:同一红包队列上，同一机器人只能发一个红包
    if (this.redPacketQueue.filter(redPacketInfo => redPacketInfo.owner_uid === this.uid).length) return;
    // Step 2:确认当前红包队列数量:暂定机器人发的红包不超过5个
    const { length } = this.redPacketQueue.filter(redPacketInfo => redPacketInfo.isRobot);
    const len = length < 5 ? length : 5;
    // Step 3:发红包
    const currentProbability = randomFromRange(0, 100);
    const ableHandoutProbability = len * 20;

    if (currentProbability > ableHandoutProbability) this.action.handoutRedPacket();
  }

  /**
   * 游戏正常完成一局，调用此函数
   */
  nextGameRound() {
    // 若开启机器人大于红包数，抢包者会超过红包数；故需清抢红包延迟器函数
    if (!this.hadGrabFlag) clearTimeout(this.grabTimeOut);
    // 若当前参与过抢夺红包则更新对应信息
    if (!this.currentGraberQueue.filter(redPacketInfo => redPacketInfo.grabUid === this.uid).length) {
      this.playRound++;
    }

  }

  /**
   * 初始化下一局所需信息
   */
  initNextGameGoundTmpInfo() {
    // 初始化对局临时数据
    this.currentGraberQueue = [];
    this.currentMines = 0;
    this.grabbedCount = 0;
    this.canGrabFlag = false;
    this.hadGrabFlag = false;
  }

  /**
   * 发红包补充检测
   */
  // private heartbeatCheck() {
  //   clearInterval(this.heartbeatTimer);

  //   this.heartbeatTimer = setInterval(() => {


  //     const second = Math.round(new Date().getTime() / 1000) - this.redPacketQueueUpdateTimeStamp;

  //     if (second > 30) {
  //       this.handOutRedPacket();
  //       this.heartbetHandoutRedPacketAction = true;
  //       return;
  //     }

  //     if (this.redPacketQueue.length === 0 || second > 20) {
  //       this.handOutRedPacket();
  //       return;
  //     }

  //   }, 10e3);
  // }

}
