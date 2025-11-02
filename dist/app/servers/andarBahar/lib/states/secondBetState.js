"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class SecondBetState {
    constructor(room) {
        this.countdown = 10 * 1000;
        this.stateName = constants_1.RoomState.SECOND_BET;
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
        this.room.routeMsg.startSecondBetState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.SECOND_LOTTERY);
    }
}
exports.default = SecondBetState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vjb25kQmV0U3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2xpYi9zdGF0ZXMvc2Vjb25kQmV0U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFLdkMsTUFBcUIsY0FBYztJQU0vQixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixjQUFTLEdBQUcscUJBQVMsQ0FBQyxVQUFVLENBQUM7UUFDMUMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBS0YsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUVSLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBS2xCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBRVAsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSjtBQW5DRCxpQ0FtQ0MifQ==