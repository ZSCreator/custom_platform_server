"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class BetState {
    constructor(room) {
        this.countdown = 10 * 1000;
        this.stateName = constants_1.RoomState.BET;
        this.startTime = 0;
        this.room = room;
    }
    async init() {
        this.startTime = Date.now();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0U3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2xpYi9zdGF0ZXMvYmV0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFLdkMsTUFBcUIsUUFBUTtJQU16QixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixjQUFTLEdBQUcscUJBQVMsQ0FBQyxHQUFHLENBQUM7UUFDbkMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBS0YsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUVSLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBS2xCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUVQLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUFuQ0QsMkJBbUNDIn0=