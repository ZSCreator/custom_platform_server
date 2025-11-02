import Room from "../../RedPacketRoomImpl";
import { getLogger } from "pinus";

const logger = getLogger("server_out", __filename);

export default class StateInwaitAction {
  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): StateInwaitAction {
    if (this.roomCodeList.findIndex((roomId) => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new StateInwaitAction(room);
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * 房间游戏进行前时调用
   */
  initBeforeGame(): void {

    if (this.room.redPackQueue.length > 0 && !this.room.redPackQueue[0].isRobot) {
      this.room.robotGrabRedPacketLimit = this.room.sceneId === 0 ? 10 : 7;
    } else {
      // 每回合开始约束本回合机器人最多可以抢多少个红包
      /* this.room.robotGrabRedPacketLimit = random(
        this.room.sceneInfo.robotGrabRedPacketMin,
        this.room.sceneInfo.robotGrabRedPacketMax
      ); */
      this.room.robotGrabRedPacketLimit = this.room.sceneId === 0 ? 10 : 7;
    }


    this.room.robotGrabRedPacketCount = 0;

    if (this.room.currentGraberQueue.length !== 0)
      this.room.currentGraberQueue = [];
    if (this.room.tmp_countDown < 0)
      this.room.tmp_countDown = this.room.grabCountDown;
  }

  /**
   * 检测红包队列是否有红包
   * @returns 可否开始抢红包
   */
  checkRedPacketQueue(): boolean {
    try {
      // 检查红包第一个红包的发包者是否还满足发包条件
      // 不满足则把这个红包去掉
      let nextStatus = false;

      while (!nextStatus) {
        const { length } = this.room.redPackQueue;

        if (length === 0) {
          break;
        }

        const redPacket = this.room.redPackQueue[0];

        const player = this.room.getPlayer(redPacket.owner_uid);

        if (!player) {
          this.room.redPackQueue = this.room.redPackQueue.slice(1);
          continue;
        }

        if (player.gold >= redPacket.amount) {
          nextStatus = true;
        } else {
          this.room.redPackQueue = this.room.redPackQueue.slice(1);
        }
      }

      const { length } = this.room.redPackQueue;

      if (length > 0) {
        return true;
      }

      // 红包队列为空;且倒计时为 0 时群发消息通知
      if (this.room.tmp_countDown === 0 && length === 0) {
        this.room.endAction.nextGameRound();
        this.room.channelForPlayerAction.roomWaitForHandOutRedPacketToAllPlayer();
      }

      return false;
    } catch (e) {
      logger.error(
        `红包扫雷 | ${this.room.roomId} | 检测红包队列是否有红包 | 出错 : ${e.stack}`
      );
      return false;
    }
  }
}
