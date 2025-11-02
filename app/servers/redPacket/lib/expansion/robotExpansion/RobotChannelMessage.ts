import { RedPacketRobotImpl } from "../../RedPacketRobotImpl";
import {
  RoomWaitForHandoutRedPacketDTO,
  RoomReadyForGrabDTO,
  redPacketQueueWithUpdateDTO,
  BeInRedPacketQueueDTO,
  gameOverDTO,
  SettledDTO,
  HandOutRedPacketDTO,
  GrabRedPacketDTO,
  CurrentGraberQueueDTO
} from "../../pojo/RoomChannelMessageDTO";
import { random } from "../../../../../utils";

/**
 * 消息通知集中管理，更新运行时所需游戏信息
 */
export class RobotChannelMessage {

  robot: RedPacketRobotImpl;

  constructor(robot: RedPacketRobotImpl) {
    this.robot = robot;
  }

  /**
   * 房间红包队列为空，通知机器人发红包
   */
  waitForHandoutRedPacket({ countDown }: RoomWaitForHandoutRedPacketDTO) {
    this.robot.countDown = countDown;

    if (!this.robot.canNotAction) {
      this.robot.handOutRedPacket();
    }

  }

  /**
     * 可抢红包
     * @param {RoomReadyForGrabDTO} message 
     */
  grabRedPacket({ roomId, roomStatus, countDown, currentRedPacketInfo }: RoomReadyForGrabDTO) {
    // this.robot.robotLogger.debug(`第${this.robot.playRound}局|可开抢`);
    this.robot.currentRedPacketInfo = currentRedPacketInfo;
    this.robot.grabRedPacket();
    // 房间状态不同则更新
    // if (this.robot.roomStatus !== roomStatus) this.robot.changeRoomStatus(roomStatus);
    // this.robot.countDown = countDown;
    // this.robot.canGrabFlag = true;
  }

  /**
   * redPacketQueue 红包队列 减少时会收到此通知
   * @param message 变化后的红包队列
   * @description 消息更新
   */
  redPacketQueueWithUpdate({ redPacketList }: redPacketQueueWithUpdateDTO) {
    this.robot.redPacketQueueUpdateTimeStamp = Math.round(new Date().getTime() / 1000);
    this.robot.redPacketQueue = redPacketList;
    this.robot.beInRedPacketQueueFlag = !!this.robot.redPacketQueue.find(({ owner_uid }) => owner_uid === this.robot.uid);

    if (this.robot.heartbetHandoutRedPacketAction) {
      this.robot.heartbetHandoutRedPacketAction = !this.robot.redPacketQueue.find(({ owner_uid }) => owner_uid === this.robot.uid);
    }
    
    if (!this.robot.beInRedPacketQueueFlag && !this.robot.canNotAction) this.robot.handOutRedPacket();
  }

  /**
   * 对局结束
   * @param {gameOverDTO} message  
   * @description 判断是否可结算，预处理信息
   */
  endOfGameRound({ gameRound, canBeSettled, redPackQueue }: gameOverDTO) {
    if (!canBeSettled) return;
    this.robot.nextGameRound();
  }

  /**
   * 结算通知
   * @param {SettledDTO} message 
   * @description 一局里，有人发红包，至少有1人抢，才会有此信息，是否有结算信息取自函数'endOfGameRound' canBeSettled 变量
   */
  async gameSettled({ gameRound, redPackQueue, result }: SettledDTO) {
    if (!result) return;

    const robotResultIdx = result.grabberResult.findIndex(settleInfo => settleInfo.uid === this.robot.uid);

    if (robotResultIdx < 0) return;
    // 获取属于自己的结果
    const { profitAmount } = result.grabberResult[robotResultIdx];
    // 记录:胜场次数
    if (profitAmount > 0) this.robot.winRound += 1;
    // 记录:游玩信息统计
    this.robot.playRound += 1;
    this.robot.profit += profitAmount;
    // 记录:金额变化
    this.robot.playerGold += profitAmount;
    this.robot.initNextGameGoundTmpInfo();

    // 如果玩的回合超过限制 补充离开游戏
    if (this.robot.playRound > this.robot.maxRound) {
      await this.robot.leave();
    }
  }

  /**
   * 有人发红包，接收此信息
   * @param {HandOutRedPacketDTO} message
   */
  someOneHandoutRedPacket({ roomStatus, hadAddRedPacket }: HandOutRedPacketDTO) {
    const { uid, amount } = hadAddRedPacket;
    // this.robot.robotLogger.debug(`有人发红包| 用户:${uid} | 发出金额: ${amount} 的红包`);
    // 房间状态不同则更新
    if (this.robot.roomStatus !== roomStatus) this.robot.changeRoomStatus(roomStatus);
  }

  /**
   * 有人抢红包，接收此信息
   * @param messageList
   * @description 检测并更新进 currentGraberQueue 
   */
  someOneGrabRedPacket(messageList: GrabRedPacketDTO[]) {

    const { length } = messageList;

    // this.robot.robotLogger.debug(`有人抢红包| 当前抢红包 ${length} 人| 当前对局红包共有 ${this.robot.currentMines} 个雷 | 已有 ${messageList.filter(redPacket => redPacket.isStepInMine).length} 人中雷 `);
    // 遍历更新进对局所需信息里
    for (let i = 0; i < length; i++) {

      const { uid, redPacketAmount } = messageList[i];
      const graberIdx = this.robot.currentGraberQueue.findIndex(graberRedPacket => uid === graberRedPacket.grabUid);

      if (graberIdx < 0) {
        const redPacketIdx = this.robot.currentGraberQueue.findIndex(graberRedPacket => graberRedPacket.redPacketAmount === redPacketAmount);
        this.currentGraberQueue[redPacketIdx].grabUid = uid;
        this.currentGraberQueue[redPacketIdx].hasGrabed = true;
      }

    }

    // 检测是否抢完
    if (this.robot.currentGraberQueue && this.robot.currentGraberQueue.length === length)
      this.robot.nextGameRound();

  }

  /**
   * 若发过红包，则会在“对局结束”前单独收到此消息
   * @param {BeInRedPacketQueueDTO} message 下一轮游戏是否扔在红包队列里
   * @description 消息更新
   */
  beInRedPacketQueue({ beInRedPacketList }: BeInRedPacketQueueDTO) {
    this.robot.beInRedPacketQueueFlag = beInRedPacketList ? beInRedPacketList : null;
  }

  /**
   * 每局生成的待抢红包队列，在房间内的机器人将会收到此信息
   * @param message 
   */
  currentGraberQueue({ currentGraberQueue, gameRound }: CurrentGraberQueueDTO) {
    // this.robot.robotLogger.debug(`获取到第 ${gameRound} 局|生成的 ${currentGraberQueue.length} 个红包|内有雷 ${currentGraberQueue.filter(redPacket => redPacket.isStepInMine).length} 个`);
    this.robot.currentGraberQueue = currentGraberQueue;
    this.robot.currentMines = currentGraberQueue.filter(redPacketInfo => redPacketInfo.isStepInMine).length;
  }

  timeOut() {
    if (!this.robot.canNotAction) {
      this.robot.canNotAction = true;
    }

    if (!this.robot.beInRedPacketQueueFlag) {
      // this.robot.robotLogger.debug(`超时 | 退出房间`);
      this.robot.leave()
    }
    // this.robot.leave();
  }
}