import { pinus, getLogger } from "pinus";
import { SystemRoom } from "../../../common/pojo/entity/SystemRoom";
import { GameStatusEnum } from "./enum/GameStatusEnum";
import { PlayerGameStatusEnum } from "./enum/PlayerGameStatusEnum";
import StateNoneAction from "./expansion/roomExpansion/StateNoneAction";
import StateWaitAction from "./expansion/roomExpansion/StateWaitAction";
import StateReadyAction from "./expansion/roomExpansion/StateReadyAction";
import StateGameAction from "./expansion/roomExpansion/StateGameAction";
import StateEndAction from "./expansion/roomExpansion/StateEndAction";
import ChannelForPlayerAction from "./expansion/channelExpansion/ChannelForPlayerAction";
import ChannelForRobotAction from "./expansion/channelExpansion/ChannelForRobotAction";
import RoomInterface from "./interface/Room";
import SceneInterface from "./interface/Scene";
import Player from "./RedPacketPlayerImpl";
import IRedPacket from "./interface/IRedPacket";
import { IRoomTimer } from "./interface/IRoomTimer";
import { IGraberRedPacket } from "./interface/IGraberRedPacket";
import { RedPacketGameStatusEnum } from "./enum/RedPacketGameStatusEnum";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import utils = require("../../../utils/index");
import { ChannelEventEnum } from "./enum/ChannelEventEnum";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import RedPacketControl from "./redPacketControl";
import GameCommissionManager from "../../../common/dao/daoManager/GameCommission.manager";
import * as moment from "moment";
import { pushMessageByUids } from "../../../services/MessageService";
import langsrv = require('../../../services/common/langsrv');
import ApiResultDTO from "../../../common/classes/apiResultDTO";
import { RedPacketTenantRoomManager } from "./RedPacketTenantRoomManager";

const logger = getLogger("server_out", __filename);

/**
 * @property sceneInfo "场"信息  src: config/data/scenes/redPacket
 * @property roundTimes 第 n 轮游戏
 * @property totalAmount 房间内红包总金额
 * @property status 大厅状态
 * @property redPackQueue 红包队列，按金额大至小排序
 * @property waitCountDown 等待时长
 * @property grabCountDown 抢红包时长
 * @property settleCountDown 结算时长
 * @property grabTheRedPacketQueue 抢红包队列 ( uid[] 抢包玩家uid)
 * @property currentCommissionBetRatio 当前对局 埋雷红包 抽利比例
 * @property cuurentRedPacketList 当前对局生成的红包
 * @property currentGraberRedPacketQueue 当前对局抢包者信息
 * @property baseCorrectedValue 基础中雷概率
 * @property redParketNum 红包个数
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 为游戏记录压缩的结果
 */
export default class RedPacketRoomImpl extends SystemRoom<Player> {

  backendServerId: string;
  public readonly robotGrabRedPacketMax = 8;
  public readonly robotGrabRedPacketMin = 3;
  public robotGrabRedPacketLimit: number = 0;
  public robotGrabRedPacketCount: number = 0;
  // 房间基础信息和函数
  roundTimes: number = 1;
  sceneInfo: SceneInterface;
  status: GameStatusEnum = GameStatusEnum.NONE;
  /** gameProcess 各阶段函数封装 */
  noneAction: StateNoneAction;
  waitAction: StateWaitAction;
  readyAction: StateReadyAction;
  gameAction: StateGameAction;
  endAction: StateEndAction;
  /** 消息通知 */
  channelForPlayerAction: ChannelForPlayerAction;
  channelForRobotAction: ChannelForRobotAction;
  // 游戏基础信息
  totalAmount: number = 0;
  waitCountDown: number = 5000; // 等待发包倒计时
  grabCountDown: number = 4000; // 抢包倒计时
  settleCountDown: number = 4000; // 结算倒计时
  opened: boolean = false;
  // 游戏过程属性
  tmp_countDown: number = 0; // 倒计时
  process: boolean = false;
  hadRunning: boolean = false;
  baseCorrectedValue: number = 0.1;
  lastCountDownTime: number;
  redPackQueue: IRedPacket[] = [];
  currentCommissionBetRatio: number = 0;
  currentRedPacketList: string[];
  currentGraberQueue: IGraberRedPacket[] = [];
  timerMap: IRoomTimer;
  players: Player[] = [];
  redParketNum: number;

