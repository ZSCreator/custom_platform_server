import Room from "../../RedPacketRoomImpl";
import { GameStatusEnum } from "../../enum/GameStatusEnum";
import { RedPacketGameStatusEnum } from '../../enum/RedPacketGameStatusEnum';
import MessageService = require('../../../../../services/MessageService');
import { ChannelEventEnum } from "../../enum/ChannelEventEnum";

/**
 * 消息通知
 */
export default class ChannelForPlayerAction {

  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): ChannelForPlayerAction {
    if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new ChannelForPlayerAction(room);
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * 群发消息：发红包
   */
  roomWaitForHandOutRedPacketToAllPlayer() {
    this.room.channelIsPlayer(ChannelEventEnum.roomWaitForHandout, {
      roomId: this.room.roomId,
      roomStatus: GameStatusEnum[this.room.status],
      countDown: this.room.tmp_countDown
    });
  }

  /**
   * 群发可以开抢红包
   * @description 红包队列数量大于0; 房间状态从 wait > ready
   */
  roomReadyForGrabToAllPlayer() {
    this.room.channelIsPlayer(ChannelEventEnum.roomReady, {
      roomId: this.room.roomId,
      roomStatus: GameStatusEnum[this.room.status],
      countDown: this.room.tmp_countDown,
      currentRedPacketInfo: Object.assign({}, this.room.getPlayer(this.room.redPackQueue[0].owner_uid).sendPlayerInfoForFrontEnd(), this.room.redPackQueue[0])
    });
  }

  /**
   * 红包队列减少时，发送群消息通知
   */
  redPacketQueueWithUpdateToAllPlayer() {
    this.room.channelIsPlayer(ChannelEventEnum.redPacketQueueWithUpdate, {
      redPacketList: this.room.redPackQueue,
    });
  }

  /**
   * 对发红包的玩家，单独发送消息
   * @description 红包队列里的首个位置 为 false,其余true
   */
  beInRedPacketQueueToPlayerInQueue() {
    this.room.redPackQueue.map(redPacketInfo => {
      const member = this.room.channel.getMember(redPacketInfo.owner_uid);
      member && MessageService.pushMessageByUids(ChannelEventEnum.beInRedPacketQueue, { beInRedPacketList: redPacketInfo.status === RedPacketGameStatusEnum.WAIT }, member);
    })
  }

  /**
   * 结算后通知结果
   */
  afterSettledToAllPlayer(result) {
    this.room.channelIsPlayer(ChannelEventEnum.settled, {
      gameRound: this.room.roundTimes,
      redPackQueue: this.room.redPackQueue,
      result
    });
  }

  /**
   * 每一局结束时群发一次通知
   * @param 是否可结算
   */
  gameOverToAllPlayer(canBeSettled: boolean) {
    this.room.channelIsPlayer(ChannelEventEnum.settle, {
      gameRound: this.room.roundTimes,
      redPackQueue: this.room.redPackQueue,
      canBeSettled,
      roundId: this.room.roundId,
    });
  }

  playerListWithUpdate(playerCount: number) {
    this.room.channelIsPlayer(ChannelEventEnum.redPacketPlayerListWithUpdate, {
      playerCount
    });
  }

}
