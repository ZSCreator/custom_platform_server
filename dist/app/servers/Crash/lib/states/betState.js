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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0U3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9DcmFzaC9saWIvc3RhdGVzL2JldFN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNENBQXVDO0FBS3ZDLE1BQXFCLFFBQVE7SUFNekIsWUFBWSxJQUFVO1FBTGIsY0FBUyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdEIsY0FBUyxHQUFHLHFCQUFTLENBQUMsR0FBRyxDQUFDO1FBQ25DLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUc1QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFHckMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFJbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBRVAsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQXpDRCwyQkF5Q0MifQ==