  grabPlayerSet: Set<string>;

  startTime: number;
  endTime: number;
  zipResult: string = "";

  control: RedPacketControl;
  processInterval = null;
  timer = null;
  roomManager: RedPacketTenantRoomManager;
  /**
   * @constructor
   * @param {RoomInterface} opt
   * @description 初始化房间基础属性
   */
  constructor(opt: RoomInterface, roomManager: RedPacketTenantRoomManager) {
    super(opt);
    /** gamesProcess 进程不同，函数封装 */
    // this.noneAction = StateNoneAction.getInstance(this, opt["roomId"]);
    this.noneAction = new StateNoneAction(this)
    // this.waitAction = StateWaitAction.getInstance(this, opt["roomId"]);
    this.waitAction = new StateWaitAction(this)
    // this.readyAction = StateReadyAction.getInstance(this, opt["roomId"]);
    this.readyAction = new StateReadyAction(this)
    // this.gameAction = StateGameAction.getInstance(this, opt["roomId"]);
    this.gameAction = new StateGameAction(this)
    // this.endAction = StateEndAction.getInstance(this, opt["roomId"]);
    this.endAction = new StateEndAction(this)
    /** 消息通知 */
    // this.channelForPlayerAction = ChannelForPlayerAction.getInstance(this, opt["roomId"]);
    this.channelForPlayerAction = new ChannelForPlayerAction(this)

    this.channelForRobotAction = new ChannelForRobotAction(this)

    /** 初始化时获取对局信息基本设定 */
    // RedPacketDynamicRoomManager.getInstance().init()
    ///@ts-ignore
    const sceneList = require(`../../../../config/data/scenes/redPacket.json`);
    this.sceneInfo = sceneList.find(info => info.id === this.sceneId)
    this.redParketNum = opt["redParketNum"];

    this.control = new RedPacketControl({room: this});

    this.backendServerId = pinus.app.getServerId();

    this.grabPlayerSet = new Set();

    this.roomManager = roomManager;
  }

  /**
   * 变更房间游戏状态
   * @param status
   */
  async changeGameStatues(status: GameStatusEnum): Promise<void> {
    try {
      this.status = status;
    } catch (e) {
      logger.error(`红包扫雷|改变房间状态|出错:${e.stack}`);
      this.status = status;
    }
  }

  /**
   * 变更红包队列里的状态
   * @description 因是按金额降序排序，故改变第一个
   */
  changeStatusInRedPacketQueue(status: RedPacketGameStatusEnum): void {
    this.redPackQueue[0].status = status;
  }

  /**
   * 查询当前房间里的用户
   * @param uid 用户 id
   */
  findPlayerByUidInRoom(uid: string) {
    return this.players.find(
      (playerInfo) => playerInfo && playerInfo.uid === uid
    );
  }

  /**
   * 房间初始化 只调用一次
   */
  async init(): Promise<void> {
    this.process = true;

    /** 获取下注红包抽利信息 */

    const gameCommissionSetting = await GameCommissionManager.findOne({ nid: this.nid });
    if (gameCommissionSetting && gameCommissionSetting.open) {
      this.currentCommissionBetRatio = gameCommissionSetting.bet;
    } else {
      this.currentCommissionBetRatio = 0
    }

    /**  */
    this.kickAllOffLinePlayer();
    // 更新真实玩家数量
    this.updateRealPlayersNumber();
    this.updateRoundId();
    for (let player of this.players) {
      player.initGame();
    }

    this.totalAmount = 0;

    this.redPackQueue = [];

    this.currentGraberQueue = [];

    this.opened = true;
  }

  /**
   * 房间开始运行
   */
  run(): void {
    if (!this.hadRunning) {
      // console.info(`房间:${this.roomId} | 房间开始运行`);
      this.lastCountDownTime = Date.now();
      this.hadRunning = !this.hadRunning;
    }

    this.processInterval = setInterval(() => this.gameProcess.apply(this), 1000);
  }

