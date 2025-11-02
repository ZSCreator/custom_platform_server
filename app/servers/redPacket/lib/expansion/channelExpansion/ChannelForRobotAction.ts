import Room from "../../RedPacketRoomImpl";
import MessageService = require('../../../../../services/MessageService');
import { ChannelEventEnum } from "../../enum/ChannelEventEnum";

export default class ChannelForRobotAction {

  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): ChannelForRobotAction {
    if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new ChannelForRobotAction(room);
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * 发送信息：将当前对局里 待抢红包队列  to 机器人
   */
  graberRedPacketToAllRobot() {

    this.room.players.filter(player => player.isRobot === 2)
      .map(player => {
        const member = this.room.channel.getMember(player.uid);

        member && MessageService.pushMessageByUids(ChannelEventEnum.currentGraberQueue, {
          currentGraberQueue: this.room.currentGraberQueue,
          gameRound: this.room.roundTimes
        },
          member
        );
      });

  }

}