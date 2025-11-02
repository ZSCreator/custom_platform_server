"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lotteryUtil_1 = require("../util/lotteryUtil");
class LotteryState {
    constructor(room) {
        this.countdown = 0;
        this.stateName = constants_1.RoomState.LOTTERY;
        this.startTime = 0;
        this.room = room;
    }
    init() {
        this.startTime = Date.now();
    }
    ;
    getRemainingTime() {
        return Date.now() - this.startTime;
    }
    async before() {
        this.init();
        const lotteryUtil = new lotteryUtil_1.LotteryUtil();
        await this.room.control.runControl(lotteryUtil);
        this.room.players.filter(p => p.takeProfitPoint > 0 && p.takeProfitPoint <= lotteryUtil.getResult() && p.getTotalBet() > 0)
            .forEach(p => {
            const timer = setTimeout(() => {
                if (!p.isTaken()) {
                    p.addProfit(p.takeProfitPoint);
                    p.settlement(this.room);
                    this.room.routeMsg.takeProfit(p);
                }
            }, (new lotteryUtil_1.LotteryUtil()).getFlyTimeToOdds(p.takeProfitPoint));
            this.room.addTimer(timer);
        });
        this.room.setResult(lotteryUtil.getResult())
            .setFlyTime(lotteryUtil.getFlyTime())
            .addOneLotteryResult(lotteryUtil.getResult());
        this.countdown = lotteryUtil.getFlyTime();
        this.room.routeMsg.startLotteryState();
    }
    async after() {
        await this.room.updateAfterLottery();
        await this.room.changeRoomState(constants_1.RoomState.SETTLEMENT);
    }
}
exports.default = LotteryState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGliL3N0YXRlcy9sb3R0ZXJ5U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFDdkMscURBQWdEO0FBS2hELE1BQXFCLFlBQVk7SUFPN0IsWUFBWSxJQUFVO1FBTHRCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDTCxjQUFTLEdBQUcscUJBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdkMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdaLE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFDO1FBR3RDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBR2hELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDdEgsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFFMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDZCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDL0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEM7WUFDTCxDQUFDLEVBQUUsQ0FBQyxJQUFJLHlCQUFXLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFBO1FBR0YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3ZDLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDcEMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFHbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7UUFHMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVyQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNKO0FBL0RELCtCQStEQyJ9