  /**
   * 房间游戏主程调度
   * @description 统一管理，方便阅读和维护
   */
  async gameProcess() {
    try {
      /**
     * this.tmp_countDown 倒计时 标志位:涉及判断的逻辑从 WAIT 状态开始
     */
      if (!this.process) return;
      if (this.status !== GameStatusEnum.NONE && this.tmp_countDown >= 0)
        this.tmp_countDown -= 1000;

      switch (this.status) {
        // 房间初始化时
        case GameStatusEnum.NONE:
          // this.tmp_countDown = this.waitCountDown;
          // this.changeGameStatues(GameStatusEnum.WAIT);
          this.noneAction.startBefore();
          break;

        // 等待埋雷
        case GameStatusEnum.WAIT:

          this.waitAction.initBeforeGame();

          const isBeginingGrabFlag = this.waitAction.checkRedPacketQueue();

          if (isBeginingGrabFlag) {

            // Step 1:变更红包状态 
            this.changeStatusInRedPacketQueue(RedPacketGameStatusEnum.GAME);

            // 生成对局用红包
            await this.gameAction.checkRedPacketListOnReady();

            // 变更 红包所属玩家的游戏状态
            const handOutRedPacketUid = this.redPackQueue[0].owner_uid;

            this.getPlayer(handOutRedPacketUid).changePlayerStatus(PlayerGameStatusEnum.GAME);

            this.players
              .filter(p => p.status === PlayerGameStatusEnum.GAME && p.uid !== handOutRedPacketUid)
              .forEach(p => {
                p.status = PlayerGameStatusEnum.READY
                p.initControlType();
              })
            // Step 2:将生成的待抢红包队列信息推送给所属房间的机器人
            this.channelForRobotAction.graberRedPacketToAllRobot();
            // Step 3:改变房间状态，此时可抢红包
            await this.changeGameStatues(GameStatusEnum.READY);
            // Step 4:初始化计时器
            this.tmp_countDown = this.grabCountDown;
            this.startTime = Date.now();
            // Step 5:发送广播表示可以开抢
            this.channelForPlayerAction.roomReadyForGrabToAllPlayer();
          }
          break;

        // 等待抢包
        case GameStatusEnum.READY:
          // Step 1:是否有人抢红包
          const hasGrabedFlag = this.readyAction.checkGrabRedPacketQueue();
          if (!hasGrabedFlag) {
            break;
          }
          // Step 2:改变房间状态
          await this.changeGameStatues(GameStatusEnum.GAME);
          // Step 3:清除计时函数
          this.readyAction.clearCountDown();

        // 过程状态-处理信息
        case GameStatusEnum.GAME:
          if (!this.gameAction.canBeSettled()) break;
          await this.changeGameStatues(GameStatusEnum.END);
          this.endTime = Date.now();
          this.endAction.initSettleTime();

        // 结算
        case GameStatusEnum.END:
          this.process = false;
          const settledResult = await this.endAction.settedCurrentGame2();

          /** 对发红包的玩家，单独发送消息 */
          this.channelForPlayerAction.beInRedPacketQueueToPlayerInQueue();

          /** 删除首个红包 */
          this.redPackQueue.splice(0, 1);

          /** 红包队列发生变化，群通知 */
          this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();


          await this.checkOffLinePlayersBeforeGaming();

          /** 通知前端结算结果 */
          this.channelForPlayerAction.afterSettledToAllPlayer(settledResult);

          /** 前端有结算动画，延迟3秒执行如下函数 */
          this.timer = setTimeout(() => {
            // 发送对局结束信息
            this.channelForPlayerAction.gameOverToAllPlayer(true);

            // const pList = this.players.filter(p => !p.onLine);

            // 初始化下局游戏的临时变量 ,尤其是 process<boolean>
            this.endAction.nextGameRound();
          }, 1000);
          // 初始化回合id
          this.updateRoundId();
          /** 变更房间状态 */
          await this.changeGameStatues(GameStatusEnum.WAIT);

          break;
      }
    } catch (e) {
      logger.error(`运行进程出错: ${e.stack}`);
    }
  }

  /**
   * 房间添加玩家
   * @param player
   */
  addPlayerInRoom(dbplayer) {
    const playerInfo = this.getPlayer(dbplayer.uid);

    if (playerInfo) {
      playerInfo.sid = dbplayer.sid;
      this.offLineRecover(playerInfo);
      return true;
    }

    if (this.isFull()) return false;

    const newPlayer = new Player(dbplayer);

    newPlayer.onLine = true;

    this.players.push(newPlayer);
    // 添加到消息通道
    this.addMessage(dbplayer);

    // 更新真实玩家数量
    this.updateRealPlayersNumber();

    this.channelForPlayerAction.playerListWithUpdate(this.players.length);

    return true;
  }

