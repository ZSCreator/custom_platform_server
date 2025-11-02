"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageService = require("../../../../../services/MessageService");
const ChannelEventEnum_1 = require("../../enum/ChannelEventEnum");
class ChannelForRobotAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new ChannelForRobotAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    graberRedPacketToAllRobot() {
        this.room.players.filter(player => player.isRobot === 2)
            .map(player => {
            const member = this.room.channel.getMember(player.uid);
            member && MessageService.pushMessageByUids(ChannelEventEnum_1.ChannelEventEnum.currentGraberQueue, {
                currentGraberQueue: this.room.currentGraberQueue,
                gameRound: this.room.roundTimes
            }, member);
        });
    }
}
exports.default = ChannelForRobotAction;
ChannelForRobotAction.roomCodeList = [];
ChannelForRobotAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbEZvclJvYm90QWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9leHBhbnNpb24vY2hhbm5lbEV4cGFuc2lvbi9DaGFubmVsRm9yUm9ib3RBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5RUFBMEU7QUFDMUUsa0VBQStEO0FBRS9ELE1BQXFCLHFCQUFxQjtJQWlCeEMsWUFBWSxJQUFVO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFYRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQVUsRUFBRSxhQUFxQjtRQUNsRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2RSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkU7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQVNELHlCQUF5QjtRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQzthQUNyRCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDWixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXZELE1BQU0sSUFBSSxjQUFjLENBQUMsaUJBQWlCLENBQUMsbUNBQWdCLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzlFLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCO2dCQUNoRCxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2FBQ2hDLEVBQ0MsTUFBTSxDQUNQLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7O0FBdENILHdDQXdDQztBQXBDUSxrQ0FBWSxHQUFhLEVBQUUsQ0FBQztBQUU1QixpQ0FBVyxHQUFXLEVBQUUsQ0FBQyJ9