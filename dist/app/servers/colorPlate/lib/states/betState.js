"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class BetState {
    constructor(room) {
        this.countdown = 15 * 1000;
        this.stateName = constants_1.RoomState.BET;
        this.startTime = 0;
        this.room = room;
    }
    async init() {
        this.startTime = Date.now();
        this.room.init();
        this.room.startTime = this.startTime;
        await this.room.removeOfflinePlayers();
    }
    ;
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }
    async before() {
        await this.init();
        this.room.routeMsg.startBetState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.LOTTERY);
    }
}
exports.default = BetState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0U3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb2xvclBsYXRlL2xpYi9zdGF0ZXMvYmV0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFLdkMsTUFBcUIsUUFBUTtJQU16QixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixjQUFTLEdBQUcscUJBQVMsQ0FBQyxHQUFHLENBQUM7UUFDbkMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRzVCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFakIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUdyQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBQUEsQ0FBQztJQUtGLGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDUixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUlsQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNKO0FBekNELDJCQXlDQyJ9