  //断线重连获取数据
  getOffLineData(player) {
    let data = { onLine: null, toResultBack: null };
    //当前正是这个玩家说话
    if (player.onLine) {
      data.onLine = player.onLine;
      // data.toResultBack = this.toResultBack(player.uid)
    }
    return data;
  }

  /**
   * 获取房间当前信息
   */
  getCurrentInformationAboutRoom() {
    return {
      roomId: this.roomId,
      redPackQueue: this.redPackQueue,
      roomStatus: this.status,
      countDown: this.tmp_countDown,
    };
  }

  /**
   * 玩家离开房间
   * @param {string} uid 用户编号
   * @param {boolean} isOffLine 是否离线
   * @returns {string|null} 此处不引入 apiResult 有错误直接返回 string，以防调用逻辑零碎，不利于阅读
   */
  leaveRoom(uid: string, isOffLine: boolean): string | null {
    // Step 1:踢出消息通道
    if (isOffLine) {
      this.kickOutMessage(uid);
      this.getPlayer(uid).onLine = false;
      return;
    }

    // Step 2:离房玩家是否埋雷,且红包队列里的首个红包状态是否属当前游戏中
    if (this.redPackQueue.findIndex((redPacket) => redPacket.owner_uid === uid) === 0 && this.redPackQueue[0].status === RedPacketGameStatusEnum.GAME) {
      return langsrv.getlanguage(this.getPlayer(uid).language, langsrv.Net_Message.id_8112);
    }

    // Step 3:离房玩家是否正在争抢红包，且红包队列里的首个红包状态是否属当前游戏中
    const grabQueueIdx = this.currentGraberQueue.findIndex((graber) => graber.grabUid === uid);

    if (grabQueueIdx >= 0 && this.redPackQueue[0] && this.redPackQueue[0].status === RedPacketGameStatusEnum.GAME) {

      return langsrv.getlanguage(this.getPlayer(uid).language, langsrv.Net_Message.id_8113);
    }

    // 不在当前对局中的红包则剔除红包队列
    if (this.redPackQueue.find((redPacket) => redPacket.owner_uid === uid)) {

      this.redPackQueue = this.redPackQueue.filter((redPacket) => redPacket.owner_uid !== uid);

      // 发送通知
      this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
    }

    this.kickOutMessage(uid);

    // 更新真实玩家数量
    this.updateRealPlayersNumber();

    this.channelForPlayerAction.playerListWithUpdate(this.players.length);

    if (isOffLine) {
      return;
    }
    utils.remove(this.players, "uid", uid);
    return null;
  }

  /**
   * 踢掉离线玩家
   */
  kickAllOffLinePlayer(): void {
    for (const pl of this.players) {
      if (pl.isRobot === RoleEnum.ROBOT) {
        if (Math.round(moment().valueOf() / 1000) - pl.updatetime > 3 * 60) {
          pl.onLine = false;
        }
      } else {
        // 如果真人玩家不在线则踢出
        if (!pl.onLine) {
          this.roomManager.removePlayer(pl);
        }

        if (Math.round(moment().valueOf() / 1000) - pl.updatetime > 45) {
          pl.onLine = false;
        }
      }
      if (!pl.onLine && !this.redPackQueue.some((redPacket) => redPacket.owner_uid === pl.uid)) {
        const member = this.channel.getMember(pl.uid);
        !!member && pushMessageByUids(ChannelEventEnum.timeout, {}, member);
        this.kickOutMessage(pl.uid);
        utils.remove(this.players, "uid", pl.uid);
        this.kickingPlayer(pinus.app.getServerId(), [pl]);
      }
    }
  }

