"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lotteryUtil_1 = require("../util/lotteryUtil");
class LotteryState {
    constructor(room) {
        this.countdown = 10 * 1000;
        this.stateName = constants_1.RoomState.LOTTERY;
        this.startTime = 0;
        this.room = room;
    }
    init() {
        this.startTime = Date.now();
    }
    ;
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }
    async before() {
        this.init();
        this.room.randomAreasDouble();
        const lotteryUtil = new lotteryUtil_1.LotteryUtil();
        lotteryUtil.setBetAreas(this.room.getBetAreas());
        await this.room.control.runControl(lotteryUtil);
        this.room.setResult(lotteryUtil.getResult())
            .setWinAreas(lotteryUtil.getWinAreas())
            .addOneLotteryResult(lotteryUtil.getResult());
        this.room.routeMsg.startLotteryState();
    }
    async after() {
        await this.room.updateAfterLottery();
        await this.room.changeRoomState(constants_1.RoomState.SETTLEMENT);
    }
}
exports.default = LotteryState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpYi9zdGF0ZXMvbG90dGVyeVN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNENBQXVDO0FBQ3ZDLHFEQUFnRDtBQUtoRCxNQUFxQixZQUFZO0lBTTdCLFlBQVksSUFBVTtRQUxiLGNBQVMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLGNBQVMsR0FBRyxxQkFBUyxDQUFDLE9BQU8sQ0FBQztRQUN2QyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBSVYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQUEsQ0FBQztJQUtGLGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHWixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFHOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFLENBQUM7UUFHdEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFHakQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFHaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3ZDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDdEMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFHbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVyQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNKO0FBbkRELCtCQW1EQyJ9