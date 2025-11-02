"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameStatusEnum_1 = require("../../enum/GameStatusEnum");
class StateNoneAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateNoneAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    startBefore() {
        this.room.tmp_countDown = this.room.waitCountDown;
        this.room.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
    }
}
exports.default = StateNoneAction;
StateNoneAction.roomCodeList = [];
StateNoneAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVOb25lQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9leHBhbnNpb24vcm9vbUV4cGFuc2lvbi9TdGF0ZU5vbmVBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4REFBMkQ7QUFHM0QsTUFBcUIsZUFBZTtJQWlCbEMsWUFBWSxJQUFVO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFYRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQVUsRUFBRSxhQUFxQjtRQUNsRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2RSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzVEO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFNRCxXQUFXO1FBRVQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQywrQkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7O0FBekJILGtDQTBCQztBQXRCUSw0QkFBWSxHQUFhLEVBQUUsQ0FBQztBQUU1QiwyQkFBVyxHQUFXLEVBQUUsQ0FBQyJ9