  /**
   * 抢红包
   * @param uid 用户id
   * @return {boolean} 是否中雷
   */
  async grabRedPacket(uid: string) {
    // Step 1:判断当前发红包角色（机器人or真实玩家）
    const redPacketOwnerIdx = this.players.findIndex(
      (player) => player.uid === this.redPackQueue[0].owner_uid
    );

    const isRobotForRedPacketOwner = this.players[redPacketOwnerIdx].isRobot === 2;

    // Step 2:判断抢包者角色身份，同时修改玩家在房间里的游戏状态
    const graberIdx = this.players.findIndex((player) => player.uid === uid);

    const graberPlayer = this.players[graberIdx];

    const isRobotForGraber = graberPlayer.isRobot === 2;

    // Step 2.1:修改玩家房间游戏状态
    graberPlayer.changePlayerStatus(PlayerGameStatusEnum.GAME);

    if (this.grabPlayerSet.has(uid)) {
      return new ApiResultDTO({ code: 500, msg: langsrv.getlanguage(this.players[redPacketOwnerIdx].language, langsrv.Net_Message.id_8100) });
    }

    this.grabPlayerSet.add(uid);

    // 发包者和抢包者相同的人随机
    if (this.players[redPacketOwnerIdx].uid === graberPlayer.uid) {
      if (isRobotForGraber) {
        this.addRobotGrabRedPacketCount();
      }

      return this.gameAction.getRedPacketByRandom(uid);
    }

    /**
     * Step 4:不同角色按不同公式计算中雷概率
     */
    const currentProbability = utils.random(0, 100);

    // 如果发包者是机器人
    if (isRobotForRedPacketOwner) {
      // 如果抢包的真人 查看是否调控 机器人则随机返回
      if (!isRobotForGraber) {
        // 是否调控
        const isControl: boolean = await this.control.isControl(graberPlayer);

        return isControl ? this.gameAction.getHasMineInRedPacket(uid) : this.gameAction.getRedPacketByRandom(uid);
      } else {

        // const graberWithoutRedPacketList = this.currentGraberQueue.filter(withoutGreab => !withoutGreab.hasGrabed);


        const realPlayerList = this.players.filter(p => p.isRobot === 0);

        /**
         * 针对玩家卡雷抢最后几个
         * @date 2021/9/3
         */
        // 红包总数
        const redPacketTotalCount = this.currentRedPacketList.length;
        // 剩余红包（可抢）
        const remainingRedPacketCount = redPacketTotalCount - this.robotGrabRedPacketCount;
        // 若当前房间包含真实玩家
        if (realPlayerList.length > 0) {

          this.addRobotGrabRedPacketCount();
          if (remainingRedPacketCount > 3) {
            return this.gameAction.getNotHasMineInRedPacket(uid);
          } else {
            return this.gameAction.getHasMineInRedPacket(uid);
          }
        }



        this.addRobotGrabRedPacketCount();

        return this.gameAction.getRedPacketByRandom(uid);
      }
    }

    // 真人玩家发红包

    // 如果抢包者是机器人
    if (isRobotForGraber) {
      this.addRobotGrabRedPacketCount();
      // 如果发包者被调控 则进行获取一个无雷红包 否则 则随机;
      return this.players[redPacketOwnerIdx].controlState ===
        CommonControlState.LOSS
        ? this.gameAction.getNotHasMineInRedPacket(uid)
        : this.gameAction.getRedPacketByRandom(uid);
    }

    // 余下情况真人发包者和真实玩家抢包都不进行调控
    return this.gameAction.getRedPacketByRandom(uid);
  }

  /**
   * 抢红包临时需求 - 针对皇室急上线补丁逻辑
   * @param uid 用户id
   * @return {boolean} 获取处理成功,false 获取失败
   * @author Andy
   * @date 2019年11月4日
   * @description 针对机器人角色调用:优先获取无雷红包
   */
  async grabRedPacketForRobot(uid: string): Promise<boolean> {
    // Step 1:判断当前发红包角色（机器人or真实玩家）
    const redPacketOwnerIdx = this.players.findIndex(
      (player) => player.uid === this.redPackQueue[0].owner_uid
    );
    const isRobotForRedPacketOwner =
      this.players[redPacketOwnerIdx].isRobot === 2;
    // Step 2:判断抢包者角色身份，同时修改玩家在房间里的游戏状态
    const graberIdx = this.players.findIndex((player) => player.uid === uid);
    const graberPlayer = this.players[graberIdx];
    const isRobotForGraber = graberPlayer.isRobot === 2;
    // Step 3:修改玩家房间游戏状态
    graberPlayer.changePlayerStatus(PlayerGameStatusEnum.GAME);
    /** Step 4:相同角色纯随机获取一个红包 */
    if (isRobotForRedPacketOwner === isRobotForGraber) {
      this.gameAction.getRedPacketByRandom(uid);
      return true;
    }

    /**
     * Step 5:不同角色，即发包者真实玩家，抢包者机器人
     */
    const isSuccess = this.gameAction.getNotHasMineInRedPacket(uid);
    if (!isSuccess) {
      logger.warn(
        `房间:${this.roomId}|游戏第 ${this.roundTimes
        } 轮|玩家埋雷 机器人:${uid}抢|红包队列里已没有无雷红包|当前还剩${this.currentGraberQueue.filter((redPacket) => !redPacket.hasGrabed)
          .length
        }个红包（雷)`
      );
      // 取消该机器人抢包,恢复机器人状态
      graberPlayer.changePlayerStatus(PlayerGameStatusEnum.READY);
      return false;
    }

    return true;
  }

