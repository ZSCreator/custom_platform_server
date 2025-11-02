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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0U3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9mYW5UYW4vbGliL3N0YXRlcy9iZXRTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRDQUF1QztBQUt2QyxNQUFxQixRQUFRO0lBTXpCLFlBQVksSUFBVTtRQUxiLGNBQVMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLGNBQVMsR0FBRyxxQkFBUyxDQUFDLEdBQUcsQ0FBQztRQUNuQyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBSVYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFJbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBRVAsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQWpDRCwyQkFpQ0MifQ==