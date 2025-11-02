import { GameStatusEnum } from "../../enum/GameStatusEnum";
import Room from "../../RedPacketRoomImpl";

export default class StateNoneAction {

  room: Room;

  static roomCodeList: string[] = [];

  static instanceMap: object = {};

  static getInstance(room: Room, paramRoomCode: string): StateNoneAction {
    if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
      this.roomCodeList.push(paramRoomCode);
      this.instanceMap[paramRoomCode] = new StateNoneAction(room)
    }

    return this.instanceMap[paramRoomCode];
  }

  constructor(room: Room) {
    this.room = room;
  }

  startBefore() {
    // this.logger.debug(`红包扫雷|场:${this.room.sceneId}|房间:${this.room.roomId}|游戏主程逻辑运行前`);
    this.room.tmp_countDown = this.room.waitCountDown;
    this.room.changeGameStatues(GameStatusEnum.WAIT);
  }
}