  /**
   * 是否允许机器人抢包
   */
  allowedRobotGrab(): boolean {
    return this.robotGrabRedPacketCount >= this.robotGrabRedPacketLimit;
  }

  /**
   * 加机器人抢包统计
   */
  addRobotGrabRedPacketCount() {
    this.robotGrabRedPacketCount += 1;
  }

  /**
   * 发红包 (埋雷)
   * @param uid 用户id
   * @param amount 金额
   * @param mineNumber 地雷编号
   */
  handOutRedPacket(
    uid: string,
    amount: number,
    mineNumber: number
  ): IRedPacket[] {
    // Step 1:封装红包信息
    const redPacket: IRedPacket = {
      owner_uid: uid,
      mineNumber,
      amount,
      nickname: this.getPlayer(uid).nickname,
      isRobot: this.getPlayer(uid).isRobot === 2,
      status: RedPacketGameStatusEnum.WAIT,
    };

    // Step 2:添加进红包队列
    this.gameAction.addRedPacketToRedPackQueue(redPacket);

    // Step 3:变更玩家状态
    const currentPlayer = this.getPlayer(uid);

    // currentPlayer.changePlayerStatus(PlayerGameStatusEnum.GAME);

    // Step 4:发送消息通知
    this.channelIsPlayer(ChannelEventEnum.handout, {
      roomStatus: RedPacketGameStatusEnum[this.status],
      hadAddRedPacket: Object.assign(
        {},
        currentPlayer.sendPlayerInfoForFrontEnd(),
        { amount }
      ),
    });

    return this.redPackQueue;
  }

  /**
   * 取消发红包
   * @param uid
   */
  cancelHandOutRedPacket(uid: string) {
    this.gameAction.deleteRedPacketFromRedPacketQueue(uid);
    this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
  }

  /**
   * 检测长时间未操作的玩家
   */
  private async checkOffLinePlayersBeforeGaming() {
    this.kickAllOffLinePlayer();

    if (this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).length === 0) {
      this.canBeDestroy = true;
    }

    // 轮数
    if (this.roundTimes % 15 === 0) {
      try {
        // 检测和清理 room -> users
        // RoomController.updateUserFromRoom(this.players, this.nid, this.roomId);
      } catch (e) {
        logger.warn(`${this.backendServerId} | 场 ${this.sceneId} | 房间 ${this.roomId} | 清理 redis users和players出错: ${e.stack}`);
      } finally {
        this.channelForPlayerAction.playerListWithUpdate(this.players.length);
      }
    }
    return;
  }

  public destroy() {
    clearInterval(this.processInterval);
    clearTimeout(this.timer);
    this.noneAction = null;
    this.waitAction = null;
    this.readyAction = null;
    this.gameAction = null;
    this.endAction = null;
    this.channelForPlayerAction = null;
    this.channelForRobotAction = null;
    this.sendRoomCloseMessage();
    this.grabPlayerSet = null;
    // const uidList = this.channel.getMembers()
    // uidList.forEach(uid => this.kickOutMessage(uid));
  }

  public close() {
    // this.sendRoomCloseMessage();
    // this.stopTimer();
    this.roomManager = null;
    // this._players.clear();
    // this.control = null;
    // this.routeMsg = null;
    clearInterval(this.processInterval);
    clearTimeout(this.timer);
    this.noneAction = null;
    this.waitAction = null;
    this.readyAction = null;
    this.gameAction = null;
    this.endAction = null;
    this.channelForPlayerAction = null;
    this.channelForRobotAction = null;
    this.grabPlayerSet = null;
    this.control = null;

    /* this.noneAction.room = null;
    this.noneAction = null;
    this.waitAction.room = null;
    this.waitAction = null;
    this.readyAction.room = null;
    this.readyAction = null;
    this.gameAction.room = null;
    this.gameAction = null;
    this.endAction.room = null;
    this.endAction = null; */
  }
}
