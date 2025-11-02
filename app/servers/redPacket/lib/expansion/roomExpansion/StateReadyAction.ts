import Room from "../../RedPacketRoomImpl";
import { getLogger } from "pinus";
import { GameStatusEnum } from "../../enum/GameStatusEnum";

const logger = getLogger("server_out", __filename);

/**
 * @property countTimes 等待抢红包阶段，计时器重计次数
 */
export default class StateReadyAction {

  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): StateReadyAction {

    if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new StateReadyAction(room)
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * 初始化计时器
   */
  initCountDown(): void {
    if (this.room.tmp_countDown < 0) {
      this.room.tmp_countDown = this.room.waitCountDown;
      // 通知前端当前第几轮，等待抢包第几次，是否可结算等信息
      const canBeSettled = this.room.currentGraberQueue.filter(GraberRedPacket => GraberRedPacket.hasGrabed).length > 0;
      if (!canBeSettled) {

        // 倒计时结束，没人抢红包，则删除首个红包
        /** 对发红包的玩家，单独发送消息 */
        this.room.channelForPlayerAction.beInRedPacketQueueToPlayerInQueue();

        /** 删除红包队列里的首个红包 */
        this.room.redPackQueue.splice(0, 1);

        /** 红包队列发生变化，群通知 */
        this.room.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();

        /** 初始划对局变量 */
        this.room.waitAction.initBeforeGame();

        /** 变更房间状态 */
        this.room.changeGameStatues(GameStatusEnum.WAIT);

        /** 发送对局结束信息 */
        this.room.channelForPlayerAction.gameOverToAllPlayer(false);

        logger.info(`红包扫雷|无人抢红包|房间:${this.room.roomId}|第${this.room.roundTimes}轮`);
      }

    }
  }

  clearCountDown() {
    this.room.tmp_countDown = 0;
  }

  /**
   * 检测是否有人抢红包
   */
  checkGrabRedPacketQueue() {
    const { length } = this.room.currentGraberQueue.filter(redPacket => redPacket.hasGrabed);
    const playerHasGrabFlag = (length > 0 && this.room.tmp_countDown === 0) || length === this.room.currentGraberQueue.length;
    if (!playerHasGrabFlag) this.initCountDown();
    return playerHasGrabFlag;
  }

}
